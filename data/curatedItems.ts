
import { CuratedItem } from '../types';

export const CURATED_ITEMS: CuratedItem[] = [
  {
    id: 'kyoto',
    title: 'Kyoto in Autumn',
    subtitle: "Zen Heritage",
    description: "Experience the timeless beauty of Japan's ancient capital. Wander through Zen gardens and fiery foliage.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
    prefs: { destination: 'Kyoto, Japan', days: 5, interests: ['Culture', 'Nature', 'History'] },
    details: {
      bestTime: "Oct-Nov",
      visa: "Visa-free 90 days (most passports)",
      customs: ["Bow when greeting", "Remove shoes indoors"],
      bookingText: "Official Kyoto Guide",
      bookingLink: "https://www.japan.travel/en/destinations/kansai/kyoto/"
    }
  },
  {
    id: 'iceland',
    title: 'Nordic Silence',
    subtitle: "Arctic Wonders",
    description: "Explore the land of fire and ice. From Blue Lagoon to Aurora hunting.",
    image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1200",
    prefs: { destination: 'Reykjavik, Iceland', days: 7, interests: ['Nature', 'Adventure'] },
    details: {
      bestTime: "Sept-Mar",
      visa: "Schengen rules",
      customs: ["Shower before pools", "Leave no trace"],
      bookingText: "Visit Iceland",
      bookingLink: "https://visiticeland.com/"
    }
  },
  {
    id: 'tuscany',
    title: 'Tuscan Heritage',
    subtitle: "Gourmet Escape",
    description: "A gastronomic pilgrimage through rolling hills and world-class vineyards.",
    image: "https://images.unsplash.com/photo-1516108317508-6788f6a160ee?q=80&w=1200",
    prefs: { destination: 'Tuscany, Italy', days: 6, interests: ['Food', 'History'] },
    details: {
      bestTime: "May-June, Sept-Oct",
      visa: "Schengen rules",
      customs: ["No cappuccino after 11am", "Dress modestly in churches"]
    }
  },
  {
    id: 'santorini',
    title: 'Aegean Sunsets',
    subtitle: "Cycladic Luxury",
    description: "Iconic blue domes and volcanic cliffs in the heart of the Mediterranean.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200",
    prefs: { destination: 'Santorini, Greece', days: 4, budget: 'Luxury', interests: ['Relaxation', 'Art'] },
    details: {
      bestTime: "April-Oct",
      visa: "Schengen rules",
      customs: ["No flushing paper", "Siesta hours are quiet"]
    }
  },
  {
    id: 'marrakech',
    title: 'Ochre Dreams',
    subtitle: "Desert Soul",
    description: "Lost in the labyrinth of the Medina and the vibrant colors of Majorelle Garden.",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200",
    prefs: { destination: 'Marrakech, Morocco', days: 5, interests: ['Shopping', 'History'] },
    details: {
      bestTime: "Mar-May, Sept-Nov",
      visa: "90 days (most passports)",
      customs: ["Haggling is expected", "Right hand for eating"]
    }
  },
  {
    id: 'banff',
    title: 'Glacial Lakes',
    subtitle: "Canadian Rockies",
    description: "Turquoise waters of Lake Louise and the rugged peaks of Alberta.",
    image: "https://images.unsplash.com/photo-1503614472682-20a11775b61c?q=80&w=1200",
    prefs: { destination: 'Banff, Canada', days: 6, interests: ['Nature', 'Adventure'] },
    details: {
      bestTime: "June-Sept (Hiking), Dec-Mar (Ski)",
      visa: "eTA required (most passports)",
      customs: ["Stay bear-aware", "Tip 15-20%"]
    }
  },
  {
    id: 'sedona',
    title: 'Red Rock Vortex',
    subtitle: "Spiritual Path",
    description: "High desert landscapes and spiritual energy in America's southwest.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200",
    prefs: { destination: 'Sedona, Arizona', days: 4, interests: ['Relaxation', 'Nature'] },
    details: {
      bestTime: "Mar-May, Sept-Nov",
      visa: "US Visa/ESTA",
      customs: ["Respect trail markings", "Sun protection is key"]
    }
  },
  {
    id: 'lisbon',
    title: 'Tiled Streets',
    subtitle: "Atlantic Charm",
    description: "Fado music, pastel-colored buildings, and the best custard tarts in the world.",
    image: "https://images.unsplash.com/photo-1548120231-1d3f9453b0a7?q=80&w=1200",
    prefs: { destination: 'Lisbon, Portugal', days: 4, interests: ['History', 'Food'] },
    details: {
      bestTime: "Mar-May, Sept-Oct",
      visa: "Schengen rules",
      customs: ["Complimentary bread is charged", "Late dinners"]
    }
  },
  {
    id: 'hoian',
    title: 'Lantern Nights',
    subtitle: "Ancient Port",
    description: "Tailor-made clothes and yellow-washed merchant houses in central Vietnam.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200",
    prefs: { destination: 'Hoi An, Vietnam', days: 3, interests: ['History', 'Shopping', 'Food'], budget: 'Budget' },
    details: {
      bestTime: "Feb-April",
      visa: "E-visa available",
      customs: ["Remove shoes in homes", "Cover shoulders in temples"]
    }
  },
  {
    id: 'amalfi',
    title: 'Lemon Groves',
    subtitle: "Coastal Verve",
    description: "Clinging to the cliffs of the Tyrrhenian Sea, the jewel of southern Italy.",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?q=80&w=1200",
    prefs: { destination: 'Amalfi Coast, Italy', days: 5, budget: 'Luxury', interests: ['Relaxation', 'Food'] },
    details: {
      bestTime: "May-June, Sept",
      visa: "Schengen rules",
      customs: ["Pack walking shoes", "Boats over buses"]
    }
  },
  {
    id: 'lofoten',
    title: 'Fisherman Cabins',
    subtitle: "Arctic Fjords",
    description: "Sharp peaks rising directly from the sea in northern Norway.",
    image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=1200",
    prefs: { destination: 'Lofoten Islands, Norway', days: 6, interests: ['Nature', 'Art'] },
    details: {
      bestTime: "June-Aug",
      visa: "Schengen rules",
      customs: ["Right to roam (Allemannsretten)", "Expensive dining"]
    }
  },
  {
    id: 'luang',
    title: 'Alms & Temples',
    subtitle: "Lao Tradition",
    description: "Golden wats and French colonial architecture on the banks of the Mekong.",
    image: "https://images.unsplash.com/photo-1521336575624-9977ad1d4c68?q=80&w=1200",
    prefs: { destination: 'Luang Prabang, Laos', days: 4, interests: ['History', 'Nature'] },
    details: {
      bestTime: "Nov-Feb",
      visa: "Visa on arrival",
      customs: ["Dress modestly", "Quiet during Alms giving"]
    }
  },
  {
    id: 'provence',
    title: 'Lavender Fields',
    subtitle: "French Countryside",
    description: "The scent of summer and the light that inspired Van Gogh.",
    image: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?q=80&w=1200",
    prefs: { destination: 'Provence, France', days: 5, interests: ['Art', 'Nature'] },
    details: {
      bestTime: "Late June to Early July (Lavender)",
      visa: "Schengen rules",
      customs: ["Always say 'Bonjour'", "Market days are early"]
    }
  },
  {
    id: 'siemreap',
    title: 'Temple Ruins',
    subtitle: "Angkor Echoes",
    description: "Uncover the mysteries of the Khmer Empire at Angkor Wat.",
    image: "https://images.unsplash.com/photo-1500043204644-7686281a6c52?q=80&w=1200",
    prefs: { destination: 'Siem Reap, Cambodia', days: 4, interests: ['History', 'Adventure'] },
    details: {
      bestTime: "Nov-Feb",
      visa: "Visa on arrival/E-visa",
      customs: ["Respect Monks", "Don't touch heads"]
    }
  },
  {
    id: 'cappadocia',
    title: 'Fairy Chimneys',
    subtitle: "Anatolian Skies",
    description: "Cave hotels and sunrise hot air balloon rides over lunar landscapes.",
    image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=1200",
    prefs: { destination: 'Cappadocia, Turkey', days: 4, interests: ['Adventure', 'Nature'] },
    details: {
      bestTime: "April-June, Sept-Nov",
      visa: "E-visa (most passports)",
      customs: ["Remove shoes in homes", "Hospitality is paramount"]
    }
  },
  {
    id: 'faroe',
    title: 'Shear Cliffs',
    subtitle: "Remote Atlantic",
    description: "A wild archipelago where sheep outnumber people. True isolation.",
    image: "https://images.unsplash.com/photo-1521336575624-9977ad1d4c68?q=80&w=1200",
    prefs: { destination: 'Faroe Islands', days: 5, interests: ['Nature', 'Adventure'] },
    details: {
      bestTime: "June-Aug",
      visa: "Danish rules (non-Schengen visa needed if non-exempt)",
      customs: ["Be prepared for rain", "Tunnels have tolls"]
    }
  },
  {
    id: 'naoshima',
    title: 'The Art Island',
    subtitle: "Seto Inland Sea",
    description: "Contemporary museums and underground galleries integrated with nature.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200",
    prefs: { destination: 'Naoshima, Japan', days: 3, interests: ['Art', 'Relaxation'] },
    details: {
      bestTime: "April-May, Oct-Nov",
      visa: "Visa-free 90 days",
      customs: ["Pre-book museum tickets", "Rent a bicycle"]
    }
  },
  {
    id: 'atacama',
    title: 'Stargazer Desert',
    subtitle: "Altiplano Silence",
    description: "The driest place on Earth, featuring salt flats and geysers.",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1200",
    prefs: { destination: 'Atacama, Chile', days: 5, interests: ['Nature', 'Adventure'] },
    details: {
      bestTime: "Sept-Nov, Mar-May",
      visa: "90 days (most passports)",
      customs: ["Acclimatize to altitude", "Drink plenty of water"]
    }
  },
  {
    id: 'byron',
    title: 'Surfer Spirits',
    subtitle: "Australian East",
    description: "Lighthouse walks and organic culture at Australia's easternmost point.",
    image: "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?q=80&w=1200",
    prefs: { destination: 'Byron Bay, Australia', days: 4, interests: ['Nature', 'Food'] },
    details: {
      bestTime: "Sept-Nov",
      visa: "ETA/Subclass 600",
      customs: ["No plastic bags", "Early morning surf"]
    }
  },
  {
    id: 'patagonia',
    title: 'Edge of the World',
    subtitle: "Southern Wild",
    description: "Torres del Paine and the rugged frontier of the Andes.",
    image: "https://images.unsplash.com/photo-1518182170546-0766ac6f5a14?q=80&w=1200",
    prefs: { destination: 'Patagonia', days: 10, interests: ['Adventure', 'Nature'] },
    details: {
      bestTime: "Nov-Mar",
      visa: "Visa-free 90 days",
      customs: ["Pack layers", "Respect wildlife distance"]
    }
  }
];
