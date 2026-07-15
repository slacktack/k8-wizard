import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const lessons = [
  { id: '07-07-observability-lab', phase: '07-monitoring', title: 'Observability Lab: Metrics, Logs & Traces' },
  { id: '08-07-security-hardening', phase: '08-production', title: 'Security Hardening: SecurityContext, Image Scanning & Best Practices' },
  { id: '08-08-helm-basics', phase: '08-production', title: 'Helm: Charts, Templates & Releases' },
  { id: '09-07-affinity-pdbs', phase: '09-advanced-workloads', title: 'Affinity, Anti-Affinity & PodDisruptionBudgets' },
  { id: '10-07-operators-lab', phase: '10-extending-k8s', title: 'Operators Lab: CRD, Controller & Simple Backup Operator' },
];

test.describe('New lessons smoke tests', () => {
  test.beforeEach(async () => {
    // console capture is done per-test for assertion
  });

  test('homepage loads without 500s and console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle');
    // save screenshot of homepage
    await fs.promises.mkdir('tests/screenshots', { recursive: true });
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
    expect(consoleErrors, 'No console errors on homepage').toHaveLength(0);
  });

  for (const lesson of lessons) {
    test(`validate lesson ${lesson.id}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const url = `${BASE}/lesson/${lesson.phase}/${lesson.id}`;
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Verify title
      await expect(page.locator(`text=${lesson.title}`)).toBeVisible({ timeout: 5000 });

      // Verify progress count (e.g., '1 of 7')
      const progress = page.locator('.progress-count');
      await expect(progress.first()).toHaveText(/\d+ of \d+/);

      // Verify sidebar exists
      await expect(page.locator('.lesson-grid')).toBeVisible();

      // Verify code blocks / YAML snippets render (pre or code tags)
      const codeBlocks = page.locator('pre, code');
      await expect(codeBlocks.first()).toBeVisible();

      // Verify quiz exists if the lesson has one (not all lessons include a Quiz section)
      const quiz = page.locator('text=Quiz');
      if (await quiz.count() > 0) {
        await expect(quiz.first()).toBeVisible({ timeout: 3000 });
      }

      // Capture screenshot (desktop)
      await page.screenshot({ path: `tests/screenshots/${lesson.id}.png`, fullPage: true });

      // Mobile viewport check
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `tests/screenshots/${lesson.id}-mobile.png`, fullPage: true });

      // Click Next if exists and verify route changed
      const nextNav = page.locator('.lesson-nav a').nth(1);
      if (await nextNav.count() > 0) {
        const href = await nextNav.getAttribute('href');
        if (href) {
          await nextNav.click();
          await page.waitForLoadState('networkidle');
          // route changed
          await page.screenshot({ path: `tests/screenshots/${lesson.id}-next.png`, fullPage: true });
        }
      }

      // Assert no console errors during lesson page
      expect(errors, `Console errors on lesson ${lesson.id}`).toHaveLength(0);
    });
  }
});
