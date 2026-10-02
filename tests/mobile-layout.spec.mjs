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
