"use client"

import { useRef } from "react"
import * as THREE from "three"
import { useHelper } from "@react-three/drei"
import { DirectionalLightHelper } from "three"

export function EnhancedLighting({ showHelpers = false, isDayMode = true }) {
  const lightRef = useRef<THREE.DirectionalLight | null>(null)

  useHelper(showHelpers ? (lightRef as React.RefObject<THREE.Object3D>) : null, DirectionalLightHelper, 1, "#ffcc00")

  return (
    <>
      {isDayMode ? (
        <>
          <ambientLight intensity={0.5} color="#fffaf0" />
          <directionalLight
            ref={lightRef}
            position={[10, 20, 10]}
            intensity={1.2}
            color="#fff5e6"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight position={[-10, 10, -5]} intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.2} />
          <hemisphereLight args={["#ffffff", "#f0f0f0", 0.6]} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.1} color="#e6f0ff" />
          <directionalLight
            ref={lightRef}
            position={[10, 20, 10]}
            intensity={0.2}
            color="#e6f0ff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[0, 15, 0]} intensity={0.3} color="#4169e1" />
          <pointLight position={[20, 5, 20]} intensity={0.15} color="#a7c5ff" />
        </>
      )}
    </>
  )
}
