// Define space data - in a real app, this might come from an API
export const SPACE_DATA = {
  // Flats with descriptive data
  "flat-01.001": { id: "01.001", floor: 1, type: "2BHK", area: "850 sq ft", price: "$145,000", status: "Available" },
  "flat-01.002": { id: "01.002", floor: 1, type: "1BHK", area: "650 sq ft", price: "$125,000", status: "Sold" },
  "flat-01.003": { id: "01.003", floor: 1, type: "3BHK", area: "1100 sq ft", price: "$185,000", status: "Available" },
  "flat-01.004": { id: "01.004", floor: 1, type: "2BHK", area: "850 sq ft", price: "$150,000", status: "Reserved" },
  "flat-01.005": { id: "01.005", floor: 1, type: "1BHK", area: "650 sq ft", price: "$130,000", status: "Available" },
  "flat-01.006": { id: "01.006", floor: 1, type: "3BHK", area: "1100 sq ft", price: "$190,000", status: "Available" },
  "flat-01.007": { id: "01.007", floor: 1, type: "2BHK", area: "900 sq ft", price: "$155,000", status: "Sold" },

  // 2nd floor flats
  "flat-02.001": { id: "02.001", floor: 2, type: "2BHK", area: "850 sq ft", price: "$155,000", status: "Available" },
  "flat-02.002": { id: "02.002", floor: 2, type: "1BHK", area: "650 sq ft", price: "$135,000", status: "Available" },
  "flat-02.003": { id: "02.003", floor: 2, type: "3BHK", area: "1100 sq ft", price: "$195,000", status: "Reserved" },
  "flat-02.004": { id: "02.004", floor: 2, type: "2BHK", area: "850 sq ft", price: "$160,000", status: "Available" },
  "flat-02.005": { id: "02.005", floor: 2, type: "1BHK", area: "650 sq ft", price: "$140,000", status: "Sold" },
  "flat-02.006": { id: "02.006", floor: 2, type: "3BHK", area: "1100 sq ft", price: "$200,000", status: "Available" },

  // Continue similar entries for floors 3-6...
  "flat-03.001": { id: "03.001", floor: 3, type: "2BHK", area: "850 sq ft", price: "$165,000", status: "Available" },
  "flat-03.002": { id: "03.002", floor: 3, type: "1BHK", area: "650 sq ft", price: "$145,000", status: "Sold" },
  "flat-03.003": { id: "03.003", floor: 3, type: "3BHK", area: "1100 sq ft", price: "$205,000", status: "Available" },

  // Commercial spaces
  "SHOP-01.000": {
    id: "SHOP-01",
    floor: 0,
    type: "Retail Space",
    area: "450 sq ft",
    price: "$220,000",
    status: "Available",
  },
  "SHOP-02.000": {
    id: "SHOP-02",
    floor: 0,
    type: "Retail Space",
    area: "500 sq ft",
    price: "$240,000",
    status: "Reserved",
  },
  "SHOP-03.000": {
    id: "SHOP-03",
    floor: 0,
    type: "Retail Space",
    area: "520 sq ft",
    price: "$250,000",
    status: "Available",
  },
  "SHOP-04.000": {
    id: "SHOP-04",
    floor: 0,
    type: "Retail Space",
    area: "480 sq ft",
    price: "$230,000",
    status: "Sold",
  },
  "SHOP-05.000": {
    id: "SHOP-05",
    floor: 0,
    type: "Retail Space",
    area: "550 sq ft",
    price: "$270,000",
    status: "Available",
  },
  "SHOP-06.000": {
    id: "SHOP-06",
    floor: 0,
    type: "Retail Space",
    area: "600 sq ft",
    price: "$290,000",
    status: "Available",
  },
  "SHOP-07.000": {
    id: "SHOP-07",
    floor: 0,
    type: "Retail Space",
    area: "500 sq ft",
    price: "$245,000",
    status: "Reserved",
  },
  "SHOP-08.000": {
    id: "SHOP-08",
    floor: 0,
    type: "Retail Space",
    area: "520 sq ft",
    price: "$255,000",
    status: "Available",
  },

  // Common areas with descriptive info
  "LOBBY.000": {
    id: "LOBBY",
    floor: 0,
    type: "Common Area",
    description: "Main building lobby with reception and waiting area",
  },
  "ENTRANCE.000": { id: "ENTRANCE", floor: 0, type: "Common Area", description: "Main entrance to the building" },
  "ENTRANCE0.000": { id: "ENTRANCE0", floor: 0, type: "Common Area", description: "Secondary entrance" },
  "ENT LOBBY.000": { id: "ENT LOBBY", floor: 0, type: "Common Area", description: "Entrance lobby area" },
  "HALL WAY.000": { id: "HALL WAY-G", floor: 0, type: "Common Area", description: "Ground floor hallway" },
  "HALL WAY.001": { id: "HALL WAY-1", floor: 1, type: "Common Area", description: "First floor hallway" },
  "HALL WAY.002": { id: "HALL WAY-2", floor: 2, type: "Common Area", description: "Second floor hallway" },
  "HALL WAY.003": { id: "HALL WAY-3", floor: 3, type: "Common Area", description: "Third floor hallway" },
  "HALL WAY.004": { id: "HALL WAY-4", floor: 4, type: "Common Area", description: "Fourth floor hallway" },
  "HALL WAY.005": { id: "HALL WAY-5", floor: 5, type: "Common Area", description: "Fifth floor hallway" },
  "HALL WAY.006": { id: "HALL WAY-6", floor: 6, type: "Common Area", description: "Sixth floor hallway" },
  "ELECTRICAL RM.000": {
    id: "ELECTRICAL RM",
    floor: 0,
    type: "Utility",
    description: "Electrical room with main distribution panel",
  },
  "GUARD ROOM.000": { id: "GUARD ROOM", floor: 0, type: "Security", description: "24/7 security guard station" },
  "GARBAGE.000": { id: "GARBAGE", floor: 0, type: "Utility", description: "Waste management area" },
  "TELECOM.000": { id: "TELECOM", floor: 0, type: "Utility", description: "Telecommunications equipment room" },
  "GROUND1.000": { id: "GROUND1", floor: 0, type: "Common Area", description: "Ground floor common area" },
}

// Define floor structure
export const FLOORS = [
  { id: "ground", name: "GROUND FLOOR", level: 0 },
  { id: "first", name: "FIRST FLOOR", level: 1 },
  { id: "second", name: "SECOND FLOOR", level: 2 },
  { id: "third", name: "THIRD FLOOR", level: 3 },
  { id: "fourth", name: "FOURTH FLOOR", level: 4 },
  { id: "fifth", name: "FIFTH FLOOR", level: 5 },
  { id: "penthouse", name: "PENTHOUSE FLOOR", level: 6 },
  { id: "terrace", name: "TERRACE FLOOR", level: 7 },
]

// Array of specific scene objects to find and control visibility
export const TARGET_SCENE_OBJECTS = [
  "ELECTRICAL RM.000",
  "ENT LOBBY.000",
  "ENTRANCE.000",
  "ENTRANCE0.000",
  "ENV",
  "flat-01.001",
  "flat-01.002",
  "flat-01.003",
  "flat-01.004",
  "flat-01.005",
  "flat-01.006",
  "flat-01.007",
  "flat-02.001",
  "flat-02.002",
  "flat-02.003",
  "flat-02.004",
  "flat-02.005",
  "flat-02.006",
  "flat-03.001",
  "flat-03.002",
  "flat-03.003",
  "flat-03.004",
  "flat-03.005",
  "flat-03.006",
  "flat-04.001",
  "flat-04.002",
  "flat-04.003",
  "flat-04.004",
  "flat-04.005",
  "flat-04.006",
  "flat-05.001",
  "flat-05.002",
  "flat-05.003",
  "flat-05.004",
  "flat-05.005",
  "flat-05.006",
  "flat-06.001",
  "flat-06.002",
  "flat-06.003",
  "flat-06.004",
  "flat-06.005",
  "flat-06.006",
  "GARBAGE.000",
  "GUARD ROOM.000",
  "HALL WAY.000",
  "HALL WAY.001",
  "HALL WAY.002",
  "HALL WAY.003",
  "HALL WAY.004",
  "HALL WAY.005",
  "HALL WAY.006",
  "LOBBY.000",
  "GROUND1.000",
  "SHOP-01.000",
  "SHOP-02.000",
  "SHOP-03.000",
  "SHOP-04.000",
  "SHOP-05.000",
  "SHOP-06.000",
  "SHOP-07.000",
  "SHOP-08.000",
  "TELECOM.000",
]

// Group objects by floor based on suffix
export const FLOOR_OBJECTS = {
  0: [
    // GROUND FLOOR (.000)
    "ELECTRICAL RM.000",
    "ENT LOBBY.000",
    "ENTRANCE.000",
    "ENTRANCE0.000",
    "GARBAGE.000",
    "GUARD ROOM.000",
    "HALL WAY.000",
    "LOBBY.000",
    "GROUND1.000",
    "SHOP-01.000",
    "SHOP-02.000",
    "SHOP-03.000",
    "SHOP-04.000",
    "SHOP-05.000",
    "SHOP-06.000",
    "SHOP-07.000",
    "SHOP-08.000",
    "TELECOM.000",
  ],
  1: [
    // FIRST FLOOR (.001)
    "HALL WAY.001",
    "flat-01.001",
    "flat-02.001",
    "flat-03.001",
    "flat-04.001",
    "flat-05.001",
    "flat-06.001",
  ],
  2: [
    // SECOND FLOOR (.002)
    "HALL WAY.002",
    "flat-01.002",
    "flat-02.002",
    "flat-03.002",
    "flat-04.002",
    "flat-05.002",
    "flat-06.002",
  ],
  3: [
    // THIRD FLOOR (.003)
    "HALL WAY.003",
    "flat-01.003",
    "flat-02.003",
    "flat-03.003",
    "flat-04.003",
    "flat-05.003",
    "flat-06.003",
  ],
  4: [
    // FOURTH FLOOR (.004)
    "HALL WAY.004",
    "flat-01.004",
    "flat-02.004",
    "flat-03.004",
    "flat-04.004",
    "flat-05.004",
    "flat-06.004",
  ],
  5: [
    // FIFTH FLOOR (.005)
    "HALL WAY.005",
    "flat-01.005",
    "flat-02.005",
    "flat-03.005",
    "flat-04.005",
    "flat-05.005",
    "flat-06.005",
  ],
  6: [
    // PENTHOUSE FLOOR (.006)
    "HALL WAY.006",
    "flat-01.006",
    "flat-02.006",
    "flat-03.006",
    "flat-04.006",
    "flat-05.006",
    "flat-06.006",
  ],
  7: [
    // TERRACE FLOOR (.007)
    "flat-00.007",
  ],
}

// Helper function to get floor level from object name
export function getFloorLevel(name: string) {
  if (!name) return null

  // Check for flat pattern (flat-XX)
  if (name.includes("flat-")) {
    const match = name.match(/flat-(\d+)/i)
    if (match) {
      return Number.parseInt(match[1], 10)
    }
  }

  // Check for suffix pattern (.000, .001, etc.)
  const suffixMatch = name.match(/\.(\d{3})$/)
  if (suffixMatch) {
    return Number.parseInt(suffixMatch[1], 10)
  }

  // Check for shop pattern (shop-XX)
  if (name.includes("shop-")) {
    return 0 // Shops are on ground floor
  }

  // Check for floor/level in name
  if (name.toLowerCase().includes("ground")) return 0
  if (name.toLowerCase().includes("first")) return 1
  if (name.toLowerCase().includes("second")) return 2
  if (name.toLowerCase().includes("third")) return 3
  if (name.toLowerCase().includes("fourth")) return 4
  if (name.toLowerCase().includes("fifth")) return 5
  if (name.toLowerCase().includes("sixth")) return 6
  if (name.toLowerCase().includes("penthouse")) return 6
  if (name.toLowerCase().includes("terrace")) return 7

  // Check for numeric indicators
  const levelMatch = name.match(/level[_\s-]?(\d+)/i) || name.match(/floor[_\s-]?(\d+)/i) || name.match(/f(\d+)/i)
  if (levelMatch) {
    return Number.parseInt(levelMatch[1], 10)
  }

  // Check if the object is in SPACE_DATA
  if (SPACE_DATA[name as keyof typeof SPACE_DATA]) {
    if (name in SPACE_DATA) {
        return SPACE_DATA[name as keyof typeof SPACE_DATA].floor;
    }
    return null;
  }

  // Default to ground floor if no pattern matches
  return 0
}

// Helper function to determine if an object is a room/flat
export function isRoomOrFlat(name: string) {
  if (!name) return false

  // Check if it's a flat
  if (name.toLowerCase().includes("flat")) return true

  // Check if it's a shop
  if (name.toLowerCase().includes("shop")) return true

  // Check if it's in SPACE_DATA and has a type
  if (
    SPACE_DATA[name as keyof typeof SPACE_DATA] &&
    ((name in SPACE_DATA && SPACE_DATA[name as keyof typeof SPACE_DATA].type === "2BHK") ||
      SPACE_DATA[name as keyof typeof SPACE_DATA].type === "1BHK" ||
      SPACE_DATA[name as keyof typeof SPACE_DATA].type === "3BHK" ||
      SPACE_DATA[name as keyof typeof SPACE_DATA].type === "Retail Space")
  ) {
    return true
  }

  return false
}

// Helper function to determine if an object is a structural element
export function isStructuralElement(name: string) {
  if (!name) return false

  // Common structural elements
  const structuralKeywords = [
    "wall",
    "floor",
    "ceiling",
    "roof",
    "column",
    "beam",
    "stair",
    "foundation",
    "structure",
    "frame",
    "support",
    "pillar",
  ]

  // Check for structural keywords
  for (const keyword of structuralKeywords) {
    if (name.toLowerCase().includes(keyword)) return true
  }

  // Check if it's a common area in SPACE_DATA
  if (SPACE_DATA[name as keyof typeof SPACE_DATA] && SPACE_DATA[name as keyof typeof SPACE_DATA].type === "Common Area") {
    return true
  }

  // Check for common areas by name
  const commonAreaKeywords = ["hall", "lobby", "entrance", "corridor", "way", "room", "area"]

  for (const keyword of commonAreaKeywords) {
    if (name.toLowerCase().includes(keyword)) return true
  }

  return false
}

// Helper function to extract floor level from object name
export function getFloorLevelFromName(name: string) {
  const match = name.match(/(\d+)$/) // Matches trailing digits
  if (match) {
    return Number.parseInt(match[1], 10)
  }
  return null // Or a default value if no match is found
}
