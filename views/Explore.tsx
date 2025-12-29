
import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, Navigation, Layers, X, MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { searchNearbyPlaces } from '../services/geminiService';

// Declare L for Leaflet as it is loaded globally via script tag
declare const L: any;

interface ExploreSpot {
  id: number;
  lat: number;
  lng: number;
  name: string;
  category: string;
  image: string;
  description: string;
  rating: number;
  openTime: string;
}

export const Explore: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ExploreSpot | null>(null);
  const [spots, setSpots] = useState<ExploreSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    const container = mapContainerRef.current as any;
    if (container._leaflet_id) return;

    const defaultCenter: [number, number] = [35.0116, 135.7681]; // Default to Kyoto if no loc
    
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true
    }).setView(defaultCenter, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Zoom control top-right for desktop, hidden or moved for mobile usually, 
    // but here we keep custom controls
    // L.control.zoom({ position: 'bottomleft' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && !layer.options.icon.options.className?.includes('user-location')) {
        map.removeLayer(layer);
      }
    });

    spots.forEach(spot => {
       const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-10 h-10 bg-stone-900 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white transform transition-transform duration-200 hover:scale-110">
             <span class="text-xs font-serif font-bold">${spot.category[0]}</span>
          </div>
        </div>
       `;

       const customIcon = L.divIcon({
          className: 'custom-map-icon-explore',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
       });

       const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });
       
       marker.on('click', () => {
         setSelectedSpot(spot);
         // Offset center slightly to account for bottom sheet on mobile
         const offset = window.innerWidth < 768 ? -0.005 : 0;
         map.flyTo([spot.lat + offset, spot.lng], 15, { duration: 1 });
       });

       marker.addTo(map);
    });
  }, [spots]);

  // Initial Geolocation & Search
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLoadingLoc(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLoadingLoc(false);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14);
          
           const userIcon = L.divIcon({
             className: 'user-location-icon',
             html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md animate-pulse"></div>`,
             iconSize: [16, 16],
             iconAnchor: [8, 8]
           });
           L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
        }

        handleSearch(latitude, longitude, "top rated places");
      },
      (error) => {
        setLoadingLoc(false);
        handleSearch(35.0116, 135.7681, "temples and food"); 
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleSearch = async (lat: number, lng: number, query: string) => {
    setIsSearching(true);
    try {
      const results = await searchNearbyPlaces(lat, lng, query);
      if (results.length > 0) {
        setSpots(results);
      } else {
        setSpots([
            { 
              id: 1, lat: lat + 0.01, lng: lng + 0.01, 
              name: 'Local Gem', category: 'Culture', 
              image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800',
              description: 'A beautiful spot nearby found by our fallback system.', rating: 4.5, openTime: '09:00 - 18:00'
            }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userLocation) {
        handleSearch(userLocation[0], userLocation[1], searchQuery);
    }
  };

  const handleRecenter = () => {
    if (userLocation && mapInstanceRef.current) {
       mapInstanceRef.current.flyTo(userLocation, 15, { duration: 1.5 });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-[#EAE8E4]">
      {/* Floating Search Bar - Mobile Optimized */}
      <div className={`absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-[500] w-[95%] md:w-[600px] transition-all duration-300 ${selectedSpot ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur shadow-xl rounded-full p-2 flex items-center gap-2 border border-stone-100/50">
          <Search className="text-stone-400 ml-3" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onSearchSubmit}
            placeholder={isSearching ? " AI is exploring..." : "Search places..."}
            className="flex-1 outline-none text-stone-900 placeholder:text-stone-400 py-2 bg-transparent font-sans text-sm md:text-base"
          />
          <button className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 transition-colors">
            <Filter size={18} />
          </button>
        </div>
        
        {/* Horizontal Scroll Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 justify-start md:justify-center hide-scrollbar px-1 md:px-4 snap-x">
          {['All', 'Food', 'Culture', 'Nature', 'Coffee', 'Shops'].map(cat => (
             <button 
               key={cat} 
               onClick={() => userLocation && handleSearch(userLocation[0], userLocation[1], cat === 'All' ? 'interesting places' : cat)}
               className="snap-start px-4 py-1.5 bg-white/90 backdrop-blur shadow-md rounded-full text-xs md:text-sm font-medium text-stone-700 hover:bg-stone-900 hover:text-white transition-all border border-stone-100 whitespace-nowrap active:scale-95"
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" style={{ background: '#EAE8E4' }} />

      {/* Map Controls - Moved up to avoid Navbar/Drawer */}
      <div className={`absolute bottom-24 md:bottom-12 right-4 md:right-12 z-[400] flex flex-col gap-3 transition-all duration-300 ${selectedSpot ? 'translate-y-[-60vh] md:translate-y-0' : ''}`}>
        <button className="p-3 bg-white text-stone-900 shadow-xl rounded-full hover:bg-stone-50 active:scale-95 transition-all">
          <Layers size={20} />
        </button>
        {userLocation && (
          <button onClick={handleRecenter} className="p-3 bg-stone-900 text-white shadow-xl rounded-full hover:bg-stone-800 active:scale-95 transition-all">
            <Navigation size={20} className={loadingLoc ? "animate-pulse" : ""} />
          </button>
        )}
      </div>

      {/* Spot Detail Modal - Bottom Sheet on Mobile */}
      {selectedSpot && (
        <div className="absolute inset-0 z-[1000] flex items-end md:items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-white w-full md:max-w-4xl h-[60vh] md:h-auto md:max-h-[80vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row animate-slide-up">
            
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-40 md:h-auto relative bg-stone-200 shrink-0">
              <img src={selectedSpot.image} className="w-full h-full object-cover" alt={selectedSpot.name} onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800')} />
              <button 
                onClick={() => setSelectedSpot(null)}
                className="absolute top-4 right-4 md:hidden p-2 bg-black/40 text-white rounded-full backdrop-blur-md active:scale-90 transition-transform"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-900">
                  {selectedSpot.category}
                </span>
                <span className="px-3 py-1 bg-stone-900/90 backdrop-blur rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                   <Star size={10} fill="currentColor" /> {selectedSpot.rating}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col overflow-y-auto bg-[#FDFCF8]">
              <div className="hidden md:flex justify-end mb-4">
                <button onClick={() => setSelectedSpot(null)} className="text-stone-400 hover:text-stone-900">
                  <X size={24} />
                </button>
              </div>

              <h2 className="font-serif text-2xl md:text-4xl text-stone-900 mb-2 leading-tight">{selectedSpot.name}</h2>
              <p className="text-stone-500 text-xs md:text-sm flex items-center gap-2 mb-4 md:mb-6">
                <MapPin size={14} /> Nearby • <Clock size={14} /> {selectedSpot.openTime}
              </p>

              <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-none">
                {selectedSpot.description || "A wonderful spot to explore in the area."}
              </p>

              <div className="mt-auto space-y-3 pb-safe">
                <Button className="w-full group py-3 md:py-4">
                  Add to Itinerary <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="secondary" className="w-full py-3 md:py-4" onClick={() => window.open(`https://maps.google.com/?q=${selectedSpot.lat},${selectedSpot.lng}`, '_blank')}>
                  Get Directions
                </Button>
              </div>
            </div>

          </div>
          {/* Backdrop for Mobile to close on tap outside */}
          <div className="absolute inset-0 bg-black/20 -z-10 md:hidden" onClick={() => setSelectedSpot(null)} />
        </div>
      )}
    </div>
  );
};
