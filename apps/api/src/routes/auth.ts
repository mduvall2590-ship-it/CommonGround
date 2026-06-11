import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { db } from '../db';
import { users, properties } from 'db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { LoginSchema, RegisterSchema } from 'types';
import { zValidator } from '@hono/zod-validator';

const auth = new Hono();
const JWT_SECRET = 'commonground-secret-change-me';

auth.post('/register', zValidator('json', RegisterSchema), async (c) => {
  const { email, password, name, role, neighborhoodId, propertyId } = c.req.valid('json');

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return c.json({ error: { message: 'User already exists' } }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    email,
    passwordHash,
    name,
    role,
    neighborhoodId: neighborhoodId || null,
    createdAt: Date.now(),
  };

  await db.insert(users).values(newUser).run();

  // If propertyId is provided, link it to the user
  if (propertyId) {
    await db.update(properties).set({ ownerId: newUser.id }).where(eq(properties.id, propertyId)).run();
  }

  const token = await sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, 'HS256');

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return c.json({ token, user: userWithoutPassword });
});

auth.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json({ error: { message: 'Invalid credentials' } }, 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: { message: 'Invalid credentials' } }, 401);
  }

  const token = await sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, 'HS256');

  const { passwordHash: _, ...userWithoutPassword } = user;
  return c.json({ token, user: userWithoutPassword });
});

auth.get('/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const user = await db.select().from(users).where(eq(users.id, payload.id)).get();
  if (!user) return c.json({ error: { message: 'User not found' } }, 404);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return c.json({ data: userWithoutPassword });
});

export { auth, JWT_SECRET };
