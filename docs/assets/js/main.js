const menuButton=document.querySelector("[data-menu-toggle]");
const menu=document.querySelector("[data-menu]");
const year=document.querySelector("[data-year]");

if(year) year.textContent=new Date().getFullYear();

if(menuButton&&menu){
  menu.querySelectorAll("a").forEach((link)=>{
    link.addEventListener("click",()=>{
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded","false");
      const label=menuButton.querySelector(".sr-only");
      if(label) label.textContent="Abrir menu";
    });
  });
}

const preferences={
  reducedMotion:"(prefers-reduced-motion: reduce)",
  moreContrast:"(prefers-contrast: more)",
  forcedColors:"(forced-colors: active)",
  reducedTransparency:"(prefers-reduced-transparency: reduce)"
};

Object.entries(preferences).forEach(([name,query])=>{
  const media=window.matchMedia(query);
  const attribute="data-a11y-"+name.replace(/[A-Z]/g,(letter)=>"-"+letter.toLowerCase());
  const update=()=>document.documentElement.setAttribute(attribute,String(media.matches));
  update();
  media.addEventListener?.("change",update);
});

document.documentElement.dataset.a11yNative="ready";

const internalPage = !document.querySelector("main > .hero") &&
  document.querySelector("main > section, main > .detail-section, main > .prose-section");
if(internalPage){
  document.documentElement.classList.add("section-snap-page");
  if(document.querySelector(".page-subnav")){
    document.documentElement.classList.add("has-page-subnav");
  }
}


/* Context navigation stays synchronized with the section in view. */
const subnavLinks=[...document.querySelectorAll(".page-subnav a[href^='#']")];
if(subnavLinks.length){
  const targets=subnavLinks
    .map((link)=>document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let programmaticScroll=false;
  let settleTimer=null;

  const fixedOffset=()=>{
    const header=document.querySelector(".site-header")?.getBoundingClientRect().height||0;
    const subnav=document.querySelector(".page-subnav")?.getBoundingClientRect().height||0;
    return header+subnav+14;
  };

  const setCurrentSubnav=(href)=>{
    subnavLinks.forEach((link)=>{
      if(link.getAttribute("href")===href) link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    });
  };

  const syncCurrentSubnav=()=>{
    const offset=fixedOffset()+12;
    let current=targets[0];
    targets.forEach((target)=>{
      if(target.getBoundingClientRect().top<=offset) current=target;
    });
    if(current?.id) setCurrentSubnav("#"+current.id);
  };

  const scrollToTarget=(target)=>{
    const top=window.scrollY+target.getBoundingClientRect().top-fixedOffset();
    programmaticScroll=true;
    window.scrollTo({
      top:Math.max(0,top),
      behavior:reducedMotion.matches?"auto":"smooth"
    });
    window.setTimeout(()=>{
      programmaticScroll=false;
      syncCurrentSubnav();
    },reducedMotion.matches?0:650);
  };

  subnavLinks.forEach((link)=>{
    link.addEventListener("click",(event)=>{
      const href=link.getAttribute("href");
      const target=document.querySelector(href);
      if(!target) return;
      event.preventDefault();
      setCurrentSubnav(href);
      scrollToTarget(target);
      history.replaceState(null,"",href);
    });
  });

  const initialHref=
    location.hash && subnavLinks.some((link)=>link.getAttribute("href")===location.hash)
      ? location.hash
      : subnavLinks[0].getAttribute("href");
  setCurrentSubnav(initialHref);

  window.addEventListener("scroll",()=>{
    syncCurrentSubnav();
    if(programmaticScroll || reducedMotion.matches) return;

    window.clearTimeout(settleTimer);
    settleTimer=window.setTimeout(()=>{
      const offset=fixedOffset();
      const candidate=targets
        .map((target)=>({target,delta:target.getBoundingClientRect().top-offset}))
        .filter(({delta})=>Math.abs(delta)<=90)
        .sort((a,b)=>Math.abs(a.delta)-Math.abs(b.delta))[0];

      if(!candidate || Math.abs(candidate.delta)<3) return;
      programmaticScroll=true;
      window.scrollBy({top:candidate.delta,behavior:"smooth"});
      window.setTimeout(()=>{
        programmaticScroll=false;
        syncCurrentSubnav();
      },500);
    },170);
  },{passive:true});

  window.addEventListener("resize",syncCurrentSubnav,{passive:true});
  syncCurrentSubnav();
}


/* Dedicated presentation carousel */
const presentationCarousel=document.querySelector("[data-presentation-carousel]");
if(presentationCarousel){
  const track=presentationCarousel.querySelector("[data-presentation-track]");
  const slides=[...presentationCarousel.querySelectorAll("[data-presentation-slide]")];
  const dots=[...presentationCarousel.querySelectorAll("[data-presentation-dot]")];
  const prev=presentationCarousel.querySelector("[data-presentation-prev]");
  const next=presentationCarousel.querySelector("[data-presentation-next]");
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let index=0;

  const updateDots=(nextIndex)=>{
    index=Math.max(0,Math.min(slides.length-1,nextIndex));
    slides.forEach((slide,i)=>{
      const active=i===index;
      slide.setAttribute("aria-hidden",String(!active));
      slide.querySelectorAll("a,button").forEach((control)=>{
        if(active) control.removeAttribute("tabindex");
        else control.setAttribute("tabindex","-1");
      });
    });
    dots.forEach((dot,i)=>{
      const active=i===index;
      dot.classList.toggle("is-active",active);
      if(active) dot.setAttribute("aria-current","true");
      else dot.removeAttribute("aria-current");
      dot.setAttribute("aria-pressed",String(active));
    });
  };

  const goTo=(nextIndex)=>{
    const bounded=(nextIndex+slides.length)%slides.length;
    const slide=slides[bounded];
    if(!slide) return;
    const targetLeft=slide.offsetLeft-(track.clientWidth-slide.clientWidth)/2;
    track.scrollTo({
      left:targetLeft,
      behavior:reducedMotion.matches?"auto":"smooth"
    });
    updateDots(bounded);
  };

  prev?.addEventListener("click",()=>goTo(index-1));
  next?.addEventListener("click",()=>goTo(index+1));
  dots.forEach((dot)=>dot.addEventListener("click",()=>goTo(Number(dot.dataset.presentationDot))));

  const observer=new IntersectionObserver((entries)=>{
    const visible=entries
      .filter((entry)=>entry.isIntersecting)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const slideIndex=slides.indexOf(visible.target);
    if(slideIndex>=0) updateDots(slideIndex);
  },{
    root:track,
    threshold:[.55,.7,.85]
  });

  slides.forEach((slide)=>observer.observe(slide));
}


/* Small cookie information menu. No non-essential cookies are enabled in this version. */
(() => {
  const script = document.querySelector('script[src*="assets/js/main.js"]');
  const scriptUrl = script ? new URL(script.src, window.location.href) : new URL(window.location.href);
  const siteBase = script ? scriptUrl.href.replace(/assets\/js\/main\.js(?:\?.*)?$/,"") : "./";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "cookie-mini";
  trigger.textContent = "Cookies";
  trigger.setAttribute("aria-expanded","false");
  trigger.setAttribute("aria-controls","cookie-info-panel");

  const panel = document.createElement("aside");
  panel.id = "cookie-info-panel";
  panel.className = "cookie-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label","Informações sobre cookies");
  panel.innerHTML = `
    <strong>Cookies e privacidade</strong>
    <p>Esta versão não usa cookies analíticos ou publicitários. O menu existe para manter essa informação acessível sem interromper a navegação.</p>
    <div class="cookie-panel-actions">
      <a href="${siteBase}cookies/">Ver aviso</a>
      <button type="button" class="cookie-close">Fechar</button>
    </div>
  `;

  const closeButton = panel.querySelector(".cookie-close");

  const setOpen = (open) => {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded",String(open));
    if(open) closeButton?.focus();
  };

  trigger.addEventListener("click",() => setOpen(panel.hidden));
  closeButton?.addEventListener("click",() => {
    setOpen(false);
    trigger.focus();
  });

  document.addEventListener("keydown",(event) => {
    if(event.key === "Escape" && !panel.hidden){
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener("pointerdown",(event) => {
    if(panel.hidden) return;
    if(panel.contains(event.target) || trigger.contains(event.target)) return;
    setOpen(false);
  });

  document.body.append(trigger,panel);
})();


/* Mobile navigation regression guards */
if(menuButton && menu){
  const setMenuOpen=(open)=>{
    menu.classList.toggle("is-open",open);
    menuButton.setAttribute("aria-expanded",String(open));
    const label=menuButton.querySelector(".sr-only");
    if(label) label.textContent=open?"Fechar menu":"Abrir menu";
  };

  menuButton.addEventListener("click",()=>{
    const open=menuButton.getAttribute("aria-expanded")!=="true";
    setMenuOpen(open);
  });

  document.addEventListener("keydown",(event)=>{
    if(event.key==="Escape" && menuButton.getAttribute("aria-expanded")==="true"){
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  document.addEventListener("pointerdown",(event)=>{
    if(menuButton.getAttribute("aria-expanded")!=="true") return;
    if(menu.contains(event.target) || menuButton.contains(event.target)) return;
    setMenuOpen(false);
  });
}


/* Avoid covering primary actions with the floating WhatsApp control on small screens. */
(() => {
  const floating=document.querySelector(".whatsapp-float");
  if(!floating || !("IntersectionObserver" in window)) return;

  const mobile=window.matchMedia("(max-width: 680px)");
  const zones=[...document.querySelectorAll(".hero-actions, #whatsapp, .final-cta-actions")];
  const visibleZones=new Set();

  const update=()=>{
    floating.classList.toggle("is-context-hidden",mobile.matches && visibleZones.size>0);
  };

  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting) visibleZones.add(entry.target);
      else visibleZones.delete(entry.target);
    });
    update();
  },{threshold:.12});

  zones.forEach((zone)=>observer.observe(zone));
  mobile.addEventListener?.("change",update);
  update();
})();
