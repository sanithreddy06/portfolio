"use client";

import { useEffect, useState } from "react";

const links = [
  { number: "01", label: "Projects", href: "#projects" },
  { number: "02", label: "Experience", href: "#experience" },
  { number: "03", label: "Contact", href: "#contact" },
];

const socials = [
  { label: "GitHub", href: "https://github.com/sanithreddy06" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mudiyalasaisanithreddy/",
  },
  { label: "X", href: "https://x.com/sanithreddy2006" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/saisanithreddy/",
  },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden px-5 pt-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={closeMenu}
            className="text-[25px] font-black tracking-[-0.08em] select-none"
          >
            <span className="text-[#A02A22]">S</span>
            <span className="text-white">SR.</span>
          </a>

          {/* Menu button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="w-12 h-12 rounded-full border border-white/15 bg-black/40 backdrop-blur-xl flex items-center justify-center"
          >
            <span className="relative w-5 h-4 flex flex-col justify-between">
              <span
                className={`h-[1.5px] w-full bg-white transition-all duration-300 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-full bg-white transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-full bg-white transition-all duration-300 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[90] md:hidden bg-[#080808] transition-all duration-500 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* subtle red glow */}
        <div
          className="absolute top-[-10%] right-[-20%] w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(160,42,34,0.18), transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative h-full flex flex-col px-7 pt-28 pb-8">
          {/* small label */}
          <div className="mb-10">
            <span className="text-[10px] tracking-[0.35em] uppercase text-white/35">
              Navigation
            </span>
          </div>

          {/* links */}
          <nav className="flex flex-col">
            {links.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="group flex items-center gap-5 py-5 border-b border-white/[0.08]"
                style={{
                  transitionDelay: open ? `${index * 70}ms` : "0ms",
                }}
              >
                <span className="text-[10px] text-[#A02A22] tracking-[0.15em]">
                  {link.number}
                </span>

                <span className="text-[clamp(2rem,9vw,3.5rem)] font-bold tracking-[-0.04em] text-white group-active:text-[#A02A22] transition-colors">
                  {link.label}
                </span>

                <span className="ml-auto text-white/30 text-xl">
                  ↗
                </span>
              </a>
            ))}
          </nav>

          {/* socials */}
          <div className="mt-auto">
            <div className="h-px bg-white/[0.08] mb-6" />

            <span className="text-[10px] tracking-[0.3em] uppercase text-white/35">
              Social
            </span>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">
                Open to opportunities
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}