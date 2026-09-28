import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { routes } from "./helpers.mjs";

const deviceClasses=[
  {name:"realme-c75x-class",width:360,height:800},
  {name:"galaxy-a55-class",width:384,height:832},
  {name:"iphone-16",width:393,height:852}
];

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    try{localStorage.setItem("ct-cookie-notice-v1","acknowledged")}catch{}
  });
});

for(const viewport of deviceClasses){
  for(const route of routes){
    test(`BUG-MOBILE-01 header full viewport ${viewport.name} ${route}`,async({page})=>{
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      await page.goto(route,{waitUntil:"networkidle"});

      const metrics=await page.evaluate(()=>{
        const header=document.querySelector(".site-header");
        const inner=document.querySelector(".site-header .header-inner");
        const hr=header?.getBoundingClientRect();
        const ir=inner?.getBoundingClientRect();
        return {
          innerWidth:window.innerWidth,
          scrollWidth:document.documentElement.scrollWidth,
          header:hr?{left:hr.left,right:hr.right,width:hr.width}:null,
          inner:ir?{left:ir.left,right:ir.right,width:ir.width}:null
        };
      });

      expect(metrics.header).not.toBeNull();
      expect(metrics.inner).not.toBeNull();
      expect(metrics.scrollWidth-metrics.innerWidth).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.header.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.header.right-metrics.innerWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.header.width-metrics.innerWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.inner.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.inner.right-metrics.innerWidth)).toBeLessThanOrEqual(1);
    });
  }
}

test("Home desktop remediation contracts and evidence",async({page})=>{
  fs.mkdirSync("test-results/predeploy",{recursive:true});
  await page.setViewportSize({width:1536,height:900});
  await page.goto("/",{waitUntil:"networkidle"});

  const contract=await page.evaluate(()=>{
    const carousel=document.querySelector(".presentation-carousel")?.getBoundingClientRect();
    const slide=document.querySelector(".presentation-slide")?.getBoundingClientRect();
    const sectionHead=document.querySelector(".presentation-section .section-head")?.getBoundingClientRect();
    const images=[...document.querySelectorAll(".presentation-media img")].map(img=>({
      complete:img.complete,
      naturalWidth:img.naturalWidth,
      naturalHeight:img.naturalHeight
    }));
    const insightCards=[...document.querySelectorAll(".home-insight-card")];
    const insightText=insightCards.map(card=>card.textContent||"").join(" ");
    const finalGrid=document.querySelector(".home-final-cta .final-cta-grid")?.getBoundingClientRect();
    const finalStyle=getComputedStyle(document.querySelector(".home-final-cta .final-cta-grid"));
    const footerStyle=getComputedStyle(document.querySelector(".home-footer"));
    return {
      carousel:carousel?{width:carousel.width}:null,
      slide:slide?{height:slide.height}:null,
      sectionHead:sectionHead?{left:sectionHead.left,width:sectionHead.width}:null,
      imageCount:images.length,
      images,
      insightCount:insightCards.length,
      insightText,
      finalGrid:finalGrid?{left:finalGrid.left,width:finalGrid.width}:null,
      finalTextAlign:finalStyle.textAlign,
      footerBackground:footerStyle.backgroundColor,
      viewport:window.innerWidth,
      scrollWidth:document.documentElement.scrollWidth
    };
  });

  expect(contract.scrollWidth-contract.viewport).toBeLessThanOrEqual(1);
  expect(contract.carousel.width).toBeLessThanOrEqual(982);
  expect(contract.slide.height).toBeLessThanOrEqual(360);
  expect(Math.abs((contract.sectionHead.left+contract.sectionHead.width/2)-contract.viewport/2)).toBeLessThanOrEqual(2);
  expect(contract.imageCount).toBe(3);
  for(const image of contract.images){
    expect(image.complete).toBeTruthy();
    expect(image.naturalWidth).toBeGreaterThan(0);
    expect(image.naturalHeight).toBeGreaterThan(0);
  }
  expect(contract.insightCount).toBe(3);
  expect(contract.insightText).toContain("CNIS");
  expect(contract.insightText).toContain("incapacidade");
  expect(contract.insightText).toContain("Desconto");
  expect(contract.finalTextAlign).toBe("center");
  expect(Math.abs((contract.finalGrid.left+contract.finalGrid.width/2)-contract.viewport/2)).toBeLessThanOrEqual(2);
  expect(contract.footerBackground).not.toBe("rgb(15, 33, 56)");

  await page.screenshot({path:"test-results/predeploy/home-desktop-1536.png",fullPage:true});
  await page.locator(".presentation-section").screenshot({path:"test-results/predeploy/home-presentation-desktop.png"});
  await page.locator(".home-insights").screenshot({path:"test-results/predeploy/home-content-desktop.png"});
  await page.locator(".home-final-cta").screenshot({path:"test-results/predeploy/home-closing-desktop.png"});
});

test("Home mobile remediation contracts and evidence",async({page})=>{
  fs.mkdirSync("test-results/predeploy",{recursive:true});
  await page.setViewportSize({width:393,height:852});
  await page.goto("/",{waitUntil:"networkidle"});

  const contract=await page.evaluate(()=>{
    const header=document.querySelector(".site-header")?.getBoundingClientRect();
    const inner=document.querySelector(".site-header .header-inner")?.getBoundingClientRect();
    const slide=document.querySelector(".presentation-slide")?.getBoundingClientRect();
    const cards=[...document.querySelectorAll(".home-insight-card")].map(card=>card.getBoundingClientRect());
    return {
      viewport:window.innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      header:header?{left:header.left,right:header.right,width:header.width}:null,
      inner:inner?{left:inner.left,right:inner.right,width:inner.width}:null,
      slide:slide?{width:slide.width,height:slide.height}:null,
      cards:cards.map(r=>({left:r.left,right:r.right,width:r.width}))
    };
  });

  expect(contract.scrollWidth-contract.viewport).toBeLessThanOrEqual(1);
  expect(Math.abs(contract.header.width-contract.viewport)).toBeLessThanOrEqual(1);
  expect(Math.abs(contract.inner.width-contract.viewport)).toBeLessThanOrEqual(1);
  expect(contract.slide.width).toBeLessThanOrEqual(360);
  for(const card of contract.cards){
    expect(card.left).toBeGreaterThanOrEqual(-1);
    expect(card.right).toBeLessThanOrEqual(contract.viewport+1);
  }

  await page.screenshot({path:"test-results/predeploy/home-mobile-393.png",fullPage:true});
  await page.locator(".site-header").screenshot({path:"test-results/predeploy/header-mobile-393.png"});
});

