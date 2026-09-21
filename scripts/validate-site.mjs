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

const htmlFiles=allFiles.filter(file=>file.endsWith(".html"));
const existing=new Set(allFiles.map(file=>path.relative(process.cwd(),file).replaceAll("\\","/")));
const errors=[];

function resolveLocal(page,href){
  if(!href || href.startsWith("#") || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) return null;
  const clean=href.split("#")[0].split("?")[0];
  let resolved=path.resolve(path.dirname(page),clean);
  if(clean.endsWith("/") || !path.extname(resolved)) resolved=path.join(resolved,"index.html");
  return path.relative(process.cwd(),resolved).replaceAll("\\","/");
}

for(const file of htmlFiles){
  const html=fs.readFileSync(file,"utf8");
  const rel=path.relative(process.cwd(),file).replaceAll("\\","/");
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  const duplicates=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
  if(duplicates.length) errors.push(`${rel}: IDs duplicados: ${duplicates.join(", ")}`);

  for(const match of html.matchAll(/<img\b[^>]*>/gi)){
    if(!/\salt=/.test(match[0])) errors.push(`${rel}: imagem sem atributo alt`);
    if(!/\swidth=/.test(match[0]) || !/\sheight=/.test(match[0])){
      errors.push(`${rel}: imagem sem width/height explícitos`);
    }
  }

  const hashes=[...html.matchAll(/href="#([^"]+)"/g)].map(match=>match[1]);
  for(const id of hashes){
    if(!ids.includes(id)) errors.push(`${rel}: âncora #${id} não existe`);
  }

  for(const match of html.matchAll(/\shref="([^"]+)"/g)){
    const href=match[1];
    const target=resolveLocal(file,href);
    if(target && !existing.has(target)){
      errors.push(`${rel}: link local quebrado ${href} -> ${target}`);
    }
  }

  if(!/<meta\s+name="viewport"/i.test(html)) errors.push(`${rel}: meta viewport ausente`);
  if(!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${rel}: title ausente`);
  if(!/<meta\s+name="description"/i.test(html) && !rel.endsWith("404.html")){
    errors.push(`${rel}: meta description ausente`);
  }
}

if(errors.length){
  console.error("\nFalhas de validação estrutural:\n");
  errors.forEach(error=>console.error(" - "+error));
  process.exit(1);
}

console.log(`QA estrutural OK: ${htmlFiles.length} páginas HTML validadas.`);
