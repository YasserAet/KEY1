"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, LayoutGrid, Smartphone, ImageIcon, X, ChevronLeft, ChevronRight, Plus, Minus, RotateCcw } from "lucide-react"
import VRTourViewer from "@/components/vr-tour-viewer"
import { Room } from "./data" // Import Room from data.tsx instead of redefining it

interface VRTourViewerProps {
  panoramas: any;
  autoRotate: any;
  height?: string;
  width?: string;
  hotspots?: any[];
  showControls?: boolean;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

interface RoomViewerModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (room: Room) => void;
  favoriteRooms: Room[];
}

// Sample hotspots data
const sampleHotspots = [
  {
    position: [4, 0, -3] as [number, number, number], // [x, y, z] coordinates in 3D space
    targetIndex: 1, // Navigate to panorama index 1
    label: "Next Space",
    panoramaIndex: 0 // This hotspot appears in panorama 0
  },
  {
    position: [-4, 0, 2] as [number, number, number],
    targetIndex: 0, // Navigate back to panorama 0
    label: "Next Space",
    panoramaIndex: 1 // This hotspot appears in panorama 1
  },
  {
    position: [0, 0, -5] as [number, number, number],
    targetIndex: 2,
    label: "Next Space",
    panoramaIndex: 0 // This appears in panorama 0
  }
];

export function RoomViewerModal({ room, isOpen, onClose, onToggleFavorite, favoriteRooms }: RoomViewerModalProps) {
  if (!isOpen || !room) return null

  const isFavorite = favoriteRooms?.some((favRoom) => favRoom.id === room.id)
  const [activeView, setActiveView] = useState<null | '2d' | 'vr' | 'images'>(null) // Removed '3d' option
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)

  useEffect(() => {
    setCurrentImageIndex(0)
    setCurrentPanoramaIndex(0)
  }, [room.id])

  useEffect(() => {
    setImageZoom(1)
  }, [currentImageIndex])

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'reset') {
      setImageZoom(1)
      return
    }

    setImageZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2
      return Math.min(Math.max(newZoom, 0.5), 3)
    })
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-[90%] sm:w-full overflow-hidden transition-all duration-500 
          ${activeView ? 'max-w-[85%] sm:max-w-xl md:max-w-2xl' : 'max-w-[85%] sm:max-w-sm'}
          max-h-[85vh] sm:max-h-[90vh] pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 sm:p-2.5 bg-[#0b4d43] text-white flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">
            Space Informations
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              onClick={() => onToggleFavorite(room)}
              className={`p-1.5 sm:p-2 rounded-full cursor-pointer ${isFavorite ? 'bg-red-500' : 'bg-white/20'}`}
            >
              <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="py-2 px-3 border-b bg-gray-50">
          <div className="flex flex-row items-center justify-center text-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Type</span>
              <p className="text-base sm:text-lg font-bold text-[#0b4d43] mt-1">{room.type}</p>
            </div>
            
            <div className="h-16 sm:h-20 border-l border-gray-300"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Surface</span>
              <p className="text-base sm:text-lg font-bold text-[#0b4d43] mt-1">{room.area || "N/A"}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-1 sm:p-2 md:p-3 flex ${activeView 
          ? 'space-x-1 sm:space-x-2 md:space-x-3 justify-center' 
          : 'flex-wrap gap-0.5 sm:gap-1 md:gap-2 justify-center'}`}>
          
          {/* 2D Plan Button - more compact on mobile */}
          <Button 
            variant={activeView === '2d' ? "default" : "outline"}
            className={`relative items-center text-xs sm:text-sm ${activeView 
              ? 'px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 flex' 
              : 'px-1.5 sm:px-2 py-1 sm:py-1.5 flex'} ${activeView === '2d' 
                ? 'bg-[#0b4d43] text-white' 
                : 'hover:bg-gray-50'}`}
            onClick={() => setActiveView('2d')}
          >
            <div className="flex items-center">
              <LayoutGrid className={`${activeView 
                ? 'h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-1.5 md:mr-2' 
                : 'h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-0.5 sm:mr-1'}`} />
              <span>2D Plan</span>
            </div>
            {activeView === '2d' && <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 left-0 w-full h-0.5 sm:h-1 bg-[#0b4d43]"></div>}
          </Button>

          {/* VR Tour Button - more compact on mobile */}
          <Button 
            variant={activeView === 'vr' ? "default" : "outline"}
            className={`relative items-center text-xs sm:text-sm ${activeView 
              ? 'px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 flex' 
              : 'px-1.5 sm:px-2 py-1 sm:py-1.5 flex'} ${activeView === 'vr' 
                ? 'bg-[#0b4d43] text-white' 
                : 'hover:bg-gray-50'}`}
            onClick={() => setActiveView('vr')}
          >
            <div className="flex items-center">
              <Smartphone className={`${activeView 
                ? 'h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-1.5 md:mr-2' 
                : 'h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-0.5 sm:mr-1'}`} />
              <span>VR Tour</span>
            </div>
            {activeView === 'vr' && <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 left-0 w-full h-0.5 sm:h-1 bg-[#0b4d43]"></div>}
          </Button>

          {/* Images Button - more compact on mobile */}
          <Button 
            variant={activeView === 'images' ? "default" : "outline"}
            className={`relative items-center text-xs sm:text-sm ${activeView 
              ? 'px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 flex' 
              : 'px-1.5 sm:px-2 py-1 sm:py-1.5 flex'} ${activeView === 'images' 
                ? 'bg-[#0b4d43] text-white' 
                : 'hover:bg-gray-50'}`}
            onClick={() => setActiveView('images')}
          >
            <div className="flex items-center">
              <ImageIcon className={`${activeView 
                ? 'h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-1.5 md:mr-2' 
                : 'h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-0.5 sm:mr-1'}`} />
              <span>Images</span>
            </div>
            {activeView === 'images' && <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 left-0 w-full h-0.5 sm:h-1 bg-[#0b4d43]"></div>}
          </Button>
        </div>
        
        {activeView && (
          <div className="border-t px-2 sm:px-3 pt-2 sm:pt-2.5 pb-1.5 sm:pb-2">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <h3 className="text-sm sm:text-base font-medium">
                {activeView === '2d' ? '2D Floor Plan' : 
                 activeView === 'vr' ? '360° Virtual Tour' :
                 'Property Images'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 sm:h-8 sm:w-8 p-0.5"
                onClick={() => setActiveView(null)}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            
            <div 
              className={`bg-gray-50 border rounded-md p-1.5 sm:p-2 ${
                activeView === 'images' 
                  ? 'overflow-auto max-h-[calc(70vh-10rem)] sm:max-h-[calc(80vh-10rem)]' 
                  : 'overflow-hidden h-[calc(75vh-10rem)] sm:h-[calc(85vh-10rem)]'
              }`}
            >
              {/* 2D Plan View with improved vertical centering */}
              {activeView === '2d' && (
                <div className="flex justify-center items-center w-full h-full" style={{ minHeight: "300px" }}>
                  {room.floorPlanImage ? (
                    <div className="flex items-center justify-center h-full w-full">
                      <img 
                        src={room.floorPlanImage} 
                        alt={`Floor plan for ${room.id}`}
                        className="max-w-full max-h-full object-contain rounded-md" 
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400">No 2D floor plan available</p>
                  )}
                </div>
              )}
              
              {/* VR Tour View with improved vertical centering */}
              {activeView === 'vr' && (
                <div className="flex justify-center items-center w-full h-full" style={{ minHeight: "300px" }}>
                  {room.panoramas && room.panoramas.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <VRTourViewer 
                        panoramas={room.panoramas} 
                        autoRotate={false}
                        currentIndex={currentPanoramaIndex}
                        onIndexChange={setCurrentPanoramaIndex}
                        hotspots={sampleHotspots}
                        showControls={true}
                        height="100%"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">
                      No 360° panoramas available
                    </p>
                  )}
                </div>
              )}
              
              {activeView === 'images' && (
                <div className="p-1 flex items-center justify-center">
                  {room.roomImages && room.roomImages.length > 0 ? (
                    <div className="relative flex justify-center">
                      <div 
                        className="relative overflow-auto rounded-md"
                        style={{ 
                          transform: `scale(${imageZoom})`, 
                          transformOrigin: 'center', 
                          transition: 'transform 0.2s ease' 
                        }}
                      >
                        <img 
                          src={room.roomImages[currentImageIndex]} 
                          alt={`${room.id} image ${currentImageIndex + 1}`}
                          className="max-w-full object-contain" 
                          style={{ maxHeight: 'calc(55vh - 10rem)' }} // Add specific height constraint
                        />
                      </div>
                      
                      {/* Add zoom controls */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => handleZoom('in')}
                          className="bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors"
                          aria-label="Zoom in"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleZoom('out')}
                          className="bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors"
                          aria-label="Zoom out"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleZoom('reset')}
                          className="bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors"
                          aria-label="Reset zoom"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Navigation arrows */}
                      {room.roomImages.length > 1 && (
                        <>
                          {/* Left arrow */}
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === 0 ? (room.roomImages?.length ?? 0) - 1 : prev - 1
                            )}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          
                          {/* Right arrow */}
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === (room.roomImages?.length ?? 0) - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          
                          {/* Image counter */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/30 text-white rounded-full text-xs">
                            {currentImageIndex + 1} / {room.roomImages.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">No images available for this property</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
