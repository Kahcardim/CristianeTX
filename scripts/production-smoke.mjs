const base=(process.argv[2]||"").replace(/\/$/,"");
if(!base){
  console.error("Uso: node scripts/production-smoke.mjs <base-url>");
  process.exit(1);
}

const checks=[
  {path:"/",status:200,contains:"Cristiane Teixeira"},
  {path:"/escritorio/",status:200,contains:"Experiência que se transforma"},
  {path:"/atuacao/",status:200,contains:"Áreas de Atuação"},
  {path:"/contato/",status:200,contains:"Contato"},
  {path:"/assets/css/styles.css",status:200,contains:""},
  {path:"/assets/js/main.js",status:200,contains:""}
];

async function fetchWithRetry(url,attempts=8){
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const response=await fetch(url,{redirect:"follow",cache:"no-store"});
      if(response.status<500) return response;
      lastError=new Error(`HTTP ${response.status}`);
    }catch(error){
      lastError=error;
    }
    await new Promise(resolve=>setTimeout(resolve,attempt*1500));
  }
  throw lastError;
}

const failures=[];
for(const check of checks){
  const url=base+check.path;
  try{
    const response=await fetchWithRetry(url);
    const body=await response.text();
    if(response.status!==check.status) failures.push(`${check.path}: HTTP ${response.status}, esperado ${check.status}`);
    if(check.contains && !body.includes(check.contains)) failures.push(`${check.path}: marcador ausente: ${check.contains}`);
    console.log(`PASS ${check.path} -> ${response.status}`);
  }catch(error){
    failures.push(`${check.path}: ${error.message}`);
  }
}

try{
  const url=base+`/qa-404-${Date.now()}/`;
  const response=await fetchWithRetry(url);
  const body=await response.text();
  if(response.status!==404) failures.push(`404 customizado: HTTP ${response.status}, esperado 404`);
  if(!body.includes("Voltar ao início")) failures.push("404 customizado: conteúdo do 404.html não carregou");
  console.log(`PASS 404 customizado -> ${response.status}`);
}catch(error){
  failures.push(`404 customizado: ${error.message}`);
}

if(failures.length){
  console.error("\nSmoke de produção falhou:\n");
  failures.forEach(item=>console.error(" - "+item));
  process.exit(1);
}

console.log("Smoke de produção OK.");
