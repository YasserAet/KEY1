// import { FLOORS, getFloorLevelFromName, isStructuralElement } from "./building-data"

// /**
//  * Process a 3D model to identify and categorize floor-related objects
//  * @param model The Three.js model to process
//  * @returns Object containing floor objects organized by floor level
//  */
// export function processFloorObjects(model) {
//   const detectedFloors = {}

//   // Initialize arrays for each floor
//   FLOORS.forEach((floor) => {
//     detectedFloors[floor.level] = []
//   })

//   console.log("Processing floor model objects:", model)

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

//     // Skip ENV objects
//     if (obj.name === "ENV" || obj.name.includes("ENV")) {
//       obj.userData.isEnv = true
//       obj.userData.clickable = false
//       obj.userData.originalVisibility = obj.visible
//       return
//     }

//     // Store original visibility
//     obj.userData.originalVisibility = obj.visible

//     // Determine if this is a structural element
//     const isStructural = isStructuralElement(obj.name)

//     // Only process structural elements in this processor
//     if (!isStructural) {
//       return
//     }

//     // Get floor level using the helper function
//     const floorLevel = getFloorLevelFromName(obj.name)

//     // Modify the condition in your processFloorObjects function
//     if (floorLevel !== null && floorLevel >= 0) {
//       // Set object metadata
//       obj.userData.floorLevel = floorLevel
//       obj.userData.isStructural = true
//       obj.userData.clickable = false // Structural elements aren't clickable by default

//       // Add to appropriate floor collection
//       if (!detectedFloors[floorLevel]) {
//         detectedFloors[floorLevel] = []
//       }

//       detectedFloors[floorLevel].push(obj)
//       console.log(`Found structural element: "${obj.name}" on floor ${floorLevel}`)
//     } else {
//       // No floor level detected - assign to ground floor for visibility
//       if (obj.isMesh || obj.isGroup) {
//         console.log(`Structural object without floor level: ${obj.name} - assigning to ground floor`)
//         if (!detectedFloors[0]) {
//           detectedFloors[0] = []
//         }
//         detectedFloors[0].push(obj)
//         obj.userData.floorLevel = 0
//         obj.userData.isStructural = true
//         obj.userData.clickable = false
//       }
//     }
//   })

//   // Log what we found for each floor
//   Object.entries(detectedFloors).forEach(([floor, objects]) => {
//     console.log(`Floor ${floor}: ${objects.length} structural elements found`)
//   })

//   return detectedFloors
// }
