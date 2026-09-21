const menuButton=document.querySelector("[data-menu-toggle]");
const menu=document.querySelector("[data-menu]");
const year=document.querySelector("[data-year]");

if(year) year.textContent=new Date().getFullYear();

if(menuButton&&menu){
  menuButton.addEventListener("click",()=>{
    const open=menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded",String(open));
  });

  menu.querySelectorAll("a").forEach((link)=>{
    link.addEventListener("click",()=>{
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded","false");
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


/* Context navigation stays synchronized with the section in view. */
const subnavLinks=[...document.querySelectorAll(".page-subnav a[href^='#']")];
if(subnavLinks.length){
  const targets=subnavLinks
    .map((link)=>document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");

  subnavLinks.forEach((link)=>{
    link.addEventListener("click",(event)=>{
      const target=document.querySelector(link.getAttribute("href"));
      if(!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior:reducedMotion.matches?"auto":"smooth",
        block:"start"
      });
      history.replaceState(null,"",link.getAttribute("href"));
    });
  });

  const observer=new IntersectionObserver((entries)=>{
    const visible=entries
      .filter((entry)=>entry.isIntersecting)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const id="#"+visible.target.id;
    subnavLinks.forEach((link)=>{
      if(link.getAttribute("href")===id) link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    });
  },{
    rootMargin:"-25% 0px -55% 0px",
    threshold:[0,.25,.5,.75]
  });

  targets.forEach((target)=>observer.observe(target));
}


/* Institutional hero carousel */
const heroCarousel=document.querySelector("[data-hero-carousel]");
if(heroCarousel){
  const slides=[...heroCarousel.querySelectorAll("[data-hero-slide]")];
  const dots=[...heroCarousel.querySelectorAll("[data-hero-dot]")];
  const prev=heroCarousel.querySelector("[data-hero-prev]");
  const next=heroCarousel.querySelector("[data-hero-next]");
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let index=0;
  let timer=null;
  let touchStartX=null;

  const setSlide=(nextIndex,{user=false}={})=>{
    index=(nextIndex+slides.length)%slides.length;

    slides.forEach((slide,i)=>{
      const active=i===index;
      slide.classList.toggle("is-active",active);
      slide.setAttribute("aria-hidden",String(!active));
      slide.querySelectorAll("a,button").forEach((control)=>{
        if(active) control.removeAttribute("tabindex");
        else control.setAttribute("tabindex","-1");
      });
    });

    dots.forEach((dot,i)=>{
      const active=i===index;
      dot.classList.toggle("is-active",active);
      dot.setAttribute("aria-selected",String(active));
    });

    if(user) restart();
  };

  const stop=()=>{
    if(timer){
      window.clearInterval(timer);
      timer=null;
    }
  };

  const start=()=>{
    stop();
    if(reduceMotion.matches||slides.length<2) return;
    timer=window.setInterval(()=>setSlide(index+1),7000);
  };

  const restart=()=>{
    stop();
    start();
  };

  prev?.addEventListener("click",()=>setSlide(index-1,{user:true}));
  next?.addEventListener("click",()=>setSlide(index+1,{user:true}));

  dots.forEach((dot)=>{
    dot.addEventListener("click",()=>setSlide(Number(dot.dataset.heroDot),{user:true}));
  });

  heroCarousel.addEventListener("mouseenter",stop);
  heroCarousel.addEventListener("mouseleave",start);
  heroCarousel.addEventListener("focusin",stop);
  heroCarousel.addEventListener("focusout",(event)=>{
    if(!heroCarousel.contains(event.relatedTarget)) start();
  });

  heroCarousel.addEventListener("touchstart",(event)=>{
    touchStartX=event.changedTouches[0]?.clientX??null;
    stop();
  },{passive:true});

  heroCarousel.addEventListener("touchend",(event)=>{
    if(touchStartX===null) return;
    const endX=event.changedTouches[0]?.clientX??touchStartX;
    const distance=endX-touchStartX;
    if(Math.abs(distance)>45){
      setSlide(index+(distance<0?1:-1),{user:true});
    }else{
      start();
    }
    touchStartX=null;
  },{passive:true});

  reduceMotion.addEventListener?.("change",start);
  setSlide(0);
  start();
}
