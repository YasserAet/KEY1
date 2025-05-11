"use client";

import { useState, useEffect } from "react"; // Add useEffect
import Image from "next/image";
import { ArrowLeft, ArrowRight, X, Grid, Rows, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mainImages = [
  // Building/ outer images
    { id: "b1", url: "/images/Gallery/B(1).jpg", alt: "Building image 1" },
    { id: "b2", url: "/images/Gallery/B(2).jpg", alt: "Building image 2" },
    { id: "b3", url: "/images/Gallery/B(3).jpg", alt: "Building image 3" },
    { id: "b4", url: "/images/Gallery/B(4).jpg", alt: "Building image 4" },
    { id: "b5", url: "/images/Gallery/B(5).jpg", alt: "Building image 5" },
    { id: "b6", url: "/images/Gallery/B(6).jpg", alt: "Building image 6" },
    { id: "b7", url: "/images/Gallery/B(7).jpg", alt: "Building image 7" },
    { id: "b8", url: "/images/Gallery/B(8).jpg", alt: "Building image 8" },
    { id: "b9", url: "/images/Gallery/B(9).jpg", alt: "Building image 9" },
    
    //LIYMLIGHT images
    { id: "l1", url: "/images/Gallery/L(1).jpg", alt: "Liymlight image 1" },
    { id: "l2", url: "/images/Gallery/L(2).jpg", alt: "Liymlight image 2" },
    { id: "l3", url: "/images/Gallery/L(3).jpg", alt: "Liymlight image 3" },
    { id: "l5", url: "/images/Gallery/L(5).jpg", alt: "Liymlight image 5" },
    { id: "l6", url: "/images/Gallery/L(6).jpg", alt: "Liymlight image 6" },
    { id: "l7", url: "/images/Gallery/L(7).jpg", alt: "Liymlight image 7" },
    { id: "l8", url: "/images/Gallery/L(8).jpg", alt: "Liymlight image 8" },
    { id: "l9", url: "/images/Gallery/L(9).jpg", alt: "Liymlight image 9" },
    { id: "l10", url: "/images/Gallery/L(10).jpg", alt: "Liymlight image 10" },
    { id: "l11", url: "/images/Gallery/L(11).jpg", alt: "Liymlight image 11" },
    { id: "l12", url: "/images/Gallery/L(12).jpg", alt: "Liymlight image 12" },
    
    //TERRACOTTA images
    // { id: "t1", url: "/images/Gallery/T(1).jpg", alt: "Terracotta image 1" },
    { id: "t2", url: "/images/Gallery/T(2).jpg", alt: "Terracotta image 2" },
    { id: "t3", url: "/images/Gallery/T(3).jpg", alt: "Terracotta image 3" },
    { id: "t4", url: "/images/Gallery/T(4).jpg", alt: "Terracotta image 4" },
    { id: "t5", url: "/images/Gallery/T(5).jpg", alt: "Terracotta image 5" },
    { id: "t6", url: "/images/Gallery/T(6).jpg", alt: "Terracotta image 6" },

    //LAVENDER images
    { id: "la1", url: "/images/Gallery/La(1).jpg", alt: "Lavander image 1" },
    { id: "la2", url: "/images/Gallery/La(2).jpg", alt: "Lavander image 2" },
    { id: "la3", url: "/images/Gallery/La(3).jpg", alt: "Lavander image 3" },
    { id: "la4", url: "/images/Gallery/La(4).jpg", alt: "Lavander image 4" },
    { id: "la5", url: "/images/Gallery/La(5).jpg", alt: "Lavander image 5" },
    { id: "la6", url: "/images/Gallery/La(6).jpg", alt: "Lavander image 6" }
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("terracotta");
  const [viewMode, setViewMode] = useState<"grid" | "rows">("grid");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [fade, setFade] = useState(true);

  // Add background fix just like in the location page
  useEffect(() => {
    // Apply background fix on mount
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

  // Add/remove a class to the body when lightbox is open
  useEffect(() => {
    if (selectedImage !== null) {
      document.body.classList.add('lightbox-active');
      
      // Hide the header/menu
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('lightbox-active');
      
      // Show the header/menu again
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('lightbox-active');
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  // Function to handle next/prev image in lightbox with fade animation
  const navigateImage = (direction: 'next' | 'prev') => {
    if (selectedImage === null || filteredImages.length === 0) return;

    setFade(false);
    setTimeout(() => {
      const newIndex = direction === 'next'
        ? (selectedImage + 1) % filteredImages.length
        : (selectedImage - 1 + filteredImages.length) % filteredImages.length;
      setSelectedImage(newIndex);
      setFade(true);
    }, 200);
  };

  // Handle image load error
  const handleImageError = (url: string) => {
    setImgError(prev => ({ ...prev, [url]: true }));
  };

  // Filtered images for current tab
  const filteredImages = mainImages.filter(img => {
    if (activeTab === 'terracotta') return img.url.includes("/T(");
    if (activeTab === 'key1') return img.url.includes("/B(");
    if (activeTab === 'liymlight') return img.url.includes("/L(");
    if (activeTab === 'lavender') return img.url.includes("/La(");
    return true;
  });

  return (
    <>
      {/* Background overlay to ensure no blue shows through */}
      <div className="fixed inset-0 bg-gray-100 -z-10"></div>
      
      <div className="p-3 sm:p-6 pt-10 sm:pt-[110px] max-w-7xl mx-auto bg-gray-100 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6 text-[#0b4d43]">Project Gallery</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-6 sm:mb-10">
          {/* Header area - stack on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <Tabs defaultValue="terracotta" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="terracotta" className="text-xs sm:text-sm py-1 px-1 sm:px-3">TERRACOTTA</TabsTrigger>
                <TabsTrigger value="key1" className="text-xs sm:text-sm py-1 px-1 sm:px-3">KEY1</TabsTrigger>
                <TabsTrigger value="liymlight" className="text-xs sm:text-sm py-1 px-1 sm:px-3">LIYMLIGHT</TabsTrigger>
                <TabsTrigger value="lavender" className="text-xs sm:text-sm py-1 px-1 sm:px-3">LAVENDER</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center self-end sm:self-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 ${viewMode === 'rows' ? 'bg-gray-100' : ''}`}
                onClick={() => setViewMode("rows")}
              >
                <Rows className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
          
          {/* Image Grid - 2 columns by default, 3 on medium, 4 on large screens */}
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4' 
              : 'flex flex-col space-y-2 sm:space-y-4'}
          `}>
            {filteredImages.map((image, index) => (
              <div 
                key={image.id} // Use id instead of url
                className={`
                  cursor-pointer overflow-hidden rounded-lg border border-gray-200
                  ${viewMode === 'grid' 
                    ? 'aspect-square' 
                    : 'w-full aspect-video'}
                `}
                onClick={() => !imgError[image.url] && setSelectedImage(index)}
              >
                <div className="relative w-full h-full group">
                  {!imgError[image.url] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(image.url)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-xs sm:text-sm">
                          View
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2 sm:p-4 text-center">
                      <ImageOff className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-1 sm:mb-2" />
                      <p className="text-gray-500 text-xs sm:text-sm">Image not available</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced Lightbox with improved styling */}
        {selectedImage !== null && filteredImages.length > 0 && selectedImage < filteredImages.length && (
          <div 
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-[90%] max-h-[90%] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent clicks on container from closing
            >
              {/* Close button - repositioned for better visibility */}
              <Button 
                variant="outline" 
                size="icon"
                className="absolute -top-12 right-0 z-[60] bg-white/10 text-white border-none hover:bg-white/20 h-10 w-10 rounded-full transition-all duration-200"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Centered image with enhanced styling */}
              <div className="group relative">
                <img 
                  src={filteredImages[selectedImage]?.url || ''}
                  alt={filteredImages[selectedImage]?.alt || ''}
                  className={`object-contain max-w-full max-h-[80vh] rounded-lg shadow-2xl transition-all duration-300 
                    ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                  onError={() => {
                    handleImageError(filteredImages[selectedImage]?.url || '');
                    setSelectedImage(null);
                  }}
                  onLoad={() => setFade(true)}
                />
                
                {/* Caption overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg">
                  <p className="text-white text-sm">{filteredImages[selectedImage]?.alt || ''}</p>
                </div>
              </div>
              
              {/* Lightbox Navigation Buttons - Updated to hide on mobile */}
              {/* Desktop navigation buttons - HIDDEN ON MOBILE */}
              <Button 
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[120%] bg-white/10 text-white border-none hover:bg-white/20 h-12 w-12 rounded-full transition-all duration-200 hidden sm:block"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[120%] bg-white/10 text-white border-none hover:bg-white/20 h-12 w-12 rounded-full transition-all duration-200 hidden sm:block"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
              
              {/* Mobile navigation (visible only on small screens) */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 sm:hidden">
                <Button 
                  variant="outline"
                  size="icon"
                  className="bg-black/50 text-white border-none hover:bg-black/80 h-12 w-12 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="icon"
                  className="bg-black/50 text-white border-none hover:bg-black/80 h-12 w-12 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}