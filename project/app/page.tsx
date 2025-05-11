"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import IntroScreen from "@/components/intro-screen"
import LandingPage from "@/components/landing-page"

export default function HomePage() {
  const [introState, setIntroState] = useState<"showing" | "transitioning" | "hidden">("showing")
  const [contentVisible, setContentVisible] = useState(false)

  // Handle intro screen transition
  useEffect(() => {
    // Start showing intro
    const introTimer = setTimeout(() => {
      // After 2.5 seconds, start transition
      setIntroState("transitioning")

      // After transition starts, begin fading in the content
      const contentTimer = setTimeout(() => {
        setContentVisible(true)

        // After content is visible, complete the transition
        const completeTimer = setTimeout(() => {
          setIntroState("hidden")
        }, 1000) // Complete transition after 1 second

        return () => clearTimeout(completeTimer)
      }, 500) // Start showing content 0.5 seconds after transition begins

      return () => clearTimeout(contentTimer)
    }, 2500) // Show intro for 2.5 seconds

    return () => clearTimeout(introTimer)
  }, [])

  return (
    // Add a background color to the main wrapper
    <div className="bg-gray-900 min-h-screen">
      {introState !== "hidden" && <IntroScreen isTransitioning={introState === "transitioning"} />}

      <div
        className={cn(
          "w-full h-screen transition-opacity duration-1000 bg-gray-900", // Added bg-gray-900 here
          introState === "showing" ? "opacity-0" : "opacity-100"
        )}
      >
        {contentVisible && (
          <div
            className={cn(
              "w-full h-full transition-all duration-700 bg-gray-900", // Added bg-gray-900 here
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <LandingPage />
          </div>
        )}
      </div>
    </div>
  )
}