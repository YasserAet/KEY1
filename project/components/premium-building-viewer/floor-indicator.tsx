"use client"

import { ChevronUp, ChevronDown, Layers } from "lucide-react"
import { FLOORS } from "./data"

interface FloorIndicatorProps {
  currentFloor: number;
  totalFloors: number;
  onFloorChange: (floor: number) => void;
}

export function FloorIndicator({ currentFloor, totalFloors, onFloorChange }: FloorIndicatorProps) {
  const validFloorLevels = FLOORS.map((f) => f.level)
  const currentIndex = currentFloor === -1 ? -1 : validFloorLevels.indexOf(currentFloor)
  const nextFloor = currentIndex < validFloorLevels.length - 1 ? validFloorLevels[currentIndex + 1] : currentFloor
  const prevFloor = currentIndex > 0 ? validFloorLevels[currentIndex - 1] : validFloorLevels[0]

  return (
    <div className="hidden md:flex flex-col items-center py-3 px-2 backdrop-blur-md bg-[#0b4d43]/10 border border-[#0b4d43]/30 rounded-lg shadow-lg w-[80px]">
      {/* Up button */}
      <button
        className="bg-[#0b4d43]/10 backdrop-blur-md border border-[#0b4d43]/30 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0b4d43]/20 disabled:opacity-30 transition-all mb-2"
        onClick={() => onFloorChange(nextFloor)}
        disabled={currentIndex === validFloorLevels.length - 1}
      >
        <ChevronUp className="h-4 w-4 text-[#0b4d43]" />
      </button>

      {/* Floor display */}
      <div className="flex flex-col items-center my-1">
        <div className="font-bold text-2xl text-[#0b4d43] drop-shadow-sm">
          {currentFloor === -1 ? "ALL" : currentFloor}
        </div>
        <div className="text-[#0b4d43]/80 text-[10px] tracking-wider">
          {currentFloor === -1 ? "FLOORS" : FLOORS.find((f) => f.level === currentFloor)?.name?.split(" ")[0] || ""}
        </div>
      </div>

      {/* All floors button */}
      {currentFloor !== -1 && (
        <button
          className="bg-[#0b4d43]/10 backdrop-blur-md border border-[#0b4d43]/30 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0b4d43]/20 transition-all my-2"
          onClick={() => onFloorChange(-1)}
        >
          <Layers className="h-3 w-3 text-[#0b4d43]" />
        </button>
      )}

      {/* Down button */}
      <button
        className="bg-[#0b4d43]/10 backdrop-blur-md border border-[#0b4d43]/30 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0b4d43]/20 disabled:opacity-30 transition-all mt-2"
        onClick={() => onFloorChange(prevFloor)}
        disabled={currentIndex === 0}
      >
        <ChevronDown className="h-4 w-4 text-[#0b4d43]" />
      </button>
    </div>
  )
}
