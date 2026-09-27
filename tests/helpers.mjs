export const routes=[
  "/",
  "/escritorio/",
  "/atuacao/",
  "/atuacao/planejamento/",
  "/atuacao/incapacidade/",
  "/atuacao/pcd/",
  "/atuacao/fraudes/",
  "/artigos/",
  "/faq/",
  "/contato/",
  "/privacidade/",
  "/termos/",
  "/cookies/",
  "/404.html"
];

export const responsiveViewports=[
  {name:"android-compact",width:360,height:800},
  {name:"iphone-16",width:393,height:852},
  {name:"android-large",width:412,height:915},
  {name:"tablet",width:768,height:1024},
  {name:"desktop",width:1366,height:768}
];

export const heroViewports=[
  {name:"small-android",width:320,height:568},
  {name:"android-360",width:360,height:800},
  {name:"iphone-375",width:375,height:812},
  {name:"iphone-390",width:390,height:844},
  {name:"iphone-16",width:393,height:852},
  {name:"android-412",width:412,height:915},
  {name:"large-mobile",width:430,height:932}
];

export function collectRuntimeErrors(page){
  const errors=[];
  page.on("pageerror",error=>errors.push(`pageerror: ${error.message}`));
  page.on("console",message=>{
    if(message.type()==="error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}
