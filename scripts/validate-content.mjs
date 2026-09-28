import fs from "node:fs";
import path from "node:path";

const root=path.resolve("docs");
const htmlFiles=[];

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);

const failures=[];
const forbiddenIdentity=[
  /\bUPPTB\b/i,
  /\bAlice\b/i,
  /\bBeyblade\b/i,
  /\bTurtle(?:s| Step)?\b/i
];
const forbiddenDraft=[
  /Lorem ipsum/i,
  /A Home resume/i,
  /Área reservada para imagens reais do escritório/i,
  /TODO:/i
];

for(const file of htmlFiles){
  const html=fs.readFileSync(file,"utf8");
  const rel=path.relative(process.cwd(),file).replaceAll("\\","/");

  if(!/<html\s+lang="pt-BR"/i.test(html)) failures.push(`${rel}: lang pt-BR ausente`);
  if(!/<meta\s+name="viewport"[^>]*width=device-width/i.test(html)) failures.push(`${rel}: viewport responsivo ausente`);
  if(!/<meta\s+name="viewport"[^>]*viewport-fit=cover/i.test(html)) failures.push(`${rel}: viewport-fit=cover ausente`);

  const h1Count=(html.match(/<h1\b/gi)||[]).length;
  if(h1Count!==1) failures.push(`${rel}: esperado 1 H1, encontrado ${h1Count}`);

  if(!rel.endsWith("404.html")){
    if(!/<link\s+rel="canonical"\s+href="https:\/\/kahcardim\.github\.io\/CristianeTX\//i.test(html)){
      failures.push(`${rel}: canonical oficial ausente`);
    }
    if(!/<meta\s+name="description"/i.test(html)) failures.push(`${rel}: meta description ausente`);
  }

  for(const pattern of forbiddenIdentity){
    if(pattern.test(html)) failures.push(`${rel}: identidade externa indevida detectada (${pattern})`);
  }
  for(const pattern of forbiddenDraft){
    if(pattern.test(html)) failures.push(`${rel}: texto de rascunho/placeholder detectado (${pattern})`);
  }

  if(!/Cristiane Teixeira/i.test(html)) failures.push(`${rel}: identidade Cristiane Teixeira ausente`);

  const externalWhatsApp=[...html.matchAll(/href="https:\/\/(?:wa\.me|api\.whatsapp\.com)\/([^"]+)"/gi)];
  for(const match of externalWhatsApp){
    const digits=match[1].replace(/\D/g,"");
    if(digits.length<10) failures.push(`${rel}: URL de WhatsApp inválida`);
  }

  if(/href="[^"]*#whatsapp"/i.test(html)){
    failures.push(`${rel}: referência interna a #whatsapp sem canal oficial configurado`);
  }
}

const fixturePath=path.resolve("qa/fixtures/institutional.test.json");
if(!fs.existsSync(fixturePath)){
  failures.push("fixture institucional de QA ausente");
}else{
  const fixture=JSON.parse(fs.readFileSync(fixturePath,"utf8"));
  if(fixture.fictitious!==true) failures.push("fixture institucional deve declarar fictitious=true");
  if(!/^55\d{11}$/.test(fixture.whatsappDigits||"")) failures.push("fixture: WhatsApp fictício fora do formato brasileiro esperado");
  if(!/^\(\d{2}\) \d{5}-\d{4}$/.test(fixture.whatsappDisplay||"")) failures.push("fixture: exibição de WhatsApp inválida");
  if(!/^OAB\/SP \d{6}$/.test(fixture.oab||"")) failures.push("fixture: OAB fictícia inválida");
  if(!/^@[A-Za-z0-9._]{1,30}$/.test(fixture.instagram||"")) failures.push("fixture: Instagram fictício inválido");

  const publicCorpus=htmlFiles.map(file=>fs.readFileSync(file,"utf8")).join("\n");
  for(const key of ["whatsappDigits","whatsappDisplay","oab","instagram"]){
    const value=fixture[key];
    if(value && publicCorpus.includes(value)) failures.push(`dados fictícios de QA vazaram para produção: ${key}`);
  }
}

const sourceFiles=[
  "docs/assets/css/styles.css",
  "docs/assets/js/main.js"
].map(file=>({file,content:fs.readFileSync(file,"utf8")}));

for(const {file,content} of sourceFiles){
  for(const pattern of forbiddenIdentity){
    if(pattern.test(content)) failures.push(`${file}: identidade externa indevida detectada (${pattern})`);
  }
}

if(!sourceFiles[0].content.includes("@media(pointer:coarse)") && !sourceFiles[0].content.includes("@media (pointer:coarse)")){
  failures.push("styles.css: adaptação para pointer:coarse ausente");
}
for(const feature of ["prefers-reduced-motion","prefers-contrast","forced-colors"]){
  if(!sourceFiles[0].content.includes(feature)) failures.push(`styles.css: suporte a ${feature} ausente`);
}
for(const safeArea of ["safe-area-inset-top","safe-area-inset-left","safe-area-inset-right"]){
  if(!sourceFiles[0].content.includes(safeArea)) failures.push(`styles.css: suporte a ${safeArea} ausente`);
}
if(!sourceFiles[1].content.includes("matchMedia")) failures.push("main.js: integração matchMedia ausente");

if(failures.length){
  console.error("\nFalhas de contrato de conteúdo/identidade:\n");
  failures.forEach(item=>console.error(" - "+item));
  process.exit(1);
}

console.log(`Contratos de conteúdo OK: ${htmlFiles.length} páginas; fixture institucional fictícia validada; 0 warnings.`);
