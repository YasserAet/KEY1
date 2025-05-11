// "use client"

// import { useRef, useState, useEffect } from "react"
// import { useFrame, useThree } from "@react-three/fiber"
// import { TextureLoader, SphereGeometry, MeshBasicMaterial, Mesh, AmbientLight, BoxGeometry } from "three"

// export function PanoramaViewer({ imageUrl, autoRotate = true }) {
//   const sphereRef = useRef()
//   const { scene, camera } = useThree()
//   const [isLoaded, setIsLoaded] = useState(false)
//   const [loadError, setLoadError] = useState(false)

//   useEffect(() => {
//     // Clear any previous panorama
//     if (sphereRef.current) {
//       scene.remove(sphereRef.current)
//       if (sphereRef.current.geometry) sphereRef.current.geometry.dispose()
//       if (sphereRef.current.material) {
//         if (sphereRef.current.material.map) sphereRef.current.material.map.dispose()
//         sphereRef.current.material.dispose()
//       }
//     }

//     // Set camera position to center of sphere
//     camera.position.set(0, 0, 0.1)

//     // Create the panorama sphere
//     console.log("Attempting to load panorama from:", imageUrl)

//     try {
//       const loader = new TextureLoader()
//       // Add cache buster to avoid browser caching issues
//       const imageSrc = `${imageUrl}?v=${Date.now()}`

//       loader.load(
//         imageSrc,
//         (texture) => {
//           // Create sphere geometry, inside-out
//           const geometry = new SphereGeometry(5, 60, 40)
//           // Scale negative on X to flip the sphere inside out
//           geometry.scale(-1, 1, 1)

//           // Create material with the panorama texture
//           const material = new MeshBasicMaterial({
//             map: texture,
//           })

//           // Create mesh and add to scene
//           const sphere = new Mesh(geometry, material)
//           sphere.rotation.y = Math.PI / 2 // Adjust initial rotation if needed
//           scene.add(sphere)
//           sphereRef.current = sphere
//           setIsLoaded(true)
//           setLoadError(false)

//           console.log("Panorama loaded successfully")
//         },
//         // Progress callback
//         (xhr) => {
//           console.log(`Panorama loading: ${(xhr.loaded / xhr.total) * 100}% loaded`)
//         },
//         // Error callback
//         (err) => {
//           console.error("Error loading panorama:", err, "URL:", imageUrl)
//           setLoadError(true)

//           // Create a fallback colored sphere
//           const geometry = new SphereGeometry(5, 32, 32)
//           geometry.scale(-1, 1, 1)
//           const material = new MeshBasicMaterial({
//             color: 0x444444,
//             wireframe: true,
//           })
//           const sphere = new Mesh(geometry, material)
//           scene.add(sphere)
//           sphereRef.current = sphere
//           setIsLoaded(true)

//           // Add debug objects to show something
//           const boxGeometry = new BoxGeometry(1, 1, 1)
//           const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 })
//           const box = new Mesh(boxGeometry, boxMaterial)
//           box.position.set(0, 0, -3)
//           scene.add(box)
//         },
//       )
//     } catch (e) {
//       console.error("Exception during panorama loading:", e)
//     }

//     // Cleanup
//     return () => {
//       if (sphereRef.current) {
//         scene.remove(sphereRef.current)
//         if (sphereRef.current.geometry) sphereRef.current.geometry.dispose()
//         if (sphereRef.current.material) {
//           if (sphereRef.current.material.map) sphereRef.current.material.map.dispose()
//           sphereRef.current.material.dispose()
//         }
//       }
//     }
//   }, [imageUrl, scene, camera])

//   // Add fallback/debug objects
//   useEffect(() => {
//     if (loadError) {
//       // Add ambient light so we can see the debug geometry
//       const light = new AmbientLight(0xffffff, 1)
//       scene.add(light)

//       return () => {
//         scene.remove(light)
//       }
//     }
//   }, [loadError, scene])

//   // Auto-rotate the camera if enabled
//   useFrame(() => {
//     if (autoRotate && isLoaded && sphereRef.current) {
//       camera.rotation.y -= 0.0005
//     }
//   })

//   return null
// }
