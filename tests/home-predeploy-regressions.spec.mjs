import { test, expect } from "@playwright/test";
import { routes, heroViewports, collectRuntimeErrors } from "./helpers.mjs";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    try{localStorage.setItem("ct-cookie-notice-v1","acknowledged")}catch{}
  });
});

for(const viewport of heroViewports){
  test(`BUG-MOBILE-01 header global ocupa a viewport em ${viewport.width}px`,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});

    for(const route of routes){
      await page.goto(route,{waitUntil:"networkidle"});
      const metrics=await page.evaluate(()=>{
        const header=document.querySelector(".site-header")?.getBoundingClientRect();
        const inner=document.querySelector(".header-inner")?.getBoundingClientRect();
        return {
          viewport:window.innerWidth,
          scrollWidth:document.documentElement.scrollWidth,
          header:header?{left:header.left,right:header.right,width:header.width}:null,
          inner:inner?{left:inner.left,right:inner.right,width:inner.width}:null
        };
      });

      expect(metrics.scrollWidth-metrics.viewport,`overflow em ${route}`).toBeLessThanOrEqual(1);
      if(route==="/404.html") continue;
      expect(metrics.header,`header ausente em ${route}`).not.toBeNull();
      expect(Math.abs(metrics.header.left),`borda esquerda em ${route}`).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.header.right-metrics.viewport),`borda direita em ${route}`).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.header.width-metrics.viewport),`largura em ${route}`).toBeLessThanOrEqual(1);
      expect(metrics.inner.left,`container esquerdo em ${route}`).toBeGreaterThanOrEqual(0);
      expect(metrics.inner.right,`container direito em ${route}`).toBeLessThanOrEqual(metrics.viewport+1);
    }
  });
}

for(const viewport of [
  {name:"portrait",width:393,height:852},
  {name:"landscape",width:852,height:393}
]){
  test(`BUG-MOBILE-01 menu permanece dentro da largura útil em ${viewport.name}`,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.goto("/",{waitUntil:"networkidle"});
    await page.locator("[data-menu-toggle]").click();

    const menu=await page.locator("[data-menu]").evaluate(element=>{
      const rect=element.getBoundingClientRect();
      const firstLink=element.querySelector("a").getBoundingClientRect();
      return {
        left:rect.left,right:rect.right,width:rect.width,viewport:window.innerWidth,
        firstLinkVisible:Boolean(document.elementFromPoint(firstLink.left+firstLink.width/2,firstLink.top+firstLink.height/2)?.closest("[data-menu]"))
      };
    });

    expect(Math.abs(menu.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(menu.right-menu.viewport)).toBeLessThanOrEqual(1);
    expect(menu.firstLinkVisible).toBe(true);
  });
}

test("BUG-MOBILE-01 paisagem usa a largura sem empilhar um hero excessivo",async({page})=>{
  await page.setViewportSize({width:852,height:393});
  await page.goto("/",{waitUntil:"networkidle"});
  const metrics=await page.evaluate(()=>{
    const hero=document.querySelector(".hero").getBoundingClientRect();
    const copy=document.querySelector(".hero-copy").getBoundingClientRect();
    const photo=document.querySelector(".portrait-frame").getBoundingClientRect();
    return {heroHeight:hero.height,viewportHeight:innerHeight,copyRight:copy.right,photoLeft:photo.left,photoRight:photo.right,viewportWidth:innerWidth};
  });
  expect(metrics.heroHeight).toBeLessThan(metrics.viewportHeight*1.4);
  expect(metrics.copyRight).toBeLessThan(metrics.photoLeft);
  expect(metrics.photoRight).toBeGreaterThan(metrics.viewportWidth*.9);
});

test("BUG-MOBILE-01 contrato de safe area está presente em todas as páginas",async({page})=>{
  for(const route of routes){
    await page.goto(route,{waitUntil:"networkidle"});
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content",/viewport-fit=cover/);
  }

  const css=await (await page.request.get("/assets/css/styles.css")).text();
  for(const token of ["safe-area-inset-top","safe-area-inset-left","safe-area-inset-right"]){
    expect(css).toContain(token);
  }
});

test("BUG-HOME-01 bloco inicial mantém escala contida no desktop",async({page})=>{
  await page.setViewportSize({width:1536,height:864});
  await page.goto("/",{waitUntil:"networkidle"});
  const metrics=await page.evaluate(()=>{
    const header=document.querySelector(".site-header").getBoundingClientRect();
    const hero=document.querySelector(".hero").getBoundingClientRect();
    const presentation=document.querySelector(".presentation-slide").getBoundingClientRect();
    return {headerHeight:header.height,heroHeight:hero.height,presentationHeight:presentation.height,viewportHeight:innerHeight};
  });
  expect(metrics.heroHeight).toBeLessThan(metrics.viewportHeight-metrics.headerHeight);
  expect(metrics.heroHeight).toBeLessThanOrEqual(700);
  expect(metrics.presentationHeight).toBeLessThanOrEqual(430);
});

test("BUG-HOME-02 cards institucionais usam imagens próprias e válidas",async({page})=>{
  await page.goto("/",{waitUntil:"networkidle"});
  const images=page.locator(".presentation-photo img");
  await expect(images).toHaveCount(3);
  const invalid=await images.evaluateAll(items=>items.filter(img=>!img.complete||img.naturalWidth<900||img.naturalHeight<675).map(img=>img.src));
  expect(invalid).toEqual([]);
});

test("BUG-HOME-03 e BUG-HOME-04 conteúdo é específico, centralizado e compacto",async({page})=>{
  await page.setViewportSize({width:1536,height:864});
  await page.goto("/",{waitUntil:"networkidle"});
  await expect(page.locator(".home-guide-card")).toHaveCount(3);
  await expect(page.getByText("Quanto tempo falta para se aposentar?",{exact:true})).toBeVisible();
  await expect(page.getByText("Desconto não reconhecido na aposentadoria: por onde começar?",{exact:true})).toBeVisible();
  const metrics=await page.locator(".home-guides-grid").evaluate(element=>{
    const rect=element.getBoundingClientRect();
    return {left:rect.left,right:rect.right,width:rect.width,viewport:innerWidth};
  });
  expect(Math.abs(metrics.left-(metrics.viewport-metrics.right))).toBeLessThanOrEqual(2);
  expect(metrics.width).toBeLessThanOrEqual(1041);
});

test("BUG-HOME-05 fechamento mantém eixo central e runtime limpo",async({page})=>{
  const runtimeErrors=collectRuntimeErrors(page);
  await page.setViewportSize({width:1536,height:864});
  await page.goto("/",{waitUntil:"networkidle"});
  const metrics=await page.evaluate(()=>{
    const cta=document.querySelector(".final-cta-grid").getBoundingClientRect();
    const footer=document.querySelector(".footer-grid").getBoundingClientRect();
    return {viewport:innerWidth,cta:{left:cta.left,right:cta.right,width:cta.width},footer:{left:footer.left,right:footer.right,width:footer.width}};
  });
  expect(Math.abs(metrics.cta.left-(metrics.viewport-metrics.cta.right))).toBeLessThanOrEqual(2);
  expect(Math.abs(metrics.footer.left-(metrics.viewport-metrics.footer.right))).toBeLessThanOrEqual(2);
  expect(runtimeErrors).toEqual([]);
});
