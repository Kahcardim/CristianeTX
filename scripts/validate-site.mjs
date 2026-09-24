import fs from "node:fs";
import path from "node:path";

const root=path.resolve("docs");
const allFiles=[];

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else allFiles.push(full);
  }
}
walk(root);

const relPath=file=>path.relative(process.cwd(),file).replaceAll("\\","/");
const existing=new Set(allFiles.map(relPath));
const htmlFiles=allFiles.filter(file=>file.endsWith(".html"));
const cssFiles=allFiles.filter(file=>file.endsWith(".css"));
const errors=[];

const required=[
  "docs/index.html",
  "docs/escritorio/index.html",
  "docs/atuacao/index.html",
  "docs/atuacao/planejamento/index.html",
  "docs/atuacao/incapacidade/index.html",
  "docs/atuacao/pcd/index.html",
  "docs/atuacao/fraudes/index.html",
  "docs/artigos/index.html",
  "docs/faq/index.html",
  "docs/contato/index.html",
  "docs/privacidade/index.html",
  "docs/termos/index.html",
  "docs/cookies/index.html",
  "docs/404.html",
  "docs/assets/css/styles.css",
  "docs/assets/js/main.js",
  "docs/robots.txt",
  "docs/sitemap.xml"
];

for(const file of required){
  if(!existing.has(file)) errors.push(`arquivo obrigatório ausente: ${file}`);
}

function resolveLocal(page,value){
  if(!value || value.startsWith("#") || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  const clean=value.split("#")[0].split("?")[0];
  let resolved=path.resolve(path.dirname(page),clean);
  if(clean.endsWith("/") || !path.extname(resolved)) resolved=path.join(resolved,"index.html");
  return relPath(resolved);
}

const corpus=[];

for(const file of htmlFiles){
  const html=fs.readFileSync(file,"utf8");
  const rel=relPath(file);
  corpus.push(html);

  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  const duplicates=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
  if(duplicates.length) errors.push(`${rel}: IDs duplicados: ${duplicates.join(", ")}`);

  for(const match of html.matchAll(/<img\b[^>]*>/gi)){
    const tag=match[0];
    if(!/\salt=/.test(tag)) errors.push(`${rel}: imagem sem alt`);
    if(!/\swidth=/.test(tag) || !/\sheight=/.test(tag)){
      errors.push(`${rel}: imagem sem width/height explícitos`);
    }
    const src=(tag.match(/\ssrc="([^"]+)"/i)||[])[1];
    const target=resolveLocal(file,src);
    if(target && !existing.has(target)) errors.push(`${rel}: imagem local quebrada: ${src}`);
  }

  for(const match of html.matchAll(/href="#([^"]+)"/g)){
    if(!ids.includes(match[1])) errors.push(`${rel}: âncora inexistente: #${match[1]}`);
  }

  for(const match of html.matchAll(/\shref="([^"]+)"/g)){
    const target=resolveLocal(file,match[1]);
    if(target && !existing.has(target)) errors.push(`${rel}: link local quebrado: ${match[1]}`);
  }

  if(!/<meta\s+name="viewport"/i.test(html)) errors.push(`${rel}: meta viewport ausente`);
  if(!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${rel}: title ausente`);
  if(!/<meta\s+name="description"/i.test(html) && !rel.endsWith("404.html")){
    errors.push(`${rel}: meta description ausente`);
  }
}

for(const file of cssFiles){
  const css=fs.readFileSync(file,"utf8");
  corpus.push(css);
  const rel=relPath(file);
  for(const match of css.matchAll(/url\((?:["']?)([^"'\)]+)(?:["']?)\)/g)){
    const url=match[1].trim();
    const target=resolveLocal(file,url);
    if(target && !existing.has(target)) errors.push(`${rel}: asset CSS quebrado: ${url}`);
  }
}

const searchable=corpus.join("\n");
const imageFiles=allFiles.filter(file=>/docs[\\/]assets[\\/]images[\\/].+\.(?:webp|avif|png|jpe?g|svg)$/i.test(file));
for(const file of imageFiles){
  const name=path.basename(file);
  if(!searchable.includes(name)) errors.push(`imagem órfã: ${relPath(file)}`);
}

if(errors.length){
  console.error("\nFalhas de validação estrutural:\n");
  errors.forEach(error=>console.error(" - "+error));
  process.exit(1);
}

console.log(`QA estrutural OK: ${htmlFiles.length} páginas e ${imageFiles.length} imagens validadas.`);
