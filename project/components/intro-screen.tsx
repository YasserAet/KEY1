"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface IntroScreenProps {
  isTransitioning: boolean
}

export default function IntroScreen({ isTransitioning }: IntroScreenProps) {
  const [logoVisible, setLogoVisible] = useState(false)
  const [logoTransitioning, setLogoTransitioning] = useState(false)

  useEffect(() => {
    // Trigger logo animation after background animation starts
    const timer = setTimeout(() => {
      setLogoVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Handle logo transition when main transition starts
  useEffect(() => {
    if (isTransitioning) {
      setLogoTransitioning(true)
    }
  }, [isTransitioning])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-900 transition-all duration-1000",
        isTransitioning ? "opacity-0" : "opacity-100",
      )}
    >
      {/* Animated blurred circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob1 absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-800 opacity-70 blur-3xl"></div>
        <div className="animate-blob2 absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-emerald-700 opacity-70 blur-3xl"></div>
        <div className="animate-blob3 absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-emerald-800 opacity-70 blur-3xl"></div>
        <div className="animate-blob4 absolute top-1/2 left-1/2 h-80 w-80 rounded-full bg-emerald-700 opacity-70 blur-3xl"></div>
      </div>

      {/* Logo */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center transition-all duration-1000",
          logoVisible && !logoTransitioning
            ? "opacity-100 scale-100"
            : logoVisible && logoTransitioning
              ? "opacity-0 scale-150 translate-y-[-30px]"
              : "opacity-0 scale-50",
        )}
      >
        <div className="mb-4">
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 50.000000 50.000000"
            preserveAspectRatio="xMidYMid meet"
            className="h-24 w-24"
          >
            <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)" fill="#FFFFFF" stroke="none">
              <path d="M197 442 c-20 -21 -37 -42 -37 -48 0 -16 74 -84 91 -84 16 0 89 70 89 86 0 16 -74 84 -91 84 -8 0 -32 -17 -52 -38z" />
              <path d="M52 296 l-47 -45 35 -36 c59 -61 64 -62 118 -11 l47 45 -35 36 c-59 61 -64 62 -118 11z" />
              <path d="M342 296 l-47 -45 35 -36 c59 -61 64 -62 118 -11 l47 45 -35 36 c-59 61 -64 62 -118 11z" />
              <path d="M197 152 c-20 -21 -37 -42 -37 -48 0 -16 74 -84 91 -84 16 0 89 70 89 86 0 16 -74 84 -91 84 -8 0 -32 -17 -52 -38z" />
            </g>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">KEY1</h1>
        <p className="mt-2 text-sm text-emerald-100">Reliable. Effortless. Your Dream Property Awaits.</p>
      </div>
    </div>
  )
}
