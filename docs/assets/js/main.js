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
{
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const subnavTargets=subnavLinks
    .map((link)=>document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const genericTargets=[...document.querySelectorAll("main > section")]
    .filter((section)=>section.getBoundingClientRect().height>120);

  const alignTargets=subnavTargets.length ? subnavTargets : genericTargets;
  let programmaticScroll=false;
  let settleTimer=null;

  const fixedOffset=()=>{
    const header=document.querySelector(".site-header")?.getBoundingClientRect().height||0;
    const subnav=document.querySelector(".page-subnav");
    const subnavHeight=subnav ? subnav.getBoundingClientRect().height : 0;
    return header+subnavHeight+14;
  };

  const setCurrentSubnav=(href)=>{
    if(!subnavLinks.length) return;
    subnavLinks.forEach((link)=>{
      if(link.getAttribute("href")===href) link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    });
  };

  const syncCurrentSubnav=()=>{
    if(!subnavTargets.length) return;
    const offset=fixedOffset()+12;
    let current=subnavTargets[0];
    subnavTargets.forEach((target)=>{
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
    },reducedMotion.matches?0:560);
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

  if(subnavLinks.length){
    const initialHref=
      location.hash && subnavLinks.some((link)=>link.getAttribute("href")===location.hash)
        ? location.hash
        : subnavLinks[0].getAttribute("href");
    setCurrentSubnav(initialHref);
  }

  window.addEventListener("scroll",()=>{
    if(programmaticScroll) return;
    syncCurrentSubnav();
    if(reducedMotion.matches || !alignTargets.length) return;

    window.clearTimeout(settleTimer);
    settleTimer=window.setTimeout(()=>{
      const offset=fixedOffset();
      const candidate=alignTargets
        .map((target)=>({target,delta:target.getBoundingClientRect().top-offset}))
        .filter(({delta})=>Math.abs(delta)<=32)
        .sort((a,b)=>Math.abs(a.delta)-Math.abs(b.delta))[0];

      if(!candidate || Math.abs(candidate.delta)<8) return;

      programmaticScroll=true;
      window.scrollBy({
        top:candidate.delta,
        behavior:"smooth"
      });
      window.setTimeout(()=>{
        programmaticScroll=false;
        syncCurrentSubnav();
      },360);
    },240);
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


/* First-visit cookie information notice. No non-essential cookies are enabled. */
(() => {
  const storageKey="ct-cookie-notice-v1";
  let acknowledged=false;

  try{
    acknowledged=localStorage.getItem(storageKey)==="acknowledged";
  }catch{}

  if(acknowledged) return;

  const script=document.querySelector('script[src*="assets/js/main.js"]');
  const scriptUrl=script ? new URL(script.src,window.location.href) : new URL(window.location.href);
  const siteBase=script ? scriptUrl.href.replace(/assets\/js\/main\.js(?:\?.*)?$/,"") : "./";

  const notice=document.createElement("aside");
  notice.className="cookie-notice";
  notice.setAttribute("role","region");
  notice.setAttribute("aria-label","Aviso de cookies e privacidade");
  notice.innerHTML=`
    <div class="cookie-notice-copy">
      <strong>Privacidade e cookies</strong>
      <p>Este site não utiliza cookies analíticos ou publicitários nesta versão. Mantemos este aviso para informar com transparência como a navegação é tratada.</p>
    </div>
    <div class="cookie-notice-actions">
      <a href="${siteBase}cookies/">Saiba mais</a>
      <button type="button" class="cookie-ack">Entendi</button>
    </div>
  `;

  const acknowledge=()=>{
    try{
      localStorage.setItem(storageKey,"acknowledged");
    }catch{}
    notice.classList.remove("is-visible");
    window.setTimeout(()=>notice.remove(),240);
  };

  notice.querySelector(".cookie-ack")?.addEventListener("click",acknowledge);
  document.body.append(notice);

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>notice.classList.add("is-visible"));
  });
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
  if(!floating) return;

  const mobile=window.matchMedia("(max-width: 680px)");
  const zones=[...document.querySelectorAll(".hero-actions, .contact-channel-grid, .final-cta-actions")];
  let scheduled=false;

  const overlaps=(a,b)=>(
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );

  const update=()=>{
    scheduled=false;
    if(!mobile.matches){
      floating.classList.remove("is-context-hidden");
      return;
    }

    const floatingRect=floating.getBoundingClientRect();
    const blocked=zones.some((zone)=>{
      const style=getComputedStyle(zone);
      if(style.display==="none" || style.visibility==="hidden") return false;
      return overlaps(floatingRect,zone.getBoundingClientRect());
    });

    floating.classList.toggle("is-context-hidden",blocked);
  };

  const schedule=()=>{
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule,{passive:true});
  mobile.addEventListener?.("change",schedule);
  schedule();
})();
