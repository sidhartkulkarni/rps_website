import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests', workers: 1,
  outputDir: '../artifacts/backend-integration-browser',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5191', browserName: 'chromium' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5191 --strictPort', url: 'http://127.0.0.1:5191', reuseExistingServer: false },
})
