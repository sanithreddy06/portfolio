"use client";

import ScrollExpand from "./ScrollExpand";

export default function Introduction() {
  return (
    <section className="relative w-full">
      {/* MOBILE PHILOSOPHY */}
      <div
        className="md:hidden relative min-h-[100svh] w-full bg-[#080808] flex items-center justify-center px-7 py-24 overflow-hidden"
        style={{
          fontFamily:
            "var(--font-josefin), 'Josefin Sans', sans-serif",
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full pointer-events-none blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(160,42,34,0.18), transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-[340px] text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-7 h-[1px] bg-[#A02A22]" />

            <span className="text-[#A02A22] text-[10px] font-bold tracking-[0.3em] uppercase">
              The Philosophy
            </span>

            <span className="w-7 h-[1px] bg-[#A02A22]" />
          </div>

          <p className="text-[22px] leading-[1.55] font-medium tracking-[-0.02em] text-white">
            I believe technology becomes meaningful when ideas are turned into
            something real.
          </p>

          <p className="mt-7 text-[15px] leading-[1.7] text-white/50">
            I love building software, AI, and IoT projects that solve
            problems, explore new possibilities, and make technology more
            useful.
          </p>

          <div className="mt-12">
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">
              Sai Sanith Reddy
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP PHILOSOPHY */}
      <div className="hidden md:block">
      <ScrollExpand
  useWindowScroll={true}
  src="/images/philosophy-bg.jpg"
  mediaType="image"
  title="THE PHILOSOPHY"
  startWidth={42}
  startHeight={58}
  startRadius={24}
  endRadius={0}
  mediaZoom={1.35}
  scrollDistance={1.2}
  holdDistance={0.35}
  smoothing={0.1}
  overlayScrim={0.45}
>
          {/* THIS CONTENT MUST BE INSIDE ScrollExpand */}
          <div
            className="flex flex-col items-center justify-center gap-10 max-w-4xl mx-auto px-6"
            style={{
              fontFamily:
                "var(--font-josefin), 'Josefin Sans', sans-serif",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-[1px] bg-[#A02A22]" />

              <span className="text-[#A02A22] text-xs font-bold tracking-[0.3em] uppercase">
                The Philosophy
              </span>

              <span className="w-10 h-[1px] bg-[#A02A22]" />
            </div>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white leading-[1.45] tracking-tight text-center">
              I believe technology becomes meaningful when ideas are turned
              into something real. I love building software, AI, and IoT
              projects that solve problems, explore new possibilities, and make
              technology more useful.
            </p>
          </div>
        </ScrollExpand>
      </div>
    </section>
  );
}