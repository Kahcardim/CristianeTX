import { test, expect } from "@playwright/test";

const services=[
  ["Planejamento Previdenciário","planejamento-previdenciario"],
  ["Aposentadoria Especial","aposentadoria-especial"],
  ["Aposentadoria por Tempo de Contribuição","aposentadoria-tempo-contribuicao"],
  ["Aposentadoria por Idade","aposentadoria-idade"],
  ["Aposentadoria por Invalidez","aposentadoria-invalidez"],
  ["Auxílio-Doença","auxilio-doenca"],
  ["Pensão por Morte","pensao-morte"],
  ["Auxílio-Acidente","auxilio-acidente"]
];

test("os oito serviços da Home abrem o tópico correspondente",async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.goto("/");
  const cards=page.locator(".preview-card");
  await expect(cards).toHaveCount(8);
  for(let index=0;index<services.length;index++){
    const [title,id]=services[index];
    await expect(cards.nth(index).locator("h3")).toHaveText(title);
    await expect(cards.nth(index).locator("a")).toHaveAttribute("href",`./atuacao/#${id}`);
  }
  await cards.nth(7).locator("a").click();
  await expect(page).toHaveURL(/\/atuacao\/#auxilio-acidente$/);
  await expect(page.locator("#auxilio-acidente h2")).toHaveText("Auxílio-Acidente");
});

test("diretório mostra os oito serviços na mesma ordem",async({page})=>{
  await page.goto("/atuacao/");
  const entries=page.locator(".service-entry");
  await expect(entries).toHaveCount(8);
  for(let index=0;index<services.length;index++){
    const [title,id]=services[index];
    await expect(entries.nth(index)).toHaveAttribute("id",id);
    await expect(entries.nth(index).locator("h2")).toHaveText(title);
  }
});

test("carrossel mobile avança por botão, teclado e deslize",async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  const track=page.locator("[data-services-carousel]");
  const counter=page.locator("[data-services-position]");
  const prev=page.locator("[data-services-prev]");
  const next=page.locator("[data-services-next]");
  await expect(counter).toHaveText("1 de 8");
  await expect(prev).toBeDisabled();
  await next.click();
  await expect(counter).toHaveText("2 de 8");
  await track.focus();
  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText("3 de 8");
  await track.evaluate(element=>element.scrollTo({left:element.scrollWidth,behavior:"auto"}));
  await expect(counter).toHaveText("8 de 8");
  await expect(next).toBeDisabled();
});

test("grade desktop mostra oito cards e oculta controles mobile",async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await page.goto("/");
  await expect(page.locator(".preview-card")).toHaveCount(8);
  await expect(page.locator(".services-carousel-controls")).toBeHidden();
});

test("identidade e Instagram fornecidos aparecem no site",async({page})=>{
  await page.goto("/");
  await expect(page.locator(".hero-text")).toContainText("20 anos de experiência comprovada");
  await expect(page.locator(".hero-overline")).toContainText("OAB/SP 229819");
  await page.goto("/contato/");
  await expect(page.locator(".contact-channel a[href^='https://www.instagram.com/']"))
    .toHaveAttribute("href","https://www.instagram.com/adv.cristianeteixeiraa/");
});
