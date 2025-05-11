"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import jsPDF from 'jspdf'

interface Room {
  id: string
  type: string
  area?: string
  floor?: number
  roomImages?: string[]
  floorPlanImage?: string
}

interface ComparisonModalProps {
  rooms: Room[]
  isOpen: boolean
  onClose: () => void
  onRemoveFavorite: (room: Room) => void
  onToggleFavorite: (room: Room) => void;
}

export function ComparisonModal({ rooms, isOpen, onClose, onRemoveFavorite }: ComparisonModalProps) {
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && rooms.length >= 2) {
      if (rooms.length === 2) {
        setSelectedRooms(rooms)
      } else {
        setSelectedRooms([rooms[0], rooms[1]])
      }
    } else {
      setSelectedRooms([])
    }
  }, [isOpen, rooms])

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const property1DisplayName = `${selectedRooms[0].type}-${selectedRooms[0].floor}`;
      const property2DisplayName = `${selectedRooms[1].type}-${selectedRooms[1].floor}`;
      
      doc.setFontSize(22);
      doc.setTextColor(11, 77, 67);
      doc.text('Property Comparison', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 35, 275, 35);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Property 1: ${property1DisplayName}`, 20, 45);
      doc.setFontSize(12);
      doc.text(`Floor: ${selectedRooms[0].floor}`, 20, 52);
      doc.text(`Total Area: ${selectedRooms[0].area || 'N/A'}`, 20, 59);
      
      doc.setFontSize(16);
      doc.text(`Property 2: ${property2DisplayName}`, 160, 45);
      doc.setFontSize(12);
      doc.text(`Floor: ${selectedRooms[1].floor}`, 160, 52);
      doc.text(`Total Area: ${selectedRooms[1].area || 'N/A'}`, 160, 59);
      
      const loadImage = (url: string) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };
      
      try {
        if (selectedRooms[0].floorPlanImage) {
          const img1 = await loadImage(selectedRooms[0].floorPlanImage);
          
          const maxWidth = 100;
          const maxHeight = 70;
          
          const imgRatio = (img1 as HTMLImageElement).width / (img1 as HTMLImageElement).height;
          
          let width = maxWidth;
          let height = width / imgRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * imgRatio;
          }
          
          const xPos = 20 + (maxWidth - width) / 2;
          const yPos = 70 + (maxHeight - height) / 2;
          
          doc.addImage(img1 as HTMLImageElement, 'JPEG', xPos, yPos, width, height);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('Floor plan not available', 60, 110);
        }
        
        if (selectedRooms[1].floorPlanImage) {
          const img2 = await loadImage(selectedRooms[1].floorPlanImage) as HTMLImageElement;
          
          const maxWidth = 100;
          const maxHeight = 70;
          
          const imgRatio = (img2 as HTMLImageElement).width / (img2 as HTMLImageElement).height;
          
          let width = maxWidth;
          let height = width / imgRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * imgRatio;
          }
          
          const xPos = 160 + (maxWidth - width) / 2;
          const yPos = 70 + (maxHeight - height) / 2;
          
          doc.addImage(img2, 'JPEG', xPos, yPos, width, height);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('Floor plan not available', 200, 110);
        }
      } catch (error) {
        console.error("Error loading images:", error);
        doc.setTextColor(255, 0, 0);
        doc.text('Error loading floor plan images', 20, 180);
      }
      
      doc.save(`property-comparison-${property1DisplayName}-${property2DisplayName}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsPdfGenerating(false);
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  if (!isOpen || !selectedRooms || selectedRooms.length !== 2) return null

  const handleRemoveRoom = (room: Room) => {
    onRemoveFavorite(room)
    if (selectedRooms.some((r) => r.id === room.id)) {
      onClose()
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto md:overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[90%] md:max-w-6xl h-auto md:h-[90vh] max-h-[80vh] md:max-h-[900px] overflow-hidden flex flex-col my-2 md:my-0">
          <div className="p-3 md:p-5 border-b flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-lg md:text-xl font-medium text-[#0b4d43]">Property Comparison</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">Comparing {selectedRooms.length} properties</p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
              aria-label="Close comparison"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {rooms.length > 2 && (
            <div className="p-3 md:p-4 bg-gray-50 border-b">
              <div className="text-xs md:text-sm font-medium mb-1 md:mb-2">Select properties:</div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {rooms.map((room) => (
                  <button
                    key={`select-${room.id}`}
                    className={`px-2 py-1 md:px-3 md:py-1.5 text-xs rounded-full transition-colors ${
                      selectedRooms.some((r) => r.id === room.id)
                        ? "bg-[#0b4d43] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => {
                      if (selectedRooms.some((r) => r.id === room.id)) {
                        setSelectedRooms(selectedRooms.filter((r) => r.id !== room.id))
                      } else if (selectedRooms.length < 2) {
                        setSelectedRooms([...selectedRooms, room])
                      } else {
                        setSelectedRooms([selectedRooms[0], room])
                      }
                    }}
                  >
                    {room.type}-{room.floor}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 bg-white border-b flex md:flex-row flex-col">
              <div className="w-full md:w-48 flex-shrink-0 bg-gray-50 p-2 md:p-0"></div>
              {selectedRooms.map((room, index) => (
                <div key={`header-${index}`} className="flex-1 p-2 md:p-4 text-center border-t md:border-t-0 md:border-l relative group">
                  <div className="font-medium text-[#0b4d43]">{room.type}</div>
                  <button
                    className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                    onClick={() => handleRemoveRoom(room)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="md:hidden">
              {selectedRooms.map((room, roomIndex) => (
                <div key={`mobile-room-${roomIndex}`} className="border-b p-2">
                  <div className="font-medium text-[#0b4d43] mb-1 text-sm">{room.type}</div>
                  
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">Floor Plan</div>
                    <div 
                      className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative h-28"
                      onClick={() => setZoomedImage(room.floorPlanImage || "/images/placeholder-plan.jpg")}
                    >
                      <img
                        src={room.floorPlanImage || "/images/placeholder-plan.jpg"}
                        alt={`${room.type} Floor Plan`}
                        className="w-full h-full object-contain cursor-zoom-in"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder-plan.jpg"
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1">
                        <ZoomIn className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-gray-700 font-medium">Floor:</span> {room.floor}
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Type:</span> {room.type}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-700 font-medium">Total Area:</span> {room.area || "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 p-4 bg-gray-50 flex items-center">
                  <span className="font-medium text-gray-700">Floor Plan</span>
                </div>
                {selectedRooms.map((room, index) => (
                  <div key={`plan-${index}`} className="flex-1 p-4 border-l">
                    <div 
                      className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative cursor-zoom-in"
                      onClick={() => setZoomedImage(room.floorPlanImage || "/images/placeholder-plan.jpg")}
                    >
                      <img
                        src={room.floorPlanImage || "/images/placeholder-plan.jpg"}
                        alt={`${room.type} Floor Plan`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder-plan.jpg"
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
                        <ZoomIn className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 p-4 bg-gray-50 flex items-center">
                  <span className="font-medium text-gray-700">Floor</span>
                </div>
                {selectedRooms.map((room, index) => (
                  <div key={`floor-${index}`} className="flex-1 p-4 border-l flex items-center">
                    <span>{room.floor}</span>
                  </div>
                ))}
              </div>

              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 p-4 bg-gray-50 flex items-center">
                  <span className="font-medium text-gray-700">Total Area</span>
                </div>
                {selectedRooms.map((room, index) => (
                  <div key={`area-${index}`} className="flex-1 p-4 border-l flex items-center">
                    <span>{room.area || "N/A"}</span>
                  </div>
                ))}
              </div>

              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 p-4 bg-gray-50 flex items-center">
                  <span className="font-medium text-gray-700">Type</span>
                </div>
                {selectedRooms.map((room, index) => (
                  <div key={`type-${index}`} className="flex-1 p-4 border-l flex items-center">
                    <span>{room.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 border-t bg-gray-50 flex justify-end gap-2 md:gap-3">
            <Button variant="outline" onClick={onClose} className="text-xs md:text-sm px-2 md:px-4">
              Close
            </Button>
            <Button
              className="bg-[#0b4d43] hover:bg-[#0b4d43]/90 flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
            >
              {isPdfGenerating ? "Generating..." : "Download Comparison"}
            </Button>
          </div>
        </div>
      </div>

      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center"
          onClick={() => {
            setZoomedImage(null);
            setZoomLevel(1);
          }}
        >
          <div 
            className="max-w-[95vw] max-h-[95vh] overflow-auto" 
            ref={imageRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={zoomedImage}
                alt="Zoomed floor plan"
                className="transform transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder-plan.jpg"
                }}
              />
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800"
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleResetZoom();
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800"
              disabled={zoomLevel >= 4}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
          
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            onClick={() => {
              setZoomedImage(null);
              setZoomLevel(1);
            }}
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  )
}
