
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, MapPin, Clock, Wallet, Check, Calendar, FileText, Info, Globe } from 'lucide-react';
import { generateItinerary } from '../services/geminiService';
import { Itinerary, UserPreferences, CuratedItem } from '../types';
import { Button } from '../components/ui/Button';
import { CURATED_ITEMS } from '../data/curatedItems';

interface CuratedProps {
  onBack: () => void;
  onGenerate: (itinerary: Itinerary) => void;
  onPlan: (destination: string) => void;
}

export const Curated: React.FC<CuratedProps> = ({ onBack, onGenerate, onPlan }) => {
  const [selectedItem, setSelectedItem] = useState<CuratedItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayItems, setDisplayItems] = useState<CuratedItem[]>([]);

  useEffect(() => {
    // Dynamic shuffle for the gallery view
    setDisplayItems([...CURATED_ITEMS].sort(() => Math.random() - 0.5));
  }, []);

  const handleGenerateClick = async () => {
    if (!selectedItem) return;
    setLoading(true);
    
    const fullPrefs: UserPreferences = {
      destination: selectedItem.prefs.destination || selectedItem.title,
      days: selectedItem.prefs.days || 3,
      startDate: '',
      travelers: 1,
      groupComposition: [],
      budget: selectedItem.prefs.budget || 'Moderate',
      interests: selectedItem.prefs.interests || ['Culture'],
    };

    try {
      const result = await generateItinerary(fullPrefs);
      onGenerate(result);
    } catch (e) {
      console.error(e);
      alert("Unable to load this experience right now.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedItem) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FDFCF8] overflow-y-auto animate-fade-in flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative shrink-0">
          <img 
            src={selectedItem.image} 
            alt={selectedItem.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 md:hidden p-3 bg-black/30 backdrop-blur-md text-white rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen p-6 md:p-20 flex flex-col justify-center bg-[#FDFCF8]">
          <button 
            onClick={() => setSelectedItem(null)}
            className="hidden md:flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors mb-12 uppercase tracking-widest text-sm"
          >
            <ArrowLeft size={16} /> Back to Collection
          </button>

          <div className="mb-2">
            <span className="text-stone-500 uppercase tracking-widest text-xs border border-stone-200 px-3 py-1 rounded-full">
              {selectedItem.subtitle}
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-7xl text-stone-900 mb-6 md:mb-8 leading-[1.1]">
            {selectedItem.title}
          </h1>

          <div className="flex gap-4 md:gap-6 mb-8 text-stone-500 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{selectedItem.prefs.days} Days</span>
            </div>
            {selectedItem.prefs.budget && (
              <div className="flex items-center gap-2">
                <Wallet size={16} />
                <span>{selectedItem.prefs.budget}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Check size={16} />
              <span>{selectedItem.prefs.interests?.slice(0, 2).join(', ')}</span>
            </div>
          </div>

          <p className="text-stone-600 leading-relaxed text-base md:text-lg mb-8 max-w-lg">
            {selectedItem.description}
          </p>

          <div className="bg-stone-50 p-6 md:p-8 rounded-sm mb-12">
            <h3 className="font-serif text-2xl text-stone-900 mb-6 border-b border-stone-200 pb-2">Travel Essentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                  <Calendar size={14}/> Best Time to Visit
                </h4>
                <p className="text-stone-800 text-sm md:text-base font-light leading-relaxed">{selectedItem.details.bestTime}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                  <FileText size={14}/> Visa Information
                </h4>
                <p className="text-stone-800 text-sm md:text-base font-light leading-relaxed">{selectedItem.details.visa}</p>
              </div>
              
              <div className="sm:col-span-2">
                <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                  <Info size={14}/> Local Customs & Etiquette
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedItem.details.customs.map((custom, idx) => (
                    <span key={idx} className="bg-white border border-stone-200 text-stone-600 text-sm px-4 py-2 rounded-full shadow-sm">
                      {custom}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pb-24 md:pb-0">
             <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                 onClick={handleGenerateClick} 
                 isLoading={loading}
                 className="w-full sm:w-auto py-4"
               >
                 Instant Itinerary
               </Button>
               <Button 
                 variant="secondary"
                 onClick={() => onPlan(selectedItem.prefs.destination || selectedItem.title)}
                 className="w-full sm:w-auto py-4"
               >
                 Customize Plan
               </Button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto animate-fade-in">
      <button 
        onClick={onBack} 
        className="mb-8 text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest active:scale-95 w-fit p-2 -ml-2"
      >
        <ArrowLeft size={16} /> Home
      </button>

      <h1 className="font-serif text-4xl md:text-6xl text-stone-900 mb-4">Curated Collections</h1>
      <p className="text-stone-500 mb-12 max-w-xl leading-relaxed text-sm md:text-base">
        A rotating selection of destinations blending heritage, tranquility, and modern aesthetics. 
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer bg-white border border-stone-100 rounded-sm overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          >
            <div className="aspect-[16/10] overflow-hidden relative">
              <img 
                src={item.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={item.title} 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
            <div className="p-6">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2 block">{item.subtitle}</span>
              <h3 className="font-serif text-2xl text-stone-900 mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
              <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between items-center">
                 <span className="text-xs text-stone-400">{item.prefs.days} Days</span>
                 <ArrowUpRight size={18} className="text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
