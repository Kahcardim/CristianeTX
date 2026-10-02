import { test, expect } from "@playwright/test";
import { routes, responsiveViewports, heroViewports } from "./helpers.mjs";

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    try{localStorage.setItem("ct-cookie-notice-v1","acknowledged")}catch{}
  });
});

for(const viewport of responsiveViewports){
  for(const route of routes){
    test(`responsivo ${viewport.name} ${route}`,async({page})=>{
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      await page.goto(route,{waitUntil:"networkidle"});

      const metrics=await page.evaluate(()=>({
        innerWidth:window.innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        bodyWidth:document.body.getBoundingClientRect().width,
        mainWidth:document.querySelector("main")?.getBoundingClientRect().width||0
      }));

      expect(metrics.scrollWidth-metrics.innerWidth,`overflow em ${viewport.name} ${route}`).toBeLessThanOrEqual(1);
      expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.innerWidth+1);
      expect(metrics.mainWidth).toBeLessThanOrEqual(metrics.innerWidth+1);
    });
  }
}

for(const viewport of heroViewports){
  test(`home hero estável ${viewport.name}`,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.goto("/",{waitUntil:"networkidle"});

    const metrics=await page.evaluate(()=>{
      const portrait=document.querySelector(".hero-portrait");
      const frame=document.querySelector(".portrait-frame");
      const copy=document.querySelector(".hero-copy");
      const image=document.querySelector(".hero-portrait img");
      const pictureSource=document.querySelector('.hero-portrait source[media="(max-width:680px)"]');
      const pr=portrait?.getBoundingClientRect();
      const fr=frame?.getBoundingClientRect();
      const cr=copy?.getBoundingClientRect();
      return {
        portrait:pr?{top:pr.top,bottom:pr.bottom,width:pr.width,height:pr.height}:null,
        frame:fr?{width:fr.width,height:fr.height}:null,
        copy:cr?{top:cr.top,width:cr.width}:null,
        objectFit:image?getComputedStyle(image).objectFit:null,
        objectPosition:image?getComputedStyle(image).objectPosition:null,
        mobileSource:pictureSource?.getAttribute("srcset")||null
      };
    });

    expect(metrics.portrait).not.toBeNull();
    expect(metrics.copy).not.toBeNull();

    if(viewport.width<=680){
      expect(metrics.mobileSource).toContain("hero-mobile.webp");
      expect(metrics.frame.height).toBeGreaterThanOrEqual(200);
      expect(metrics.frame.height).toBeLessThanOrEqual(255);
      expect(Math.abs(metrics.copy.top-metrics.portrait.bottom)).toBeLessThanOrEqual(2);
      expect(metrics.copy.width).toBeLessThanOrEqual(viewport.width);
      expect(metrics.objectFit).toBe("cover");
      expect(metrics.objectPosition).toContain("0%");
    }
  });
}

for(const viewport of heroViewports.filter(v=>v.width<=430)){
  test(`escritório abertura segura ${viewport.name}`,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.goto("/escritorio/",{waitUntil:"networkidle"});

    const metrics=await page.evaluate(()=>{
      const section=document.querySelector(".office-intro-featured");
      const copy=document.querySelector(".office-profile-featured .office-profile-copy");
      const sr=section?.getBoundingClientRect();
      const cr=copy?.getBoundingClientRect();
      return {
        section:sr?{left:sr.left,right:sr.right,width:sr.width}:null,
        copy:cr?{left:cr.left,right:cr.right,top:cr.top,width:cr.width}:null,
        innerWidth:window.innerWidth,
        scrollWidth:document.documentElement.scrollWidth
      };
    });

    expect(metrics.scrollWidth-metrics.innerWidth).toBeLessThanOrEqual(1);
    expect(metrics.copy.left).toBeGreaterThanOrEqual(0);
    expect(metrics.copy.right).toBeLessThanOrEqual(metrics.innerWidth+1);
  });
}
