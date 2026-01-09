import { describe, it, expect } from '@jest/globals';
import { DELETE } from './route';
type NextRequest = any;

function mockRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
  } as unknown as NextRequest;
}

describe('DELETE /api/meals/[id]', () => {
  it('returns 401 if not authorized', async () => {
    const req = mockRequest();
    // @ts-ignore
    const res = await DELETE(req, { params: { id: 'fakeid' } });
    expect(res.status).toBe(401);
  });
});
