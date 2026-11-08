import { test, expect } from '@playwright/test';

test('church content and logo load without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nepali church');
  for (const id of ['mission','about','pastors','connect']) await expect(page.locator('#'+id)).toBeVisible();
  await expect(page.locator('#visit')).toContainText('400 Donelson Pike');
  await expect.poll(() => page.locator('.brand-logo').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await context.close();
});

test('mobile menu closes after selecting a section', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation').getByRole('link', { name: 'Mission', exact: true }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#mission$/);
});

test('contact form preserves a failed message and clears it after successful retry', async ({ page }) => {
  let attempts = 0;
  await page.route('https://formspree.io/**', route => {
    attempts++;
    return route.fulfill({ status: attempts === 1 ? 500 : 200, json: { ok: attempts > 1 } });
  });
  await page.goto('/');
  await page.getByLabel('Your name').fill('Local preview test');
  await page.getByLabel('Email address').fill('preview@example.com');
  const message = page.getByLabel('How can we help?');
  await message.fill('This is intercepted; no message is sent.');
  const submit = page.getByRole('button', { name: 'Send message' });
  await submit.click();
  await expect(page.getByRole('status')).toContainText('could not be sent');
  await expect(message).toHaveValue('This is intercepted; no message is sent.');
  await submit.click();
  await expect(page.getByRole('status')).toContainText('Your message has been sent');
  await expect(message).toHaveValue('');
});

test('editor exposes branding, layout and mission image controls', async ({ request }) => {
  const [admin, config] = await Promise.all([request.get('/admin/'),request.get('/admin/config.yml')]);
  expect(admin.ok()).toBeTruthy();
  expect(config.ok()).toBeTruthy();
  const yaml = await config.text();
  for (const value of ['Branding & layout','Homepage section order','Mission stories','widget: image','public/uploads']) expect(yaml).toContain(value);
});

test('Nepal mission opens in a new tab with aid details and credited images', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#mission');
  if (isMobile) {
    await page.getByRole('button', { name: 'Next mission story' }).click();
    await expect.poll(() => page.locator('#mission-track').evaluate(track => track.scrollLeft)).toBeGreaterThan(0);
  }
  const [mission] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('#mission-track a[href="/mission/nepal/"]').click(),
  ]);
  await expect(mission).toHaveURL(/\/mission\/nepal\/$/);
  await expect(mission.getByRole('heading', { name: 'Sharing the Gospel' })).toBeVisible();
  await expect(mission.getByRole('heading', { name: 'Flood relief and practical aid' })).toBeVisible();
  await expect(mission.getByRole('link', { name: 'CC BY-SA 4.0', exact: true })).toHaveCount(0);
  await mission.getByText('Image sources', { exact: true }).click();
  await expect(mission.getByRole('link', { name: 'CC BY-SA 4.0', exact: true })).toHaveCount(2);
  const images = mission.locator('.mission-detail img');
  await expect(images).toHaveCount(3);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  }
  expect(await mission.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
