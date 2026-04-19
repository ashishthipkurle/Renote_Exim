"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ProductCategory } from "@/lib/types";

const CATEGORIES = [
  {
    title: "Luxury",
    subtitle: "Goods",
    tag: "High-End Sourcing",
    category: ProductCategory.OTHER, // Or a specific one if added later
    desc: "Exquisite craftsmanship and premium materials sourced from top-tier global suppliers for elite markets.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGJAINthV2SEgWajgPH428NG66vtDwIuJIhFUvc2NgY7yCBAXSF-toT36X9GvtI4y_teyIZDgQtLnIEdp6-4n9An8S9yuukPsWrF_elBG573vIoOg3uNZ0yrXqKiUJImJr5pIjKs5yFLQDuaWM-nZH-VQHb6ryNSg4W7NyaLJXRSUbp6qOKknIAhFPSwLJFBnr8sh-Q3x0vcsFq_ZIuAJauu8dM0WtQj3dXKxiPORpu5q_BmOvZsKR1sQUJO1hfYtpejs-vOV1h-8",
  },
  {
    title: "Consumer",
    subtitle: "Electronics",
    tag: "Tech & Innovation",
    category: ProductCategory.ELECTRONICS,
    desc: "Next-generation components and consumer tech directly from verified manufacturers across the globe.",
    image: "/assets/consumer-electronics.jpg",
  },
  {
    title: "Raw",
    subtitle: "Materials",
    tag: "Industrial Core",
    category: ProductCategory.CONSTRUCTION,
    desc: "Industrial-grade metals, minerals, and agricultural products for heavy manufacturing and construction.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Bc88m8O11l_cbqn7bF__ywxVWWueCoosbhNBofiTCk0DRdT6tCnGuQlWbEk5qICLTpZSVEF3VWk35BzlEXlBX13ecZoHLYf1PsoMAWx-W53ioZRuwcdDm8cb0AqjqkCO5ZVbTzJroYM4HUIxWh12Y5JtdHz4ksawx_cN--_7fjtiilqXBQz-YzWImjr8RDUxcmrsquuG_elQB0Rj2WRFLLoJ5WbCsn_Gd3fib_TVpy-S2ggl69SJZkxVOWJT6hRnLgiGwlp1cec",
  },
  {
    title: "Electric",
    subtitle: "Automotive",
    tag: "Future Mobility",
    category: ProductCategory.AUTOMOTIVE,
    desc: "EV components, traditional auto parts, and cutting-edge mobility solutions driving the auto sector.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA69LSELe9Cx1tL3UYR_K6CETFwiiWlf-pkfJBqCViaWIpMLq4tn3rR82g9F00MYIMHcC-OdvebYLsKvbZ8fTZEc0nmiAx9UgGRMwXPw28bk2AwZRTpn-jq0umzDDtC6mN4f-oxLj82qmnjGmAfaVNJo1QgY1yUKJK6wly_WP2D0PcBKgyQWQWPtXCljyYtQk3n_iO3tXZMw0FsEKSy0xBo8rtjnP5xZzc7m9tdFFLcIEFE7BaDAdPLaSthANtZh1XiEQRjy415xoA",
  },
  {
    title: "Energy",
    subtitle: "Solutions",
    tag: "Sustainable Grid",
    category: ProductCategory.OTHER, // Energy often falls under Chemicals or Other for now
    desc: "Solar panels, high-efficiency turbines, and sustainable grid infrastructure powering a green tomorrow.",
    image: "/assets/energy-solution.png",
  }
];

export default function TrendingCategories() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const handleNextRef = useRef<(() => void) | null>(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      handleNextRef.current?.();
    }, 10000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('.carousel-item');
    if (!items.length) return;

    // Setup initial state: first is full screen, rest are thumbnails
    gsap.set(items[0], { top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0, opacity: 1 });
    gsap.set(items[0].querySelector('.item-content-full'), { opacity: 1, y: 0 });
    gsap.set(items[0].querySelector('.item-content-thumb'), { opacity: 0 });

    for (let i = 1; i < items.length; i++) {
      gsap.set(items[i], {
        top: "70%",
        left: `calc(50% + ${(i - 1) * 240}px)`,
        width: 220,
        height: 320,
        y: "-50%",
        borderRadius: 20,
        opacity: 1
      });
      gsap.set(items[i].querySelector('.item-content-full'), { opacity: 0, y: 40 });
      gsap.set(items[i].querySelector('.item-content-thumb'), { opacity: 1 });
    }
  }, []);

  const handleSelect = (idx: number) => {
    if (isAnimating.current || !containerRef.current || idx === 0) return;
    isAnimating.current = true;

    const items = containerRef.current.querySelectorAll('.carousel-item');
    if (idx >= items.length) return;

    const firstItem = items[0] as HTMLElement;
    const targetItem = items[idx] as HTMLElement;

    gsap.set(targetItem, { zIndex: 10 });
    gsap.set(firstItem, { zIndex: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        for (let j = 0; j < idx; j++) {
          containerRef.current?.appendChild(items[j]);
        }

        for (let j = 0; j < idx; j++) {
          const resetEl = items[j] as HTMLElement;
          const newIndex = items.length - idx + j;
          gsap.set(resetEl, {
            x: 0,
            opacity: 1,
            top: "70%",
            left: `calc(50% + ${(newIndex - 1) * 240}px)`,
            width: 220,
            height: 320,
            y: "-50%",
            borderRadius: 20,
            zIndex: 2
          });
          gsap.set(resetEl.querySelector('.item-content-thumb'), { opacity: 1 });
          gsap.set(resetEl.querySelector('.item-content-full'), { opacity: 0, y: 40 });
        }

        const updatedItems = containerRef.current?.querySelectorAll('.carousel-item');
        updatedItems?.forEach(el => gsap.set(el, { zIndex: 2 }));
        if (updatedItems?.length) gsap.set(updatedItems[0], { zIndex: 1 });

        isAnimating.current = false;
      }
    });

    // Hide thumbnail content, expand to full screen
    tl.to(targetItem.querySelector('.item-content-thumb'), { opacity: 0, duration: 0.3 }, 0);
    tl.to(targetItem, {
      top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0, y: 0,
      duration: 0.8, ease: "power3.inOut"
    }, 0);
    // Show full content
    tl.to(targetItem.querySelector('.item-content-full'), { opacity: 1, y: 0, duration: 0.6 }, 0.4);

    // Hide full content of previous full screen
    tl.to(firstItem.querySelector('.item-content-full'), { opacity: 0, y: -40, duration: 0.4 }, 0);
    const width = (firstItem as HTMLElement).offsetWidth;

    // Slide out passed items (from 0 to idx - 1)
    for (let i = 0; i < idx; i++) {
      const el = items[i] as HTMLElement;
      // First item hides full content (done above), others hide thumb content
      if (i > 0) {
        tl.to(el.querySelector('.item-content-thumb'), { opacity: 0, duration: 0.3 }, 0);
      }

      tl.to(el, {
        x: -(width * 0.3),
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut"
      }, 0);
    }

    // Shift remaining thumbnails
    for (let i = idx + 1; i < items.length; i++) {
      const newIndex = i - idx;
      tl.to(items[i], {
        left: `calc(50% + ${(newIndex - 1) * 240}px)`,
        duration: 0.8,
        ease: "power3.inOut"
      }, 0);
    }
  };

  const handleNext = () => handleSelect(1);

  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  return (
    <section className="relative w-full h-[800px] overflow-hidden bg-slate-50 dark:bg-[#0A0E17]">
      <div className="absolute top-10 left-10 z-[60] pointer-events-none">
        <span className="text-slate-800 dark:text-white text-xs tracking-[0.3em] font-medium uppercase drop-shadow-lg opacity-90 dark:opacity-80 backdrop-blur-md px-3 py-1 bg-white/80 dark:bg-black/20 rounded-full border border-slate-200 dark:border-white/10">REN<span className="text-primary font-bold">X</span> PLORE</span>
      </div>

      <div ref={containerRef} className="absolute inset-0 w-full h-full list-container">
        {CATEGORIES.map((cat, idx) => (
          <div key={`slide-${idx}`} className="carousel-item absolute overflow-hidden shadow-2xl bg-white dark:bg-[#0B0E14] rounded-lg cursor-pointer" onClick={(e) => {
            const items = containerRef.current?.querySelectorAll('.carousel-item');
            if (!items) return;
            const itemArray = Array.from(items);
            const itemIndex = itemArray.indexOf(e.currentTarget);
            if (itemIndex > 0) {
              handleSelect(itemIndex);
              startAutoPlay();
            }
          }}>
            <Image src={cat.image} fill className="absolute inset-0 object-cover filter brightness-[0.7] contrast-125" alt={cat.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 dark:from-[#0A0E17]/90 via-slate-900/40 dark:via-[#0A0E17]/40 to-transparent" />
            <div className="absolute inset-0 bg-black/10 transition-opacity hover:bg-transparent duration-500" />

            <div className="item-content-full absolute top-[45%] -translate-y-[50%] left-[6%] md:left-[10%] w-[90%] md:w-[650px] pointer-events-none z-20">
              <p className="text-white tracking-[0.2em] uppercase mb-4 text-xs font-semibold relative before:content-[''] before:w-12 before:h-[1px] before:bg-white/60 before:absolute before:-left-16 before:top-1/2 before:-translate-y-1/2 ml-16 drop-shadow-md">
                {cat.tag}
              </p>
              <h2 className="text-6xl md:text-8xl lg:text-[100px] font-bold text-white mb-2 leading-none drop-shadow-2xl">
                {cat.title}
              </h2>
              <h2 className="text-5xl md:text-7xl lg:text-[80px] font-light text-white mb-6 drop-shadow-xl text-primary/90">
                {cat.subtitle}
              </h2>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-10 max-w-lg drop-shadow-md font-medium">
                {cat.desc}
              </p>
              <Link
                href={`/products?category=${cat.category}`}
                className="w-max px-8 py-3.5 border border-white/40 text-white rounded-full hover:bg-white hover:text-black transition-all bg-black/30 backdrop-blur pointer-events-auto font-semibold flex items-center gap-3 group text-sm tracking-wide"
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-black/10 transition-colors material-icons text-xs">explore</span>
                DISCOVER MARKET
              </Link>
            </div>

            <div className="item-content-thumb absolute bottom-6 left-6 right-6 pointer-events-none z-20">
              <p className="text-white/80 text-[10px] uppercase font-bold mb-1 tracking-[0.1em] drop-shadow-md border-b border-primary/40 pb-1 w-fit">
                {cat.tag}
              </p>
              <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-xl">
                {cat.title}<br /><span className="font-light text-primary/90">{cat.subtitle}</span>
              </h3>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
