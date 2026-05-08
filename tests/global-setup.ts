import { request } from '@playwright/test';
import { TEST_ACCOUNT } from './helpers';

export default async function globalSetup() {
  const req = await request.newContext({ baseURL: 'http://localhost:5173' });
  // Create test account — ignore error if already exists
  await req.post('/api/accounts', { data: { name: TEST_ACCOUNT } }).catch(() => {});
  await req.dispose();
}
