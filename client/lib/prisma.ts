import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

const createPrismaClient = () => {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasourceUrl: process.env.DATABASE_URL,
  });

  // Handle potential connection issues gracefully
  baseClient.$on('error' as any, (e: any) => {
    console.error('[PRISMA_CLIENT_ERROR]', e.message);
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (['User', 'Product', 'Order'].includes(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (['User', 'Product', 'Order'].includes(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (['User', 'Product', 'Order'].includes(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (['User', 'Product', 'Order'].includes(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (['User', 'Product', 'Order'].includes(model)) {
            const modelName = model.toLowerCase() as any;
            return (baseClient as any)[modelName].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (['User', 'Product', 'Order'].includes(model)) {
            const modelName = model.toLowerCase() as any;
            return (baseClient as any)[modelName].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
      }
    }
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

