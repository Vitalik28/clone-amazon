import { Prisma } from '@prisma/client';
import { categoryObject } from 'src/category/return-category.object';
import { reviewObject } from 'src/review/return-review.object';

export const productObject: Prisma.ProductSelect = {
  id: true,
  name: true,
  description: true,
  images: true,
  price: true,
  createdAt: true,
  slug: true,
};

export const productObjectFullest: Prisma.ProductSelect = {
  ...productObject,
  reviews: {
    select: reviewObject,
  },
  category: {
    select: categoryObject,
  },
};
