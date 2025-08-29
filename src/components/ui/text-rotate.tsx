"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface TextRotateProps {
  texts: string[]
  className?: string
  duration?: number
  framerProps?: Record<string, unknown>
}

export function TextRotate({
  texts,
  className,
  duration = 2500,
  framerProps = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.2, ease: "easeInOut" }
  }
}: TextRotateProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, duration)
    return () => clearInterval(interval)
  }, [texts.length, duration])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        className={cn("inline-block", className)}
        {...framerProps}
      >
        {texts[currentIndex]}
      </motion.span>
    </AnimatePresence>
  )
}

// Alternative version with individual character animation
export function TextRotateCharacter({
  texts,
  className,
  duration = 2500,
  charDelay = 0.03,
}: {
  texts: string[]
  className?: string
  duration?: number
  charDelay?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, duration)
    return () => clearInterval(interval)
  }, [texts.length, duration])

  const currentText = texts[currentIndex]

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        className={cn("inline-block", className)}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {currentText.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: index * charDelay,
                  duration: 0.2,
                },
              },
              exit: {
                opacity: 0,
                y: -20,
                transition: {
                  delay: index * charDelay * 0.5,
                  duration: 0.2,
                },
              },
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  )
}

// Fade version
export function TextRotateFade({
  texts,
  className,
  duration = 2500,
}: {
  texts: string[]
  className?: string
  duration?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, duration)
    return () => clearInterval(interval)
  }, [texts.length, duration])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        className={cn("inline-block", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {texts[currentIndex]}
      </motion.span>
    </AnimatePresence>
  )
}