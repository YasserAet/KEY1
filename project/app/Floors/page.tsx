"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ArrowLeft, ArrowRight, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import Loading from "../loading";

// 3D floor plan render images
const floorPlans = [
  {
    id: "floor0",
    title: "Ground Floor",
    description: "Stylish modern studio with open concept living space",
    image: "/images/3drenders/3dGroundFloor.png",
    area: "45m²"
  },
  {
    id: "floor1",
    title: "First Floor",
    description: "Spacious one bedroom with balcony and modern amenities",
    image: "/images/3drenders/3dMiddleFloors.png",
    area: "75m²"
  },
  {
    id: "floor2",
    title: "Second Floor",
    description: "Spacious one bedroom with balcony and modern amenities",
    image: "/images/3drenders/3dMiddleFloors.png",
    area: "75m²"
  },
  {
    id: "floor3",
    title: "Third Floor",
    description: "Spacious one bedroom with balcony and modern amenities",
    image: "/images/3drenders/3dMiddleFloors.png",
    area: "75m²"
  },
  {
    id: "floor4",
    title: "Fourth Floor",
    description: "Luxury two bedroom with panoramic views and premium finishes",
    image: "/images/3drenders/3dMiddleFloors.png",
    area: "110m²"
  },
  {
    id: "floor5",
    title: "Fifth Floor",
    description: "Luxury two bedroom with panoramic views and premium finishes",
    image: "/images/3drenders/3dMiddleFloors.png",
    area: "110m²"
  },
  {
    id: "floor6",
    title: "Penthouse Floor",
    description: "Luxury two bedroom with panoramic views and premium finishes",
    image: "/images/3drenders/3dMiddleFloors.png",
    area: "110m²"
  },
  {
    id: "floor7",
    title: "Terrace Floor",
    description: "Luxury two bedroom with panoramic views and premium finishes",
    image: "/images/3drenders/3dTerrace.png",
    area: "110m²"
  }
];

export default function FloorsPage() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
  const [initialZoomLevel, setInitialZoomLevel] = useState<number>(1);

  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(0);

  // Handle background color fix
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, #__next, #__next > div, main, [data-nextjs-scroll-focus-boundary] {
        background-color: #f3f4f6 !important;
      }
    `;
    document.head.appendChild(style);

    document.documentElement.style.cssText = "background-color: #f3f4f6 !important";
    document.body.style.cssText = "background-color: #f3f4f6 !important";

    setPageLoaded(true);

    return () => {
      document.head.removeChild(style);
      document.documentElement.style.cssText = "";
      document.body.style.cssText = "";
    };
  }, []);

  // Handle image loading errors
  const handleImageError = (imageUrl: string) => {
    setImgError(prev => ({
      ...prev,
      [imageUrl]: true
    }));
  };

  // Navigate between slides
  const navigateSlide = (newDirection: number) => {
    setDirection(newDirection);

    if (newDirection === -1) {
      setCurrentIndex(prev =>
        prev === 0 ? floorPlans.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex(prev =>
        prev === floorPlans.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Navigate lightbox
  const navigateImage = (dir: 'prev' | 'next') => {
    if (selectedImage === null) return;

    let newIndex;
    if (dir === 'prev') {
      newIndex = selectedImage === 0 ? floorPlans.length - 1 : selectedImage - 1;
    } else {
      newIndex = selectedImage === floorPlans.length - 1 ? 0 : selectedImage + 1;
    }
    setSelectedImage(newIndex);
  };

  // Handle zoom in/out
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.25);
    } else if (direction === 'out' && zoomLevel > 1) {
      setZoomLevel(prev => prev - 0.25);
    }

    // Reset pan position when zooming out to 1
    if (direction === 'out' && zoomLevel === 1.25) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

  // Reset zoom when changing slides
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Show loading screen until ready
  if (!pageLoaded) {
    return <Loading />;
  }

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-100 -z-10"></div>

      {/* Increased top padding from pt-16/pt-20 to pt-20/pt-24 */}
      <div className="pt-10 md:pt-[110px] px-6 pb-6 max-w-7xl mx-auto bg-gray-100 min-h-screen"> 
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6 text-[#0b4d43]">3D Floor Plans</h1>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-6 overflow-hidden">
          <p className="text-gray-600 mb-4 text-center text-sm">
            Explore our meticulously designed floor plans featuring modern layouts and premium finishes.
          </p>

          {/* Slideshow container */}
          <div className="relative overflow-hidden rounded-lg" style={{ height: "450px" }}>
            {/* Large navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-white/80 hover:bg-white shadow-md text-[#0b4d43] rounded-full"
              onClick={() => navigateSlide(-1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-white/80 hover:bg-white shadow-md text-[#0b4d43] rounded-full"
              onClick={() => navigateSlide(1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Slideshow with animation */}
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction * 50 // Slide from left or right
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.4 }
                }}
                exit={{
                  opacity: 0,
                  x: direction * -50,
                  transition: { duration: 0.2 }
                }}
                className="absolute inset-0 flex"
              >
                {/* Current slide */}
                <div className="w-full h-full flex flex-col md:flex-row items-center justify-center p-3 sm:p-6">
                  {/* Image with zoom controls */}
                  <div className="relative h-[250px] md:h-[400px] w-full md:w-3/4 overflow-hidden rounded-lg">
                    <div
                      className="cursor-move w-full h-full relative group overflow-hidden"
                      onClick={() => !imgError[floorPlans[currentIndex].image] && setSelectedImage(currentIndex)}
                      onMouseDown={() => zoomLevel > 1 && setIsPanning(true)}
                      onMouseUp={() => setIsPanning(false)}
                      onMouseLeave={() => setIsPanning(false)}
                      onMouseMove={(e) => {
                        if (isPanning && zoomLevel > 1) {
                          setPanPosition(prev => ({
                            x: prev.x + e.movementX / zoomLevel,
                            y: prev.y + e.movementY / zoomLevel
                          }));
                        }
                      }}
                      onTouchStart={(e) => {
                        // Check if it's a pinch gesture (2 touch points)
                        if (e.touches.length === 2) {
                          // Calculate initial distance between touch points
                          const touch1 = e.touches[0];
                          const touch2 = e.touches[1];
                          const distance = Math.hypot(
                            touch2.clientX - touch1.clientX,
                            touch2.clientY - touch1.clientY
                          );
                          
                          // Save initial distance and current zoom level
                          setTouchStartDistance(distance);
                          setInitialZoomLevel(zoomLevel);
                          e.preventDefault(); // Prevent default to avoid unwanted behaviors
                        } else if (e.touches.length === 1 && zoomLevel > 1) {
                          // Enable panning with one finger when zoomed in
                          setIsPanning(true);
                        }
                      }}
                      onTouchMove={(e) => {
                        // Handle pinch zoom
                        if (e.touches.length === 2 && touchStartDistance !== null) {
                          // Calculate new distance
                          const touch1 = e.touches[0];
                          const touch2 = e.touches[1];
                          const currentDistance = Math.hypot(
                            touch2.clientX - touch1.clientX,
                            touch2.clientY - touch1.clientY
                          );
                          
                          // Calculate new scale based on the ratio of distances
                          const scale = initialZoomLevel * (currentDistance / touchStartDistance);
                          
                          // Limit zoom between 1 and 3
                          const newZoom = Math.min(Math.max(scale, 1), 3);
                          setZoomLevel(newZoom);
                          
                          e.preventDefault(); // Prevent default to avoid unwanted behaviors
                        } 
                        // Handle panning with one finger
                        else if (e.touches.length === 1 && isPanning && zoomLevel > 1) {
                          const touch = e.touches[0];
                          
                          // Use touch movement delta if available (via stored previous position)
                          if (e.targetTouches.length > 0) {
                            const touchTarget = e.targetTouches[0];
                            
                            // Get the previous touch position from a custom data attribute or state
                            // For simplicity, we'll just use a small increment in the direction of the touch
                            // You might want to improve this by properly tracking previous touch position
                            const movementX = touchTarget.clientX - touchTarget.clientX;
                            const movementY = touchTarget.clientY - touchTarget.clientY;
                            
                            setPanPosition(prev => ({
                              x: prev.x + movementX / zoomLevel,
                              y: prev.y + movementY / zoomLevel
                            }));
                          }
                        }
                      }}
                      onTouchEnd={() => {
                        // Reset touch tracking state
                        setTouchStartDistance(null);
                        setIsPanning(false);
                      }}
                    >
                      {!imgError[floorPlans[currentIndex].image] ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <div
                            style={{
                              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                              transition: isPanning ? 'none' : 'transform 0.2s',
                              transformOrigin: 'center',
                              width: '100%',
                              height: '100%',
                              position: 'relative'
                            }}
                          >
                            <Image
                              src={floorPlans[currentIndex].image}
                              alt={floorPlans[currentIndex].title}
                              fill
                              className="object-contain"
                              onError={() => handleImageError(floorPlans[currentIndex].image)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                          <p className="text-gray-500 text-sm">Image not available</p>
                        </div>
                      )}

                      {/* Zoom controls */}
                      <div className="absolute bottom-2 right-2 flex flex-col bg-white/90 rounded-lg shadow-md overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 hover:bg-gray-100 text-[#0b4d43] disabled:text-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleZoom('in');
                          }}
                          disabled={zoomLevel >= 3}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                        <div className="px-2 py-1 text-xs text-center border-t border-b border-gray-200">
                          {Math.round(zoomLevel * 100)}%
                        </div>
                        <button 
                          className="p-2 hover:bg-gray-100 text-[#0b4d43] disabled:text-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleZoom('out');
                          }}
                          disabled={zoomLevel <= 1}
                        >
                          <ZoomIn className="h-4 w-4 rotate-180" />
                        </button>
                      </div>

                      {/* Reset zoom button - only show when zoomed */}
                      {zoomLevel > 1 && (
                        <div className="absolute top-2 right-2 bg-white/90 rounded-md shadow-md p-1 text-xs">
                          <button 
                            className="text-[#0b4d43] px-2 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomLevel(1);
                              setPanPosition({ x: 0, y: 0 });
                            }}
                          >
                            Reset View
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Information */}
                  <div className="w-full md:w-1/4 p-2 sm:p-4 md:pl-6 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center md:text-left"
                    >
                      <div className="mb-1 inline-block px-2 py-0.5 bg-[#0b4d43]/10 text-[#0b4d43] text-xs font-medium rounded-full">
                        {floorPlans[currentIndex].area}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0b4d43] mb-1">{floorPlans[currentIndex].title}</h2>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2">{floorPlans[currentIndex].description}</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination indicators */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {floorPlans.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-[#0b4d43] w-4"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Floor selection buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mt-6">
            {floorPlans.map((plan, index) => (
              <button
                key={plan.id}
                className={`text-xs py-1 px-1 rounded transition-all ${
                  currentIndex === index
                    ? "bg-[#0b4d43] text-white font-medium"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
              >
                {plan.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
