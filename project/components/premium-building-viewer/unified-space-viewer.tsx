// "use client"

// import { useRef, useState, useEffect } from "react"
// import { Canvas } from "@react-three/fiber"
// import { OrbitControls } from "@react-three/drei"
// import { Button } from "@/components/ui/button"
// import { MapPin, Eye, ArrowLeft } from "lucide-react"
// import { PanoramaViewer } from "./panorama-viewer"

// export function UnifiedSpaceViewer({ room, onClose }) {
//   const [activeTab, setActiveTab] = useState("plan")
//   const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0)
//   const [isVRLoading, setIsVRLoading] = useState(true)
//   const [isPlanLoading, setIsPlanLoading] = useState(true)
//   const [hotspots, setHotspots] = useState([])
//   const panoramaRef = useRef(null)
//   const canvasRef = useRef(null)
//   const planImageRef = useRef(null)

//   // Default panoramas and plan image if none provided
//   const panoramas = room?.panoramas && room.panoramas.length > 0 ? room.panoramas : ["/images/panoramas/sample.jpg"]

//   const floorPlanImage = room?.floorPlanImage || "/images/placeholder-plan.jpg"

//   // Handle VR Tour initialization
//   useEffect(() => {
//     if (activeTab !== "vr") return

//     // Set a short loading time
//     setIsVRLoading(true)

//     // Simulate minimal loading time for better UX
//     const timer = setTimeout(() => {
//       setIsVRLoading(false)
//     }, 500)

//     return () => {
//       clearTimeout(timer)
//     }
//   }, [activeTab, panoramas, currentPanoramaIndex])

//   // Add this debug log in the UnifiedSpaceViewer component
//   useEffect(() => {
//     console.log("Panoramas available:", panoramas)
//     console.log("Current panorama URL:", panoramas[currentPanoramaIndex])
//   }, [panoramas, currentPanoramaIndex])

//   return (
//     <div className="h-full w-full flex flex-col">
//       {/* Tab Navigation */}
//       <div className="flex border-b bg-white">
//         <button
//           className={`flex items-center gap-2 px-4 py-3 ${activeTab === "plan" ? "border-b-2 border-[#0b4d43] text-[#0b4d43] font-medium" : "text-gray-500 hover:text-gray-800"}`}
//           onClick={() => setActiveTab("plan")}
//         >
//           <MapPin className="h-4 w-4" />
//           <span>Floor Plan</span>
//         </button>
//         <button
//           className={`flex items-center gap-2 px-4 py-3 ${activeTab === "vr" ? "border-b-2 border-[#0b4d43] text-[#0b4d43] font-medium" : "text-gray-500 hover:text-gray-800"}`}
//           onClick={() => setActiveTab("vr")}
//         >
//           <Eye className="h-4 w-4" />
//           <span>VR Tour</span>
//         </button>
//       </div>

//       {/* Content Area */}
//       <div className="flex-1 relative overflow-hidden">
//         {/* Floor Plan View */}
//         <div className={`absolute inset-0 ${activeTab === "plan" ? "block" : "hidden"}`}>
//           {isPlanLoading ? (
//             <div className="h-full w-full flex items-center justify-center bg-gray-100">
//               <div className="text-center">
//                 <div className="animate-spin h-8 w-8 border-4 border-[#0b4d43] border-t-transparent rounded-full mx-auto mb-2"></div>
//                 <p className="text-gray-500">Loading floor plan...</p>
//               </div>
//             </div>
//           ) : (
//             <div className="h-full w-full flex flex-col">
//               <div className="flex-1 relative overflow-hidden">
//                 <canvas
//                   ref={canvasRef}
//                   className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
//                 ></canvas>
//               </div>

//               <div className="p-3 bg-white border-t">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-medium text-[#0b4d43]">{room?.type || "Floor Plan"}</h3>
//                     <p className="text-xs text-gray-500">Click on a hotspot to view in VR</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="text-xs"
//                       onClick={() => {
//                         // Reset zoom/pan logic would go here
//                       }}
//                     >
//                       Reset View
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* VR Tour View - UPDATED */}
//         <div className={`absolute inset-0 ${activeTab === "vr" ? "block" : "hidden"}`}>
//           {isVRLoading ? (
//             <div className="h-full w-full flex items-center justify-center bg-gray-100">
//               <div className="text-center">
//                 <div className="animate-spin h-8 w-8 border-4 border-[#0b4d43] border-t-transparent rounded-full mx-auto mb-2"></div>
//                 <p className="text-gray-500">Loading VR tour...</p>
//               </div>
//             </div>
//           ) : (
//             <div className="h-full w-full flex flex-col">
//               <div
//                 className="flex-1 relative"
//                 ref={panoramaRef}
//                 style={{
//                   minHeight: "300px",
//                   height: "100%",
//                 }}
//               >
//                 <Canvas
//                   className="w-full h-full"
//                   style={{ display: "block", position: "absolute", width: "100%", height: "100%" }}
//                   camera={{ fov: 75 }}
//                 >
//                   <PanoramaViewer imageUrl={panoramas[currentPanoramaIndex]} autoRotate={true} />
//                   <OrbitControls
//                     enableZoom={false}
//                     enablePan={false}
//                     rotateSpeed={0.5}
//                     enableDamping
//                     dampingFactor={0.1}
//                   />
//                 </Canvas>
//               </div>

//               {/* Controls and navigation */}
//               <div className="p-3 bg-white border-t">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-medium text-[#0b4d43]">
//                       {currentPanoramaIndex === 0 ? "Living Room" : currentPanoramaIndex === 1 ? "Kitchen" : "Bedroom"}
//                     </h3>
//                     <p className="text-xs text-gray-500">
//                       Panorama {currentPanoramaIndex + 1} of {panoramas.length}
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button variant="outline" size="sm" className="text-xs" onClick={() => setActiveTab("plan")}>
//                       <ArrowLeft className="h-3 w-3 mr-1" />
//                       Back to Plan
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Panorama navigation dots */}
//                 {panoramas.length > 1 && (
//                   <div className="flex justify-center mt-2 gap-1">
//                     {panoramas.map((_, index) => (
//                       <button
//                         key={index}
//                         className={`w-8 h-8 rounded ${
//                           currentPanoramaIndex === index
//                             ? "bg-[#0b4d43] text-white"
//                             : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//                         }`}
//                         onClick={() => setCurrentPanoramaIndex(index)}
//                       >
//                         {index + 1}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
