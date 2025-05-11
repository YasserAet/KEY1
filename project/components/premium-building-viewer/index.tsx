"use client"

import { Canvas } from "@react-three/fiber"
import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import { OrbitControls as DreiOrbitControls, OrbitControls } from "@react-three/drei"
import dynamic from "next/dynamic"
import { SPACE_DATA, FLOORS, Room } from "./data"
import { BuildingModelLoader } from "./building-model-loader"
import { EnhancedLighting } from "./enhanced-lighting"
import { EnhancedEnvironment } from "./enhanced-environment"
import { MobileFloorControls } from "./mobile-floor-controls"
import { RoomViewerModal } from "./room-viewer-modal"
import { ComparisonModal } from "./comparison-modal"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { Suspense } from "react"
import { Preload, useProgress } from "@react-three/drei"

const DynamicFloorIndicator = dynamic(() => Promise.resolve(FloorIndicator), {
  ssr: false,
})
import { FloorIndicator } from "./floor-indicator"

interface RoomViewerModalProps {
  room: Room
  isOpen: boolean
  onClose: () => void
  onToggleFavorite: (room: Room) => void
  favoriteRooms: Room[]
}

// Add this loading component to display visual progress
function LoadingScreen() {
  const { progress } = useProgress()
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-6 flex flex-col items-center">
        <div className="text-2xl font-medium mb-4 text-gray-800">Loading 3D Model</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-[#0b4d43] h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-gray-600">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}

export default function PremiumBuildingViewer() {
  const [currentFloor, setCurrentFloor] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const totalFloors = FLOORS.length
  const isDayMode = true

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [hoveredFlat, setHoveredFlat] = useState(null)

  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const [cameraPosition, setCameraPosition] = useState([20, 15, 20])
  const [targetPosition, setTargetPosition] = useState([0, 5, 0])
  const [favoriteRooms, setFavoriteRooms] = useState<Room[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const cameraAnimationRef = useRef<number | null>(null)

  // Toggle favorite room
  const toggleFavorite = (room: Room) => {
    setFavoriteRooms((prev) => {
      const isAlreadyFavorite = prev.some((favRoom) => favRoom.id === room.id)
      if (isAlreadyFavorite) {
        return prev.filter((favRoom) => favRoom.id !== room.id)
      } else {
        return [...prev, room]
      }
    })
    setHoveredFlat(null)
  }

  const handleFloorChange = useCallback((floor: number) => {
    console.log("Changing floor to:", floor)
    setCurrentFloor(floor)
  }, [])

  // Define the handleFlatClick function
  const handleFlatClick = useCallback((flat: THREE.Object3D) => {
    const flatObject = {
      name: flat.name as keyof typeof SPACE_DATA,
      userData: flat.userData as { floorLevel?: number },
    }
    console.log("Flat clicked in viewer:", flatObject)
    console.log("Object name:", flatObject.name)

    // First, try exact match
    const flatData = SPACE_DATA[flatObject.name as keyof typeof SPACE_DATA]

    if (flatData) {
      // Use the actual data from SPACE_DATA
      setSelectedRoom({
        id: flatObject.name,
        floor: flatData.floor || 1,
        type: flatData.type || "-",
        area: flatData.area || "-",
        status: "status" in flatData ? (flatData.status as string) : "-", // Ensure 'status' is provided
        objectName: flatObject.name,
        floorPlanImage: flatData.floorPlanImage || "/images/placeholder-plan.jpg",
        roomImages: flatData.roomImages || ["/images/placeholder-room.jpg"],
        panoramas: "panoramas" in flatData ? flatData.panoramas : [], // Provide default empty array for panoramas
      })

      setShowRoomModal(true)
    } else {
      console.warn(`Clicked object ${flatObject.name} has no data in SPACE_DATA`)

      // Fallback for objects without data
      const fallbackRoom = {
        id: flatObject.name,
        floor: flatObject.userData.floorLevel || 1,
        type: "SPACE",
        area: "-",
        status: "-",
        objectName: flatObject.name,
        floorPlanImage: "/images/placeholder-plan.jpg",
        roomImages: ["/images/placeholder-room.jpg"],
        panoramas: ["/images/panoramas/sample.jpg"],
      }

      setSelectedRoom(fallbackRoom)
      setShowRoomModal(true)
    }
  }, [])

  return (
    <div className="premium-building-viewer h-screen w-full relative">
      {!isLoading && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-10">
          <MobileFloorControls
            currentFloor={currentFloor}
            totalFloors={totalFloors}
            onFloorChange={handleFloorChange}
          />
        </div>
      )}

      {/* Favorites bar - MOVED HIGHER */}
      {!isLoading && favoriteRooms.length > 0 && (
        <div className="fixed bottom-16 md:bottom-24 left-2 md:left-4 z-20 pointer-events-auto" style={{ maxWidth: "calc(100% - 16px)" }}>
          <div className="bg-white/90 backdrop-blur-md p-1.5 md:p-2 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <div className="text-xs md:text-sm font-medium text-[#0b4d43]">
                Favorites ({favoriteRooms.length})
              </div>
              
              {favoriteRooms.length >= 2 && (
                <Button
                  size="sm"
                  className="bg-[#0b4d43] hover:bg-[#0b4d43]/90 text-[10px] md:text-xs h-6 md:h-7 px-2 ml-2"
                  onClick={() => setShowComparison(true)}
                >
                  Compare
                </Button>
              )}
            </div>
            
            <div className="flex gap-1 md:gap-2 overflow-x-auto pb-0.5 md:pb-1">
              {favoriteRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 relative rounded-md overflow-hidden border border-gray-200 cursor-pointer group"
                  onClick={() => {
                    setSelectedRoom(room)
                    setShowRoomModal(true)
                  }}
                >
                  <img
                    src={room.roomImages ? room.roomImages[0] : "/images/placeholder-room.jpg"}
                    alt={`${room.type}-${room.floor}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
                    <div className="absolute bottom-0.5 right-0.5 text-[8px] font-medium bg-white/80 rounded-sm px-1 py-0.5">
                      {room.type}-{room.floor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{
          position: [15, 30, 40],
          fov: 20,
        }}
        dpr={[1, 2]} // Limit pixel ratio to improve performance
        gl={{ 
          antialias: false, // Disable built-in AA for performance
          powerPreference: "high-performance",
          // Removed shadowMapSize as it is not a valid property
        }}
        performance={{ min: 0.5 }} // Allow throttling for smoother experience
      >
        <Suspense fallback={null}> {/* Use Suspense for asynchronous loading */}
          {!isLoading && !showRoomModal && (
            <FloorIndicator currentFloor={currentFloor} totalFloors={totalFloors} onFloorChange={handleFloorChange} />
          )}
          <BuildingModelLoader
            currentFloor={currentFloor}
            onFlatClick={handleFlatClick}
            onLoadingChange={setIsLoading}
            modalOpen={showRoomModal || showComparison}
            quality={isLoading ? "low" : "medium"} // Start with low quality, increase after loaded
          />
          {!isLoading && (
            <>
              <EnhancedLighting isDayMode={isDayMode} />
              <EnhancedEnvironment isDayMode={isDayMode} quality="low" />
            </>
          )}
        </Suspense>
        
        <OrbitControls
          ref={controlsRef}
          target={[0, 7, 0]}
          // Fix polar angle to prevent vertical rotation
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2.5}
          // Disable zooming
          enableZoom={false}
          // Disable panning (repositioning)
          enablePan={false}
          // Keep rotation enabled but you can set this to false to block all camera movement
          enableRotate={true}
          // Keep damping for smooth rotation
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
        
        <Preload all /> {/* Preload critical assets */}
      </Canvas>
      
      {isLoading && <LoadingScreen />} {/* Show loading screen overlay when loading */}

      {/* Room modal */}
      {selectedRoom && (
        <RoomViewerModal
          room={selectedRoom}
          isOpen={showRoomModal}
          onClose={() => setShowRoomModal(false)}
          onToggleFavorite={toggleFavorite}
          favoriteRooms={favoriteRooms}
        />
      )}

      {/* Comparison modal */}
      <ComparisonModal
        rooms={favoriteRooms}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemoveFavorite={(room) => toggleFavorite(room as any as Room)}
        onToggleFavorite={toggleFavorite as any}
      />
    </div>
  )
}
