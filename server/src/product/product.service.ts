import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';
import { generateSlug } from 'src/utils/generate-slug';
import { EnumProductSort, GetAllProductDto } from './dto/get-all-product.dto';
import { ProductDto } from './dto/product.dto';
import { productObject, productObjectFullest } from './product.objet';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private pagination: PaginationService,
  ) {}

  async getAll(dto: GetAllProductDto = {}) {
    const { searchItem, sort } = dto;

    const prismaSort: Prisma.ProductOrderByWithRelationInput[] = [];

    if (sort === EnumProductSort.LOW_PRICE) {
      prismaSort.push({ price: 'asc' });
    } else if (sort === EnumProductSort.HIGH_PRICE) {
      prismaSort.push({ price: 'desc' });
    } else if (sort === EnumProductSort.OLDEST) {
      prismaSort.push({ createdAt: 'asc' });
    } else {
      prismaSort.push({ createdAt: 'desc' });
    }

    const prismaSearchTermFilter: Prisma.ProductWhereInput = searchItem
      ? {
          OR: [
            {
              category: {
                name: {
                  contains: searchItem,
                  mode: 'insensitive',
                },
              },
            },
            {
              name: {
                contains: searchItem,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchItem,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const { perPage, skip } = this.pagination.getPagination(dto);

    const products = await this.prisma.product.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage,
    });

    return {
      products,
      length: await this.prisma.product.count({
        where: prismaSearchTermFilter,
      }),
    };
  }

  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: productObjectFullest,
    });

    if (!product) throw new NotFoundException('Продукт не найден');
    return product;
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: productObjectFullest,
    });

    if (!product) throw new NotFoundException('Продукт не найден');
    return product;
  }

  async byCategory(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: { slug: categorySlug },
      },
      select: productObjectFullest,
    });

    if (!products) throw new NotFoundException('Продукт не найден');

    return products;
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id);
    if (!currentProduct) throw new NotFoundException('Продукт не найден');

    const products = await this.prisma.product.findMany({
      where: {
        category: { name: currentProduct.category.name },
        NOT: { id: currentProduct.id },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: productObject,
    });
  }

  async create() {
    const product = await this.prisma.product.create({
      data: {
        name: '',
        description: '',
        price: 0,
        slug: '',
      },
    });
    return product.id;
  }

  async update(id: number, dto: ProductDto) {
    const { categoryId, description, images, name, price } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        description,
        name,
        price,
        images,
        slug: generateSlug(name),
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
