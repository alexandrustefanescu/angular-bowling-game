import { test, expect, Page } from '@playwright/test';

async function roll(page: Page, pins: number) {
  await page.getByLabel('Enter Pins Knocked Down').fill(String(pins));
  await page.getByRole('button', { name: 'Roll' }).click();
}

async function rollMany(page: Page, times: number, pins: number) {
  for (let i = 0; i < times; i++) {
    await roll(page, pins);
  }
}

function getFrameRolls(page: Page, frameIndex: number) {
  const frame = page.locator('app-scoreboard-frame').nth(frameIndex);
  return {
    nth: (i: number) => {
      const testids = ['first-roll', 'second-roll', 'third-roll'];
      return frame.locator(`[data-test="${testids[i]}"]`);
    },
  };
}

function getFrameScore(page: Page, frameIndex: number) {
  return page.locator('app-scoreboard-frame').nth(frameIndex).locator('[data-test="frame-score"]');
}

async function assertFrame(page: Page, frameIndex: number, expectedRolls: string[], expectedScore: string) {
  const rolls = getFrameRolls(page, frameIndex);
  for (let i = 0; i < expectedRolls.length; i++) {
    await expect(rolls.nth(i)).toHaveText(expectedRolls[i]);
  }
  await expect(getFrameScore(page, frameIndex)).toHaveText(expectedScore);
}

async function assertGameCompleted(page: Page, finalScore: number) {
  await expect(page.getByText('Game Completed!')).toBeVisible();
  await expect(page.getByText(`Final Score: ${finalScore}`)).toBeVisible();
}

test.describe('Full Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Gutter Game — all rolls 0, final score 0', async ({ page }) => {
    await rollMany(page, 20, 0);

    for (let i = 0; i < 10; i++) {
      await assertFrame(page, i, ['-', '-'], '0');
    }

    await assertGameCompleted(page, 0);
  });

  test('All Fives — all spares, final score 150', async ({ page }) => {
    await rollMany(page, 21, 5);

    const expectedScores = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150];

    for (let i = 0; i < 9; i++) {
      await assertFrame(page, i, ['5', '/'], String(expectedScores[i]));
    }

    await assertFrame(page, 9, ['5', '/', '5'], '150');
    await assertGameCompleted(page, 150);
  });

  test('Perfect Game — all strikes, final score 300', async ({ page }) => {
    await rollMany(page, 12, 10);

    const expectedScores = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];

    for (let i = 0; i < 9; i++) {
      await assertFrame(page, i, ['X'], String(expectedScores[i]));
    }

    await assertFrame(page, 9, ['X', 'X', 'X'], '300');
    await assertGameCompleted(page, 300);
  });

  test('Alternating pairs — two spares then two strikes, final score 190', async ({ page }) => {
    await roll(page, 5); await roll(page, 5);
    await roll(page, 5); await roll(page, 5);
    await roll(page, 10);
    await roll(page, 10);
    await roll(page, 5); await roll(page, 5);
    await roll(page, 5); await roll(page, 5);
    await roll(page, 10);
    await roll(page, 10);
    await roll(page, 5); await roll(page, 5);
    await roll(page, 5); await roll(page, 5); await roll(page, 5);

    await assertFrame(page, 0, ['5', '/'], '15');
    await assertFrame(page, 1, ['5', '/'], '35');
    await assertFrame(page, 2, ['X'], '60');
    await assertFrame(page, 3, ['X'], '80');
    await assertFrame(page, 4, ['5', '/'], '95');
    await assertFrame(page, 5, ['5', '/'], '115');
    await assertFrame(page, 6, ['X'], '140');
    await assertFrame(page, 7, ['X'], '160');
    await assertFrame(page, 8, ['5', '/'], '175');
    await assertFrame(page, 9, ['5', '/', '5'], '190');

    await assertGameCompleted(page, 190);
  });

  test('Last frame with strike and spare, final score 83', async ({ page }) => {
    for (let i = 0; i < 9; i++) {
      await roll(page, 3);
      await roll(page, 4);
    }
    await roll(page, 10);
    await roll(page, 7);
    await roll(page, 3);

    const expectedScores = [7, 14, 21, 28, 35, 42, 49, 56, 63, 83];

    for (let i = 0; i < 9; i++) {
      await assertFrame(page, i, ['3', '4'], String(expectedScores[i]));
    }

    await assertFrame(page, 9, ['X', '7', '/'], '83');
    await assertGameCompleted(page, 83);
  });

  test('Mixed game — normals, strikes, spares, and gutters, final score 125', async ({ page }) => {
    await roll(page, 3); await roll(page, 6);
    await roll(page, 10);
    await roll(page, 6); await roll(page, 4);
    await roll(page, 0); await roll(page, 0);
    await roll(page, 10);
    await roll(page, 10);
    await roll(page, 2); await roll(page, 5);
    await roll(page, 8); await roll(page, 2);
    await roll(page, 3); await roll(page, 6);
    await roll(page, 7); await roll(page, 3); await roll(page, 8);

    await assertFrame(page, 0, ['3', '6'], '9');
    await assertFrame(page, 1, ['X'], '29');
    await assertFrame(page, 2, ['6', '/'], '39');
    await assertFrame(page, 3, ['-', '-'], '39');
    await assertFrame(page, 4, ['X'], '61');
    await assertFrame(page, 5, ['X'], '78');
    await assertFrame(page, 6, ['2', '5'], '85');
    await assertFrame(page, 7, ['8', '/'], '98');
    await assertFrame(page, 8, ['3', '6'], '107');
    await assertFrame(page, 9, ['7', '/', '8'], '125');

    await assertGameCompleted(page, 125);
  });

  test('Error recovery — invalid rolls show errors, game continues correctly, final score 102', async ({ page }) => {
    const errorMessage = page.locator('[data-test="service-error"]');

    await roll(page, 5);
    await roll(page, 8);
    await expect(errorMessage).toHaveText('Invalid pin count. Must be between 0 and 5.');
    await roll(page, 3);
    await expect(errorMessage).not.toBeVisible();

    await roll(page, 10);

    await roll(page, 6);
    await roll(page, 7);
    await expect(errorMessage).toHaveText('Invalid pin count. Must be between 0 and 4.');
    await roll(page, 4);
    await expect(errorMessage).not.toBeVisible();

    await roll(page, 0); await roll(page, 0);

    await roll(page, 2);
    await roll(page, 9);
    await expect(errorMessage).toHaveText('Invalid pin count. Must be between 0 and 8.');
    await roll(page, 5);
    await expect(errorMessage).not.toBeVisible();

    await roll(page, 3); await roll(page, 3);

    await roll(page, 10);

    await roll(page, 4); await roll(page, 4);

    await roll(page, 1);
    await roll(page, 10);
    await expect(errorMessage).toHaveText('Invalid pin count. Must be between 0 and 9.');
    await roll(page, 8);
    await expect(errorMessage).not.toBeVisible();

    await roll(page, 7);
    await roll(page, 3);
    await roll(page, 6);

    await assertFrame(page, 0, ['5', '3'], '8');
    await assertFrame(page, 1, ['X'], '28');
    await assertFrame(page, 2, ['6', '/'], '38');
    await assertFrame(page, 3, ['-', '-'], '38');
    await assertFrame(page, 4, ['2', '5'], '45');
    await assertFrame(page, 5, ['3', '3'], '51');
    await assertFrame(page, 6, ['X'], '69');
    await assertFrame(page, 7, ['4', '4'], '77');
    await assertFrame(page, 8, ['1', '8'], '86');
    await assertFrame(page, 9, ['7', '/', '6'], '102');

    await assertGameCompleted(page, 102);
  });
});
