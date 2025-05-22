"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Heart, LayoutGrid, Smartphone, ImageIcon, X, ChevronLeft, ChevronRight, Plus, Minus, RotateCcw, Maximize, Minimize } from "lucide-react"
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
  loadingModelName?: string; // Add this
  isLoading?: boolean; // Add this
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

export function RoomViewerModal({ 
  room, 
  isOpen, 
  onClose, 
  onToggleFavorite, 
  favoriteRooms,
  loadingModelName = '',
  isLoading = false
}: RoomViewerModalProps) {
  if (!isOpen || !room) return null

  const isFavorite = favoriteRooms?.some((favRoom) => favRoom.id === room.id)
  const [activeView, setActiveView] = useState<null | '2d' | 'vr' | 'images'>(null) // Removed '3d' option
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContentRef = useRef<HTMLDivElement>(null);

  // New state to track floor plan image dimensions
  const [floorPlanDimensions, setFloorPlanDimensions] = useState({ width: 0, height: 0 });
  const [containerHeight, setContainerHeight] = useState("auto");
  const floorPlanContainerRef = useRef<HTMLDivElement>(null);

  // Add these state variables
  const [isModelLoading, setIsModelLoading] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(0)
    setCurrentPanoramaIndex(0)
  }, [room.id])

  useEffect(() => {
    setImageZoom(1)
  }, [currentImageIndex])

  // Handle image load to get actual dimensions
  const handleFloorPlanLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setFloorPlanDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    
    // Calculate optimal container size based on image aspect ratio
    updateContainerSize(img.naturalWidth, img.naturalHeight);
  };
  
  // Update container size when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (floorPlanDimensions.width > 0 && floorPlanDimensions.height > 0) {
        updateContainerSize(floorPlanDimensions.width, floorPlanDimensions.height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [floorPlanDimensions]);
  
  // Calculate optimal container size based on image dimensions and available space
  const updateContainerSize = (imgWidth: number, imgHeight: number) => {
    if (!floorPlanContainerRef.current) return;
    
    const containerWidth = floorPlanContainerRef.current.clientWidth;
    const availableHeight = window.innerHeight * 0.6; // 60% of viewport height as max
    
    // Calculate proper height while maintaining aspect ratio
    const aspectRatio = imgWidth / imgHeight;
    let optimalHeight;
    
    // For wide images
    if (aspectRatio > 1.5) {
      optimalHeight = Math.min(containerWidth / aspectRatio, availableHeight);
    } 
    // For square or tall images
    else {
      optimalHeight = Math.min(imgHeight, availableHeight);
      // Ensure minimum height for visibility
      optimalHeight = Math.max(optimalHeight, 300);
    }
    
    setContainerHeight(`${Math.floor(optimalHeight)}px`);
  };

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

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  }

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      onClick={onClose}>
      
      {/* Fullscreen overlay when active */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black z-[10000] flex items-center justify-center pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={fullscreenContentRef}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Fullscreen 2D Plan content */}
            {activeView === '2d' && room.floorPlanImage && (
              <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
                <img 
                  src={room.floorPlanImage} 
                  alt={`Floor plan for ${room.id}`}
                  className="max-w-full max-h-full object-contain" 
                  style={{ 
                    maxHeight: "90vh",
                    maxWidth: "90vw" 
                  }}
                />
              </div>
            )}
            
            {/* Fullscreen images content */}
            {activeView === 'images' && room.roomImages && room.roomImages.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
                <div 
                  style={{ 
                    transform: `scale(${imageZoom})`, 
                    transformOrigin: 'center', 
                    transition: 'transform 0.2s ease' 
                  }}
                >
                  <img 
                    src={room.roomImages[currentImageIndex]} 
                    alt={`${room.id} image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain" 
                    style={{ 
                      maxHeight: "90vh",
                      maxWidth: "90vw" 
                    }}
                  />
                </div>
                
                {/* Zoom controls in fullscreen */}
                <div className="absolute top-4 right-4 flex gap-1 z-10">
                  <button
                    onClick={() => handleZoom('in')}
                    className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleZoom('out')}
                    className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleZoom('reset')}
                    className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Navigation arrows in fullscreen */}
                {room.roomImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? (room.roomImages?.length ?? 0) - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === (room.roomImages?.length ?? 0) - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white rounded-full text-xs">
                      {currentImageIndex + 1} / {room.roomImages.length}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Exit fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors z-10"
            >
              <Minimize className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Regular modal content - when not fullscreen */}
      <div 
        className={`bg-white rounded-lg shadow-xl w-[85%] sm:w-full overflow-hidden transition-all duration-500 
          ${activeView ? 'max-w-[80%] sm:max-w-md md:max-w-lg' : 'max-w-[80%] sm:max-w-xs'}
          max-h-[80vh] sm:max-h-[85vh] pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - smaller padding */}
        <div className="p-1.5 sm:p-2 bg-[#0b4d43] text-white flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
            Space Informations
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div 
              onClick={() => onToggleFavorite(room)}
              className={`p-1 sm:p-1.5 rounded-full cursor-pointer ${isFavorite ? 'bg-red-500' : 'bg-white/20'}`}
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
            </div>
            
            <button 
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Room details - smaller heights and padding */}
        <div className="py-1.5 px-2 border-b bg-gray-50">
          <div className="flex flex-row items-center justify-center text-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Type</span>
              <p className="text-sm sm:text-base font-bold text-[#0b4d43] mt-0.5">{room.type}</p>
            </div>
            
            <div className="h-12 sm:h-16 border-l border-gray-300"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Surface</span>
              <p className="text-sm sm:text-base font-bold text-[#0b4d43] mt-0.5">{room.area || "N/A"}</p>
            </div>
          </div>
        </div>
        
        {/* View selection buttons - reduced padding */}
        <div className={`p-1 flex ${activeView 
          ? 'space-x-1 justify-center' 
          : 'flex-wrap gap-0.5 justify-center'}`}>
          
          {/* 2D Plan Button - smaller */}
          <Button 
            variant={activeView === '2d' ? "default" : "outline"}
            className={`relative items-center text-xs ${activeView 
              ? 'px-1.5 sm:px-2 py-0.5 sm:py-1 flex' 
              : 'px-1 sm:px-1.5 py-0.5 sm:py-1 flex'} ${activeView === '2d' 
                ? 'bg-[#0b4d43] text-white' 
                : 'hover:bg-gray-50'}`}
            onClick={() => setActiveView('2d')}
          >
            <div className="flex items-center">
              <LayoutGrid className={`${activeView 
                ? 'h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1' 
                : 'h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5'}`} />
              <span>2D Plan</span>
            </div>
            {activeView === '2d' && <div className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-0.5 bg-[#0b4d43]"></div>}
          </Button>

          {/* VR Tour Button - smaller */}
          <Button 
            variant={activeView === 'vr' ? "default" : "outline"}
            className={`relative items-center text-xs ${activeView 
              ? 'px-1.5 sm:px-2 py-0.5 sm:py-1 flex' 
              : 'px-1 sm:px-1.5 py-0.5 sm:py-1 flex'} ${activeView === 'vr' 
                ? 'bg-[#0b4d43] text-white' 
                : 'hover:bg-gray-50'}`}
            onClick={() => setActiveView('vr')}
          >
            <div className="flex items-center">
              <Smartphone className={`${activeView 
                ? 'h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1' 
                : 'h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5'}`} />
              <span>VR Tour</span>
            </div>
            {activeView === 'vr' && <div className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-0.5 bg-[#0b4d43]"></div>}
          </Button>

          {/* Images Button - smaller */}
          <Button 
            variant={activeView === 'images' ? "default" : "outline"}
            className={`relative items-center text-xs ${activeView 
              ? 'px-1.5 sm:px-2 py-0.5 sm:py-1 flex' 
              : 'px-1 sm:px-1.5 py-0.5 sm:py-1 flex'} ${activeView === 'images' 
                ? 'bg-[#0b4d43] text-white' 
                : 'hover:bg-gray-50'}`}
            onClick={() => setActiveView('images')}
          >
            <div className="flex items-center">
              <ImageIcon className={`${activeView 
                ? 'h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1' 
                : 'h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5'}`} />
              <span>Images</span>
            </div>
            {activeView === 'images' && <div className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-0.5 bg-[#0b4d43]"></div>}
          </Button>
        </div>
        
        {/* Loading indicator - new addition */}
        {isLoading && loadingModelName && (
          <div className="mx-2 my-1 p-1.5 bg-[#0b4d43]/5 border border-[#0b4d43]/20 rounded flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full border-2 border-[#0b4d43] border-t-transparent animate-spin"></div>
            <span className="text-xs text-[#0b4d43]">
              Loading {loadingModelName}...
            </span>
          </div>
        )}
        
        {activeView && (
          <div className="border-t px-1.5 sm:px-2 pt-1.5 sm:pt-2 pb-1 sm:pb-1.5">
            <div className="flex justify-between items-center mb-1 sm:mb-1.5">
              <h3 className="text-xs sm:text-sm font-medium">
                {activeView === '2d' ? '2D Floor Plan' : 
                 activeView === 'vr' ? '360° Virtual Tour' :
                 'Property Images'}
              </h3>
              <div className="flex gap-1">
                {/* Fullscreen button - only for 2D and images */}
                {(activeView === '2d' || activeView === 'images') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0.5"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0.5"
                  onClick={() => setActiveView(null)}
                >
                  <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* Content area */}
            <div 
              className={`bg-gray-50 border rounded-md p-1 sm:p-1.5 ${
                activeView === 'images' 
                  ? 'overflow-auto max-h-[calc(60vh-9rem)] sm:max-h-[calc(70vh-9rem)]' 
                  : 'overflow-hidden h-[calc(60vh-9rem)] sm:h-[calc(70vh-9rem)]'
              }`}
            >
              {/* 2D Plan View */}
              {activeView === '2d' && !isFullscreen && (
                <div 
                  ref={floorPlanContainerRef}
                  className="flex justify-center items-center w-full h-full overflow-auto"
                  style={{ 
                    minHeight: "250px", 
                    height: containerHeight,
                    maxHeight: "calc(60vh - 10rem)"
                  }}
                >
                  {room.floorPlanImage ? (
                    <div className="relative flex items-center justify-center h-full w-full">
                      <img 
                        src={room.floorPlanImage} 
                        alt={`Floor plan for ${room.id}`}
                        className="max-w-full max-h-full object-contain rounded-md" 
                        onLoad={handleFloorPlanLoad}
                        style={{ 
                          maxHeight: "100%", 
                          objectFit: "contain",
                          objectPosition: "center"
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No 2D floor plan available</p>
                  )}
                </div>
              )}
              
              {/* VR Tour View - reduced height */}
              {activeView === 'vr' && !isFullscreen && (
                <div className="flex justify-center items-center w-full h-full" style={{ minHeight: "250px" }}>
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
                    <p className="text-xs text-gray-400 text-center">
                      No 360° panoramas available
                    </p>
                  )}
                </div>
              )}
              
              {/* Images View - reduced height and smaller controls */}
              {activeView === 'images' && !isFullscreen && (
                <div className="p-0.5 flex items-center justify-center">
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
                          style={{ maxHeight: 'calc(45vh - 9rem)' }} // Reduced height
                        />
                      </div>
                      
                      {/* Zoom controls - smaller */}
                      <div className="absolute top-1 right-1 flex gap-0.5">
                        <button
                          onClick={() => handleZoom('in')}
                          className="bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-colors"
                          aria-label="Zoom in"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleZoom('out')}
                          className="bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-colors"
                          aria-label="Zoom out"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleZoom('reset')}
                          className="bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-colors"
                          aria-label="Reset zoom"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Navigation arrows - smaller */}
                      {room.roomImages.length > 1 && (
                        <>
                          {/* Left arrow */}
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === 0 ? (room.roomImages?.length ?? 0) - 1 : prev - 1
                            )}
                            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-colors"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          
                          {/* Right arrow */}
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === (room.roomImages?.length ?? 0) - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-colors"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          
                          {/* Image counter - smaller */}
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/30 text-white rounded-full text-[10px]">
                            {currentImageIndex + 1} / {room.roomImages.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">No images available for this property</p>
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
