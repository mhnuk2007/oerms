import { test, expect } from '@playwright/test';

async function injectAxe(page) {
  // inject axe-core from CDN to avoid local install
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js' });
}

test.describe('Accessibility audit (axe) - multiple pages', () => {
  const paths = ['/', '/login', '/register', '/exams', '/features', '/pricing', '/about', '/contact'];

  for (const p of paths) {
    test(`audit ${p}`, async ({ page, baseURL }) => {
      const url = (baseURL || 'http://localhost:3000') + p;
      await page.goto(url);
      await injectAxe(page);

      const results = await page.evaluate(async () => {
        // @ts-ignore
        return await (window as any).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2aa'] },
        });
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
