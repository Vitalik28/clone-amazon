import { Prisma } from '@prisma/client';

export const reviewObject: Prisma.ReviewSelect = {
  user: {
    select: {
      id: true,
      name: true,
      avatarPath: true,
    },
  },
  id: true,
  rating: true,
  text: true,
  createdAt: true,
};
