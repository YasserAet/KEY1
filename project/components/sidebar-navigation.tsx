"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Globe, Eye, MapPin, Home, Image as ImageIcon, Layers, Menu, X } from "lucide-react"

// Define colors based on the logo
const brandGreen = "#0b4d43"; // Brand green color
const logoAccentColor = "#ffffff"; // White for contrast

export default function SidebarNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Determine which pages get special treatment (green logo and gradient fade)
  const isSpecialPage = pathname === "/location" || pathname === "/gallery" || pathname === "/Floors"
  const desktopLogoSrc = isSpecialPage ? "/images/logo_green.svg" : "/images/logo.svg"
  const mobileLogoSrc = "/images/logo.svg" // Always use the standard logo for mobile
  
  // Only apply the hue-rotate filter to the regular logo, not the green one
  const desktopLogoStyle = isSpecialPage ? {} : { filter: `hue-rotate(160deg) saturate(100%)` }
  const mobileLogoStyle = { filter: `hue-rotate(160deg) saturate(100%)` } // Always apply filter on mobile
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: "/map", label: "Map", icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { href: "/cyclorama", label: "Cyclorama", icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { href: "/location", label: "Location", icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { href: "/projects", label: "Projects", icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { href: "/gallery", label: "Gallery", icon: <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { href: "/Floors", label: "Floors", icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <div className="fixed top-0 left-0 right-0 z-[9999] hidden md:block">
        {/* White gradient fade for desktop menu - INCREASED HEIGHT */}
        {isSpecialPage && (
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white to-transparent pointer-events-none z-[-1]"></div>
        )}

        <div className="w-full flex items-center justify-between py-2 px-3 lg:py-3 lg:px-6 relative z-[1]">
          {/* Desktop logo */}
          <div className="ml-2 sm:ml-4 md:ml-6 lg:ml-8">
            <Image
              src={desktopLogoSrc}
              alt="Logo"
              width={40}
              height={16}
              className="object-contain w-[40px] md:w-[50px] lg:w-[60px]" 
              style={desktopLogoStyle}
              priority
            />
          </div>
          
          {/* Navigation Links - more compact on smaller screens */}
          <div className="flex gap-1 md:gap-2 lg:gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group relative flex items-center gap-1 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-2.5 rounded-full transition-all duration-300
                  ${pathname === link.href 
                    ? "bg-white text-[#0b4d43] shadow-lg" 
                    : "bg-[#0b4d43]/70 text-white hover:bg-[#0b4d43] hover:shadow"}
                `}
              >
                <span className={`
                  relative z-10 transition-colors duration-300
                  ${pathname === link.href ? 'text-[#0b4d43]' : 'text-white'}
                `}>
                  {link.icon}
                </span>
                
                <span className={`
                  relative z-10 text-[10px] md:text-xs font-medium
                  ${pathname === link.href ? 'text-[#0b4d43]' : ''}
                `}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{ backgroundColor: brandGreen }} 
        className="fixed top-3 right-3 z-[10000] p-2 text-white rounded-full shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* White gradient fade for mobile menu - EXCLUDING GALLERY, LOCATION & FLOORS PAGES */}
      {(isSpecialPage && pathname !== "/gallery" && pathname !== "/location" && pathname !== "/Floors" && !isMobileMenuOpen) && (
        <div className="fixed top-0 inset-x-0 h-24 bg-gradient-to-b from-white via-white to-transparent pointer-events-none z-[9990] md:hidden"></div>
      )}
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md md:hidden">
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[280px] py-3">
            {/* Mobile logo */}
            <div className="mb-4 sm:mb-6">
              <Image
                src={mobileLogoSrc}
                alt="Logo"
                width={80}
                height={30}
                className="object-contain" 
                style={mobileLogoStyle}
              />
            </div>
            
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-3 rounded-lg w-full
                  transition-all duration-300
                  ${pathname === link.href 
                    ? "bg-white text-[#0b4d43]"
                    : "bg-[#0b4d43]/70 text-white hover:bg-[#0b4d43]"}
                `}
              >
                <span className={pathname === link.href ? "text-[#0b4d43]" : "text-white"}>
                  {link.icon}
                </span>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}