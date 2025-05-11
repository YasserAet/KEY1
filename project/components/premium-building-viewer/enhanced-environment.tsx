"use client"
import { useMemo, useRef, useEffect } from "react"
import { ContactShadows } from "@react-three/drei"
import { 
  EffectComposer, 
  SMAA, 
  ToneMapping, 
  BrightnessContrast,
  Vignette
} from "@react-three/postprocessing"
import { ToneMappingMode, BlendFunction } from "postprocessing"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

export function EnhancedEnvironment({ quality = "low", isDayMode = true }) {
  // Define settings based on quality
  const { shadowResolution } = useMemo(() => {
    switch(quality) {
      case "high":
        return { shadowResolution: 2048 }
      case "medium":
        return { shadowResolution: 1024 }
      case "low":
      default:
        return { shadowResolution: 512 }
    }
  }, [quality]);

  // References for the main light
  const mainLightRef = useRef<THREE.DirectionalLight | null>(null)
  
  // Get Three.js context
  const { gl: renderer, camera } = useThree()
  
  // Set up physically accurate exposure and camera control
  useEffect(() => {
    // Renderer settings
    if (renderer) {
      // V-Ray style rendering settings
      // Removed invalid property 'useLegacyLights'
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = isDayMode ? 1.2 : 0.8; // Increased from 1.0/0.7
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Increase sharpness
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    // Fix camera position and properties
    if (camera) {
      // Check if device is mobile based on screen width
      const isMobile = window.innerWidth < 768;
      
      camera.position.set(15, 30, 15);
      camera.lookAt(0, 10, 0);
      
      // Set FOV based on device type
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = isMobile ? 60 : 35; // 50 for mobile, 35 for desktop
      }
      
      camera.updateProjectionMatrix();
      
      // Add resize listener to update FOV when orientation changes
      const handleResize = () => {
        const isMobileNow = window.innerWidth < 768;
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = isMobileNow ? 60 : 35;
          camera.updateProjectionMatrix();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
        if (renderer) {
          renderer.toneMapping = THREE.NoToneMapping;
          renderer.toneMappingExposure = 1.0;
        }
      };
    }
  }, [renderer, camera, isDayMode]);

  return (
    <>
      {/* Clean background */}
      <color attach="background" args={[isDayMode ? "#f5f5f5" : "#0a0e17"]} />
      
      {isDayMode ? (
        <>
          {/* Main sun light - moderate intensity */}
          <directionalLight
            ref={mainLightRef}
            position={[-2, 5, 3]} // Slightly adjusted position
            intensity={1.5} // Increased from 1.0 but not too high
            color="#ffffff" 
            castShadow
            shadow-mapSize={[shadowResolution, shadowResolution]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-bias={-0.0001}
          />
          
          {/* Increased ambient light for building visibility */}
          <hemisphereLight 
            intensity={0.3} // Increased from 0.1
            color="#ffffff" 
            groundColor="#e0e0e0" 
          />
          
          {/* Add a subtle fill light from another angle */}
          <directionalLight
            position={[5, 3, -2]}
            intensity={0.4}
            color="#f0f0ff" 
            castShadow={false} // No shadows from this light
          />
        </>
      ) : (
        <>
          {/* Night mode - simple lighting */}
          <directionalLight
            position={[5, 5, 2]}
            intensity={0.2}
            color="#a4c8ff"
            castShadow
            shadow-mapSize={[shadowResolution, shadowResolution]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          
          {/* Nighttime ambient */}
          <hemisphereLight 
            intensity={0.2} 
            color="#103060" 
            groundColor="#301a15" 
          />
        </>
      )}
      
      {/* Clean contact shadows */}
      <ContactShadows
        position={[0, -0.01, 0]}
        scale={120}
        blur={2}
        far={20}
        opacity={isDayMode ? 0.2 : 0.15}
        resolution={shadowResolution}
        color={isDayMode ? "#000a" : "#00086"}
      />
      
      {/* Minimal post-processing - just the essentials */}
      <EffectComposer>
        {/* Anti-aliasing for crisp edges */}
        <SMAA />
        
        {/* V-Ray style tone mapping */}
        <ToneMapping
          mode={ToneMappingMode.ACES_FILMIC}
          adaptive={false}
          resolution={512}
          middleGrey={0.7} // Reduced from 0.8 to brighten midtones
          maxLuminance={1.5} // Increased from 1.0 for better dynamic range
          adaptationRate={1.0}
        />

        {/* Better balance of brightness/contrast */}
        <BrightnessContrast
          brightness={0.01} // Increased slightly from 0.01
          contrast={0.08} // Reduced slightly from 0.05 to avoid washing out whites
        />

         {/* Add white vignette effect */}
          <Vignette
            offset={1}  // Distance of effect from center (0.5 = starts halfway to edges)
            darkness={-5}  // Negative values create a white vignette instead of dark
            eskil={false}  // Use simple vignette algorithm
            blendFunction={BlendFunction.SCREEN}  // Screen blend mode for white vignette
          />
      </EffectComposer>
    </>
  )
}