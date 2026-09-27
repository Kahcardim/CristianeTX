import { test, expect } from "@playwright/test";
import { routes } from "./helpers.mjs";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    try{localStorage.setItem("ct-cookie-notice-v1","acknowledged")}catch{}
  });
});

for(const route of routes){
  test(`semântica essencial ${route}`,async({page})=>{
    await page.goto(route,{waitUntil:"networkidle"});

    await expect(page.locator("html")).toHaveAttribute("lang","pt-BR");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('a.skip-link[href="#conteudo"]')).toHaveCount(1);
    await expect(page.locator("#conteudo")).toHaveCount(1);

    const nameless=await page.locator("a,button").evaluateAll(elements=>elements
      .filter(el=>{
        const r=el.getBoundingClientRect();
        const s=getComputedStyle(el);
        return r.width>0 && r.height>0 && s.visibility!=="hidden" && s.display!=="none";
      })
      .filter(el=>{
        const name=(el.getAttribute("aria-label")||el.getAttribute("title")||el.textContent||"").trim();
        return !name;
      })
      .map(el=>el.outerHTML.slice(0,160)));
    expect(nameless,`controles sem nome em ${route}`).toEqual([]);
  });
}

test("preferências nativas são refletidas no documento",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce",forcedColors:"active"});
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-reduced-motion","true");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-forced-colors","true");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-native","ready");
});

test("controles primários mobile têm área de toque mínima",async({page})=>{
  await page.setViewportSize({width:360,height:800});
  await page.goto("/");
  await page.evaluate(()=>localStorage.removeItem("ct-cookie-notice-v1"));
  await page.reload();

  const selectors=[
    "[data-menu-toggle]",
    ".hero-actions .button",
    ".presentation-arrow",
    ".cookie-notice a",
    ".cookie-ack"
  ];

  const failures=await page.evaluate(selectors=>{
    const result=[];
    for(const selector of selectors){
      document.querySelectorAll(selector).forEach(el=>{
        const r=el.getBoundingClientRect();
        const s=getComputedStyle(el);
        if(r.width===0||r.height===0||s.display==="none"||s.visibility==="hidden") return;
        if(r.width<44||r.height<44) result.push({selector,width:r.width,height:r.height,text:(el.textContent||"").trim()});
      });
    }
    return result;
  },selectors);

  expect(failures,"alvos de toque menores que 44px").toEqual([]);
});
