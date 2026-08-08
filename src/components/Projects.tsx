"use client";

import { useState } from "react";

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string;
  color: string;
  glowColor: string;
  githubUrl?: string;
  liveUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: "codelens",
    title: "CodeLens",
    description:
      "AI-powered tool for understanding and exploring codebases with intelligent explanations, structure analysis, and codebase-aware interaction.",
    tech: "React • Node.js • AI • GitHub API",
    color: "#FC6B2F",
    glowColor: "rgba(252, 107, 47, 0.35)",
    githubUrl:
      "https://github.com/sanithreddy06/AI-Powered-Codebase-Understanding-and-Exploration-Tool",
  },
  {
    id: "smart-waste",
    title: "Smart Waste Classification",
    description:
      "Image-based waste classification system designed to identify and categorize different types of waste automatically.",
    tech: "Python • Machine Learning • Computer Vision",
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.35)",
    githubUrl: "https://github.com/sanithreddy06/smartwaste.git",
  },
  {
  id: "smart-parking",
  title: "Smart Parking System",
  description:
    "An IoT-based parking system built using sensors and microcontrollers to detect parking availability and improve parking management.",
  tech: "Arduino • IoT • Sensors",
  color: "#6366F1",
  glowColor: "rgba(99, 102, 241, 0.35)",
  },
  {
  id: "house-price",
  title: "House Price Prediction",
  description:
    "A machine learning project that predicts house prices using property features and historical housing data.",
  tech: "Python • Machine Learning • Data Science",
  color: "#D4A373",
  glowColor: "rgba(212, 163, 115, 0.35)",
  },
];

export default function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="projects"
      className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Divider */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-iron to-transparent"
        aria-hidden="true"
      />

      {/* Dynamic ambient background glow */}
      <div
        className="absolute top-1/3 -left-48 w-96 h-96 rounded-full opacity-25 pointer-events-none blur-[140px] transition-all duration-700"
        style={{
          backgroundColor:
            hoveredIndex !== null
              ? PROJECTS[hoveredIndex]?.color || "var(--ember)"
              : "var(--ember)",
        }}
      />

      <div className="section-container relative z-10">
        {/* Minimal Section Header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-ember inline-block rounded-full" />
            <span className="text-ember text-xs font-bold tracking-[0.25em] uppercase">
              Featured Work
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Selected Projects
          </h2>
        </div>

        {/* Pure Image Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {PROJECTS.map((project, i) => (
            <div
                key={project.id}
                 onMouseEnter={() => setHoveredIndex(i)}
                 onMouseLeave={() => setHoveredIndex(null)}
                 className="relative min-h-[280px] w-full rounded-2xl overflow-hidden border border-white/10 group hover:border-white/30 transition-all duration-500 shadow-2xl bg-obsidian"
            >
           {/* Ambient project glow */}
          <div
                 className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style={{
                  background: `radial-gradient(circle at 70% 30%, ${project.glowColor} 0%, transparent 65%)`,
                }}
          />

  {/* Project number */}
  <div className="absolute top-6 right-6 text-white/30 text-sm font-mono">
    0{i + 1}
  </div>

  {/* Project content */}
  <div className="relative z-10 h-full min-h-[280px] p-7 md:p-9 flex flex-col justify-between">
    <div>
      <div
        className="w-8 h-[2px] mb-6 rounded-full"
        style={{ backgroundColor: project.color }}
      />

      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
        {project.title}
      </h3>

      <p className="text-sm md:text-base text-[#B5B5B5] leading-relaxed max-w-xl">
        {project.description}
      </p>
    </div>

    <div className="flex items-end justify-between gap-4 mt-8">
      <span className="text-[11px] md:text-xs text-white/50 tracking-wide uppercase">
        {project.tech}
      </span>

      {project.liveUrl || project.githubUrl ? (
        <a
          href={project.liveUrl || project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 rounded-full border border-white/15 text-xs text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          View Project ↗
        </a>
      ) : (
        <span className="shrink-0 px-4 py-2 rounded-full border border-white/10 text-xs text-white/40">
          Academic Project
        </span>
      )}
            </div>
          </div>
        </div>
          ))}
        </div>
      </div>
    </section>
  );
}
