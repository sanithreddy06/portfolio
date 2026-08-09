"use client";

import React, { useCallback, useEffect, useRef } from "react";
import "./ScrollExpand.css";

const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ScrollExpandProps {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollExpand: React.FC<ScrollExpandProps> = ({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,

  // IMPORTANT:
  // Much longer expansion on mobile.
scrollDistance = 1.2,
holdDistance = 0.35,
smoothing = 0.06,
overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  children,
  className = "",
  style,
  ...rest
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef<Record<string, any>>({});

  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  };

  const applyProgress = useCallback((p: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;

    if (!frame || !media) return;

    const c = propsRef.current;

    /*
     * --------------------------------------------------
     * FRAME EXPANSION
     * --------------------------------------------------
     */

    const expand = smoothstep(0, 1, p);

    const w =
      c.startWidth +
      (100 - c.startWidth) * expand;

    const h =
      c.startHeight +
      (100 - c.startHeight) * expand;

    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);

    const radius =
      c.startRadius +
      (c.endRadius - c.startRadius) * expand;

    frame.style.clipPath =
      `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${radius}px)`;

    /*
     * --------------------------------------------------
     * MEDIA
     * --------------------------------------------------
     */

    media.style.transform =
      `scale(${c.mediaZoom + (1 - c.mediaZoom) * expand})`;

    const blurAmount =
      12 * (1 - smoothstep(0, 0.55, p));

    media.style.filter =
      `blur(${blurAmount}px)`;

    /*
     * --------------------------------------------------
     * SCRIM
     * --------------------------------------------------
     */

    if (scrimRef.current) {
      scrimRef.current.style.opacity =
        `${c.overlayScrim * expand}`;
    }

    /*
     * --------------------------------------------------
     * TITLE
     * --------------------------------------------------
     */

if (titleRef.current) {
  // Title leaves smoothly as the image expands
  const out = smoothstep(0.42, 0.68, p);

  titleRef.current.style.opacity = `${1 - out}`;
  titleRef.current.style.transform =
    `translate3d(0, ${-20 * out}px, 0) scale(${1 + 0.04 * out})`;
}

if (overlayRef.current) {
  // Thought begins almost immediately as the title disappears
  const inn = smoothstep(0.60, 0.78, p);

  overlayRef.current.style.opacity = `${inn}`;
  overlayRef.current.style.transform =
    `translate3d(0, ${12 * (1 - inn)}px, 0)`;
}
    /*
     * --------------------------------------------------
     * SCROLL HINT
     * --------------------------------------------------
     */

    if (hintRef.current) {
      const gone = smoothstep(0, 0.15, p);

      hintRef.current.style.opacity =
        `${1 - gone}`;

      hintRef.current.style.transform =
        `translate3d(0, ${8 * gone}px, 0)`;
    }

    /*
     * --------------------------------------------------
     * PHILOSOPHY CONTENT
     *
     * This is the important change.
     *
     * It appears AFTER the frame is mostly expanded
     * and stays fully visible until the scroll track
     * finishes.
     * --------------------------------------------------
     */

  
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;

    if (!root || !track || !stage) return;

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    /*
     * --------------------------------------------------
     * MEASURE
     * --------------------------------------------------
     */

    const measure = () => {
      const c = propsRef.current;

      stageH =
        c.useWindowScroll
          ? window.innerHeight
          : root.clientHeight;

      if (stageH <= 0) return;

      stage.style.height =
        `${stageH}px`;

      /*
       * Expansion distance + HOLD distance.
       *
       * The hold is deliberately long on mobile.
       */

      const total =
        1 +
        Math.max(0, c.scrollDistance) +
        Math.max(0, c.holdDistance);

      track.style.height =
        `${stageH * total}px`;

      const w =
        root.clientWidth || stageH;

      stage.style.setProperty(
        "--se-title-size",
        `${clamp(w * 0.075, 20, 84)}px`
      );
    };

    /*
     * --------------------------------------------------
     * PROGRESS
     * --------------------------------------------------
     */

    const readProgress = () => {
      const c = propsRef.current;

      if (!c.enabled) return 1;

      /*
       * Only the expansion distance controls
       * animation progress.
       *
       * The hold distance does NOT push the
       * animation backwards or fade it away.
       */

      const span =
        stageH *
        Math.max(
          0.01,
          c.scrollDistance
        );

      if (c.useWindowScroll) {
        const top =
          track.getBoundingClientRect().top;

        return clamp(
          -top / span,
          0,
          1
        );
      }

      return clamp(
        root.scrollTop / span,
        0,
        1
      );
    };

    /*
     * --------------------------------------------------
     * RAF SMOOTHING
     * --------------------------------------------------
     */

    const tick = () => {
      const c = propsRef.current;

      const k =
        c.smoothing <= 0
          ? 1
          : 1 -
            Math.exp(
              -1 /
                (60 * c.smoothing)
            );

      current +=
        (target - current) * k;

      if (
        Math.abs(target - current) <
        0.0004
      ) {
        current = target;
        running = false;
      }

      applyProgress(current);

      raf = running
        ? requestAnimationFrame(tick)
        : 0;
    };

    const kick = () => {
      if (running) return;

      running = true;

      if (!raf) {
        raf =
          requestAnimationFrame(tick);
      }
    };

    /*
     * --------------------------------------------------
     * SCROLL
     * --------------------------------------------------
     */

    const onScroll = () => {
      target = readProgress();

      if (
        propsRef.current.smoothing <= 0 ||
        reduceMotion
      ) {
        current = target;
        applyProgress(current);
        return;
      }

      kick();
    };

    /*
     * --------------------------------------------------
     * RESIZE
     * --------------------------------------------------
     */

    const onResize = () => {
      measure();

      target = readProgress();
      current = target;

      applyProgress(current);
    };

    measure();

    target = readProgress();
    current = target;

    applyProgress(current);

    const scroller =
      useWindowScroll
        ? window
        : root;

    scroller.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      onResize
    );

    const ro =
      new ResizeObserver(onResize);

    ro.observe(root);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }

      scroller.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      ro.disconnect();
    };
  }, [
    applyProgress,
    useWindowScroll,
  ]);

  /*
   * --------------------------------------------------
   * MEDIA
   * --------------------------------------------------
   */

  const media =
    mediaType === "video" ? (
      <video
        ref={
          mediaRef as React.RefObject<HTMLVideoElement>
        }
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : src ? (
      <img
        ref={
          mediaRef as React.RefObject<HTMLImageElement>
        }
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <div
        ref={
          mediaRef as React.RefObject<HTMLDivElement>
        }
        className="absolute inset-0 bg-black"
      />
    );

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div
      ref={rootRef}
      className={`
        scroll-expand
        ${useWindowScroll
          ? ""
          : "scroll-expand--scroller"}
        ${className}
      `.trim()}
      style={style}
      {...rest}
    >
      <div
        ref={trackRef}
        className="scroll-expand__track"
      >
        <div
          ref={stageRef}
          className="scroll-expand__stage"
        >
          <div
            ref={frameRef}
            className="scroll-expand__frame z-10"
          >
            {media}

            <div
              ref={scrimRef}
              className="absolute inset-0 bg-black pointer-events-none"
              style={{
                opacity: 0,
              }}
            />

            {children ? (
              <div
                ref={overlayRef}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: 0,
                }}
              >
                {children}
              </div>
            ) : null}

{title ? (
  <div
    ref={titleRef}
    className="scroll-expand__title absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
  >
    {title}
  </div>
) : null}

            {scrollHint ? (
              <div
                ref={hintRef}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
              >
                {scrollHint}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;