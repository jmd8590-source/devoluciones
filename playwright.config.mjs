import { defineConfig, devices } from '@playwright/test';
const chromeChannel = process.env.PW_CHROME_PATH ? { launchOptions: { executablePath: process.env.PW_CHROME_PATH } } : {};
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:8788', ...chromeChannel },
  webServer: { command: 'npm run build && node scripts/serve.mjs dist 8788', port: 8788, reuseExistingServer: !process.env.CI, timeout: 120000 },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, ...chromeChannel } },
    { name: 'movil', use: { ...devices['Pixel 7'], ...chromeChannel } },
  ],
});
