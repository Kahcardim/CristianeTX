import { defineConfig, devices } from "@playwright/test";

const siteDir=process.env.SITE_DIR || "docs";

export default defineConfig({
  testDir:"./tests",
  timeout:30000,
  expect:{timeout:7000},
  fullyParallel:true,
  forbidOnly:Boolean(process.env.CI),
  retries:process.env.CI ? 1 : 0,
  workers:process.env.CI ? 3 : undefined,
  reporter:[
    ["line"],
    ["html",{outputFolder:"playwright-report",open:"never"}]
  ],
  use:{
    baseURL:"http://127.0.0.1:4173",
    trace:"retain-on-failure",
    screenshot:"only-on-failure",
    video:"retain-on-failure"
  },
  webServer:{
    command:`python3 -m http.server 4173 --bind 127.0.0.1 --directory ${siteDir}`,
    url:"http://127.0.0.1:4173",
    reuseExistingServer:false,
    timeout:15000
  },
  projects:[
    {
      name:"chromium",
      use:{...devices["Desktop Chrome"]}
    },
    {
      name:"firefox",
      grep:/@smoke/,
      use:{...devices["Desktop Firefox"]}
    },
    {
      name:"webkit",
      grep:/@smoke/,
      use:{...devices["Desktop Safari"]}
    }
  ]
});
