"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FLOORS, SPACE_DATA } from "./data"

// Replace all console.log statements with conditional logging
const DEBUG = false; // Set to false in production
const debugLog = (...args: any[]) => DEBUG && console.log(...args);

interface BuildingModelLoaderProps {
  envModelPath?: string;
  currentFloor?: number;
  scale?: number;
  onFlatClick?: (flat: THREE.Object3D) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  modalOpen?: boolean;
  quality: string
}

export function BuildingModelLoader({
  envModelPath = "/assets/ENVV.glb",
  currentFloor = -1,
  scale = 1,
  onFlatClick,
  onLoadingChange,
  modalOpen = false, // New prop to disable interactions when modal is open
}: BuildingModelLoaderProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const currentFloorStructureRef = useRef(null)
  const currentFloorPlanRef = useRef(null)
  const [isPreloading, setIsPreloading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [clickableObjects, setClickableObjects] = useState<THREE.Object3D[]>([])
  const [hoveredFlat, setHoveredFlat] = useState<THREE.Object3D | null>(null)
  const originalMaterials = useRef<Record<string, THREE.Material>>({})
  const loadedModels = useRef<{
    environment: THREE.Group | null;
    structures: Record<number, THREE.Group>;
    plans: Record<number, THREE.Group>;
  }>({
    environment: null,
    structures: {},
    plans: {},
  })

  const floorMeshes: Record<number, THREE.Mesh[]> = {}; // Cache floor meshes for quick access

  const defaultMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#cccccc",
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
    [],
  )

  // Update the hover material approach
  const hoverMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      // Use green color but keep full opacity
      color: new THREE.Color(0x00ff00),
      transparent: false,
      opacity: 1.0, // Full opacity
      emissive: new THREE.Color(0x16a34a),
      emissiveIntensity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: true, // Enable depth writing
      metalness: 0.1,
      roughness: 0.7
    })
  }, [])

  const { scene, camera, raycaster, pointer } = useThree()
  
  // Create loader with Draco compression support
  const gltfLoader = useMemo(() => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    // Verify decoder files exist and fallback if they don't
    const checkDecoderAvailable = async () => {
      try {
        const response = await fetch('/draco/draco_decoder.js');
        return response.ok;
      } catch (e) {
        return false;
      }
    };

    // Then configure loader accordingly
    const configureLoader = async () => {
      const available = await checkDecoderAvailable();
      if (available) {
        dracoLoader.setDecoderPath('/draco/');
      } else {
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      }
    };

    configureLoader();

    // Attach Draco loader to GLTF loader
    loader.setDRACOLoader(dracoLoader);
    
    return loader;
  }, []);

  const [labelPosition, setLabelPosition] = useState<{ x: number, y: number } | null>(null)
  const [labelContent, setLabelContent] = useState<{ type: string, area: string } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    async function preloadModels() {
      try {
        debugLog("Starting preloading process...")

        const totalModels =
          1 +
          FLOORS.reduce((count, floor) => {
            return count + (floor.floorModelPath ? 1 : 0) + (floor.planModelPath ? 1 : 0)
          }, 0)

        let loadedCount = 0

        const updateProgress = () => {
          loadedCount++
          const percentage = Math.round((loadedCount / totalModels) * 100)
          setLoadProgress(percentage)
          debugLog(`Loading progress: ${percentage}%`)
        }

        // Shared materials for optimization
        const sharedMaterials = {}

        // First load environment model
        const envPromise = new Promise((resolve, reject) => {
          gltfLoader.load(
            envModelPath,
            (gltf) => {
              const model = gltf.scene.clone()
              model.name = "ENVIRONMENT_MODEL"

              // Simply set shadows, no material manipulation
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                  // No material cloning
                }
              })

              loadedModels.current.environment = model
              if (groupRef.current) groupRef.current.add(model)

              updateProgress()
              resolve(undefined)
            },
            undefined,
            (error) => {
              console.error("Error loading environment:", error)
              updateProgress()
              resolve(undefined) // Still resolve to continue loading other models
            },
          )
        })

        await envPromise

        const loadFloor = async (floorLevel: number) => {
          // Loading code just for this floor
          const floor = FLOORS.find(f => f.level === floorLevel);
          if (!floor) return;

          if (floor.floorModelPath) {
            const structPromise = new Promise((resolve) => {
              gltfLoader.load(
                floor.floorModelPath,
                (gltf) => {
                  const model = gltf.scene.clone()
                  model.name = `FLOOR_STRUCTURE_${floor.level}_MODEL`
                  model.visible = false

                  model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                      child.castShadow = true
                      child.receiveShadow = true
                      child.userData.clickable = false // CHANGED: Not clickable
                      child.userData.type = 'structure' // NEW: Mark as structure
                      child.userData.floorLevel = floor.level
                      
                      // Still track in floorMeshes for visibility management
                      if (!floorMeshes[floor.level]) floorMeshes[floor.level] = [];
                      if (child instanceof THREE.Mesh) {
                        floorMeshes[floor.level].push(child);
                      }
                    }
                  });

                  loadedModels.current.structures[floor.level] = model
                  if (groupRef.current) groupRef.current.add(model)

                  updateProgress()
                  resolve(undefined)
                },
                undefined,
                (error) => {
                  console.error(`Error loading structure for floor ${floor.level}:`, error)
                  updateProgress()
                  resolve(undefined)
                },
              )
            })
            await structPromise;
          }

          if (floor.planModelPath) {
            const planPromise = new Promise((resolve) => {
              gltfLoader.load(
                floor.planModelPath,
                (gltf) => {
                  console.log(`Successfully loaded floor plan ${floor.level}:`, floor.planModelPath);
                  const model = gltf.scene;
                  model.name = `FLOOR_PLAN_${floor.level}_MODEL`
                  model.visible = false

                  model.traverse((child) => {
                    // Set basic properties
                    child.userData.clickable = true;
                    child.userData.type = 'plan';
                    child.userData.floorLevel = floor.level;
                    
                    // Default: NOT hoverable
                    child.userData.hoverable = false;
                    
                    if (child instanceof THREE.Mesh) {
                      const meshName = child.name;
                      
                      // SIMPLE APPROACH: Make everything hoverable EXCEPT specific exclusions
                      const isCommonArea = 
                        meshName.includes('HALL') || 
                        meshName.includes('LOBBY') || 
                        meshName.includes('ENTRANCE') || 
                        meshName.includes('ELECTRICAL') || 
                        meshName.includes('GUARD') || 
                        meshName.includes('GARBAGE') || 
                        meshName.includes('TELECOM') || 
                        meshName.includes('GROUND1') ||
                        meshName.includes('STAIR') ||
                        meshName.includes('CORRIDOR');
                      
                      // Make EVERYTHING hoverable except common areas
                      child.userData.hoverable = !isCommonArea;
                      
                      // Print debug info for each floor object
                      console.log(`Floor ${floor.level} - Object "${meshName}" - Hoverable: ${child.userData.hoverable}`);
                      
                      // Add to floor meshes cache
                      if (!floorMeshes[floor.level]) floorMeshes[floor.level] = [];
                      floorMeshes[floor.level].push(child);
                    }
                  });

                  loadedModels.current.plans[floor.level] = model
                  if (groupRef.current) groupRef.current.add(model)

                  updateProgress()
                  resolve(undefined)
                },
                (progress) => {
                  if (progress.lengthComputable) {
                    const percentComplete = Math.round((progress.loaded / progress.total) * 100);
                    setLoadProgress(prev => Math.max(prev, percentComplete));
                  }
                },
                (error) => {
                  console.error(`Error loading floor plan ${floor.level}:`, error);
                  console.error(`Path attempted: ${floor.planModelPath}`);
                  updateProgress();
                  resolve(undefined);
                },
              )
            })
            await planPromise;
          }

          debugLog(`Floor ${floorLevel} loaded`);
        };

        // Load all floors immediately
        await Promise.all(FLOORS.map(floor => loadFloor(floor.level)));
        debugLog("All floors loaded immediately!");

        // Move only environment and structure models up on the Y-axis, NOT plans
        const envOffset = new THREE.Vector3(0, 1.2, 0) // Lower environment position

        // Apply offset to environment model only
        if (loadedModels.current.environment) {
          loadedModels.current.environment.position.add(envOffset)
        }

        const structureOffset = new THREE.Vector3(0, 1.0, 0) // Much higher than before

        // Apply offset to structure models
        FLOORS.forEach((floor) => {
          const structureModel = loadedModels.current.structures[floor.level]
          if (structureModel) {
            structureModel.position.add(structureOffset)
          }
        })

        // Apply custom Y-axis offset for each plan
        const planOffsets = {
          0: 1.0,  // Ground floor 
          1: 1.08, // First floor
          2: 2.36, // Second floor
          3: 3.63,  // Third floor
          4: 4.84,  // Fourth floor
          5: 6.1, // Fifth floor
          6: 7.3, // Penthouse
          7: 1.06, // Terrace
        } as const;

        FLOORS.forEach((floor) => {
          const planModel = loadedModels.current.plans[floor.level];
          if (planModel) {
            const customOffset = planOffsets[floor.level as keyof typeof planOffsets] || 0; // Default to 0 if no offset specified
            planModel.position.setY(customOffset);
            debugLog(`Floor ${floor.level} plan positioned at Y: ${customOffset}`);
          }
        });

        debugLog("Applied position offsets to structures and plans")

        // Reduce contrast of floor plans
        console.log("Reducing contrast of floor plans for better visibility");
        FLOORS.forEach((floor) => {
          const planModel = loadedModels.current.plans[floor.level];
          if (planModel) {
            planModel.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                // Only process plan materials that haven't been processed
                if (!child.material.userData?.contrastReduced) {
                  if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => {
                      const newMat = mat.clone();
                      
                      // Reduce contrast by making dark colors lighter and bright colors less bright
                      if (newMat.color) {
                        // Calculate luminance (rough approximation)
                        const luminance = (newMat.color.r + newMat.color.g + newMat.color.b) / 3;
                        
                        // For dark colors, lighten them
                        if (luminance < 0.5) {
                          newMat.color.lerp(new THREE.Color(0x888888), 0.3); // Pull toward mid-gray
                        } 
                        // For light colors, make them less bright
                        else {
                          newMat.color.lerp(new THREE.Color(0xcccccc), 0.2); // Pull toward light gray
                        }
                      }
                      
                      // Increase roughness to reduce contrast from lighting
                      if (newMat.roughness !== undefined) {
                        newMat.roughness = Math.min(1.0, newMat.roughness + 0.2);
                      }
                      
                      // Mark as processed
                      newMat.userData = { ...newMat.userData, contrastReduced: true };
                      return newMat;
                    });
                  } else {
                    const newMat = child.material.clone();
                    
                    // Reduce contrast by making dark colors lighter and bright colors less bright
                    if (newMat.color) {
                      // Calculate luminance (rough approximation)
                      const luminance = (newMat.color.r + newMat.color.g + newMat.color.b) / 3;
                      
                      // For dark colors, lighten them
                      if (luminance < 0.5) {
                        newMat.color.lerp(new THREE.Color(0x888888), 0.3); // Pull toward mid-gray
                      } 
                      // For light colors, make them less bright
                      else {
                        newMat.color.lerp(new THREE.Color(0xcccccc), 0.2); // Pull toward light gray
                      }
                    }
                    
                    // Increase roughness to reduce contrast from lighting
                    if (newMat.roughness !== undefined) {
                      newMat.roughness = Math.min(1.0, newMat.roughness + 0.2);
                    }
                    
                    // Mark as processed
                    newMat.userData = { ...newMat.userData, contrastReduced: true };
                    child.material = newMat;
                  }
                }
              }
            });
          }
        });

        // Make building materials brighter
        FLOORS.forEach((floor) => {
          // Brighten structure models
          const structureModel = loadedModels.current.structures[floor.level]
          if (structureModel) {
            structureModel.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                // Clone the material if not already cloned
                if (!child.material.userData?.isProcessed) {
                  if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => {
                      const newMat = mat.clone();
                      
                      // INCREASED: Brightness by 80% (up from 40%)
                      if (newMat.color) {
                        newMat.color.multiplyScalar(1.8); 
                      }
                      
                      // DECREASED: Further reduce roughness for more shine
                      if (newMat.roughness !== undefined) {
                        newMat.roughness = Math.max(0.05, newMat.roughness * 0.5);
                      }
                      
                      // INCREASED: Metalness for more reflections
                      if (newMat.metalness !== undefined) {
                        newMat.metalness = Math.min(0.8, newMat.metalness * 1.5);
                      }
                      
                      // NEW: Add slight emissive glow for brightness boost
                      newMat.emissive = new THREE.Color(0xffffff);
                      newMat.emissiveIntensity = 0.15;
                      
                      newMat.userData = { isProcessed: true };
                      return newMat;
                    });
                  } else {
                    const newMat = child.material.clone();
                    
                    // INCREASED: Brightness by 80% (up from 40%)
                    if (newMat.color) {
                      newMat.color.multiplyScalar(1.8);
                    }
                    
                    // DECREASED: Further reduce roughness
                    if (newMat.roughness !== undefined) {
                      newMat.roughness = Math.max(0.05, newMat.roughness * 0.5);
                    }
                    
                    // INCREASED: Metalness for reflectivity
                    if (newMat.metalness !== undefined) {
                      newMat.metalness = Math.min(0.8, newMat.metalness * 1.5);
                    }
                    
                    // NEW: Add slight emissive glow for brightness boost
                    newMat.emissive = new THREE.Color(0xffffff);
                    newMat.emissiveIntensity = 0.15;
                    
                    newMat.userData = { isProcessed: true };
                    child.material = newMat;
                  }
                }
              }
            });
          }
        });

        // Also brighten the environment model
        if (loadedModels.current.environment) {
          loadedModels.current.environment.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (!child.material.userData?.isProcessed) {
                if (Array.isArray(child.material)) {
                  child.material = child.material.map(mat => {
                    const newMat = mat.clone();
                    if (newMat.color) newMat.color.multiplyScalar(1.6); // Increased from 1.3
                    if (newMat.roughness !== undefined) newMat.roughness = Math.max(0.1, newMat.roughness * 0.6);
                    // Add subtle emissive glow to environment
                    newMat.emissive = new THREE.Color(0xffffff);
                    newMat.emissiveIntensity = 0.1;
                    newMat.userData = { isProcessed: true };
                    return newMat;
                  });
                } else {
                  const newMat = child.material.clone();
                  if (newMat.color) newMat.color.multiplyScalar(1.6); // Increased from 1.3
                  if (newMat.roughness !== undefined) newMat.roughness = Math.max(0.1, newMat.roughness * 0.6);
                  // Add subtle emissive glow to environment
                  newMat.emissive = new THREE.Color(0xffffff);
                  newMat.emissiveIntensity = 0.1;
                  newMat.userData = { isProcessed: true };
                  child.material = newMat;
                }
              }
            }
          });
        }

        updateFloorVisibility(-1);

        setIsPreloading(false)
        onLoadingChange && onLoadingChange(false)
      } catch (err) {
        console.error("Error during preloading:", err)
        setError(err as any)
        setIsPreloading(false)
        onLoadingChange && onLoadingChange(false)
      }
    }

    preloadModels()

    return () => {
      Object.values(originalMaterials.current).forEach((mat) => mat?.dispose())
      defaultMaterial?.dispose()
      hoverMaterial?.dispose()
    }
  }, [envModelPath, gltfLoader, defaultMaterial, hoverMaterial, onLoadingChange])

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isPreloading)
    }
  }, [isPreloading, onLoadingChange])

  useEffect(() => {
    if (isPreloading || !groupRef.current || modalOpen) return

    // Create a DOM click handler that will raycast manually
    const handleClick = (event: MouseEvent) => {
      // Skip click handling if modal is open
      if (modalOpen) {
        return
      }

      event.preventDefault()

      // Calculate mouse position in normalized device coordinates
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Set up raycaster
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      // Find intersections with ALL objects in the scene
      const intersects = raycaster.intersectObjects(scene.children, true)

      debugLog("Total clickable objects:", clickableObjects.length)
      debugLog("Found intersections:", intersects.length)

      if (intersects.length > 0) {
        // Log the names of all objects that were hit
        debugLog(
          "Hit objects:",
          intersects.map((i) => i.object.name || "unnamed"),
        )

        // Check if the currently hovered object is in the intersection path
        if (hoveredFlat) {
          debugLog("Currently hovered object:", hoveredFlat.name)
          onFlatClick && onFlatClick(hoveredFlat)
          return
        }

        // If no hovered object is active, try to find a clickable object in the intersection path
        for (const intersect of intersects) {
          let current = intersect.object
          let depth = 0

          while (current && current !== scene && depth < 10) {
            const floorLevel = current.userData.floorLevel;
            // Check BOTH clickable AND hoverable flags
            if (current.userData.clickable === true && 
                current.userData.type === 'plan' && 
                current.userData.hoverable === true &&
                floorLevel === currentFloor) {
              debugLog("Found clickable plan object in hierarchy:", current.name);
              onFlatClick && onFlatClick(current);
              return;
            }
            if (!current.parent) break;
            current = current.parent;
            depth++;
          }
        }

        debugLog("No clickable object found in the hierarchy or not on current floor")
      } else {
        debugLog("No intersections found")
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [camera, clickableObjects, isPreloading, onFlatClick, scene, hoveredFlat, modalOpen, currentFloor])

  const updateFloorVisibility = useCallback((floor: number) => {
    if (!groupRef.current) return

    const newClickableObjects: THREE.Object3D[] = [];

    FLOORS.forEach((floorData) => {
      const level = floorData.level
      const structureModel = loadedModels.current.structures[level]
      const planModel = loadedModels.current.plans[level]

      if (floor === -1) {
        // Show all floors
        if (structureModel) structureModel.visible = true
        if (planModel) planModel.visible = true
        
        // Add only PLAN objects to clickable array
        if (floorMeshes[level]) {
          floorMeshes[level].forEach(mesh => {
            if (mesh.userData.type === 'plan') {
              newClickableObjects.push(mesh);
            }
          });
        }
      } else {
        // Only show structures up to current floor
        if (structureModel) structureModel.visible = level <= floor
        
        // Only show plan for current floor
        if (planModel) planModel.visible = level === floor
        
        // Only add current floor PLAN objects to clickable array
        if (level === floor && floorMeshes[level]) {
          floorMeshes[level].forEach(mesh => {
            if (mesh.userData.type === 'plan') {
              newClickableObjects.push(mesh);
            }
          });
        }
      }
    });

    console.log(`Floor ${floor} visibility updated. Clickable objects: ${newClickableObjects.length}`);
    setClickableObjects(newClickableObjects);
  }, [])

  useEffect(() => {
    if (!isPreloading) {
      updateFloorVisibility(currentFloor)
    }
  }, [currentFloor, isPreloading, updateFloorVisibility])

  // Fix 1: Modify the resetHoveredObject function to remove scale changes
  const resetHoveredObject = useCallback((obj: THREE.Object3D) => {
    if (!obj) return
    if (originalMaterials.current[obj.uuid] !== undefined) {
      if (obj instanceof THREE.Mesh) {
        obj.material = originalMaterials.current[obj.uuid]
      }
      delete originalMaterials.current[obj.uuid]
    }
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && originalMaterials.current[child.uuid] !== undefined) {
        child.material = originalMaterials.current[child.uuid]
        delete originalMaterials.current[child.uuid]
      }
    })
  }, [])

  // Alternative approach - modify useFrame to change how hover is applied
  useFrame(() => {
    // Skip hover effects if modal is open
    if (isPreloading || clickableObjects.length === 0 || !groupRef.current || modalOpen) {
      if (hoveredFlat) {
        resetHoveredObject(hoveredFlat)
        setHoveredFlat(null)
        setLabelPosition(null)
        setLabelContent(null)
      }
      return
    }

    try {
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(clickableObjects, true)

      let newHoveredFlat = null
      if (intersects.length > 0) {
        for (const intersect of intersects) {
          const obj = intersect.object
          // Add hoverable check here
          if (obj.userData.floorLevel === currentFloor && 
              obj.userData.type === 'plan' &&
              obj.userData.hoverable === true) { // Only hover if marked as hoverable
            newHoveredFlat = obj
            
            // Get the center point of the object instead of the intersection point
            const center = new THREE.Vector3();
            // Use the object's bounding box to find its center
            const bbox = new THREE.Box3().setFromObject(obj);
            bbox.getCenter(center);
            
            // Project the center position to screen coordinates
            center.project(camera);
            
            // Convert to CSS coordinates
            const canvas = canvasRef.current || document.querySelector('canvas');
            if (canvas) {
              const x = (center.x * 0.5 + 0.5) * canvas.clientWidth;
              const y = (-(center.y * 0.5) + 0.5) * canvas.clientHeight;
              
              // Update label position based on the object's center
              setLabelPosition({ x, y });
            }
            
            // Get property data from SPACE_DATA or provide default
            const flatName = obj.name
            const flatData = SPACE_DATA[flatName as keyof typeof SPACE_DATA] || {}
            const flatType = flatData.type || 'Apartment'
            const flatArea = flatData.area || 'N/A'
            
            // Set label content
            setLabelContent({ 
              type: flatType, 
              area: flatArea 
            })
            
            break
          }
        }
      }

      if (hoveredFlat !== newHoveredFlat) {
        // Reset old hover
        if (hoveredFlat) resetHoveredObject(hoveredFlat)
        
        // Hide label if nothing hovered
        if (!newHoveredFlat) {
          setLabelPosition(null)
          setLabelContent(null)
        }
        
        // Apply new hover effect
        if (newHoveredFlat) {
          newHoveredFlat.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Store original material
              originalMaterials.current[child.uuid] = child.material
              
              // Clone original material to preserve properties
              const newMat = child.material.clone()
              
              // Modify just the color to green while keeping other properties
              newMat.color.set(0x208720)
              newMat.emissive = new THREE.Color(0x8cedaf)
              newMat.emissiveIntensity = 0.5
              
              // Keep original transparency settings
              newMat.transparent = child.material.transparent
              newMat.opacity = child.material.opacity
              
              // Apply the modified material
              child.material = newMat
            }
          })
        }
        
        setHoveredFlat(newHoveredFlat)
      }
    } catch (err) {
      console.error("Error in interaction frame:", err)
    }
  })

  useEffect(() => {
    canvasRef.current = document.querySelector('canvas')
  }, [])

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]}>
      {/* Hover label */}
      {labelPosition && labelContent && !modalOpen && (
        <Html
          calculatePosition={() => [
            labelPosition.x, // Horizontal position at the flat's center
            labelPosition.y - 120, // Increased from -65 to -90 for higher position
            0
          ]}
          zIndexRange={[200, 200]}
          occlude={false}
          distanceFactor={undefined}
          style={{
            transition: 'all 0.15s ease-out',
            pointerEvents: 'none',
            transform: 'translate(-50%, 0)', // Center horizontally above the target point
          }}
        >
          <div className="relative flex flex-col items-center">
            <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-xl border border-green-500/30 text-white text-xs whitespace-nowrap">
              <div className="font-medium">{labelContent.type}</div>
              <div className="text-green-400 mt-0.5 text-[10px]">Total Area: {labelContent.area}</div>
            </div>
            
            {/* Pointer triangle */}
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black/80 -mb-[5px] mt-[1px]"></div>
            
            {/* Longer vertical line - increased height from 30px to 55px */}
            <div className="w-[1px] h-[55px] bg-green-400/70"></div>
            
            {/* Larger pulsing dot for better visibility */}
            <div className="relative w-[7px] h-[7px]">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full bg-green-400"></div>
            </div>
          </div>
        </Html>
      )}

      {isPreloading && (
        <Html fullscreen zIndexRange={[100, 100]}>
          <div className="fixed inset-0 bg-[#0b4d43]/80 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden z-[9999]">
            <div className="relative mb-12">
              <div className="animate-pulse">
                <img 
                  src="/images/logo.svg"
                  alt="Logo"
                  width={120} 
                  height={40}
                  className="brightness-0 invert opacity-90"
                />
              </div>
              <div className="absolute inset-0 filter blur-md opacity-40 animate-pulse" 
                   style={{animationDelay: "0.3s"}}>
                <img 
                  src="/images/logo.svg"
                  alt=""
                  width={120} 
                  height={40}
                  className="brightness-0 invert"
                />
              </div>
            </div>
            <div className="text-white/70 text-sm tracking-wider mb-16">
              LOADING ENVIRONMENT...
            </div>
            <div className="absolute bottom-12 w-48 h-[2px] bg-white/20 overflow-hidden rounded-full">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }} 
              />
            </div>
            <div className="absolute bottom-6 text-white/50 text-xs">
              {loadProgress}%
            </div>
          </div>
        </Html>
      )}

      {error && (
        <Html center>
          <div className="bg-red-700/90 text-white p-3 rounded-lg shadow-xl">
            <p className="font-medium">Error loading models</p>
            <p className="text-sm mt-1">Please refresh and try again</p>
          </div>
        </Html>
      )}
    </group>
  )
}