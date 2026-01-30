import { z } from 'zod';
import { insertPersonSchema, insertCardSchema, people, cards } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  people: {
    list: {
      method: 'GET' as const,
      path: '/api/people',
      responses: {
        200: z.array(z.custom<typeof people.$inferSelect & { cards: typeof cards.$inferSelect[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/people',
      input: insertPersonSchema,
      responses: {
        201: z.custom<typeof people.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/people/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/people/:id',
      responses: {
        200: z.custom<typeof people.$inferSelect & { cards: typeof cards.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    }
  },
  cards: {
    create: {
      method: 'POST' as const,
      path: '/api/cards',
      input: insertCardSchema,
      responses: {
        201: z.custom<typeof cards.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cards/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    listByType: {
      method: 'GET' as const,
      path: '/api/cards/type/:type',
      responses: {
        200: z.array(z.custom<typeof people.$inferSelect & { cards: typeof cards.$inferSelect[] }>()),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export const CARD_TYPES = ["aadhaar", "pan", "voterid", "ration"];
