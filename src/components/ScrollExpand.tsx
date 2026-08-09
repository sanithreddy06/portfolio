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
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
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

  const propsRef = useRef({
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
  });

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
     * FRAME EXPANSION
     */

    const expand = smoothstep(0, 1, p);

    const width =
      c.startWidth + (100 - c.startWidth) * expand;

    const height =
      c.startHeight + (100 - c.startHeight) * expand;

    const insetX = Math.max(0, (100 - width) / 2);
    const insetY = Math.max(0, (100 - height) / 2);

    const radius =
      c.startRadius +
      (c.endRadius - c.startRadius) * expand;

    frame.style.clipPath =
      `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;

    /*
     * MEDIA
     */

    const mediaScale =
      c.mediaZoom + (1 - c.mediaZoom) * expand;

    media.style.transform = `scale(${mediaScale})`;

    const blurAmount =
      12 * (1 - smoothstep(0, 0.55, p));

    media.style.filter = `blur(${blurAmount}px)`;

    /*
     * SCRIM
     */

    if (scrimRef.current) {
      scrimRef.current.style.opacity =
        `${c.overlayScrim * expand}`;
    }

    /*
     * LARGE TITLE
     *
     * The title fades away while the frame expands.
     */

    if (titleRef.current) {
      const titleOut = smoothstep(0.4, 0.88, p);

      titleRef.current.style.opacity =
        `${1 - titleOut}`;

      titleRef.current.style.transform =
        `translate3d(0, ${-28 * titleOut}px, 0) scale(${1 + 0.06 * titleOut})`;
    }

    /*
     * PHILOSOPHY THOUGHT
     *
     * Starts appearing as the title is leaving.
     * This keeps the transition visually connected.
     */

    if (overlayRef.current) {
      const thoughtIn = smoothstep(0.68, 1, p);

      overlayRef.current.style.opacity =
        `${thoughtIn}`;

      overlayRef.current.style.transform =
        `translate3d(0, ${18 * (1 - thoughtIn)}px, 0)`;
    }

    /*
     * SCROLL HINT
     */

    if (hintRef.current) {
      const hintOut = smoothstep(0, 0.15, p);

      hintRef.current.style.opacity =
        `${1 - hintOut}`;

      hintRef.current.style.transform =
        `translate3d(0, ${8 * hintOut}px, 0)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;

    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageHeight = 0;
    let running = false;

    /*
     * MEASURE
     */

    const measure = () => {
      const c = propsRef.current;

      stageHeight = c.useWindowScroll
        ? window.innerHeight
        : root.clientHeight;

      if (stageHeight <= 0) return;

      stage.style.height =
        `${stageHeight}px`;

      const totalHeight =
        1 +
        Math.max(0, c.scrollDistance) +
        Math.max(0, c.holdDistance);

      track.style.height =
        `${stageHeight * totalHeight}px`;

      const width =
        root.clientWidth || stageHeight;

      stage.style.setProperty(
        "--se-title-size",
        `${clamp(width * 0.075, 48, 84)}px`
      );
    };

    /*
     * READ SCROLL PROGRESS
     */

    const readProgress = () => {
      const c = propsRef.current;

      if (!c.enabled) return 1;

      const span =
        stageHeight *
        Math.max(0.01, c.scrollDistance);

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
     * SMOOTH ANIMATION
     */

    const tick = () => {
      const c = propsRef.current;

      const smoothingFactor =
        c.smoothing <= 0
          ? 1
          : 1 -
            Math.exp(
              -1 / (60 * c.smoothing)
            );

      current +=
        (target - current) *
        smoothingFactor;

      if (
        Math.abs(target - current) <
        0.0004
      ) {
        current = target;
        running = false;
      }

      applyProgress(current);

      if (running) {
        raf =
          requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
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
     * SCROLL HANDLER
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
     * RESIZE HANDLER
     */

    const onResize = () => {
      measure();

      target = readProgress();
      current = target;

      applyProgress(current);
    };

    /*
     * INITIAL STATE
     */

    measure();

    target = readProgress();
    current = target;

    applyProgress(current);

    /*
     * EVENT LISTENERS
     */

    const scroller = useWindowScroll
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

    const resizeObserver =
      new ResizeObserver(onResize);

    resizeObserver.observe(root);

    /*
     * CLEANUP
     */

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

      resizeObserver.disconnect();
    };
  }, [
    applyProgress,
    useWindowScroll,
  ]);

  /*
   * MEDIA
   */

  const media =
    mediaType === "video" ? (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className="scroll-expand__media"
      />
    ) : src ? (
      <img
        ref={mediaRef as React.RefObject<HTMLImageElement>}
        src={src}
        alt={alt}
        className="scroll-expand__media"
      />
    ) : (
      <div
        className="scroll-expand__media"
        aria-hidden="true"
      />
    );

  /*
   * RENDER
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
  className="scroll-expand__frame"
>
  {media}

  <div
    ref={scrimRef}
    className="scroll-expand__scrim"
  />
</div>

{/* TITLE — intentionally OUTSIDE the clipped frame */}
{title ? (
  <div
    ref={titleRef}
    className="scroll-expand__title"
  >
    {title}
  </div>
) : null}

{/* THOUGHT — also outside the clipped frame */}
{children ? (
  <div
    ref={overlayRef}
    className="scroll-expand__overlay"
  >
    {children}
  </div>
) : null}

{/* SCROLL HINT */}
{scrollHint ? (
  <div
    ref={hintRef}
    className="scroll-expand__hint"
  >
    {scrollHint}
  </div>
) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;