"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Clock, Navigation, ExternalLink, Building, Filter, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Loading from "../loading"; // Import the loading page

interface Landmark {
  nameArabic: string;
  nameEnglish: string;
  duration: string | null;
  durationInMinutes: number | null;
  details?: string[];
  category?: string; // Category for filtering
}

const categories = [
  { id: "all", label: "All" },
  { id: "shopping", label: "Shopping" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "masjid", label: "Masjid" },
  { id: "leisure", label: "Leisure" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "finance", label: "Financial Services" }
];

export default function LocationPage() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [filteredLandmarks, setFilteredLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageLoaded, setPageLoaded] = useState(false);

  // Wait for full page load (all resources)
  useEffect(() => {
    const handleLoad = () => setPageLoaded(true);
    if (document.readyState === "complete") {
      setPageLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  useEffect(() => {
    // Fetch landmarks data
    fetch('/nearby-landmaks.json')
      .then(res => res.json())
      .then(data => {
        setLandmarks(data.landmarks);
        setFilteredLandmarks(data.landmarks);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading landmarks:', err);
        setLoading(false);
      });
  }, []);

  // Apply filters when landmarks or activeFilter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredLandmarks(landmarks);
    } else {
      setFilteredLandmarks(
        landmarks.filter(landmark => landmark.category === activeFilter)
      );
    }
  }, [landmarks, activeFilter]);

  // Make the background override even stronger
  useEffect(() => {
    // More aggressive background fix
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, #__next, #__next > div, main, [data-nextjs-scroll-focus-boundary] {
        background-color: #f3f4f6 !important;
      }
    `;
    document.head.appendChild(style);
    
    document.documentElement.style.cssText = "background-color: #f3f4f6 !important";
    document.body.style.cssText = "background-color: #f3f4f6 !important";
    
    return () => {
      document.head.removeChild(style);
      document.documentElement.style.cssText = "";
      document.body.style.cssText = "";
    };
  }, []);

  // Show loading page until everything is loaded
  if (!pageLoaded) {
    return <Loading />;
  }

  return (
    <div style={{backgroundColor: "#f3f4f6 !important"}} className="min-h-screen">
      <div className="fixed inset-0 bg-gray-100 -z-10"></div>
      <div className="pt-10 md:pt-40 px-6 pb-6 max-w-7xl mx-auto bg-gray-100 min-h-screen"> 
      {/* <h1 className="text-3xl font-bold mb-6">Location Information</h1> */}
        
        {/* Google Map Section - WITHOUT filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="text-[#0b4d43] mr-2" size={24} />
            <h2 className="text-xl font-semibold text-[#0b4d43]">Interactive Map</h2>
          </div>
          
          {/* Increased height for mobile map */}
          <div className="rounded-lg overflow-hidden border border-gray-200 aspect-square sm:aspect-video">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d58.402560573914975!3d23.55712347216705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzI1LjYiTiA1OMKwMjQnMDkuMiJF!5e1!3m2!1sen!2som!4v1616613838404!5m2!1sen!2som"
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
          
          {/* Moved below the map and made more prominent on mobile */}
          <div className="mt-4 flex justify-center sm:justify-end">
            <Button 
              variant="outline" 
              className="flex items-center text-green-600 px-4 py-2 text-sm sm:text-base"
              onClick={() => window.open("https://maps.google.com/?q=23.55712347216705,58.402560573914975&t=k", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        </div>
        
        {/* Nearby Landmarks Section - WITH filters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Navigation className="text-[#0b4d43] mr-2" size={24} />
              <h2 className="text-xl font-semibold text-[#0b4d43]">Nearby Landmarks</h2>
            </div>
            
            {activeFilter !== "all" && (
              <Badge variant="outline" className="bg-gray-100">
                Showing: {categories.find(c => c.id === activeFilter)?.label}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setActiveFilter("all")} 
                />
              </Badge>
            )}
          </div>
          
          {/* MOVED: Map Filter Labels */}
          <div className="mb-6 flex flex-wrap gap-2 pb-4 border-b border-gray-100">
            <div className="flex items-center text-sm text-gray-700 mr-2">
              <Filter className="h-4 w-4 mr-1" /> 
              <span>Filter landmarks by:</span>
            </div>
            
            {categories.map(category => (
              <Badge
                key={category.id}
                variant={activeFilter === category.id ? "default" : "outline"}
                className={`cursor-pointer ${
                  activeFilter === category.id 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.label}
                {activeFilter === category.id && category.id !== "all" && (
                  <X className="h-3 w-3 ml-1 cursor-pointer" 
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveFilter("all");
                     }} 
                  />
                )}
              </Badge>
            ))}
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading landmarks...</div>
          ) : filteredLandmarks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No landmarks found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLandmarks.map((landmark, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <Building className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">{landmark.nameEnglish}</h3>
                      <p className="text-sm text-gray-600" dir="rtl">{landmark.nameArabic}</p>
                      
                      {landmark.duration && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{landmark.duration}</span>
                        </div>
                      )}
                      
                      {landmark.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {categories.find(c => c.id === landmark.category)?.label || landmark.category}
                        </Badge>
                      )}
                      
                      {landmark.details && landmark.details.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Includes:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {landmark.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-6 text-center text-sm text-gray-500">
            All travel times are approximate and may vary depending on traffic conditions.
          </div>
        </div>
      </div>
    </div>
  );
}