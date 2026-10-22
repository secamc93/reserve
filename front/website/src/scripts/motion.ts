// Animaciones del sitio: scroll suave (Lenis) + GSAP ScrollTrigger.
// Solo corre si <html> tiene la clase .motion (el visitante no pidió reducir movimiento).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

declare global {
  interface Window { __motionReady?: boolean }
}

const root = document.documentElement;

if (root.classList.contains('motion')) {
  gsap.registerPlugin(ScrollTrigger);
  window.__motionReady = true;

  const lenis = new Lenis({ duration: 1.1, anchors: { offset: 0 }, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  progressBar();
  hero();
  reveals();
  problem();
  turn();
  howItWorks();
  extras();

  // Las fuentes cambian alturas: recalcular posiciones cuando terminen de cargar.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function progressBar() {
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.className = 'bg-brand fixed top-0 left-0 z-[60] h-[3px] w-full origin-left';
  bar.style.transform = 'scaleX(0)';
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

function hero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.set('.hero h1', { opacity: 1 }, 0)
    .from('.hero-line', { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.1)
    .to('.hero-in', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.5)
    .to('.strike-bar', { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 1.2)
    .to('.hero-visual', { opacity: 1, y: 0, duration: 1.4 }, 0.4)
    .from('.hero-phone', { rotate: 8, y: 60, duration: 1.6 }, 0.4)
    .from('.hero-card', { x: -50, opacity: 0, duration: 1.2 }, 0.9)
    .from('.hero-chip', { x: 50, opacity: 0, duration: 1.2 }, 1.05);

  document.querySelectorAll<SVGPathElement>('.river-path').forEach((p, i) => {
    const len = p.getTotalLength();
    if (!p.getAttribute('stroke-dasharray')) {
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.6, delay: 0.2 + i * 0.25, ease: 'power2.inOut' });
    } else {
      gsap.from(p, { opacity: 0, duration: 2, delay: 1 });
    }
  });

  // Parallax al salir del hero.
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-visual', { y: -120, ease: 'none', scrollTrigger: st });
  gsap.to('.hero-river', { y: 160, ease: 'none', scrollTrigger: st });
  gsap.to('.hero-diamond', { y: (i) => -80 - i * 60, ease: 'none', scrollTrigger: st });
}

function reveals() {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: 'auto' }),
  });
}

function problem() {
  const section = document.querySelector<HTMLElement>('.problem');
  if (!section) return;
  const moments = [...section.querySelectorAll<HTMLElement>('.moment')];
  const time = section.querySelector('.clock-time')!;
  const elapsed = section.querySelector('.clock-elapsed')!;
  const hand = section.querySelector<SVGGElement>('.clock-hand')!;
  const arc = section.querySelector<SVGCircleElement>('.clock-arc')!;
  const TOTAL = 255; // 19:00 → 23:15

  const render = (p: number) => {
    const m = Math.round(p * TOTAL);
    const h = 19 + Math.floor(m / 60);
    time.textContent = `${h}:${String(m % 60).padStart(2, '0')}`;
    elapsed.textContent = m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
    hand.style.transform = `rotate(${m * 6}deg)`;
    arc.style.strokeDashoffset = String(100 - (m % 60) / 0.6);
    if (m >= TOTAL) arc.style.strokeDashoffset = '0';
    moments.forEach((el) => el.toggleAttribute('data-on', m >= Number(el.dataset.minutes)));
  };

  gsap.matchMedia().add(
    { desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' },
    (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      if (desktop) section.classList.add('is-pinned');
      render(0);
      ScrollTrigger.create({
        trigger: section,
        start: desktop ? 'top top' : 'top 60%',
        end: desktop ? '+=220%' : 'bottom 70%',
        pin: desktop ? '.problem-pin' : false,
        scrub: true,
        onUpdate: (self) => render(self.progress),
      });
      return () => {
        section.classList.remove('is-pinned');
        render(1);
      };
    },
  );
}

function turn() {
  const words = gsap.utils.toArray<HTMLElement>('.turn-word');
  if (!words.length) return;
  gsap.matchMedia().add(
    { desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' },
    (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.turn',
          start: desktop ? 'top top' : 'top 75%',
          end: desktop ? '+=130%' : 'bottom 55%',
          pin: desktop ? '.turn-pin' : false,
          scrub: 0.6,
        },
      });
      tl.to(words, { opacity: 1, stagger: 0.1, ease: 'none' }).to('.turn-glow', { scale: 1.5, opacity: 1, ease: 'none' }, 0);
    },
  );
}

function howItWorks() {
  const track = document.querySelector<HTMLElement>('.how-track');
  if (!track) return;

  gsap.matchMedia().add('(min-width: 1024px)', () => {
    const distance = () => track.scrollWidth - window.innerWidth;
    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.how',
        start: 'top top',
        end: () => '+=' + distance(),
        pin: '.how-pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    gsap.to('.how-progress-bar', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.how', start: 'top top', end: () => '+=' + distance(), scrub: true },
    });

    // Cada tarjeta anima su maqueta cuando entra horizontalmente.
    gsap.utils.toArray<HTMLElement>('.how-card').forEach((card) => {
      gsap.from(card, {
        rotate: 4,
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'left right', end: 'left 45%', scrub: true },
      });
      cardUi(card, { trigger: card, containerAnimation: scroll, start: 'left 75%' });
    });
  });

  gsap.matchMedia().add('(max-width: 1023px)', () => {
    gsap.utils.toArray<HTMLElement>('.how-card').forEach((card) => {
      gsap.from(card, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
      cardUi(card, { trigger: card, start: 'top 70%' });
    });
  });
}

function cardUi(card: HTMLElement, scrollTrigger: ScrollTrigger.Vars) {
  const tl = gsap.timeline({ scrollTrigger: { ...scrollTrigger, toggleActions: 'play none none none' } });
  const fill = card.querySelector('.bar-fill');
  if (fill) tl.from(fill, { width: 0, duration: 1.4, ease: 'power3.out' }, 0);
  card.querySelectorAll<HTMLElement>('.count').forEach((el) => {
    const to = Number(el.dataset.to);
    const dec = Number(el.dataset.decimals ?? 0);
    const o = { v: 0 };
    tl.to(o, { v: to, duration: 1.4, ease: 'power3.out', onUpdate: () => (el.textContent = o.v.toFixed(dec).replace('.', ',')) }, 0);
  });
  const segs = card.querySelectorAll('.donut-seg');
  if (segs.length) tl.from(segs, { strokeDasharray: '0 100', duration: 1.2, stagger: 0.15, ease: 'power3.out' }, 0);
  const grid = card.querySelectorAll('.grid-cols-8 > span, .qr > span');
  if (grid.length) tl.from(grid, { scale: 0, duration: 0.4, stagger: { each: 0.008, from: 'random' }, ease: 'back.out(2)' }, 0.1);
}

function extras() {
  gsap.utils.toArray<HTMLElement>('.bento-bar').forEach((bar) => {
    gsap.from(bar, { width: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: bar, start: 'top 85%' } });
  });

  const cta = document.querySelector<SVGPathElement>('.cta-river');
  if (cta) {
    const len = cta.getTotalLength();
    gsap.fromTo(
      cta,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top 85%', end: 'center 50%', scrub: true } },
    );
  }
}
