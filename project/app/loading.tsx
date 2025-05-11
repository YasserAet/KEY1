"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function Loading() {
  // Simulate progress for the loading indicator
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    // Start with a quick jump to 20%
    setProgress(20)
    
    const timer1 = setTimeout(() => {
      // Simulate loading to 65%
      setProgress(65)
    }, 800)
    
    const timer2 = setTimeout(() => {
      // Simulate loading to 85%
      setProgress(85)
    }, 1600)
    
    const timer3 = setTimeout(() => {
      // Complete the loading
      setProgress(100)
    }, 2400)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])
  
  return (
    <div className="fixed inset-0 bg-[#0b4d43]/80 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden z-[9999]">
      {/* Logo - responsive sizing */}
      <div className="relative mb-6 sm:mb-8 md:mb-12">
        <div className="animate-pulse">
          <Image 
            src="/images/logo.svg"
            alt="Logo"
            width={80} 
            height={30}
            className="w-[80px] h-auto sm:w-[100px] md:w-[120px] brightness-0 invert opacity-90"
          />
        </div>
        <div className="absolute inset-0 filter blur-md opacity-40 animate-pulse" 
             style={{animationDelay: "0.3s"}}>
          <Image 
            src="/images/logo.svg"
            alt=""
            width={80} 
            height={30}
            className="w-[80px] h-auto sm:w-[100px] md:w-[120px] brightness-0 invert"
          />
        </div>
      </div>
      
      {/* Loading text - smaller on mobile */}
      <div className="text-white/70 text-xs sm:text-sm tracking-wider mb-8 sm:mb-12 md:mb-16">
        LOADING PAGE...
      </div>
      
      {/* Progress bar - responsive positioning and width */}
      <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 w-32 sm:w-40 md:w-48 h-[2px] bg-white/20 overflow-hidden rounded-full">
        <div 
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      {/* Percentage - responsive positioning */}
      <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 text-white/50 text-xs">
        {progress}%
      </div>
    </div>
  )
}

