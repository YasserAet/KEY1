"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { default as NextImage } from "next/image"
import { ArrowLeft, ArrowRight, X, Grid, Rows, ImageOff } from "lucide-react"
import { useRouter } from "next/navigation"

// Gallery images from the directory - make sure these paths are correct
const galleryImages = [
  "/images/Gallery/B(7).jpg",
  "/images/Gallery/B(6).jpg",
  "/images/Gallery/B(1).jpg",
  "/images/Gallery/B(4).jpg",
  "/images/Gallery/B(2).jpg",
  "/images/Gallery/B(3).jpg",
]

// Fallback image in case the others don't load
const fallbackImage = "/placeholder.svg?height=1080&width=1920"

export default function LandingPage() {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(Array(galleryImages.length).fill(false))
  const [anyImageLoaded, setAnyImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Preload images and check if they exist
  useEffect(() => {
    const loadImage = (src: string, index: number) => {
      const img = new window.Image()
      img.src = src
      img.onload = () => {
        setImagesLoaded((prev) => {
          const newState = [...prev]
          newState[index] = true
          return newState
        })
        setAnyImageLoaded(true)
        console.log(`Image loaded successfully: ${src}`)
      }
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`)
        setImagesLoaded((prev) => {
          const newState = [...prev]
          newState[index] = false
          return newState
        })
      }
    }

    galleryImages.forEach((src, index) => {
      loadImage(src, index)
    })

    const fallbackImg = new Image()
    fallbackImg.src = fallbackImage
  }, [])

  // Simple slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        let nextIndex = (prevIndex + 1) % galleryImages.length
        let attempts = 0

        if (!anyImageLoaded) return nextIndex

        while (!imagesLoaded[nextIndex] && attempts < galleryImages.length) {
          nextIndex = (nextIndex + 1) % galleryImages.length
          attempts++
        }

        return nextIndex
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [imagesLoaded, anyImageLoaded])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = "100vh"
    }
  }, [])

  const getCurrentImageSrc = () => {
    if (imagesLoaded[currentImageIndex]) {
      return galleryImages[currentImageIndex]
    }
    return fallbackImage
  }

  const handleStartExploring = () => {
    router.push('/map')
  }

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0 bg-gray-900">
        {galleryImages.map((src, index) => (
          <div
            key={`image-${index}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: index === currentImageIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
          >
            <img 
              src={src}
              alt={`Gallery image ${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.3)",
              }}
              onLoad={() => console.log(`Image loaded visually: ${src}`)}
              onError={(e) => {
                console.error(`Image failed to load visually: ${src}`);
                e.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 h-full flex flex-col justify-center items-center text-white p-4 sm:p-6 md:p-8 max-w-[100vw] overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2 sm:mb-3 md:mb-4"
        >
          KEY1 Residential Tower Explorer
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-3xl text-center text-sm sm:text-base md:text-lg px-2 sm:px-4"
        >
          <p className="mb-3 sm:mb-4 md:mb-5 max-w-xl mx-auto">
            Experience our architectural masterpiece through interactive 3D visualization. Explore the tower from every
            angle, discover nearby landmarks, and visualize your future living space.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-5 md:mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-white/20 transition-all">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">3D Exploration</h3>
              <p className="text-xs sm:text-sm">Navigate the 360° panoramic view to see the building and surrounding area.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-white/20 transition-all">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nearby Landmarks</h3>
              <p className="text-xs sm:text-sm">Discover points of interest within walking distance of your future home.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-white/20 transition-all sm:col-span-2 md:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Gallery View</h3>
              <p className="text-xs sm:text-sm">Browse through detailed images of the building, apartments, and amenities.</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 md:mt-8">
            <button 
              className="bg-[#0B4D35] text-white font-medium px-4 py-2 sm:px-6 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-[#0b4d35]/90 transition-all shadow-sm"
              onClick={handleStartExploring}
            >
              Start Exploring
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
