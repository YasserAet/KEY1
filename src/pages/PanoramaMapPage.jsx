import React, { useEffect } from 'react';
import { Pannellum } from 'pannellum-react';
import Sidebar from '../components/Sidebar';
import '../styles/PanoramaMapPage.css';

const PanoramaMapPage = () => {
  return (
    <div className="panorama-container">
      <Sidebar />
      
      <div className="map-content">
        <h2>360° Interactive Map</h2>
        
        <div className="panorama-viewer">
          <Pannellum
            width="100%"
            height="500px"
            image="/panorama-image.jpg"
            pitch={10}
            yaw={180}
            hfov={110}
            autoLoad
            onLoad={() => {
              console.log("360 panorama loaded");
            }}
          >
            {/* You can add hotspots here */}
            <Pannellum.Hotspot
              type="info"
              pitch={11}
              yaw={-167}
              text="Sample location"
              URL="#/location"
            />
          </Pannellum>
        </div>
        
        <div className="panorama-instructions">
          <p>Use your mouse to navigate the 360° view or click on hotspots to explore specific locations.</p>
        </div>
      </div>
    </div>
  );
};

export default PanoramaMapPage;
