import { request } from '@playwright/test';
import { TEST_ACCOUNT } from './helpers';

export default async function globalTeardown() {
  const req = await request.newContext({ baseURL: 'http://localhost:5173' });
  await req.delete(`/api/accounts/${TEST_ACCOUNT}`).catch(() => {});
  await req.dispose();
}
