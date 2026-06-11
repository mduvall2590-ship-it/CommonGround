import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { db } from './db';
import { neighborhoods } from 'db';
import { auth } from './routes/auth';
import { neighborhoodRoutes } from './routes/neighborhoods';
import { governance } from './routes/governance';
import { financials } from './routes/financials';
import { maintenance } from './routes/maintenance';
import { improvements } from './routes/improvements';
import { ai } from './routes/ai';
import { cors } from 'hono/cors';

import { dashboard } from './routes/dashboard';
import { compliance } from './routes/compliance';

const app = new Hono();

// Enable CORS
app.use('*', cors());

app.get('/', (c) => {
  return c.text('CommonGround API is running');
});

app.get('/health', async (c) => {
  try {
    // Simple query to check DB connection
    const result = await db.select().from(neighborhoods).limit(1).all();
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        api: 'running',
        db: 'responsive'
      }
    });
  } catch (error) {
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: (error as Error).message
    }, 500);
  }
});

// Routes
app.route('/api/v1/auth', auth);
app.route('/api/v1/neighborhoods', neighborhoodRoutes);
app.route('/api/v1/governance', governance);
app.route('/api/v1/financials', financials);
app.route('/api/v1/maintenance', maintenance);
app.route('/api/v1/improvements', improvements);
app.route('/api/v1/ai', ai);
app.route('/api/v1/dashboard', dashboard);
app.route('/api/v1/compliance', compliance);

// Compatibility shim for new Resident Dashboard frontend
app.get('/api/v1/proposals', (c) => governance.request('/proposals', c.req.raw));
app.get('/api/v1/proposals/:id', (c) => governance.request(`/proposals/${c.req.param('id')}`, c.req.raw));
app.post('/api/v1/proposals/:id/vote', (c) => governance.request(`/proposals/${c.req.param('id')}/vote`, c.req.raw));
app.get('/api/v1/activity', (c) => financials.request('/ledger', c.req.raw));
app.get('/api/v1/neighborhood', (c) => neighborhoodRoutes.request('/', c.req.raw));
app.get('/api/v1/me', (c) => auth.request('/me', c.req.raw));

const port = 3002;
console.log(`Server is running on http://0.0.0.0:${port}`);

serve({
  fetch: app.fetch,
  port,
});
