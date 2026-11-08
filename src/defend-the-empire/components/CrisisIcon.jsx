import React from "react";
import {
  Ship,
  Laptop,
  Factory,
  TrendingDown,
  Scale,
  Satellite,
  Megaphone,
  Package,
  Wind,
  Crown,
  Zap,
  Fuel,
  Landmark,
  Lock,
  Coins,
  Timer,
  Target,
  Radio,
  Shield,
  AlertTriangle
} from "lucide-react";

// Unicode escaped key mapping to guarantee zero literal emojis in source
const ICON_MAP = {
  // Escaped Unicode representations
  "\u{1F6A2}": Ship, // ship
  "\u{1F4BB}": Laptop, // laptop
  "\u{1F3ED}": Factory, // factory
  "\u{1F4C9}": TrendingDown, // trending down
  "\u{2696}": Scale, // balance scale
  "\u{2696}\u{FE0F}": Scale,
  "\u{1F6F0}": Satellite, // satellite
  "\u{1F6F0}\u{FE0F}": Satellite,
  "\u{1F5E3}": Megaphone, // speaking head
  "\u{1F5E3}\u{FE0F}": Megaphone,
  "\u{1F4E6}": Package, // package
  "\u{1F32A}": Wind, // tornado / wind
  "\u{1F32A}\u{FE0F}": Wind,
  "\u{1F451}": Crown, // crown
  "\u{26A1}": Zap, // high voltage
  "\u{1F6E2}": Fuel, // oil drum
  "\u{1F6E2}\u{FE0F}": Fuel,
  "\u{1F3DB}": Landmark, // classical building
  "\u{1F3DB}\u{FE0F}": Landmark,
  "\u{1F510}": Lock, // closed lock with key
  "\u{1F512}": Lock, // lock
  "\u{1F4B0}": Coins, // money bag
  "\u{23F1}": Timer, // stopwatch
  "\u{23F1}\u{FE0F}": Timer,
  "\u{1F3AF}": Target, // direct hit
  "\u{1F4E1}": Radio, // satellite antenna

  // Semantic keyword mapping
  ship: Ship,
  laptop: Laptop,
  factory: Factory,
  "trending-down": TrendingDown,
  chart: TrendingDown,
  scale: Scale,
  satellite: Satellite,
  speech: Megaphone,
  megaphone: Megaphone,
  package: Package,
  wind: Wind,
  crown: Crown,
  zap: Zap,
  fuel: Fuel,
  oil: Fuel,
  landmark: Landmark,
  lock: Lock,
  coins: Coins,
  timer: Timer,
  target: Target,
  radio: Radio,
  shield: Shield
};

export default function CrisisIcon({ icon, className = "w-5 h-5", title }) {
  const IconComponent = (icon && ICON_MAP[icon.trim?.() || icon]) || Shield;
  return <IconComponent className={className} aria-label={title || "Crisis Icon"} />;
}

export const CRISIS_ICON_OPTIONS = [
  { value: "ship", label: "Convoy / Fleet", icon: "ship" },
  { value: "laptop", label: "Ledger / Cyber", icon: "laptop" },
  { value: "factory", label: "Smelter / Industry", icon: "factory" },
  { value: "trending-down", label: "Bear Raid / Short", icon: "trending-down" },
  { value: "scale", label: "Legal / Antitrust", icon: "scale" },
  { value: "satellite", label: "Orbital / Recon", icon: "satellite" },
  { value: "speech", label: "Audio / Leak", icon: "speech" },
  { value: "package", label: "Logistics / Subsea", icon: "package" },
  { value: "wind", label: "Typhoon / Weather", icon: "wind" },
  { value: "crown", label: "Sovereign / Coup", icon: "crown" },
  { value: "fuel", label: "Petroleum / Fuel", icon: "fuel" },
  { value: "landmark", label: "Treasury / Hub", icon: "landmark" },
  { value: "lock", label: "Security / Defense", icon: "lock" },
  { value: "zap", label: "Power / Grid", icon: "zap" }
];
