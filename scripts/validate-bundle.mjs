import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.argv[2]||"dist");
const failures=[];
const files=[];

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
if(!fs.existsSync(root)){
  console.error(`Bundle ausente: ${root}`);
  process.exit(1);
}
walk(root);

const relative=file=>path.relative(root,file).replaceAll("\\","/");
const byRel=new Map(files.map(file=>[relative(file),file]));

for(const required of [
  "index.html",
  "escritorio/index.html",
  "atuacao/index.html",
  "contato/index.html",
  "404.html",
  "assets/css/styles.css",
  "assets/js/main.js"
]){
  if(!byRel.has(required)) failures.push(`arquivo obrigatório ausente no bundle: ${required}`);
}

const cssFile=byRel.get("assets/css/styles.css");
const jsFile=byRel.get("assets/js/main.js");
if(cssFile && fs.statSync(cssFile).size>90*1024) failures.push("CSS minificado excede 90 KB");
if(jsFile && fs.statSync(jsFile).size>25*1024) failures.push("JS minificado excede 25 KB");

for(const file of files.filter(file=>/\.(?:webp|avif|png|jpe?g|svg)$/i.test(file))){
  const size=fs.statSync(file).size;
  if(size>120*1024) failures.push(`imagem acima de 120 KB: ${relative(file)} (${size} bytes)`);
}

const totalSize=files.reduce((sum,file)=>sum+fs.statSync(file).size,0);
if(totalSize>700*1024) failures.push(`bundle acima de 700 KB: ${totalSize} bytes`);

for(const file of files.filter(file=>file.endsWith(".html"))){
  const html=fs.readFileSync(file,"utf8");
  if(/\b(?:UPPTB|Alice|Beyblade)\b/i.test(html)) failures.push(`${relative(file)}: identidade externa no bundle`);
}

if(jsFile){
  const js=fs.readFileSync(jsFile,"utf8");
  if(/console\.log\(/.test(js)) failures.push("JS de produção contém console.log");
  try{new Function(js)}catch(error){failures.push(`JS de produção inválido: ${error.message}`)}
}

if(cssFile){
  const css=fs.readFileSync(cssFile,"utf8");
  let balance=0;
  for(const char of css){
    if(char==="{") balance++;
    if(char==="}") balance--;
  }
  if(balance!==0) failures.push(`CSS de produção com chaves desbalanceadas: ${balance}`);
}

if(failures.length){
  console.error("\nFalhas no artefato de produção:\n");
  failures.forEach(item=>console.error(" - "+item));
  process.exit(1);
}

console.log(`Bundle OK: ${files.length} arquivos, ${totalSize} bytes.`);
