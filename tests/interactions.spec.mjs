import { test, expect } from "@playwright/test";

test("menu mobile abre, fecha com Escape e toque externo",async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.addInitScript(()=>{localStorage.setItem("ct-cookie-notice-v1","acknowledged")});
  await page.goto("/");

  const button=page.locator("[data-menu-toggle]");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded","true");
  await expect(page.locator("[data-menu]")).toHaveClass(/is-open/);

  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded","false");

  await button.click();
  await page.locator("main").click({position:{x:5,y:5}});
  await expect(button).toHaveAttribute("aria-expanded","false");
});

test("cookie persiste consentimento local",async({page})=>{
  await page.goto("/");
  await page.evaluate(()=>localStorage.removeItem("ct-cookie-notice-v1"));
  await page.reload();

  const notice=page.locator(".cookie-notice");
  await expect(notice).toBeVisible();
  await notice.locator(".cookie-ack").click();
  await expect(notice).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".cookie-notice")).toHaveCount(0);
});

test("aviso de privacidade não cobre conteúdo em desktop nem mobile",async({page})=>{
  for(const viewport of [{width:1365,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(()=>localStorage.removeItem("ct-cookie-notice-v1"));
    await page.reload();

    const metrics=await page.evaluate(()=>{
      const notice=document.querySelector(".cookie-notice");
      const main=document.querySelector("main");
      const header=document.querySelector(".site-header");
      return {
        position:getComputedStyle(notice).position,
        followsHeader:!!(header.compareDocumentPosition(notice)&Node.DOCUMENT_POSITION_FOLLOWING),
        precedesMain:!!(notice.compareDocumentPosition(main)&Node.DOCUMENT_POSITION_FOLLOWING)
      };
    });

    expect(metrics.position).toBe("relative");
    expect(metrics.followsHeader).toBe(true);
    expect(metrics.precedesMain).toBe(true);
  }
});

test("subnav do Escritório navega sem cortar título",async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.addInitScript(()=>{localStorage.setItem("ct-cookie-notice-v1","acknowledged")});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/escritorio/");

  const links=page.locator(".page-subnav a[href^='#']");
  const count=await links.count();
  expect(count).toBeGreaterThanOrEqual(3);

  for(let i=0;i<count;i++){
    const link=links.nth(i);
    const href=await link.getAttribute("href");
    await link.click();
    await page.waitForTimeout(50);

    await expect(link).toHaveAttribute("aria-current","location");
    const safe=await page.evaluate(selector=>{
      const target=document.querySelector(selector);
      const heading=target?.querySelector("h1,h2,h3") || target;
      const header=document.querySelector(".site-header");
      const subnav=document.querySelector(".page-subnav");
      if(!heading||!header||!subnav) return false;
      const top=heading.getBoundingClientRect().top;
      const min=header.getBoundingClientRect().height+subnav.getBoundingClientRect().height-2;
      return top>=min;
    },href);
    expect(safe,`título da âncora ${href} coberto`).toBeTruthy();
  }
});

test("scroll manual não sofre puxão automático",async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.addInitScript(()=>{localStorage.setItem("ct-cookie-notice-v1","acknowledged")});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/escritorio/");
  await page.evaluate(()=>window.scrollTo({top:500,behavior:"auto"}));
  await page.mouse.wheel(0,180);
  await page.waitForTimeout(120);
  const settled=await page.evaluate(()=>window.scrollY);
  await page.waitForTimeout(800);
  const finalY=await page.evaluate(()=>window.scrollY);
  expect(Math.abs(finalY-settled)).toBeLessThanOrEqual(2);
});

test("carrossel institucional responde aos controles",async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem("ct-cookie-notice-v1","acknowledged")});
  await page.goto("/");
  const carousel=page.locator("[data-presentation-carousel]");
  await expect(carousel).toBeVisible();

  const active=()=>carousel.locator("[data-presentation-dot][aria-current='true']");
  const before=await active().getAttribute("data-presentation-dot");
  await carousel.locator("[data-presentation-next]").click();
  await page.waitForTimeout(650);
  const after=await active().getAttribute("data-presentation-dot");
  expect(after).not.toBe(before);
});

test("WhatsApp não é anunciado como canal ativo sem URL oficial",async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem("ct-cookie-notice-v1","acknowledged")});
  await page.goto("/");
  await expect(page.locator(".whatsapp-float")).toHaveCount(0);
  await expect(page.locator('a[href*="wa.me"],a[href*="api.whatsapp.com"]')).toHaveCount(0);
});
