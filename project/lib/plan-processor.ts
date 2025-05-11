// import { FLOORS, SPACE_DATA, getFloorLevelFromName, isRoomOrFlat } from "./building-data"

// /**
//  * Process a 3D model to identify and categorize plan-related objects (rooms, flats, etc.)
//  * @param model The Three.js model to process
//  * @returns Object containing plan objects organized by floor level
//  */
// export function processPlanObjects(model) {
//   const detectedPlans = {}

//   // Initialize arrays for each floor
//   FLOORS.forEach((floor) => {
//     detectedPlans[floor.level] = []
//   })

//   console.log("Processing plan model objects:", model)

//   // Log the top level objects to debug
//   if (model.children) {
//     console.log(
//       "Top level objects:",
//       model.children.map((child) => child.name || "unnamed"),
//     )
//   }

//   // Process the entire model looking for objects
//   model.traverse((obj) => {
//     // Skip objects without names
//     if (!obj.name) return

//     // Log some objects for debugging
//     if (obj.type === "Mesh" || obj.type === "Group") {
//       console.log(`Found object: ${obj.name} (${obj.type})`)
//     }

//     // Skip ENV objects
//     if (obj.name === "ENV" || obj.name.includes("ENV")) {
//       obj.userData.isEnv = true
//       obj.userData.clickable = false
//       obj.userData.originalVisibility = obj.visible
//       return
//     }

//     // Store original visibility
//     obj.userData.originalVisibility = obj.visible

//     // Determine if this is a room or flat
//     const isRoom = isRoomOrFlat(obj.name)

//     // Only process rooms and flats in this processor
//     if (!isRoom) {
//       return
//     }

//     // Get floor level using the helper function
//     const floorLevel = getFloorLevelFromName(obj.name)

//     // If we found a valid floor level, process the object
//     if (floorLevel !== null && floorLevel >= 0 && floorLevel < FLOORS.length) {
//       const isFlat = obj.name.toLowerCase().includes("flat")
//       const isShop = obj.name.toLowerCase().includes("shop")
//       const isHallway = obj.name.toLowerCase().includes("hall") || obj.name.toLowerCase().includes("corridor")

//       // Set object metadata
//       obj.userData.floorLevel = floorLevel
//       obj.userData.isRoom = true
//       obj.userData.clickable = true

//       // Set room type
//       if (isFlat) obj.userData.roomType = "flat"
//       else if (isShop) obj.userData.roomType = "shop"
//       else if (isHallway) obj.userData.roomType = "hallway"
//       else obj.userData.roomType = "other"

//       // Add space data if available
//       if (SPACE_DATA[obj.name]) {
//         obj.userData.spaceData = SPACE_DATA[obj.name]
//       }

//       // Add to appropriate floor collection
//       if (!detectedPlans[floorLevel]) {
//         detectedPlans[floorLevel] = []
//       }

//       detectedPlans[floorLevel].push(obj)
//       console.log(`Found ${obj.userData.roomType}: "${obj.name}" on floor ${floorLevel}`)
//     } else {
//       // No floor level detected - assign to ground floor for visibility
//       if (obj.isMesh || obj.isGroup) {
//         console.log(`Room object without floor level: ${obj.name} - assigning to ground floor`)
//         if (!detectedPlans[0]) {
//           detectedPlans[0] = []
//         }
//         detectedPlans[0].push(obj)
//         obj.userData.floorLevel = 0
//         obj.userData.isRoom = true
//         obj.userData.clickable = true
//         obj.userData.roomType = "other"
//       }
//     }
//   })

//   // Log what we found for each floor
//   Object.entries(detectedPlans).forEach(([floor, objects]) => {
//     console.log(`Floor ${floor}: ${objects.length} plan objects found`)
//   })

//   return detectedPlans
// }
