import { test, expect } from "@playwright/test";
import { routes, collectRuntimeErrors } from "./helpers.mjs";

for(const route of routes){
  test(`@smoke rota ${route}`,async({page})=>{
    const runtimeErrors=collectRuntimeErrors(page);
    await page.addInitScript(()=>{
      try{localStorage.setItem("ct-cookie-notice-v1","acknowledged")}catch{}
    });

    const response=await page.goto(route,{waitUntil:"networkidle"});
    expect(response,`sem resposta em ${route}`).not.toBeNull();
    expect(response.status(),`status inesperado em ${route}`).toBeLessThan(400);

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    const title=await page.title();
    expect(title.trim().length).toBeGreaterThan(5);

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    expect(overflow,`overflow horizontal em ${route}`).toBeLessThanOrEqual(1);

    const brokenImages=await page.locator("img").evaluateAll(images=>images
      .filter(img=>img.getBoundingClientRect().width>0)
      .filter(img=>!img.complete || img.naturalWidth===0)
      .map(img=>img.getAttribute("src")));
    expect(brokenImages,`imagens quebradas em ${route}`).toEqual([]);

    expect(runtimeErrors,`erros JS em ${route}`).toEqual([]);
  });
}
