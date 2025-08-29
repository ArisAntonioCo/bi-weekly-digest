"use client"

import React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  duration?: number
  spread?: number
}

export function TextShimmer({
  children,
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  return (
    <motion.span
      className={cn(
        "relative inline-block bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-400 bg-clip-text text-transparent",
        "bg-[length:200%_100%]",
        className
      )}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: `${100 + spread * 100}% 100%`,
      }}
    >
      {children}
    </motion.span>
  )
}

// Alternative CSS-only version for better performance
export function TextShimmerCSS({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "animate-text-shimmer bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-400",
        "bg-[size:200%_100%] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  )
}