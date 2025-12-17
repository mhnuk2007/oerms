import { test, expect } from '@playwright/test';

async function injectAxe(page) {
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js' });
}

// Create a fake JWT (unsigned) with payload containing expected user fields
function createFakeToken() {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: 'test-sub',
    userId: 'test-user',
    email: 'test@example.com',
    username: 'testuser',
    roles: ['STUDENT'],
    authorities: ['ROLE_USER'],
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const toBase64Url = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${toBase64Url(header)}.${toBase64Url(payload)}.`; // trailing dot for signature (none)
}

test.describe('Authenticated accessibility audit (axe)', () => {
  const paths = ['/dashboard', '/dashboard/student', '/dashboard/teacher', '/profile', '/results'];

  test.beforeEach(async ({ page }) => {
    // Inject localStorage tokens before the page loads
    const token = createFakeToken();
    await page.addInitScript((t) => {
      localStorage.setItem('access_token', t);
      localStorage.setItem('refresh_token', 'fake-refresh');
      localStorage.setItem('token_expires_at', String(Date.now() + 3600 * 1000));
    }, token);
  });

  for (const p of paths) {
    test(`audit authenticated page ${p}`, async ({ page, baseURL }) => {
      const url = (baseURL || 'http://localhost:3000') + p;
      await page.goto(url);
      await injectAxe(page);

      const results = await page.evaluate(async () => {
        // @ts-ignore
        return await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2aa'] } });
      });

      if (results.violations && results.violations.length > 0) {
        console.log(`Accessibility violations on ${p}:`, results.violations.length);
        for (const v of results.violations) {
          console.log(`- id: ${v.id} impact: ${v.impact} description: ${v.description}`);
          for (const node of v.nodes) {
            console.log('  target:', node.target.join(', '));
          }
        }
      }

      expect(results.violations.length).toBe(0);
    });
  }
});
