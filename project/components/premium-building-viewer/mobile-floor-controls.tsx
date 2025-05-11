"use client"

import { ChevronUp, ChevronDown, Layers } from "lucide-react"
import { FLOORS } from "./data"

interface MobileFloorControlsProps {
  currentFloor: number;
  totalFloors: number;
  onFloorChange: (floor: number) => void;
}

export function MobileFloorControls({ currentFloor, totalFloors, onFloorChange }: MobileFloorControlsProps) {
  const validFloorLevels = FLOORS.map((f) => f.level)
  const currentIndex = currentFloor === -1 ? -1 : validFloorLevels.indexOf(currentFloor)
  const nextFloor = currentIndex < validFloorLevels.length - 1 ? validFloorLevels[currentIndex + 1] : currentFloor
  const prevFloor = currentIndex > 0 ? validFloorLevels[currentIndex - 1] : validFloorLevels[0]

  const currentFloorName =
    currentFloor === -1 ? "All Floors" : FLOORS.find((f) => f.level === currentFloor)?.name || `Floor ${currentFloor}`

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center md:hidden z-30">
      <div className="w-full max-w-[240px] bg-white/90 backdrop-blur-md shadow-xl rounded-full overflow-hidden border border-white/30">
        <div className="py-2 px-3 flex items-center justify-between">
          <button
            className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:hover:bg-gray-100"
            onClick={() => onFloorChange(prevFloor)}
            disabled={currentIndex === 0}
          >
            <ChevronDown className="h-4 w-4 text-[#0b4d43]" />
          </button>

          <div 
            className="flex flex-col items-center justify-center px-2"
            onClick={() => onFloorChange(-1)}
          >
            <div className="text-[#0b4d43] font-semibold text-sm flex items-center gap-1">
              {currentFloor === -1 ? (
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> All Floors
                </span>
              ) : (
                currentFloorName
              )}
            </div>
            {currentFloor !== -1 && (
              <div className="text-[10px] text-gray-500 font-medium flex gap-0.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0b4d43]/60 mr-0.5"></div>
                Floor {currentFloor}/{totalFloors - 1}
              </div>
            )}
          </div>

          <button
            className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:hover:bg-gray-100"
            onClick={() => onFloorChange(nextFloor)}
            disabled={currentIndex === validFloorLevels.length - 1}
          >
            <ChevronUp className="h-4 w-4 text-[#0b4d43]" />
          </button>
        </div>
      </div>
      
      {/* Floor All shortcut button - only visible when not on All Floors */}
      {currentFloor !== -1 && (
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(100%+6px)]">
          <button
            onClick={() => onFloorChange(-1)}
            className="bg-[#0b4d43]/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md hover:bg-[#0b4d43] transition-colors"
          >
            <Layers className="h-3 w-3" />
            <span>View All</span>
          </button>
        </div>
      )}
    </div>
  );
}
