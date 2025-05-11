"use client"

import { Html } from "@react-three/drei"
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
  const currentFloorName =
    currentFloor === -1 ? "ALL" : FLOORS.find((f) => f.level === currentFloor)?.name || `FLOOR ${currentFloor}`

  return (
    <Html
      position={[-12, 0, 0]}
      className="pointer-events-auto"
      distanceFactor={10}
      occlude={false}
      zIndexRange={[1, 50]}
    >
      <div className="hidden md:block p-8 w-64 md:w-80 backdrop-blur-sm rounded-xl">
        <div className="flex flex-col items-center">
          {/* Large floor number - now green */}
          <div className="font-bold text-7xl md:text-9xl text-[#0b4d43] drop-shadow-lg">
            {currentFloor === -1 ? "ALL" : currentFloor}
          </div>

          {/* Floor name - now green */}
          <div className="text-[#0b4d43]/80 text-lg md:text-xl mt-2 tracking-wider">
            {currentFloor === -1 ? "FLOORS" : FLOORS.find((f) => f.level === currentFloor)?.name.split(" ")[0] || ""}
          </div>

          {/* Navigation controls - now with green styling */}
          <div className="flex mt-8 gap-6">
            <button
              className="bg-[#0b4d43]/10 backdrop-blur-md border border-[#0b4d43]/30 w-16 h-16 rounded-full flex items-center justify-center hover:bg-[#0b4d43]/20 disabled:opacity-30 transition-all"
              onClick={() => onFloorChange(nextFloor)}
              disabled={currentIndex === validFloorLevels.length - 1}
            >
              <ChevronUp className="h-8 w-8 text-[#0b4d43]" />
            </button>

            {currentFloor !== -1 && (
              <button
                className="bg-[#0b4d43]/10 backdrop-blur-md border border-[#0b4d43]/30 w-16 h-16 rounded-full flex items-center justify-center hover:bg-[#0b4d43]/20 transition-all"
                onClick={() => onFloorChange(-1)}
              >
                <Layers className="h-7 w-7 text-[#0b4d43]" />
              </button>
            )}

            <button
              className="bg-[#0b4d43]/10 backdrop-blur-md border border-[#0b4d43]/30 w-16 h-16 rounded-full flex items-center justify-center hover:bg-[#0b4d43]/20 disabled:opacity-30 transition-all"
              onClick={() => onFloorChange(prevFloor)}
              disabled={currentIndex === 0}
            >
              <ChevronDown className="h-8 w-8 text-[#0b4d43]" />
            </button>
          </div>
        </div>
      </div>
    </Html>
  )
}
