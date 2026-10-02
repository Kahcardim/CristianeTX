import { test, expect } from "@playwright/test";

test("home mobile mantém hero, botões e rodapé legíveis",async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("ct-cookie-notice-v1","acknowledged"));

  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:430,height:932}]){
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto"});

    const hero=await page.locator(".hero").boundingBox();
    expect(hero.y+hero.height).toBeLessThanOrEqual(viewport.height);

    for(const selector of [".hero-actions .button",".final-cta-actions .button"]){
      for(const button of await page.locator(selector).all()){
        const box=await button.boundingBox();
        const radius=await button.evaluate(element=>parseFloat(getComputedStyle(element).borderTopLeftRadius));
        expect(box.width).toBeLessThan(viewport.width-48);
        expect(radius).toBeGreaterThanOrEqual(20);
      }
    }

    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    const footer=page.locator(".site-footer");
    const footerBox=await footer.boundingBox();
    const last=await page.locator(".footer-bottom").boundingBox();
    expect(last.y+last.height).toBeLessThanOrEqual(viewport.height+1);
    expect(footerBox.x).toBe(0);
    const columns=await footer.locator(".footer-col").all();
    for(const column of columns){
      const box=await column.boundingBox();
      const heading=await column.locator("h3").boundingBox();
      expect(Math.abs(heading.x+heading.width/2-(box.x+box.width/2))).toBeLessThan(2);
    }
    await expect(page.locator(".whatsapp-float")).toBeHidden();
  }
});

test("nome completo ocupa uma linha no hero mobile e desktop",async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("ct-cookie-notice-v1","acknowledged"));
  for(const viewport of [
    {width:320,height:568},{width:390,height:844},{width:768,height:1024},
    {width:1024,height:768},{width:1536,height:864}
  ]){
    await page.setViewportSize(viewport);
    await page.goto("/");
    const name=page.locator(".institution-title>span");
    const metrics=await name.evaluate(element=>{
      const rect=element.getBoundingClientRect();
      const copy=document.querySelector(".hero-copy").getBoundingClientRect();
      const style=getComputedStyle(element);
      return {width:rect.width,height:rect.height,lineHeight:parseFloat(style.lineHeight),
        left:rect.left,right:rect.right,copyLeft:copy.left,copyRight:copy.right,
        midpoint:rect.left+rect.width/2,copyMidpoint:copy.left+copy.width/2};
    });
    expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight+2);
    expect(metrics.left).toBeGreaterThanOrEqual(-1);
    expect(metrics.right).toBeLessThanOrEqual(viewport.width+1);
    expect(Math.abs(metrics.midpoint-metrics.copyMidpoint)).toBeLessThanOrEqual(2);
    if(viewport.width<=680){
      const hero=await page.locator(".hero").boundingBox();
      expect(hero.y+hero.height).toBeLessThanOrEqual(viewport.height+1);
    }
  }
});
