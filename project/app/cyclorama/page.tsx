"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useTexture, Html, Environment, Text } from "@react-three/drei"
import { Suspense } from "react"
import { Building, MapPin, Clock, Layers, X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import { Vector3, Spherical, MathUtils, Color } from "three"
import { useSpring, config } from "@react-spring/three"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SpotLight, CatmullRomCurve3 } from "three"
import { useThree } from "@react-three/fiber"
import Loading from "../loading"; // Add this import at the top

// Helper to normalize names for matching - move outside, not a hook
function normalize(str: string | undefined | null) {
  return str?.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
}

// Sample data for landmarks and pins
const landmarksData = {
  landmarks: [
    {
      nameArabic: "شارع مسقط السريع",
      nameEnglish: "Muscat Expressway",
      duration: "2 دقيقة",
      durationInMinutes: 2,
      category: "infrastructure",
    },
    {
      nameArabic: "عمان مول",
      nameEnglish: "Oman Mall",
      duration: "4 دقائق",
      durationInMinutes: 4,
      category: "shopping",
    },
    {
      nameArabic: "مجمع السلطان قابوس الرياضي",
      nameEnglish: "Sultan Qaboos Sports Complex",
      duration: "6 دقائق",
      durationInMinutes: 6,
      category: "leisure",
    },
    {
      nameArabic: "جامع محمد الأمين",
      nameEnglish: "Mohammed Al-Amin Mosque",
      duration: "7 دقائق",
      durationInMinutes: 7,
      category: "masjid",
    },
    {
      nameArabic: "شارع السلطان قابوس",
      nameEnglish: "Sultan Qaboos Street",
      duration: "7 دقائق",
      durationInMinutes: 7,
      category: "infrastructure",
    },
    {
      nameArabic: "المستشفى السلطاني",
      nameEnglish: "Sultan Hospital",
      duration: "8 دقائق",
      durationInMinutes: 8,
      category: "healthcare",
    },
    {
      nameArabic: "كلية مسقط",
      nameEnglish: "Muscat College",
      duration: "حوالي 2 دقيقة",
      durationInMinutes: 2,
      category: "education",
    },
    {
      nameArabic: "الجامعة الوطنية للتكنولوجيا والعلوم",
      nameEnglish: "National University of Technology and Science",
      duration: "حوالي 2 دقيقة",
      durationInMinutes: 2,
      category: "education",
    },
    {
      nameArabic: "الكلية الحديثة للتجارة والعلوم",
      nameEnglish: "Modern College of Commerce and Science",
      duration: "حوالي 2 دقيقة",
      durationInMinutes: 2,
      category: "education",
    },
    {
      nameArabic: "كلية الدراسات المصرفية",
      nameEnglish: "College of Banking Studies",
      duration: "حوالي 2 دقيقة",
      durationInMinutes: 2,
      category: "education",
    },
    {
      nameArabic: "مستشفى مسقط الخاص",
      nameEnglish: "Muscat Private Hospital",
      duration: "2 دقيقة",
      durationInMinutes: 2,
      category: "healthcare",
    },
    {
      nameArabic: "بنك عمان العربي",
      nameEnglish: "Arab Bank Oman",
      duration: "2 دقيقة",
      durationInMinutes: 2,
      category: "finance",
    },
    {
      nameArabic: "بنك ظفار",
      nameEnglish: "Dhofar Bank",
      duration: "2 دقيقة",
      durationInMinutes: 2,
      category: "finance",
    },
    {
      nameArabic: "hhhh",
      nameEnglish: "Al Muhana bin Sultan School",
      duration: "2 دقيقة",
      durationInMinutes: 2,
      category: "finance",
    }
  ]
}

const pinsData = {
  "KEY 1 BUILDING": {
    yaw: 100,
    pitch: -24,
  },
  OCEAN: {
    yaw: 130,
    pitch: 5,
  },
  "Mohammed Al Ameen Mosque": {
    yaw: 150,
    pitch: 2,
  },
  "OMAN MALL": {
    yaw: 105,
    pitch: -1,
  },
  "Al Muhana bin Sultan School": {
    yaw: 49,
    pitch: -51,
  },
  "Bank Muscat Bousher": {
    yaw: 34,
    pitch: -15,
  },
  "Modern College of Business and Science": {
    yaw: 327,
    pitch: -14,
  },
  "College Of Banking And Finance Services": {
    yaw: 355,
    pitch: -8,
  },
  "ABQ Al Imtiaz Private School": {
    yaw: 365,
    pitch: -12,
  },
  "Nasser bin Khalfan Al-Busaidi mosque": {
    yaw: 363,
    pitch: -3,
  },
  "Al Salam Hall": {
    yaw: 355,
    pitch: -2,
  },
  "Muscat Private Hospital": {
    yaw: -25,
    pitch: -1,
  },
}

// Main Cyclorama Page component
export default function CycloramaPage() {
  // Add this new state to track which element is active
  const [activeElement, setActiveElement] = useState<"none" | "categories" | "landmarks">("none");

  const [activePin, setActivePin] = useState("KEY 1 BUILDING")
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const cameraRef = useRef<THREE.Camera | null>(null)

  // Add these new state variables near your other state declarations
  const [targetYaw, setTargetYaw] = useState<number | null>(null)
  const [targetPitch, setTargetPitch] = useState<number | null>(null)

  // ✅ Move useMemo hooks INSIDE the component function
  // Build a lookup for landmarks by normalized English name
  const landmarkLookup = useMemo(() => {
    const lookup: { [key: string]: typeof landmarksData.landmarks[number] } = {};
    for (const lm of landmarksData.landmarks) {
      const normalizedName = normalize(lm.nameEnglish);
      if (normalizedName) {
        lookup[normalizedName] = lm;
      }
    }
    return lookup;
  }, []);

  // Build hotspots with correct landmark info
  const hotspots = useMemo(() => {
    return Object.entries(pinsData).map(([title, coordinates], index) => {
      const normTitle = normalize(title);
      const landmark = normTitle ? landmarkLookup[normTitle] : undefined;

      // Fallbacks for category and description
      let category = "default";
      if (landmark) category = landmark.category;
      else if (title === "KEY 1 BUILDING") category = "infrastructure";
      else if (title.toLowerCase().includes("mosque") || title.toLowerCase().includes("masjid")) category = "masjid";
      else if (title.toLowerCase().includes("mall") || title.toLowerCase().includes("shop")) category = "shopping";
      else if (title.toLowerCase().includes("hospital")) category = "healthcare";
      else if (title.toLowerCase().includes("school") || title.toLowerCase().includes("college")) category = "education";
      else if (title.toLowerCase().includes("bank")) category = "finance";

      return {
        id: `pin-${index}`,
        title,
        yaw: coordinates.yaw ?? (index * 30) % 360,
        pitch: coordinates.pitch ?? 0,
        category,
        durationInMinutes: landmark?.durationInMinutes ?? null,
        description: landmark?.duration ?? "A nearby landmark.",
      };
    });
  }, [landmarkLookup]);

  // Find the active landmark info for the info card and dropdown
  const activeHotspot = hotspots.find(h => h.title === activePin) || ({} as typeof hotspots[number]);

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle pin click
  const handlePinClick = (pinName: string) => {
    setActivePin(pinName)

    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  // Update the handleLandmarkSelect function - remove direction indicators
  const handleLandmarkSelect = (value: string) => {
    setActivePin(value)
    setActiveElement("landmarks")
    setSidebarOpen(false)

    // Find the selected landmark, but don't show directions
    const landmark = pinsData[value as keyof typeof pinsData]
    if (landmark) {
      // We can store the coordinates, but won't show directions
      setTargetYaw(landmark.yaw)
      setTargetPitch(landmark.pitch)
    }
  }

  // Camera reference handler
  const handleCameraRef = (state: { camera: THREE.Camera }) => {
    cameraRef.current = state.camera
  }

  // Modify the sidebar toggle
  const handleOpenSidebar = () => {
    setSidebarOpen(true)
    setActiveElement("categories") // Set categories as active element
  }

  // Handle closing elements
  const handleCloseLandmarks = () => {
    setActiveElement("none")
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Loading screen - only show when loading is true */}
      {loading && <Loading />}

      {/* 3D Panorama */}
      <div className="absolute inset-0">
        {/* Gradient overlays for better UI visibility */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-black/40 to-transparent h-32"></div>
        <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10 bg-gradient-to-t from-black/40 to-transparent h-32"></div>

        <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} className="w-full h-full" onCreated={handleCameraRef}>
          <Suspense fallback={null}>
            {/* Scene lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 10, 5]} intensity={1} />

            {/* Environment map for reflections */}
            <Environment preset="sunset" />

            {/* Panorama with hotspots */}
            <PanoramaSphere hotspots={hotspots} activePin={activePin} onPinClick={handlePinClick} />

            {/* Camera controls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.5}
              minPolarAngle={Math.PI * 0.1}
              maxPolarAngle={Math.PI / 2 + MathUtils.degToRad(-15)} // Limit pitch to -15 degrees
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Landmark sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute top-32 left-4 max-h-[65vh] w-72 bg-black/80 backdrop-blur-md z-[1050] overflow-hidden rounded-lg shadow-xl"
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-white font-bold text-base">Nearby Landmarks</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSidebarOpen(false)
                  setActiveElement("none")
                }} 
                className="text-white h-7 w-7"
              >
                <X size={16} />
              </Button>
            </div>
            
            {/* Categories tabs */}
            <div className="p-2 border-b border-gray-700 overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {["All", "infrastructure", "shopping", "education", "healthcare", "masjid", "finance", "leisure"].map((category) => (
                  <div 
                    key={category}
                    className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap
                      ${activeCategory === category ? 'bg-[#0b4d43] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category === 'All' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Landmarks list with IMPROVED mobile scrolling */}
            <div 
              className="overflow-y-auto max-h-[calc(70vh-90px)] touch-auto overscroll-contain"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '2rem' // Add extra padding to show more content is available
              }}
            >
              <div className="p-2 space-y-2 pb-6">
                {hotspots
                  .filter(landmark => activeCategory === 'All' || landmark.category === activeCategory)
                  .map((landmark) => (
                    <div
                      key={landmark.id}
                      onClick={() => handlePinClick(landmark.title)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all touch-manipulation",
                        activePin === landmark.title
                          ? "bg-[#0b4d43] text-white"
                          : "bg-gray-800/50 text-gray-200 hover:bg-gray-700/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{landmark.title}</span>
                        </div>
                        
                        {landmark.durationInMinutes !== undefined && (
                          <div className="text-xs bg-[#0b4d43]/30 text-[#4dcfba] px-2 py-1 rounded flex items-center flex-shrink-0 ml-2">
                            {landmark.durationInMinutes}m
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Scroll indicator */}
              <div className="h-8 bg-gradient-to-t from-black/80 to-transparent w-full pointer-events-none sticky bottom-0 flex justify-center items-end pb-1">
                <span className="text-[#4dcfba] text-xs">Scroll for more</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories button - only show when sidebar is closed AND no other element is active */}
      {!sidebarOpen && activeElement !== "landmarks" && (
        <div className="absolute left-4 top-[60%] z-[1100] flex flex-col items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#0b4d43] text-white rounded-full hover:bg-[#0a3e37] w-12 h-12 flex items-center justify-center shadow-lg"
            onClick={handleOpenSidebar}
          >
            <Layers className="h-6 w-6" />
          </Button>
          
          {/* Add this button for the landmark selector */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#0b4d43]/80 text-white rounded-full hover:bg-[#0a3e37] w-12 h-12 flex items-center justify-center shadow-lg mt-2"
            onClick={() => setActiveElement("landmarks")}
          >
            <MapPin className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Landmark selector dropdown - moved higher on mobile */}
      {activeElement === "landmarks" && (
        <div className="absolute bottom-32 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[95%] sm:max-w-md px-2 sm:px-4">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-4">
            {/* Add a header with back button */}
            <div className="flex justify-between items-center mb-2">
              <label className="text-white text-xs sm:text-sm">Select a landmark:</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseLandmarks}
                className="text-white p-1 h-6 w-6"
              >
                <X size={14} />
              </Button>
            </div>
            
            {/* Dropdown remains the same */}
            <Select value={activePin} onValueChange={handleLandmarkSelect}>
              <SelectTrigger className="w-full bg-black/50 border-gray-700 text-white h-8 sm:h-10 text-xs sm:text-sm min-h-[32px] sm:min-h-[40px]">
                <SelectValue placeholder="Select a landmark" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-gray-700 text-white text-xs sm:text-sm">
                {hotspots.map((landmark) => (
                  <SelectItem key={landmark.id} value={landmark.title} className="focus:bg-blue-900/50 text-xs sm:text-sm py-1 sm:py-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="truncate">{landmark.title}</span>
                      {landmark.durationInMinutes !== undefined && (
                        <Badge variant="outline" className="ml-1 sm:ml-2 bg-[#0b4d43]/30 text-[#4dcfba] border-[#0b4d43] text-[10px] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5">
                          {landmark.durationInMinutes}m
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time estimation display remains the same */}
            {activeHotspot.durationInMinutes !== undefined && (
              <div className="mt-2 sm:mt-4 bg-[#0b4d43]/30 text-white p-2 sm:p-3 rounded-lg flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-[#4dcfba]" />
                <div>
                  <p className="font-medium text-xs sm:text-sm truncate">{activeHotspot.title}</p>
                  <p className="text-[10px] sm:text-xs text-[#4dcfba]">{activeHotspot.durationInMinutes} min from KEY 1</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Keep other component definitions outside, they're not using hooks at file scope
function AnimatedArc({ from, to, color = "#0b4d43" }: { from: [number, number, number]; to: [number, number, number]; color?: string }) {
  // Create a curved path between two points
  const curve = useMemo(() => {
    const mid = [
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 8, // Raise the arc
      (from[2] + to[2]) / 2,
    ]
    return new CatmullRomCurve3([
      new Vector3(...from),
      new Vector3(...mid),
      new Vector3(...to),
    ])
  }, [from, to])

  // Animate dash offset
  const ref = useRef<THREE.Mesh | null>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.LineDashedMaterial;
      material.dashSize = 0.5 + (Math.sin(clock.getElapsedTime()) * 0.1);
      material.gapSize = 0.5 + (Math.cos(clock.getElapsedTime()) * 0.1);
      material.needsUpdate = true;
    }
  })

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.18, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        transparent
        opacity={0.7}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  )
}

function PinSpotlight({ position, active }: { position: [number, number, number]; active: boolean }) {
  const { scene } = useThree()
  const lightRef = useRef<THREE.SpotLight | null>(null)
  useEffect(() => {
    if (lightRef.current && active) {
      lightRef.current.target.position.set(...position)
      scene.add(lightRef.current.target)
    }
  }, [active, position, scene])
  return (
    <spotLight
      ref={lightRef}
      position={[position[0], position[1] + 8, position[2]]}
      angle={0.5}
      penumbra={0.7}
      intensity={active ? 1.2 : 0}
      color="#0b4d43"
      castShadow={false}
    />
  )
}

// Panorama sphere with hotspots
function PanoramaSphere({ hotspots, activePin, onPinClick }: { hotspots: Array<{ id: string; title: string; yaw: number; pitch: number; category: string; durationInMinutes: number | null; description: string }>, activePin: string, onPinClick: (pinName: string) => void }) {
  const texture = useTexture("/Panorama.jpg")
  const keyPin = hotspots.find(h => h.title === "KEY 1 BUILDING")
  const activeHotspot = hotspots.find(h => h.title === activePin)

  return (
    <>
      {/* Panorama sphere */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={texture} side={2} />
      </mesh>

      {/* Animated arc from KEY 1 to active pin */}
      {activePin !== "KEY 1 BUILDING" && keyPin && activeHotspot && (
        <AnimatedArc
          from={sphericalToCartesian(keyPin.yaw, keyPin.pitch, 49)}
          to={sphericalToCartesian(activeHotspot.yaw, activeHotspot.pitch, 49)}
          color="#22d3ee"
        />
      )}

      {/* Render all hotspots */}
      {hotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.id}
          hotspot={hotspot}
          position={sphericalToCartesian(hotspot.yaw, hotspot.pitch, 49)}
          isActive={activePin === hotspot.title}
          onClick={() => onPinClick(hotspot.title)}
        />
      ))}

      {/* Spotlight on active pin */}
      {activeHotspot && (
        <PinSpotlight
          position={sphericalToCartesian(activeHotspot.yaw, activeHotspot.pitch, 49)}
          active={true}
        />
      )}

      {/* Compass overlay can be added as a floating Html element */}
    </>
  )
}

// Individual hotspot component with improved visuals
type HotspotProps = {
  hotspot: {
    id: string;
    title: string;
    yaw: number;
    pitch: number;
    category: string;
    durationInMinutes: number | null;
    description: string;
  };
  position: [number, number, number];
  isActive: boolean;
  onClick: () => void;
};

function Hotspot({ hotspot, position, isActive, onClick }: HotspotProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const ringRef = useRef<THREE.Mesh | null>(null)
  const isKeyBuilding = hotspot.title === "KEY 1 BUILDING"
  const [hovered, setHovered] = useState(false)

  // Spring animation for hover effect
  const { scale, emissiveIntensity, ringScale } = useSpring({
    scale: isActive ? 1.5 : hovered ? 1.3 : 1,
    emissiveIntensity: isActive ? 2 : hovered ? 1.5 : 1,
    ringScale: isActive ? 1.8 : hovered ? 1.5 : 0,
    config: config.gentle,
  })

  // Animation effect
  useFrame((state) => {
    if (!meshRef.current) return

    // Pulsing animation - slower for active pins
    const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    meshRef.current.scale.x = scale.get() + (isActive ? pulse : 0)
    meshRef.current.scale.y = scale.get() + (isActive ? pulse : 0)
    meshRef.current.scale.z = scale.get() + (isActive ? pulse : 0)

    // Rotate the marker
    if (isKeyBuilding) {
      meshRef.current.rotation.y += 0.01
    }

    // Animate ring
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005
      ringRef.current.scale.x = ringScale.get()
      ringRef.current.scale.y = ringScale.get()
      ringRef.current.scale.z = 1
    }
  })

  // Get category style
  const { bgColor } = getCategoryStyle(hotspot.category)
  const color = new Color(bgColor)

  return (
    <group position={position}>
      {/* Outer ring (only visible on hover/active) */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent={true} side={2} />
      </mesh>

      {/* Pin marker */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial
          color={isKeyBuilding ? "#FFD700" : bgColor}
          opacity={0.9}
          transparent={true}
          emissive={isKeyBuilding ? "#FFD700" : bgColor}
          emissiveIntensity={emissiveIntensity.get()}
          metalness={isKeyBuilding ? 0.7 : 0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Pin label - ENLARGED */}
      <Html position={[0, 3, 0]} center distanceFactor={50} zIndexRange={[0, 1000]}>
        <div
          className={`
            px-4 py-3 rounded-lg text-white text-base md:text-lg whitespace-nowrap transform transition-all duration-500
            ${isActive ? "bg-[#0b4d43] scale-110" : "bg-black/80 backdrop-blur-sm"} 
            ${hovered ? "scale-110" : ""}
          `}
          style={{
            minWidth: "180px",
            textAlign: "center",
            boxShadow: "0 0 15px rgba(0,0,0,0.6)",
          }}
        >
          {isKeyBuilding ? (
            <div className="flex items-center justify-center gap-2">
              <Building size={24} className="text-yellow-400" />
              <span className="font-bold">{hotspot.title}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <MapPin size={22} />
              <span>{hotspot.title}</span>
            </div>
          )}
        </div>

        {/* Duration badge - only show if active or hovered */}
        {hotspot.durationInMinutes !== undefined && (isActive || hovered) && (
          <div className="mt-2 flex justify-center">
            <span className="bg-white/90 text-black px-3 py-1 text-sm rounded-full flex items-center">
              <Clock size={16} className="mr-1.5" />
              <span className="font-medium">{hotspot.durationInMinutes} min away</span>
            </span>
          </div>
        )}
      </Html>
    </group>
  )
}

// Helper function to get category style
function getCategoryStyle(category = "default") {
  switch (category) {
    case "shopping":
      return { icon: Layers, bgColor: "#0b4d43" }
    case "education":
      return { icon: Layers, bgColor: "#0b4d43" }
    case "healthcare":
      return { icon: Layers, bgColor: "#0b4d43" }
    case "infrastructure":
      return { icon: Building, bgColor: "#0b4d43" }
    case "leisure":
      return { icon: Layers, bgColor: "#0b4d43" }
    case "finance":
      return { icon: Layers, bgColor: "#0b4d43" }
    case "masjid":
      return { icon: Layers, bgColor: "#0b4d43" }
    default:
      return { icon: MapPin, bgColor: "#0b4d43" }
  }
}

// Helper function for spherical coordinates to cartesian
function sphericalToCartesian(yaw: number, pitch: number, radius: number) {
  // Convert from degrees to radians with proper direction
  const yawRad = MathUtils.degToRad((360 - yaw) % 360)
  const pitchRad = MathUtils.degToRad(pitch)

  const spherical = new Spherical(radius, Math.PI / 2 - pitchRad, yawRad)

  const cartesian = new Vector3()
  cartesian.setFromSpherical(spherical)

  return cartesian.toArray()
}
