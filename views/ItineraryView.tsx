
import React, { useState, useEffect, useRef } from 'react';
import { Itinerary, Activity } from '../types';
import { Button } from '../components/ui/Button';
import { Clock, MapPin, DollarSign, Bookmark, Share2, ArrowLeft, Check, Navigation, Map as MapIcon, X, CalendarCheck, Globe, ChevronDown, Info, Download } from 'lucide-react';
import { api } from '../services/api';

// Declare L for Leaflet
declare const L: any;

interface ItineraryViewProps {
  itinerary: Itinerary;
  onBack: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary: initialItinerary, onBack }) => {
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [showNavConfirm, setShowNavConfirm] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    setItinerary(initialItinerary);
  }, [initialItinerary]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.createItinerary(itinerary);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  const handleShare = () => {
    // Create a text summary
    const summary = `Trip to ${itinerary.destination} (${itinerary.duration} Days)\n\n` + 
      itinerary.days.map(d => `Day ${d.day}: ${d.theme}`).join('\n') + 
      `\n\nCreated with Kanso by Ainrion.`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBooked = async (dayNum: number, activityIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDays = itinerary.days.map(d => {
      if (d.day === dayNum) {
        const newActivities = [...d.activities];
        newActivities[activityIndex] = {
          ...newActivities[activityIndex],
          booked: !newActivities[activityIndex].booked
        };
        return { ...d, activities: newActivities };
      }
      return d;
    });
    
    const updatedItinerary = { ...itinerary, days: updatedDays };
    setItinerary(updatedItinerary);
    
    // Save to backend if it's already a saved trip
    await api.updateItinerary(updatedItinerary);
  };

  const handleActivitySelect = (act: Activity) => {
    if (selectedActivity === act) {
        // No op
    } else {
        setSelectedActivity(act);
    }
    
    if (window.innerWidth < 768) {
       setShowMobileMap(true);
    }
    setShowNavConfirm(true); 
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([0, 0], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Moved zoom control to top-right to avoid mobile overlays
      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const currentDayData = itinerary.days.find(d => d.day === activeDay);
    const activitiesToShow = currentDayData ? currentDayData.activities : [];

    if (activitiesToShow.length === 0) return;

    const bounds = L.latLngBounds([]);

    activitiesToShow.forEach((act, index) => {
      if (act.coordinates?.lat && act.coordinates?.lng) {
        const isSelected = selectedActivity === act;
        const isBooked = act.booked;
        
        const markerColor = isBooked ? '#059669' : (isSelected ? '#292524' : '#78716c'); 
        const zIndex = isSelected ? 1000 : (isBooked ? 500 : 100);

        const markerHtml = `
          <div style="
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background: ${markerColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: serif;
            font-size: ${isSelected ? '14px' : '10px'};
            transition: all 0.3s ease;
          ">
            ${index + 1}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-map-marker',
          html: markerHtml,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([act.coordinates.lat, act.coordinates.lng], { icon, zIndexOffset: zIndex })
          .addTo(map)
          .on('click', () => handleActivitySelect(act));
        
        markersRef.current.push(marker);
        bounds.extend([act.coordinates.lat, act.coordinates.lng]);
      }
    });

    if (bounds.isValid() && !selectedActivity) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [activeDay, itinerary, selectedActivity]);

  useEffect(() => {
    if (selectedActivity?.coordinates && mapInstanceRef.current) {
      // Offset slightly for mobile bottom sheet
      const latOffset = window.innerWidth < 768 ? -0.005 : 0;
      mapInstanceRef.current.flyTo(
        [selectedActivity.coordinates.lat + latOffset, selectedActivity.coordinates.lng], 
        16, 
        { duration: 1.5 }
      );
    }
  }, [selectedActivity]);

  const handleNavigate = () => {
    if (selectedActivity?.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedActivity.coordinates.lat},${selectedActivity.coordinates.lng}`;
      window.open(url, '_blank');
      setShowNavConfirm(false);
    }
  };

  const handleBookingSearch = () => {
    if (selectedActivity) {
      const query = encodeURIComponent(`${selectedActivity.activity} ${selectedActivity.location} tickets`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#FDFCF8] overflow-hidden print:h-auto print:overflow-visible">
      
      {/* Left Panel: Timeline & Details */}
      <div className={`
        flex-1 flex flex-col h-full overflow-y-auto pt-20 pb-32 px-6 md:px-12 max-w-2xl border-r border-stone-200 z-10 bg-[#FDFCF8] transition-transform duration-300 print:w-full print:max-w-none print:border-none print:pt-4 print:pb-4
        ${showMobileMap ? '-translate-x-full absolute md:static md:translate-x-0' : 'translate-x-0'}
      `}>
        {/* Header */}
        <div className="mb-8 border-b border-stone-200 pb-6 print:border-none">
          <button onClick={onBack} className="mb-4 text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest no-print p-2 -ml-2">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2 leading-tight">{itinerary.destination}</h1>
              <p className="text-stone-500 text-sm">{itinerary.duration} Days • {itinerary.budget}</p>
            </div>
            <div className="flex gap-2 no-print">
              <button 
                onClick={handleExport}
                className="p-2 rounded-full border border-stone-200 hover:bg-stone-100 transition-all text-stone-600 hidden md:flex"
                title="Export PDF"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 rounded-full border border-stone-200 hover:bg-stone-100 transition-all text-stone-600"
                title="Copy Summary"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className={`p-2 rounded-full border transition-all ${saved ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'}`}
              >
                {isSaving ? <span className="animate-spin text-xs">↻</span> : (saved ? <Check size={18} /> : <Bookmark size={18} />)}
              </button>
            </div>
          </div>
        </div>

        {/* Day Selector - Hidden in print (show all days stacked) */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar sticky top-0 bg-[#FDFCF8]/95 backdrop-blur-sm z-20 pt-4 border-b border-transparent no-print">
           {itinerary.days.map(d => (
             <button
               key={d.day}
               onClick={() => setActiveDay(d.day)}
               className={`whitespace-nowrap px-6 h-10 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center flex-shrink-0 border leading-none ${
                 activeDay === d.day 
                 ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-105' 
                 : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100 hover:border-stone-200 hover:text-stone-800'
               }`}
             >
               Day {d.day}
             </button>
           ))}
        </div>

        {/* Active Day Timeline (Screen) / All Days (Print) */}
        <div className="space-y-8 animate-fade-in min-h-[500px]">
          {itinerary.days.filter(d => d.day === activeDay).map(day => (
             <div key={day.day} className="print:hidden">
                <h2 className="font-serif text-2xl text-stone-800 mb-6">{day.theme}</h2>
                <div className="border-l border-stone-200 ml-4 space-y-8 pb-12">
                  {day.activities.map((act, idx) => {
                    const isSelected = selectedActivity === act;
                    const isBooked = act.booked;
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleActivitySelect(act)}
                        className={`relative pl-8 cursor-pointer group transition-all duration-300 ${isSelected ? 'scale-[1.01]' : 'hover:opacity-80'}`}
                      >
                        {/* Dot */}
                        <div className={`
                          absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full ring-4 ring-[#FDFCF8] transition-colors
                          ${isBooked ? 'bg-emerald-600' : (isSelected ? 'bg-stone-900 scale-125' : 'bg-stone-300 group-hover:bg-stone-500')}
                        `} />
                        
                        <div className={`p-5 rounded-lg border transition-all 
                          ${isSelected ? 'bg-white shadow-xl border-stone-200 ring-1 ring-stone-900/5' : 'bg-transparent border-transparent hover:bg-stone-50'}
                          ${isBooked ? 'border-l-4 border-l-emerald-500 bg-emerald-50/30' : ''}
                        `}>
                           <div className="flex justify-between items-start mb-2">
                              <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-sm">{act.time}</span>
                              <div className="flex gap-2">
                                {isBooked && <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold flex items-center gap-1"><Check size={10} /> Booked</span>}
                              </div>
                           </div>
                           <h3 className="font-serif text-lg text-stone-900 mb-2">{act.activity}</h3>
                           
                           <p className={`text-stone-600 text-sm leading-relaxed transition-all duration-300 ${isSelected ? '' : 'line-clamp-2'}`}>
                             {act.description}
                           </p>

                           {isSelected && (
                              <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 animate-fade-in bg-stone-100 p-4 rounded-md shadow-inner">
                                <div>
                                   <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1 flex items-center gap-1"><MapPin size={10}/> Location</span>
                                   <p className="text-sm font-medium text-stone-900 leading-tight">{act.location}</p>
                                </div>
                                <div>
                                   <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1 flex items-center gap-1"><DollarSign size={10}/> Cost</span>
                                   <p className="text-sm font-medium text-stone-900 leading-tight">{act.cost_estimate}</p>
                                </div>
                              </div>
                           )}
                           
                           <div className={`mt-4 pt-2 flex gap-3 items-center justify-between transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                              <button 
                                onClick={(e) => toggleBooked(day.day, idx, e)}
                                className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${isBooked ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                              >
                                <CalendarCheck size={12} />
                                {isBooked ? 'Booked' : 'Mark as Booked'}
                              </button>
                              
                              <button className={`text-xs flex items-center gap-1 transition-colors ${isSelected ? 'text-stone-900 font-medium' : 'text-stone-400 hover:text-stone-900'}`}>
                                {isSelected ? 'Close Details' : 'See Details'} <ArrowLeft size={10} className={`rotate-180 transition-transform ${isSelected ? '-rotate-90' : ''}`}/>
                              </button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          ))}

          {/* Print View Only (Shows all days) */}
          <div className="hidden print:block">
            {itinerary.days.map(day => (
              <div key={day.day} className="mb-8 print-break-inside">
                 <h2 className="font-serif text-2xl text-stone-900 mb-4 border-b border-black pb-2">Day {day.day}: {day.theme}</h2>
                 <div className="space-y-4">
                   {day.activities.map((act, idx) => (
                     <div key={idx} className="flex gap-4">
                        <span className="font-mono text-sm font-bold w-16">{act.time}</span>
                        <div>
                           <h3 className="font-bold">{act.activity}</h3>
                           <p className="text-sm text-stone-600 mb-1">{act.description}</p>
                           <p className="text-xs text-stone-500">{act.location} • {act.cost_estimate}</p>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            ))}
            <div className="mt-8 pt-8 border-t border-stone-200 text-center text-xs text-stone-400">
               Generated by Kanso Travel AI • A Product by Ainrion
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Map */}
      <div className={`
        absolute inset-0 md:static md:flex-1 bg-stone-100 z-0 transition-transform duration-300 no-print
        ${showMobileMap ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
         <div ref={mapContainerRef} className="w-full h-full" />
         
         {/* Mobile Close Map Button */}
         <button 
           onClick={() => { setShowMobileMap(false); setShowNavConfirm(false); setSelectedActivity(null); }}
           className="md:hidden absolute top-6 left-6 z-[1000] p-3 bg-white shadow-lg rounded-full text-stone-900 active:scale-95 transition-transform"
         >
           <X size={24} />
         </button>

         {/* Selected Activity Overlay - Mobile Optimized */}
         {selectedActivity && showNavConfirm && (
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto md:min-w-[320px] bg-white/95 backdrop-blur p-5 rounded-2xl shadow-2xl z-[1000] border border-stone-100 animate-slide-up">
              <div className="flex justify-between items-start mb-1">
                 <h3 className="font-serif text-lg md:text-xl text-stone-900 max-w-[200px] leading-tight">{selectedActivity.activity}</h3>
                 <button onClick={() => setShowNavConfirm(false)} className="text-stone-400 hover:text-stone-900 p-1"><X size={18}/></button>
              </div>
              <p className="text-xs text-stone-500 mb-4 flex items-center gap-1"><MapPin size={12}/> {selectedActivity.location}</p>
              
              <div className="flex gap-3">
                 <button 
                   onClick={handleNavigate}
                   className="flex-1 bg-stone-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 active:scale-95"
                 >
                   <Navigation size={14} /> Navigate
                 </button>
                 <button 
                   onClick={handleBookingSearch}
                   className="flex-1 bg-white border border-stone-200 text-stone-900 py-3 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
                 >
                   <Globe size={14} /> Tickets
                 </button>
              </div>
           </div>
         )}
      </div>

      {/* Mobile Map Toggle FAB - Moved Up to Clear Bottom Navbar */}
      {!showMobileMap && (
        <button
          onClick={() => setShowMobileMap(true)}
          className="md:hidden fixed bottom-24 right-6 z-30 bg-stone-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 no-print active:scale-95 transition-transform"
        >
          <MapIcon size={24} />
          <span className="text-sm font-medium">Map</span>
        </button>
      )}

    </div>
  );
};
