// "use client"

// import { useState } from "react"
// import PremiumBuildingViewer from "../../components/premium-building-viewer"
// import Loading from "../loading" // Import the main loading component

// export default function Page() {
//   const [sceneReady, setSceneReady] = useState(false)

//   // Show loading screen until the scene signals it's completely ready
//   return (
//     <>
//       {!sceneReady && <Loading />}
//       <main className="flex min-h-screen flex-col items-center justify-between">
//         <PremiumBuildingViewer onSceneReady={() => setSceneReady(true)} />
//       </main>
//     </>
//   )
// }
"use client"

import PremiumBuildingViewer from "../../components/premium-building-viewer/index"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <PremiumBuildingViewer />
    </main>
  )
}