import { createDb } from 'db';

// In a real app, these would come from environment variables
export const db: any = createDb('file:/home/team/shared/commonground/packages/db/local.db');
