import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const compliance = new Hono();

// ── Types ──

interface ComplianceMetric {
  label: string;
  percentage: number;
  weight: number;
  status: 'compliant' | 'warning' | 'risk';
  details: string;
}

interface HealthScore {
  score: number;
  level: 'green' | 'amber' | 'red';
  metrics: ComplianceMetric[];
}

interface SentinelAlert {
  id: string;
  type: 'notice_warning' | 'report_overdue' | 'timer_breach' | 'certificate_check';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  createdAt: number;
}

interface ComplianceReport {
  id: string;
  type: 'annual_financial' | 'meeting_minutes';
  title: string;
  generatedAt: number;
  format: 'PDF';
  verified: boolean;
}

interface RecordRequest {
  id: string;
  residentName: string;
  documentType: string;
  properPurpose: string;
  status: 'pending' | 'fulfilled' | 'denied';
  createdAt: number;
  fulfilledAt?: number;
  adminNotes?: string;
  ticketId: string;
}

// ── Mock Data ──

const complianceMetrics: ComplianceMetric[] = [
  {
    label: 'Annual Meeting',
    percentage: 100,
    weight: 40,
    status: 'compliant',
    details: 'Last annual meeting held on March 15, 2025 — within the 15-month statutory window.',
  },
  {
    label: 'Financial Disclosure',
    percentage: 100,
    weight: 30,
    status: 'compliant',
    details: 'Annual financial statement shared with all members on April 1, 2025 — within 90 days of fiscal year-end.',
  },
  {
    label: 'Record Access',
    percentage: 60,
    weight: 20,
    status: 'warning',
    details: '1 pending record request approaching the 5 business day fulfillment window.',
  },
  {
    label: 'Notices & Filings',
    percentage: 100,
    weight: 10,
    status: 'compliant',
    details: 'Management Certificate on file. Meeting notices sent 10-60 days in advance for all meetings.',
  },
];

const sentinelAlerts: SentinelAlert[] = [
  {
    id: 'sa-001',
    type: 'timer_breach',
    title: 'Record Request Approaching Deadline',
    description: 'Record request RR-2025-001 (Alex M.) expires tomorrow to meet TN "reasonable time" standard.',
    severity: 'high',
    actionable: true,
    createdAt: Date.now(),
  },
  {
    id: 'sa-002',
    type: 'certificate_check',
    title: 'Management Certificate Verified',
    description: 'Management Certificate is on file with Wilson County Register of Deeds. Next review: January 2026.',
    severity: 'low',
    actionable: false,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
];

const reportHistory: ComplianceReport[] = [
  { id: 'rpt-001', type: 'annual_financial', title: 'FY 2024 Annual Financial Report', generatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, format: 'PDF', verified: true },
  { id: 'rpt-002', type: 'meeting_minutes', title: 'Annual Meeting Minutes — March 2025', generatedAt: Date.now() - 45 * 24 * 60 * 60 * 1000, format: 'PDF', verified: true },
  { id: 'rpt-003', type: 'annual_financial', title: 'FY 2023 Annual Financial Report', generatedAt: Date.now() - 395 * 24 * 60 * 60 * 1000, format: 'PDF', verified: true },
];

const recordRequests: RecordRequest[] = [
  {
    id: 'rr-001',
    residentName: 'Alex M.',
    documentType: 'Financial Ledger (Q1 2025)',
    properPurpose: 'To verify Association expenditures and financial health.',
    status: 'pending',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    ticketId: 'RR-2025-001',
  },
  {
    id: 'rr-002',
    residentName: 'Jamie L.',
    documentType: 'Board Meeting Minutes (March 2025)',
    properPurpose: 'To review Board meeting minutes regarding a specific community decision.',
    status: 'fulfilled',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    fulfilledAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    ticketId: 'RR-2025-002',
  },
];

// ── Helpers ──

function calculateHealthScore(metrics: ComplianceMetric[]): { score: number; level: 'green' | 'amber' | 'red' } {
  const score = Math.round(metrics.reduce((sum, m) => {
    const weighted = (m.percentage / 100) * m.weight;
    return sum + weighted;
  }, 0));

  let level: 'green' | 'amber' | 'red' = 'green';
  if (score < 70) level = 'red';
  else if (score < 90) level = 'amber';

  return { score, level };
}

// ── Routes ──

// GET /api/v1/compliance/health-score
compliance.get('/health-score', (c) => {
  const healthScore = calculateHealthScore(complianceMetrics);
  return c.json({ data: { score: healthScore.score, level: healthScore.level, metrics: complianceMetrics } });
});

// GET /api/v1/compliance/sentinel-alerts
compliance.get('/sentinel-alerts', (c) => {
  return c.json({ data: sentinelAlerts });
});

// GET /api/v1/compliance/reports
compliance.get('/reports', (c) => {
  return c.json({ data: reportHistory });
});

// POST /api/v1/compliance/reports/generate
const reportSchema = z.object({
  type: z.enum(['annual_financial', 'meeting_minutes']),
});

compliance.post('/reports/generate', zValidator('json', reportSchema), (c) => {
  const { type } = c.req.valid('json');
  const newReport: ComplianceReport = {
    id: `rpt-${Date.now()}`,
    type,
    title: type === 'annual_financial' ? 'FY 2025 Annual Financial Report' : 'Meeting Minutes — Generated Report',
    generatedAt: Date.now(),
    format: 'PDF',
    verified: true,
  };
  reportHistory.unshift(newReport);
  return c.json({ data: newReport });
});

// GET /api/v1/compliance/records
compliance.get('/records', (c) => {
  return c.json({ data: recordRequests });
});

// POST /api/v1/compliance/records
const recordRequestSchema = z.object({
  residentName: z.string().min(1),
  documentType: z.string().min(1),
  properPurpose: z.string().min(1),
});

compliance.post('/records', zValidator('json', recordRequestSchema), (c) => {
  const { residentName, documentType, properPurpose } = c.req.valid('json');
  const newRequest: RecordRequest = {
    id: `rr-${Date.now()}`,
    residentName,
    documentType,
    properPurpose,
    status: 'pending',
    createdAt: Date.now(),
    ticketId: `RR-2025-${String(recordRequests.length + 1).padStart(3, '0')}`,
  };
  recordRequests.unshift(newRequest);
  return c.json({ data: newRequest });
});

// POST /api/v1/compliance/records/:id/fulfill
const fulfillSchema = z.object({
  action: z.enum(['fulfill', 'deny']),
  adminNotes: z.string().optional(),
});

compliance.post('/records/:id/fulfill', zValidator('json', fulfillSchema), (c) => {
  const id = c.req.param('id');
  const { action, adminNotes } = c.req.valid('json');
  const request = recordRequests.find(r => r.id === id);

  if (!request) {
    return c.json({ error: { message: 'Record request not found', code: 'NOT_FOUND' } }, 404);
  }

  request.status = action === 'fulfill' ? 'fulfilled' : 'denied';
  request.fulfilledAt = Date.now();
  if (adminNotes) request.adminNotes = adminNotes;

  return c.json({ data: request });
});

// GET /api/v1/compliance/public
compliance.get('/public', (c) => {
  const healthScore = calculateHealthScore(complianceMetrics);
  return c.json({
    data: {
      neighborhoodName: 'Music City Commons',
      complianceScore: healthScore.score,
      complianceLevel: healthScore.level,
      reserveHealth: 78,
      duesReduction: 22,
      improvementsCompleted: 3,
      transparencyActive: true,
      charterCommitment: `"The CommonGround Transparency Pledge: Music City Commons operates under a resident-owned governance model. We utilize AI-assisted auditing and real-time financial reporting to ensure that 100% of community dues are invested back into the neighborhood."`,
    },
  });
});
