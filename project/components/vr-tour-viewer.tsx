"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import * as THREE from "three"
import { Canvas, useThree } from "@react-three/fiber"
import { useTexture, Sphere, OrbitControls, Html, Billboard } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Navigation } from "lucide-react"

// Define hotspot structure
interface Hotspot {
  position: [number, number, number]; // 3D position
  targetIndex: number; // Index of the panorama to navigate to
  panoramaIndex?: number; // Optional index of the panorama this hotspot belongs to
  label?: string; // Optional description
}

interface VRTourViewerProps {
  panoramas: string[];
  autoRotate?: boolean;
  height?: string;
  width?: string;
  hotspots?: Hotspot[];
  showControls?: boolean;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

// Hotspot component for navigation
function Hotspot({ position, label, onClick }: { 
  position: [number, number, number]; 
  label?: string;
  onClick: () => void;
}) {
  return (
    <Billboard position={position} follow={true}>
      <Html distanceFactor={10}>
        <div 
          className="relative cursor-pointer group"
          onClick={onClick}
        >
          {/* Pulsing circle effect */}
          <div className="absolute -inset-3 rounded-full bg-blue-500/30 animate-pulse group-hover:bg-blue-600/50"></div>
          
          <div className="relative w-6 h-6 flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition-colors rounded-full">
            <Navigation className="h-3.5 w-3.5 text-white" />
            
            {/* Label that appears on hover */}
            {label && (
              <div className="absolute opacity-0 group-hover:opacity-100 whitespace-nowrap left-1/2 -translate-x-1/2 bottom-full mb-2 bg-black/80 text-white px-2 py-1 rounded text-xs transition-opacity">
                {label}
              </div>
            )}
          </div>
        </div>
      </Html>
    </Billboard>
  )
}

// Panorama sphere component
function PanoramaSphere({ 
  imageUrl, 
  autoRotate,
  hotspots = [],
  onHotspotClick
}: { 
  imageUrl: string; 
  autoRotate: boolean;
  hotspots?: Hotspot[];
  onHotspotClick: (targetIndex: number) => void;
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  
  // Load the texture - using useMemo to prevent unnecessary reloads
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(imageUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [imageUrl])
  
  // Reset camera when the image URL changes
  useEffect(() => {
    if (camera) {
      // Reset camera position to center but slightly offset
      camera.position.set(0, 0, 0.1)
      camera.rotation.set(0, 0, 0)
      camera.lookAt(0, 0, 0)
      
      // Reset the controls if they exist
      if (controlsRef.current) {
        controlsRef.current.reset()
      }
    }
  }, [camera, imageUrl])
  
  return (
    <>
      <Sphere args={[7, 64, 64]} scale={[-1, 1, 1]}>
        <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
      </Sphere>
      
      {/* Render hotspots */}
      {hotspots.map((hotspot, index) => (
        <Hotspot 
          key={`hotspot-${index}`}
          position={hotspot.position}
          label={hotspot.label}
          onClick={() => onHotspotClick(hotspot.targetIndex)}
        />
      ))}
      
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={10.0}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  )
}

// Main VR Tour component
function VRTourViewer({ 
  panoramas, 
  autoRotate: initialAutoRotate = false,
  currentIndex = 0,
  onIndexChange,
  showControls = true,
  height = "100%",
  width = "100%",
  hotspots = []
}: VRTourViewerProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [zoom, setZoom] = useState(60)
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate)
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  
  // Canvas ref for sizing
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Sync with external currentIndex prop
  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [currentIndex])
  
  // Handle initial Canvas loading - only show loading on first render
  const handleLoaded = () => {
    setIsInitialLoading(false)
  }
  
  // Update zoom level
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoom(prev => Math.max(prev - 5, 40))
    } else {
      setZoom(prev => Math.min(prev + 5, 80))
    }
  }

  // Handle panorama navigation
  const navigatePanorama = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? (activeIndex + 1) % panoramas.length
      : (activeIndex - 1 + panoramas.length) % panoramas.length;
    
    setActiveIndex(newIndex);
    
    // Notify parent component if callback is provided
    if (onIndexChange) {
      onIndexChange(newIndex);
    }
  }
  
  // Handle hotspot navigation
  const handleHotspotClick = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < panoramas.length) {
      setActiveIndex(targetIndex);
      
      // Notify parent component if callback is provided
      if (onIndexChange) {
        onIndexChange(targetIndex);
      }
    }
  }
  
  // Camera controller component
  const CameraController = ({ fov }: { fov: number }) => {
    const { camera } = useThree()
    
    useEffect(() => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
    }, [camera, fov])
    
    return null
  }

  // Filter hotspots for the current panorama
  const currentHotspots = hotspots.filter(hotspot => 
    hotspot.panoramaIndex === activeIndex || hotspot.panoramaIndex === undefined
  );

  // Make sure we have valid panoramas
  if (!panoramas || panoramas.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        No panorama images available
      </div>
    );
  }
  
  return (
    <div 
      ref={canvasRef}
      className="relative bg-black overflow-hidden rounded-md"
      style={{ width, height }}
    >
      {isInitialLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-black">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-white border-white/30 rounded-full animate-spin mb-2"></div>
            <span>Loading panorama...</span>
          </div>
        </div>
      )}
      
      <Canvas onCreated={handleLoaded} className="relative z-0">
        <CameraController fov={zoom} />
        <PanoramaSphere 
          imageUrl={panoramas[activeIndex]} 
          autoRotate={autoRotate}
          hotspots={hotspots} 
          onHotspotClick={handleHotspotClick}
        />
      </Canvas>
      
      {/* Rest of your controls remain the same */}
      {showControls && (
        <>
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-black/50 text-white border-white/20 hover:bg-black/70"
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? "Stop Rotation" : "Auto Rotate"}
            >
              {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-black/50 text-white border-white/20 hover:bg-black/70"
              onClick={() => handleZoom('in')}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-black/50 text-white border-white/20 hover:bg-black/70"
              onClick={() => handleZoom('out')}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Navigation buttons */}
          {panoramas.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 z-10 pointer-events-none">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white border-white/20 hover:bg-black/70 pointer-events-auto"
                onClick={() => navigatePanorama('prev')}
                title="Previous Panorama"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white border-white/20 hover:bg-black/70 pointer-events-auto"
                onClick={() => navigatePanorama('next')}
                title="Next Panorama"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Position indicator */}
      {panoramas.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs z-10">
          {activeIndex + 1} / {panoramas.length}
        </div>
      )}
      
      {/* Instruction overlay */}
      <div className="absolute bottom-3 left-3 bg-black/50 text-white/80 px-2 py-1 rounded text-xs flex items-center gap-1 z-10">
        <RotateCw className="h-3 w-3" /> Drag to look around
      </div>
    </div>
  )
}

export default VRTourViewer