// =========================================================================
// MARKET MONOPOLY · OFFICIAL KARACHI PROPERTY CATALOGUE & UTILITIES DATA
// Document Source: Market_Monopoly_Property_Upgrade_System.docx
// 25 properties • 3 upgrade levels • 15 utility types • All values in PKR Lakhs
// =========================================================================

export const STARTING_BUDGET_LAKH = 500; // Rs 5 Crore (500 Lakh)

export const KARACHI_UTILITIES = [
  { id: 1, name: "Electricity", cost: 12, category: "Power", summary: "Reliable power for homes and businesses." },
  { id: 2, name: "Water Supply", cost: 7, category: "Water", summary: "More consistent water access." },
  { id: 3, name: "Natural Gas", cost: 7, category: "Energy", summary: "Cooking/heating supply." },
  { id: 4, name: "Internet / Wi-Fi", cost: 5, category: "Comms", summary: "Digital access and business connectivity." },
  { id: 5, name: "Sewerage System", cost: 6, category: "Sanitation", summary: "Drainage and sanitation." },
  { id: 6, name: "Car Parking Space", cost: 4, category: "Access", summary: "Dedicated parking capacity." },
  { id: 7, name: "Garbage Collection", cost: 2, category: "Sanitation", summary: "Cleaner, better-managed waste." },
  { id: 8, name: "Mobile Network", cost: 2, category: "Comms", summary: "Reliable mobile signal." },
  { id: 9, name: "Solar Panels", cost: 5, category: "Power", summary: "Renewable energy; reduces power-risk theme." },
  { id: 10, name: "CCTV Cameras", cost: 5, category: "Security", summary: "Security monitoring." },
  { id: 11, name: "Geyser", cost: 3, category: "Energy", summary: "Hot-water access." },
  { id: 12, name: "Public Transport Service", cost: 3, category: "Access", summary: "Better access to public transit." },
  { id: 13, name: "Road Maintenance", cost: 5, category: "Access", summary: "Safer, smoother access roads." },
  { id: 14, name: "Burglary Alarm", cost: 2, category: "Security", summary: "Intrusion warning system." },
  { id: 15, name: "Surge Protection System", cost: 2, category: "Power", summary: "Protects electronics from voltage surges." },
];

export const KARACHI_PROPERTIES = [
  {
  "id": 1,
  "name": "DHA Phase 6",
  "category": "Residential",
  "zone": "South Coastal",
  "openingValue": 180,
  "level3Target": 285,
  "targetValues": [
    180,
    205,
    240,
    285
  ],
  "upgradeCosts": [
    12,
    18,
    25
  ],
  "rentValues": [
    22,
    33,
    48,
    71
  ],
  "challengeTheme": "Water pressure and supply interruptions.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 2
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 2
      }
    ]
  },
  "importance": "An established residential neighborhood with restaurants, schools, and modern family amenities.",
  "valueReason": "Positioned as a top-tier residential holding with strong demand from families and professionals.",
  "problems": "Water pressure and supply interruptions. Water pressure drops, power maintenance issues, and a high buying cost if a team bids too much.",
  "benefits": "Strong neighborhood reputation, great dining and school access, and high resale appeal."
},
  {
  "id": 2,
  "name": "Clifton Block 5",
  "category": "Residential",
  "zone": "South Coastal",
  "openingValue": 165,
  "level3Target": 270,
  "targetValues": [
    165,
    190,
    225,
    270
  ],
  "upgradeCosts": [
    11,
    17,
    24
  ],
  "rentValues": [
    20,
    30,
    45,
    68
  ],
  "challengeTheme": "Water supply, drainage and coastal wear.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 11,
        "utilityName": "Geyser",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 2
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      }
    ]
  },
  "importance": "A well-known coastal district close to shopping malls, offices, and dining spots.",
  "valueReason": "Reflects prime coastal land, solid building quality, and high tenant demand.",
  "problems": "Water supply, drainage and coastal wear. Water supply and drainage issues, sea air corrosion on fixtures, and busy street parking.",
  "benefits": "Close to the beach and major shopping centers with steady interest from corporate tenants."
},
  {
  "id": 3,
  "name": "Gulshan-e-Iqbal Block 13-D",
  "category": "Residential",
  "zone": "Central East",
  "openingValue": 95,
  "level3Target": 170,
  "targetValues": [
    95,
    115,
    140,
    170
  ],
  "upgradeCosts": [
    7,
    11,
    16
  ],
  "rentValues": [
    11,
    18,
    28,
    42
  ],
  "challengeTheme": "Traffic congestion and ageing infrastructure.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "A large, central neighborhood surrounded by universities, hospitals, and busy markets.",
  "valueReason": "Mid-range price backed by everyday family and student housing demand.",
  "problems": "Traffic congestion and ageing infrastructure. School and rush-hour traffic jams, aging pipes, and uneven street parking.",
  "benefits": "Easy access to schools, hospitals, and shopping at a fair entry price."
},
  {
  "id": 4,
  "name": "North Nazimabad Block H",
  "category": "Residential",
  "zone": "North Central",
  "openingValue": 100,
  "level3Target": 175,
  "targetValues": [
    100,
    120,
    145,
    175
  ],
  "upgradeCosts": [
    7,
    11,
    16
  ],
  "rentValues": [
    12,
    19,
    29,
    44
  ],
  "challengeTheme": "Drainage and road upkeep.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 11,
        "utilityName": "Geyser",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "A classic family neighborhood with wide streets, markets, and community parks.",
  "valueReason": "Offers a comfortable entry point with strong upside when upgraded to Level 3.",
  "problems": "Drainage and road upkeep. Blocked drains during heavy rain and worn road surfaces.",
  "benefits": "Quiet family character, local markets nearby, and low starting cost."
},
  {
  "id": 5,
  "name": "PECHS Block 2",
  "category": "Residential",
  "zone": "Central Heart",
  "openingValue": 125,
  "level3Target": 215,
  "targetValues": [
    125,
    150,
    180,
    215
  ],
  "upgradeCosts": [
    9,
    14,
    20
  ],
  "rentValues": [
    15,
    24,
    36,
    54
  ],
  "challengeTheme": "Parking pressure and older utility lines.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 11,
        "utilityName": "Geyser",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ]
  },
  "importance": "Right in the center of Karachi, connecting homes with major office corridors and shops.",
  "valueReason": "Priced above Gulshan and Nazimabad because of its central location.",
  "problems": "Parking pressure and older utility lines. Street congestion during school and office hours, and high renovation costs.",
  "benefits": "Quick connections to Tariq Road and Shahrah-e-Faisal with steady tenant demand."
},
  {
  "id": 6,
  "name": "Bahadurabad",
  "category": "Commercial",
  "zone": "Central East",
  "openingValue": 115,
  "level3Target": 205,
  "targetValues": [
    115,
    140,
    170,
    205
  ],
  "upgradeCosts": [
    8,
    13,
    19
  ],
  "rentValues": [
    14,
    22,
    34,
    51
  ],
  "challengeTheme": "Parking shortages and peak-hour congestion.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "A lively commercial hub famed for sweets, restaurants, and apparel shopping.",
  "valueReason": "Popular commercial holding supported by loyal shoppers and high footfall.",
  "problems": "Parking shortages and peak-hour congestion. Heavy evening parking problems and aging drainage.",
  "benefits": "Nonstop evening footfall and high retail shop occupancy."
},
  {
  "id": 7,
  "name": "Saddar / Empress Market",
  "category": "Commercial",
  "zone": "South Historic",
  "openingValue": 90,
  "level3Target": 165,
  "targetValues": [
    90,
    110,
    135,
    165
  ],
  "upgradeCosts": [
    6,
    10,
    15
  ],
  "rentValues": [
    11,
    18,
    27,
    41
  ],
  "challengeTheme": "Crowded streets, parking and waste management.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ]
  },
  "importance": "The heart of Old Karachi retail and wholesale markets with massive daily footfall.",
  "valueReason": "Accessible commercial price with high daily rental turnover.",
  "problems": "Crowded streets, parking and waste management. Heavy traffic jams, tight delivery lanes, and aging colonial infrastructure.",
  "benefits": "Constant buyer crowds from every part of Karachi."
},
  {
  "id": 8,
  "name": "Tariq Road",
  "category": "Commercial",
  "zone": "Central Commercial",
  "openingValue": 110,
  "level3Target": 200,
  "targetValues": [
    110,
    135,
    165,
    200
  ],
  "upgradeCosts": [
    8,
    13,
    19
  ],
  "rentValues": [
    13,
    22,
    33,
    50
  ],
  "challengeTheme": "Traffic, parking and heavy footfall.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "One of Karachi's busiest retail avenues for fashion, jewelry, and electronics.",
  "valueReason": "High customer flow creates strong and steady rental power.",
  "problems": "Traffic, parking and heavy footfall. Parking shortages and rush-hour traffic slowdowns.",
  "benefits": "Top retail reputation that easily attracts big fashion brands."
},
  {
  "id": 9,
  "name": "Shahrah-e-Faisal Business District",
  "category": "Commercial",
  "zone": "Corporate Spine",
  "openingValue": 150,
  "level3Target": 265,
  "targetValues": [
    150,
    180,
    220,
    265
  ],
  "upgradeCosts": [
    10,
    16,
    23
  ],
  "rentValues": [
    18,
    29,
    44,
    66
  ],
  "challengeTheme": "Traffic congestion and power reliability.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 2
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 2
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ]
  },
  "importance": "Karachi's main business corridor housing banks, software houses, and airline offices.",
  "valueReason": "Premium corporate value driven by international and national headquarters.",
  "problems": "Traffic congestion and power reliability. Traffic jams during office peak hours and limited parking slots.",
  "benefits": "High corporate rents, prestigious business address, and steady demand."
},
  {
  "id": 10,
  "name": "Korangi Industrial Area",
  "category": "Commercial / Industrial",
  "zone": "South-East Industrial",
  "openingValue": 105,
  "level3Target": 195,
  "targetValues": [
    105,
    130,
    160,
    195
  ],
  "upgradeCosts": [
    8,
    12,
    18
  ],
  "rentValues": [
    13,
    21,
    32,
    49
  ],
  "challengeTheme": "Industrial waste, drainage and power demand.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 2
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ]
  },
  "importance": "Karachi's export powerhouse with leather, textile, chemical, and pharma plants.",
  "valueReason": "Large industrial plots with high cash-flow factories and workshops.",
  "problems": "Industrial waste, drainage and power demand. Industrial waste, heavy truck road wear, and reliable power demands.",
  "benefits": "High productivity hub generating steady industrial revenue."
},
  {
  "id": 11,
  "name": "SITE Industrial Area",
  "category": "Commercial / Industrial",
  "zone": "West Industrial",
  "openingValue": 100,
  "level3Target": 190,
  "targetValues": [
    100,
    125,
    155,
    190
  ],
  "upgradeCosts": [
    7,
    12,
    17
  ],
  "rentValues": [
    12,
    20,
    31,
    48
  ],
  "challengeTheme": "Road wear, drainage and utility reliability.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 2
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ]
  },
  "importance": "Karachi's oldest and largest industrial estate with massive manufacturing capacity.",
  "valueReason": "Established manufacturing base close to city transit lines.",
  "problems": "Road wear, drainage and utility reliability. Heavy truck traffic, aging water mains, and gas pressure drops.",
  "benefits": "Reliable factory tenant demand and high industrial rent yields."
},
  {
  "id": 12,
  "name": "Malir Cantt",
  "category": "Residential",
  "zone": "East Residential",
  "openingValue": 135,
  "level3Target": 235,
  "targetValues": [
    135,
    160,
    195,
    235
  ],
  "upgradeCosts": [
    9,
    14,
    21
  ],
  "rentValues": [
    16,
    26,
    39,
    59
  ],
  "challengeTheme": "Connectivity and access to services vary by location.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 11,
        "utilityName": "Geyser",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "Rapidly expanding township with family homes, wedding halls, and universities.",
  "valueReason": "Affordable entry price with fast-growing tenant demand.",
  "problems": "Connectivity and access to services vary by location. Water supply dependence on tankers and summer load shedding.",
  "benefits": "Affordable starting price with strong capital growth as the city expands east."
},
  {
  "id": 13,
  "name": "Scheme 33",
  "category": "Residential",
  "zone": "South-East Residential",
  "openingValue": 75,
  "level3Target": 150,
  "targetValues": [
    75,
    95,
    120,
    150
  ],
  "upgradeCosts": [
    5,
    9,
    14
  ],
  "rentValues": [
    10,
    15,
    24,
    38
  ],
  "challengeTheme": "Water, road and public-service access can vary.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "Massive residential enclave with affordable family apartments and street markets.",
  "valueReason": "Lowest entry price on the board, perfect for high-yield rental returns.",
  "problems": "Water, road and public-service access can vary. Water supply shortages, overflowing drains, and road maintenance.",
  "benefits": "High rental yield relative to buying price and low risk."
},
  {
  "id": 14,
  "name": "Surjani Town",
  "category": "Residential",
  "zone": "South Green Belt",
  "openingValue": 55,
  "level3Target": 115,
  "targetValues": [
    55,
    70,
    90,
    115
  ],
  "upgradeCosts": [
    4,
    7,
    11
  ],
  "rentValues": [
    10,
    15,
    22,
    30
  ],
  "challengeTheme": "Long commutes and uneven infrastructure in some pockets.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ]
  },
  "importance": "Upscale suburban community near the airport known for wide avenues and clubs.",
  "valueReason": "Top-tier price backed by prestige, golf courses, and army housing security.",
  "problems": "Long commutes and uneven infrastructure in some pockets. High initial cost and long travel distance from Old City business hubs.",
  "benefits": "Best security, well-maintained roads, and elite neighborhood status."
},
  {
  "id": 15,
  "name": "Orangi Town",
  "category": "Residential",
  "zone": "South Waterfront",
  "openingValue": 60,
  "level3Target": 120,
  "targetValues": [
    60,
    75,
    95,
    120
  ],
  "upgradeCosts": [
    4,
    7,
    11
  ],
  "rentValues": [
    10,
    15,
    22,
    30
  ],
  "challengeTheme": "Water access, drainage and waste services vary by locality.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "The historical seaside promenade and popular weekend retreat for Karachiites.",
  "valueReason": "Waterfront lifestyle and tourism value with steady public foot traffic.",
  "problems": "Water access, drainage and waste services vary by locality. Sea air corrosion, weekend crowd control, and parking bottlenecks.",
  "benefits": "Iconic seaside views and strong restaurant and leisure revenue."
},
  {
  "id": 16,
  "name": "Lyari",
  "category": "Residential / Mixed-use",
  "zone": "Historic South",
  "openingValue": 65,
  "level3Target": 130,
  "targetValues": [
    65,
    80,
    105,
    130
  ],
  "upgradeCosts": [
    5,
    8,
    12
  ],
  "rentValues": [
    10,
    15,
    22,
    32
  ],
  "challengeTheme": "Drainage, road access and service reliability vary by pocket.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ]
  },
  "importance": "Historic neighborhood with dense markets, football clubs, and vibrant culture.",
  "valueReason": "Affordable entry value with strong local retail and tenant stability.",
  "problems": "Drainage, road access and service reliability vary by pocket. Narrow streets, parking shortages, and high water demand.",
  "benefits": "Loyal community, high footfall, and resilient rental returns."
},
  {
  "id": 17,
  "name": "Manora",
  "category": "Residential / Tourism",
  "zone": "Island Maritime",
  "openingValue": 70,
  "level3Target": 145,
  "targetValues": [
    70,
    90,
    115,
    145
  ],
  "upgradeCosts": [
    5,
    8,
    13
  ],
  "rentValues": [
    10,
    15,
    23,
    36
  ],
  "challengeTheme": "Coastal access, transport and service availability.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      }
    ]
  },
  "importance": "Picturesque island and naval station across Karachi harbour with lighthouse views.",
  "valueReason": "Unique tourism and maritime hospitality holding.",
  "problems": "Coastal access, transport and service availability. Boat commute dependency, limited fresh water, and maritime weather.",
  "benefits": "Exclusive island charm, tourism upside, and growing weekend visitor numbers."
},
  {
  "id": 18,
  "name": "Port Qasim",
  "category": "Commercial / Industrial",
  "zone": "East Deep-Sea Port",
  "openingValue": 120,
  "level3Target": 225,
  "targetValues": [
    120,
    150,
    185,
    225
  ],
  "upgradeCosts": [
    9,
    14,
    21
  ],
  "rentValues": [
    14,
    24,
    37,
    56
  ],
  "challengeTheme": "Industrial logistics, roads and utility demand.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 2
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ]
  },
  "importance": "Modern deep-water sea port handling bulk cargo, steel mills, and energy terminals.",
  "valueReason": "Major industrial and shipping hub connecting Pakistan to global sea lanes.",
  "problems": "Industrial logistics, roads and utility demand. Heavy transport wear, port logistics congestion, and industrial utility demand.",
  "benefits": "High industrial and cargo rents with immense commercial leverage."
},
  {
  "id": 19,
  "name": "Karachi University / University Road",
  "category": "Commercial / Institutional",
  "zone": "East Academic",
  "openingValue": 100,
  "level3Target": 190,
  "targetValues": [
    100,
    125,
    155,
    190
  ],
  "upgradeCosts": [
    7,
    12,
    17
  ],
  "rentValues": [
    12,
    20,
    31,
    48
  ],
  "challengeTheme": "Peak-hour traffic and transport demand.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 2
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      }
    ]
  },
  "importance": "Main educational corridor anchored by Karachi University, NED, and research institutes.",
  "valueReason": "Institutional holding with tens of thousands of daily students and staff.",
  "problems": "Peak-hour traffic and transport demand. Peak-hour student traffic, limited campus parking, and public transit demand.",
  "benefits": "Permanent captive audience, bookstore and cafe retail demand, and high social value."
},
  {
  "id": 20,
  "name": "Jinnah International Airport vicinity",
  "category": "Commercial",
  "zone": "Aviation Hub",
  "openingValue": 145,
  "level3Target": 260,
  "targetValues": [
    145,
    175,
    215,
    260
  ],
  "upgradeCosts": [
    10,
    16,
    23
  ],
  "rentValues": [
    17,
    28,
    43,
    65
  ],
  "challengeTheme": "Traffic, noise and access-road pressure.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 2
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      }
    ]
  },
  "importance": "Karachi's primary aviation gateway connecting domestic and international passengers.",
  "valueReason": "High commercial value supported by logistics, transit hotels, and cargo warehouses.",
  "problems": "Traffic, noise and access-road pressure. Heavy road security checkpoints, aircraft noise, and 24/7 access demand.",
  "benefits": "Strategic aviation logistics, hotel demand, and nonstop travel commerce."
},
  {
  "id": 21,
  "name": "Kharadar / Mithadar",
  "category": "Commercial / Heritage",
  "zone": "Historic Old City",
  "openingValue": 85,
  "level3Target": 160,
  "targetValues": [
    85,
    105,
    130,
    160
  ],
  "upgradeCosts": [
    6,
    10,
    15
  ],
  "rentValues": [
    10,
    17,
    26,
    40
  ],
  "challengeTheme": "Dense streets, loading access and ageing infrastructure.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      }
    ]
  },
  "importance": "Oldest trading quarter in Karachi with wholesale yarn, spice, and dry fruit markets.",
  "valueReason": "Dense heritage commercial zone with centuries of merchant pedigree.",
  "problems": "Dense streets, loading access and ageing infrastructure. Extreme street congestion, narrow alleys, and loading bottlenecks.",
  "benefits": "Massive wholesale trade volume, unbeatable merchant trust, and high shop rents."
},
  {
  "id": 22,
  "name": "Federal B Area Block 15",
  "category": "Residential",
  "zone": "Central North",
  "openingValue": 95,
  "level3Target": 170,
  "targetValues": [
    95,
    115,
    140,
    170
  ],
  "upgradeCosts": [
    7,
    11,
    16
  ],
  "rentValues": [
    11,
    18,
    28,
    42
  ],
  "challengeTheme": "Drainage, traffic and parking pressure.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 2
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 11,
        "utilityName": "Geyser",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "Densely populated residential neighborhood with family apartments and schools.",
  "valueReason": "Balanced family holding with steady rental demand.",
  "problems": "Drainage, traffic and parking pressure. Parking shortages, aging sewer lines, and rush-hour road traffic.",
  "benefits": "Central location, close to North Nazimabad and Gulshan, with stable tenants."
},
  {
  "id": 23,
  "name": "Karsaz",
  "category": "Residential / Commercial",
  "zone": "Central Transit",
  "openingValue": 130,
  "level3Target": 230,
  "targetValues": [
    130,
    155,
    190,
    230
  ],
  "upgradeCosts": [
    9,
    14,
    21
  ],
  "rentValues": [
    16,
    25,
    38,
    58
  ],
  "challengeTheme": "Traffic access and power continuity.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 2
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 2
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ]
  },
  "importance": "Major arterial link connecting Shahrah-e-Faisal with Gulshan and Karsaz naval base.",
  "valueReason": "High-visibility mixed residential and commercial corridor.",
  "problems": "Traffic access and power continuity. Fast-moving highway traffic, controlled access zones, and power continuity needs.",
  "benefits": "Prime central accessibility, high prestige, and strong tenant appeal."
},
  {
  "id": 24,
  "name": "Boat Basin",
  "category": "Commercial",
  "zone": "Waterfront Dining",
  "openingValue": 140,
  "level3Target": 255,
  "targetValues": [
    140,
    170,
    210,
    255
  ],
  "upgradeCosts": [
    10,
    15,
    22
  ],
  "rentValues": [
    17,
    27,
    42,
    64
  ],
  "challengeTheme": "Parking, traffic and drainage pressure.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 2,
        "utilityName": "Water Supply",
        "count": 2
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      },
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 2
      }
    ]
  },
  "importance": "Famous waterfront food street and commercial promenade in Clifton.",
  "valueReason": "High hospitality value driven by late-night dining crowds and bank branches.",
  "problems": "Parking, traffic and drainage pressure. Evening parking gridlock, kitchen waste management, and coastal drainage.",
  "benefits": "Top destination for restaurants, cafes, and retail with strong rent payouts."
},
  {
  "id": 25,
  "name": "Hyderi Market, North Nazimabad",
  "category": "Commercial",
  "zone": "North Central Commercial",
  "openingValue": 105,
  "level3Target": 195,
  "targetValues": [
    105,
    130,
    160,
    195
  ],
  "upgradeCosts": [
    8,
    12,
    18
  ],
  "rentValues": [
    13,
    21,
    32,
    49
  ],
  "challengeTheme": "Parking and high-footfall waste management.",
  "upgradeRequirements": {
    "1": [
      {
        "utilityId": 1,
        "utilityName": "Electricity",
        "count": 1
      },
      {
        "utilityId": 6,
        "utilityName": "Car Parking Space",
        "count": 1
      },
      {
        "utilityId": 7,
        "utilityName": "Garbage Collection",
        "count": 1
      }
    ],
    "2": [
      {
        "utilityId": 13,
        "utilityName": "Road Maintenance",
        "count": 1
      },
      {
        "utilityId": 8,
        "utilityName": "Mobile Network",
        "count": 1
      },
      {
        "utilityId": 4,
        "utilityName": "Internet / Wi-Fi",
        "count": 1
      },
      {
        "utilityId": 10,
        "utilityName": "CCTV Cameras",
        "count": 1
      }
    ],
    "3": [
      {
        "utilityId": 9,
        "utilityName": "Solar Panels",
        "count": 3
      },
      {
        "utilityId": 5,
        "utilityName": "Sewerage System",
        "count": 2
      },
      {
        "utilityId": 14,
        "utilityName": "Burglary Alarm",
        "count": 1
      },
      {
        "utilityId": 15,
        "utilityName": "Surge Protection System",
        "count": 2
      },
      {
        "utilityId": 12,
        "utilityName": "Public Transport Service",
        "count": 1
      }
    ]
  },
  "importance": "Major shopping bazaar serving North Nazimabad and surrounding blocks.",
  "valueReason": "Accessible commercial price with nonstop shopper demand for clothes and groceries.",
  "problems": "Parking and high-footfall waste management. Double-parked cars, heavy crowd waste, and tight delivery access.",
  "benefits": "Loyal local shoppers, high shop occupancy, and steady commercial rent."
},
];

export const DEFAULT_MONOPOLY_TEAMS = [];

// Calculate current valuation of a property based on its upgrade level (Max Level 3).
// Valuation strictly reflects property level and ONLY increases when the property is upgraded.
export function computePropertyValuation(prop) {
  if (!prop) return 0;
  const open = Number(prop.openingValue || 0);
  const lvl = Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0)));

  let baseAtLevel = open;
  if (Array.isArray(prop.targetValues) && prop.targetValues.length > lvl && Number(prop.targetValues[lvl]) > 0) {
    baseAtLevel = Number(prop.targetValues[lvl]);
  } else {
    const target = Number(prop.level3Target || open * 1.6);
    const diff = target - open;
    if (lvl === 1) baseAtLevel = Math.round(open + diff * 0.33);
    if (lvl === 2) baseAtLevel = Math.round(open + diff * 0.67);
    if (lvl >= 3) baseAtLevel = target;
  }

  // Value strictly depends on upgrade level, not on raw attached token costs
  return baseAtLevel;
}

// Compute property upgrade level based on attached utilities meeting recipe requirements
export function computePropertyUpgradeLevel(prop, attachedUtilIds = null) {
  if (!prop) return 0;
  const attached = (attachedUtilIds !== null ? attachedUtilIds : (prop.attachedUtilities || [])).map(Number);
  let lvl = Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0)));

  const reqs = prop.upgradeRequirements;
  if (reqs && typeof reqs === 'object') {
    for (let l = 1; l <= 3; l++) {
      const list = reqs[String(l)];
      if (Array.isArray(list) && list.length > 0) {
        let allMet = true;
        for (const req of list) {
          const countInAttached = attached.filter((id) => id === Number(req.utilityId)).length;
          if (countInAttached < Number(req.count || 1)) {
            allMet = false;
            break;
          }
        }
        if (allMet) {
          lvl = Math.max(lvl, l);
        }
      }
    }
  }

  return Math.min(3, Math.max(0, lvl));
}

// Calculate rent payable when the spin wheel lands on a property
export function computePropertyRent(prop) {
  if (!prop) return 0;
  const lvl = Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0)));
  const rents = Array.isArray(prop.rentValues) ? prop.rentValues : [15, 25, 38, 55];
  const baseRent = Number(rents[lvl] || rents[0] || 15);

  // Each attached utility boosts rent by +2 Lakh (+3 Lakh if matching property upgrade requirements)
  const utilIds = Array.isArray(prop.attachedUtilities) ? prop.attachedUtilities : [];
  const utilBonus = utilIds.length * 2;

  return baseRent + utilBonus;
}
