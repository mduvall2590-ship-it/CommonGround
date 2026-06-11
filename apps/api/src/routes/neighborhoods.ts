import { Hono } from 'hono';
import { db } from '../db';
import { neighborhoods, expenses, properties } from 'db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { NeighborhoodSchema } from 'types';
import { zValidator } from '@hono/zod-validator';
import { JWT_SECRET } from './auth';
import { jwt } from 'hono/jwt';

const neighborhoodRoutes = new Hono();

neighborhoodRoutes.get('/', async (c) => {
  try {
    const allNeighborhoods = await db.select().from(neighborhoods).all();
    return c.json({ data: allNeighborhoods });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

neighborhoodRoutes.get('/:id/properties', async (c) => {
  const id = c.req.param('id');
  try {
    const neighborhoodProperties = await db.select().from(properties).where(eq(properties.neighborhoodId, id)).all();
    return c.json({ data: neighborhoodProperties });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Protected routes below
neighborhoodRoutes.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

neighborhoodRoutes.post('/', zValidator('json', NeighborhoodSchema.omit({ id: true, createdAt: true })), async (c) => {
  const payload = c.get('jwtPayload') as any;
  if (payload.role !== 'ADMIN') {
    return c.json({ error: { message: 'Only admins can create neighborhoods' } }, 403);
  }

  const { name, location } = c.req.valid('json');

  const newNeighborhood = {
    id: uuidv4(),
    name,
    location: location || null,
    createdAt: Date.now(),
  };

  await db.insert(neighborhoods).values(newNeighborhood).run();

  return c.json({ data: newNeighborhood });
});

neighborhoodRoutes.get('/:id/expenses', async (c) => {
  const id = c.req.param('id');
  try {
    const neighborhoodExpenses = await db.select().from(expenses).where(eq(expenses.neighborhoodId, id)).all();
    return c.json({ data: neighborhoodExpenses });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

export { neighborhoodRoutes };
