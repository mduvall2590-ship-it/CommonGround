export * from './schema';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const createDb = (url: string, authToken?: string) => {
  const client = createClient({ url, authToken: authToken as string });
  return drizzle(client as any, { schema });
};
