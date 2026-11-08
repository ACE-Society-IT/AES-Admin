// =========================================================================
// MARKET MONOPOLY · KARACHI PROPERTY CATALOGUE & UTILITIES DATA (ADMIN)
// =========================================================================

export const STARTING_BUDGET_LAKH = 500;

export const KARACHI_UTILITIES = [
  { id: 1, name: 'Electricity', cost: 12, category: 'Power', summary: 'Main grid power for homes, shops, and factories.' },
  { id: 2, name: 'Water Supply', cost: 7, category: 'Water', summary: 'Steady piped water line for daily use.' },
  { id: 3, name: 'Natural Gas', cost: 7, category: 'Energy', summary: 'Heating, kitchens, and industrial boilers.' },
  { id: 4, name: 'Internet / Wi-Fi', cost: 5, category: 'Comms', summary: 'High-speed fiber for offices and homes.' },
  { id: 5, name: 'Sewerage System', cost: 6, category: 'Sanitation', summary: 'Underground drainage and storm water clearance.' },
  { id: 6, name: 'Car Parking Space (CPS)', cost: 4, category: 'Access', summary: 'Dedicated parking bays for visitors and staff.' },
  { id: 7, name: 'Garbage Collection', cost: 2, category: 'Sanitation', summary: 'Daily waste pickup to keep streets clean.' },
  { id: 8, name: 'Mobile Network', cost: 2, category: 'Comms', summary: 'Strong cellular signal across the block.' },
  { id: 9, name: 'Solar Panels', cost: 5, category: 'Power', summary: 'Clean backup power during grid cuts.' },
  { id: 10, name: 'CCTV', cost: 5, category: 'Security', summary: '24-hour camera monitoring for safety.' },
  { id: 11, name: 'Public Transport', cost: 3, category: 'Access', summary: 'Bus and commuter links near the property.' },
  { id: 12, name: 'Road Maintenance', cost: 5, category: 'Access', summary: 'Smooth paved roads for cars and delivery trucks.' },
  { id: 13, name: 'Burglary Alarm', cost: 1, category: 'Security', summary: 'Alert system against break-ins.' },
  { id: 14, name: 'Water Filter', cost: 3, category: 'Water', summary: 'Clean drinking water filtration plant.' },
  { id: 15, name: 'Surge Protection System', cost: 2, category: 'Power', summary: 'Guards appliances and machines from voltage spikes.' },
  { id: 16, name: 'Trading', cost: 13, category: 'Commerce', summary: 'Wholesale and merchant trade license setup.' },
  { id: 17, name: 'Warehouse', cost: 8, category: 'Logistics', summary: 'Storage space for stock, goods, and supplies.' }
];

export const KARACHI_PROPERTIES = [
  {
    id: 1,
    name: 'DHA Phase 6',
    category: 'Residential',
    zone: 'South Coastal',
    openingValue: 190,
    level3Target: 285,
    upgradeCosts: [12, 18, 25],
    rentValues: [22, 34, 48, 65],
    recommendedUtilities: [2, 1, 9, 15],
    importance: 'An established residential neighborhood with restaurants, schools, and modern family amenities.',
    valueReason: 'Positioned as a top-tier residential holding with strong demand from families and professionals.',
    problems: 'Water pressure drops, power maintenance issues, and a high buying cost if a team bids too much.',
    benefits: 'Strong neighborhood reputation, great dining and school access, and high resale appeal.'
  },
  {
    id: 2,
    name: 'Clifton Block 5',
    category: 'Residential',
    zone: 'South Coastal',
    openingValue: 170,
    level3Target: 270,
    upgradeCosts: [12, 16, 22],
    rentValues: [20, 31, 44, 60],
    recommendedUtilities: [2, 5, 6, 14],
    importance: 'A well-known coastal district close to shopping malls, offices, and dining spots.',
    valueReason: 'Reflects prime coastal land, solid building quality, and high tenant demand.',
    problems: 'Water supply and drainage issues, sea air corrosion on fixtures, and busy street parking.',
    benefits: 'Close to the beach and major shopping centers with steady interest from corporate tenants.'
  },
  {
    id: 3,
    name: 'Gulshan-e-Iqbal Block 13-D',
    category: 'Residential',
    zone: 'Central East',
    openingValue: 95,
    level3Target: 170,
    upgradeCosts: [8, 12, 16],
    rentValues: [12, 19, 28, 40],
    recommendedUtilities: [6, 5, 12, 4],
    importance: 'A large, central neighborhood surrounded by universities, hospitals, and busy markets.',
    valueReason: 'Mid-range price backed by everyday family and student housing demand.',
    problems: 'School and rush-hour traffic jams, aging pipes, and uneven street parking.',
    benefits: 'Easy access to schools, hospitals, and shopping at a fair entry price.'
  },
  {
    id: 4,
    name: 'North Nazimabad Block H',
    category: 'Residential',
    zone: 'North Central',
    openingValue: 80,
    level3Target: 175,
    upgradeCosts: [8, 11, 15],
    rentValues: [10, 17, 26, 38],
    recommendedUtilities: [5, 12, 2, 7],
    importance: 'A classic family neighborhood with wide streets, markets, and community parks.',
    valueReason: 'Offers a comfortable entry point with strong upside when upgraded to Level 3.',
    problems: 'Blocked drains during heavy rain and worn road surfaces.',
    benefits: 'Quiet family character, local markets nearby, and low starting cost.'
  },
  {
    id: 5,
    name: 'PECHS Block 2',
    category: 'Residential',
    zone: 'Central Heart',
    openingValue: 125,
    level3Target: 215,
    upgradeCosts: [10, 14, 18],
    rentValues: [15, 24, 35, 50],
    recommendedUtilities: [6, 1, 2, 10],
    importance: 'Right in the center of Karachi, connecting homes with major office corridors and shops.',
    valueReason: 'Priced above Gulshan and Nazimabad because of its central location.',
    problems: 'Tight parking, older underground utility lines, and crowded inner lanes.',
    benefits: 'Quick commute to offices and shopping centers with dependable tenant interest.'
  },
  {
    id: 6,
    name: 'Bahadurabad',
    category: 'Commercial',
    zone: 'Central Heart',
    openingValue: 115,
    level3Target: 205,
    upgradeCosts: [9, 14, 18],
    rentValues: [15, 24, 35, 48],
    recommendedUtilities: [6, 7, 12, 1],
    importance: 'One of Karachi’s busiest food and retail hubs with constant evening crowds.',
    valueReason: 'Sits nicely between small neighborhood markets and expensive office avenues.',
    problems: 'Severe parking shortages at peak hours, delivery bottlenecks, and trash buildup.',
    benefits: 'Huge customer footfall for restaurants, cafes, clothing stores, and clinics.'
  },
  {
    id: 7,
    name: 'Saddar / Empress Market',
    category: 'Commercial',
    zone: 'Old City Center',
    openingValue: 100,
    level3Target: 165,
    upgradeCosts: [8, 11, 15],
    rentValues: [13, 20, 29, 40],
    recommendedUtilities: [6, 7, 11, 16],
    importance: 'Karachi’s historic trading center where thousands of shoppers and buses pass daily.',
    valueReason: 'Affordable commercial entry because heavy crowds and old streets require care.',
    problems: 'Packed sidewalks, very little parking, tough loading zones, and waste cleanup needs.',
    benefits: 'Non-stop shopper traffic, bus links from every corner of the city, and steady wholesale trade.'
  },
  {
    id: 8,
    name: 'Tariq Road',
    category: 'Commercial',
    zone: 'Central Heart',
    openingValue: 190,
    level3Target: 260,
    upgradeCosts: [12, 17, 22],
    rentValues: [22, 34, 47, 62],
    recommendedUtilities: [6, 1, 7, 10],
    importance: 'The city’s premier shopping avenue for fashion, electronics, and household brands.',
    valueReason: 'High commercial value driven by nonstop shopper movement and showroom rent.',
    problems: 'Heavy traffic jams, tight parking, and difficult daytime stock deliveries.',
    benefits: 'Top retail name recognition and strong rent from brand outlets.'
  },
  {
    id: 9,
    name: 'Shahrah-e-Faisal Business District',
    category: 'Commercial',
    zone: 'Business Corridor',
    openingValue: 150,
    level3Target: 265,
    upgradeCosts: [11, 16, 22],
    rentValues: [18, 29, 42, 58],
    recommendedUtilities: [1, 4, 6, 9],
    importance: 'Karachi’s main highway corridor lined with banks, software houses, and hotels.',
    valueReason: 'Direct link between the airport and downtown makes it ideal for corporate offices.',
    problems: 'Rush-hour traffic slowdowns, backup power needs for offices, and service-lane parking.',
    benefits: 'High visibility, citywide road access, and reliable corporate tenants.'
  },
  {
    id: 10,
    name: 'Korangi Industrial Area',
    category: 'Commercial / Industrial',
    zone: 'East Industrial',
    openingValue: 200,
    level3Target: 290,
    upgradeCosts: [14, 19, 25],
    rentValues: [24, 36, 50, 68],
    recommendedUtilities: [1, 3, 5, 17],
    importance: 'A powerhouse industrial zone for factories, textile mills, and large warehouses.',
    valueReason: 'Large plot capacity and production output justify a high industrial price.',
    problems: 'High power and gas demand, industrial drainage needs, and heavy truck wear on roads.',
    benefits: 'Supports large-scale manufacturing, storage, and high-value supply contracts.'
  },
  {
    id: 11,
    name: 'SITE Industrial Area',
    category: 'Commercial / Industrial',
    zone: 'West Industrial',
    openingValue: 200,
    level3Target: 285,
    upgradeCosts: [14, 18, 24],
    rentValues: [23, 35, 49, 66],
    recommendedUtilities: [1, 5, 12, 17],
    importance: 'One of the oldest and largest factory districts in Pakistan, close to port routes.',
    valueReason: 'Major industrial hub with established factory compounds and labor access.',
    problems: 'Broken roads, sewerage blockages, and unreliable power and water lines.',
    benefits: 'Central factory location for wholesale production and logistics.'
  },
  {
    id: 12,
    name: 'Malir Cantt',
    category: 'Residential',
    zone: 'East Suburban',
    openingValue: 135,
    level3Target: 235,
    upgradeCosts: [10, 15, 20],
    rentValues: [16, 26, 38, 52],
    recommendedUtilities: [9, 2, 4, 10],
    importance: 'A clean, secure, and well-planned residential zone with greenery and quiet roads.',
    valueReason: 'Families pay a premium for organized streets, security, and calm surroundings.',
    problems: 'Further from downtown offices and requires strict entry passes for visitors.',
    benefits: 'Safe environment, clean roads, and steady appreciation for family homes.'
  },
  {
    id: 13,
    name: 'Scheme 33',
    category: 'Residential',
    zone: 'North East Growth',
    openingValue: 75,
    level3Target: 150,
    upgradeCosts: [7, 10, 14],
    rentValues: [9, 15, 23, 34],
    recommendedUtilities: [2, 1, 12, 5],
    importance: 'A fast-growing housing corridor along the highway with dozens of new societies.',
    valueReason: 'Low buying cost leaves plenty of cash for utilities and upgrades, doubling its value at Level 3.',
    problems: 'Developing road links, water tanker reliance in some blocks, and ongoing construction.',
    benefits: 'Low entry price, rapid population growth, and strong percentage gains after upgrades.'
  },
  {
    id: 14,
    name: 'Surjani Town',
    category: 'Residential',
    zone: 'North Outskirts',
    openingValue: 55,
    level3Target: 115,
    upgradeCosts: [5, 8, 12],
    rentValues: [7, 12, 18, 27],
    recommendedUtilities: [5, 11, 2, 12],
    importance: 'The most affordable housing district in the catalogue, serving working families.',
    valueReason: 'At Rs 55 Lakh, any team can buy it early without draining their bank balance.',
    problems: 'Rainwater drainage issues, long commutes to the city center, and basic utilities.',
    benefits: 'Lowest purchase cost, Green Line bus access nearby, and easy upgrade costs.'
  },
  {
    id: 15,
    name: 'Orangi Town',
    category: 'Residential',
    zone: 'West Residential',
    openingValue: 60,
    level3Target: 120,
    upgradeCosts: [6, 9, 12],
    rentValues: [8, 13, 20, 29],
    recommendedUtilities: [2, 5, 7, 12],
    importance: 'A massive, industrious community with active cottage workshops and local bazaars.',
    valueReason: 'Low purchase price paired with steady demand for everyday shops and homes.',
    problems: 'Uneven water lines, narrow sloped lanes, and sanitation upkeep needs.',
    benefits: 'Budget-friendly asset with a huge local population and active small businesses.'
  },
  {
    id: 16,
    name: 'Lyari',
    category: 'Residential / Mixed-use',
    zone: 'Old City West',
    openingValue: 65,
    level3Target: 130,
    upgradeCosts: [6, 9, 13],
    rentValues: [8, 14, 21, 31],
    recommendedUtilities: [2, 1, 5, 7],
    importance: 'One of Karachi’s oldest neighborhoods right next to the port and wholesale markets.',
    valueReason: 'Affordable mixed-use land close to central trading districts.',
    problems: 'Dense housing, old water and sewerage pipes, and narrow streets.',
    benefits: 'Minutes away from Kharadar, port gates, and central markets at a low price.'
  },
  {
    id: 17,
    name: 'Manora',
    category: 'Residential / Tourism',
    zone: 'Coastal Island',
    openingValue: 70,
    level3Target: 145,
    upgradeCosts: [7, 10, 14],
    rentValues: [9, 15, 23, 33],
    recommendedUtilities: [9, 14, 11, 7],
    importance: 'A scenic coastal peninsula known for beaches, lighthouses, and weekend visitors.',
    valueReason: 'Unique tourism and leisure spot with low entry cost and strong upgrade upside.',
    problems: 'Limited road access, fresh water transport needs, and sea weather wear.',
    benefits: 'Distinctive beach and hospitality appeal for cafes, resorts, and weekend traffic.'
  },
  {
    id: 18,
    name: 'Port Qasim',
    category: 'Commercial / Industrial',
    zone: 'South East Port',
    openingValue: 120,
    level3Target: 225,
    upgradeCosts: [10, 15, 20],
    rentValues: [15, 25, 37, 52],
    recommendedUtilities: [17, 16, 12, 1],
    importance: 'Deep-water seaport and industrial zone handling shipping containers, steel, and energy.',
    valueReason: 'Essential trade gateway with room for warehouses, shipping yards, and plants.',
    problems: 'Heavy container truck traffic, long distance from central Karachi, and high power load.',
    benefits: 'Direct sea trade access, large industrial plots, and high commercial rent.'
  },
  {
    id: 19,
    name: 'Karachi University / University Road',
    category: 'Commercial / Institutional',
    zone: 'Central East',
    openingValue: 100,
    level3Target: 190,
    upgradeCosts: [8, 12, 16],
    rentValues: [13, 21, 31, 44],
    recommendedUtilities: [4, 11, 6, 1],
    importance: 'Major education and commuter corridor serving tens of thousands of students daily.',
    valueReason: 'Constant student and commuter flow supports bookstores, cafes, hostels, and clinics.',
    problems: 'Heavy bus and commuter congestion during morning and afternoon peaks.',
    benefits: 'Year-round demand from students, faculty, and surrounding residential blocks.'
  },
  {
    id: 20,
    name: 'Jinnah International Airport Vicinity',
    category: 'Commercial',
    zone: 'Airport Corridor',
    openingValue: 145,
    level3Target: 260,
    upgradeCosts: [11, 16, 21],
    rentValues: [18, 28, 41, 56],
    recommendedUtilities: [10, 6, 4, 17],
    importance: 'Prime air cargo, hotel, and logistics hub surrounding Pakistan’s busiest airport.',
    valueReason: 'High commercial value backed by airlines, courier hubs, hotels, and offices.',
    problems: 'Strict security checks, flight noise, and peak traffic at terminal turns.',
    benefits: 'Unmatched air transport link for hotels, cargo warehouses, and corporate offices.'
  },
  {
    id: 21,
    name: 'Kharadar / Mithadar',
    category: 'Commercial / Heritage',
    zone: 'Old City Center',
    openingValue: 195,
    level3Target: 275,
    upgradeCosts: [12, 17, 23],
    rentValues: [23, 35, 48, 64],
    recommendedUtilities: [16, 17, 10, 1],
    importance: 'The historic wholesale heart of Karachi where bullion, spice, and cloth merchants trade.',
    valueReason: 'High handwritten catalogue value reflecting dense wholesale turnover.',
    problems: 'Very narrow heritage lanes, handcart congestion, and old wiring.',
    benefits: 'Deeply rooted wholesale trade network with constant daily cash business.'
  },
  {
    id: 22,
    name: 'Federal B Area Block 15',
    category: 'Residential',
    zone: 'North Central',
    openingValue: 95,
    level3Target: 170,
    upgradeCosts: [8, 12, 15],
    rentValues: [12, 19, 28, 39],
    recommendedUtilities: [5, 6, 2, 1],
    importance: 'Well-settled central neighborhood with family parks, schools, and nearby markets.',
    valueReason: 'Balanced mid-range home asset with steady family occupancy.',
    problems: 'Tight street parking and drainage backups during monsoon rains.',
    benefits: 'Central connectivity, community amenities, and reliable family rental income.'
  },
  {
    id: 23,
    name: 'Karsaz',
    category: 'Residential / Commercial',
    zone: 'Central Corridor',
    openingValue: 130,
    level3Target: 230,
    upgradeCosts: [10, 15, 19],
    rentValues: [16, 25, 37, 51],
    recommendedUtilities: [1, 6, 12, 10],
    importance: 'Strategic junction linking Shahrah-e-Faisal, Stadium Road, and central neighborhoods.',
    valueReason: 'Strong mixed-use value thanks to fast road links and clean surroundings.',
    problems: 'Peak-hour traffic bottlenecks and occasional power cuts.',
    benefits: 'Central location that works well for both upscale housing and commercial offices.'
  },
  {
    id: 24,
    name: 'Boat Basin',
    category: 'Commercial',
    zone: 'South Coastal',
    openingValue: 140,
    level3Target: 255,
    upgradeCosts: [11, 15, 20],
    rentValues: [17, 27, 40, 55],
    recommendedUtilities: [6, 7, 3, 5],
    importance: 'Famous waterfront food street and commercial promenade in Clifton.',
    valueReason: 'High hospitality value driven by late-night dining crowds and bank branches.',
    problems: 'Evening parking gridlock, kitchen waste management, and coastal drainage.',
    benefits: 'Top destination for restaurants, cafes, and retail with strong rent payouts.'
  },
  {
    id: 25,
    name: 'Hyderi Market, North Nazimabad',
    category: 'Commercial',
    zone: 'North Central',
    openingValue: 105,
    level3Target: 195,
    upgradeCosts: [9, 13, 17],
    rentValues: [14, 22, 32, 45],
    recommendedUtilities: [6, 7, 1, 10],
    importance: 'Major shopping bazaar serving North Nazimabad and surrounding blocks.',
    valueReason: 'Accessible commercial price with nonstop shopper demand for clothes and groceries.',
    problems: 'Double-parked cars, heavy crowd waste, and tight delivery access.',
    benefits: 'Loyal local shoppers, high shop occupancy, and steady commercial rent.'
  }
];

export const DEFAULT_MONOPOLY_TEAMS = [];

export function computePropertyValuation(prop) {
  if (!prop) return 0;
  const open = Number(prop.openingValue || 0);
  const lvl = Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0)));

  let baseAtLevel = open;
  if (Number.isFinite(Number(prop.valueIncreasePerLevel)) && Number(prop.valueIncreasePerLevel) > 0) {
    baseAtLevel = Math.round(open + lvl * Number(prop.valueIncreasePerLevel));
  } else {
    const target = Number(prop.level3Target || open * 1.6);
    const diff = target - open;
    if (lvl === 1) baseAtLevel = Math.round(open + diff * 0.33);
    if (lvl === 2) baseAtLevel = Math.round(open + diff * 0.67);
    if (lvl >= 3) baseAtLevel = target;
  }

  const utilIds = Array.isArray(prop.attachedUtilities) ? prop.attachedUtilities : [];
  const utilValue = utilIds.reduce((sum, uId) => {
    const found = KARACHI_UTILITIES.find((u) => u.id === Number(uId));
    return sum + (found ? found.cost : 0);
  }, 0);

  return baseAtLevel + utilValue;
}

export function computePropertyRent(prop) {
  if (!prop) return 0;
  const lvl = Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0)));
  const rents = Array.isArray(prop.rentValues) ? prop.rentValues : [15, 25, 38, 55];
  const baseRent = Number(rents[lvl] || rents[0] || 15);

  const utilIds = Array.isArray(prop.attachedUtilities) ? prop.attachedUtilities : [];
  const recIds = Array.isArray(prop.recommendedUtilities) ? prop.recommendedUtilities : [];
  const utilBonus = utilIds.reduce((sum, uId) => {
    return sum + (recIds.includes(Number(uId)) ? 3 : 2);
  }, 0);

  return baseRent + utilBonus;
}

