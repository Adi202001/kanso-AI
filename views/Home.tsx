
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { AppView, CuratedItem } from '../types';
import { MapPin, ArrowRight, Sparkles, Compass, User, Globe, Wind } from 'lucide-react';
import { CURATED_ITEMS } from '../data/curatedItems';
import { api } from '../services/api';

interface HomeProps {
  onChangeView: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ onChangeView }) => {
  const [personalizedItems, setPersonalizedItems] = useState<CuratedItem[]>([]);
  const [userName, setUserName] = useState('Traveler');

  useEffect(() => {
    const personalize = async () => {
      try {
        const profile = await api.getUserProfile();
        setUserName(profile.name || 'Traveler');

        // Dynamic Shuffle Logic:
        // Combine profile interests matching with a random shuffle to keep it "changing"
        let pool = [...CURATED_ITEMS];
        
        if (profile.defaultInterests && profile.defaultInterests.length > 0) {
          pool.sort((a, b) => {
            const aMatches = a.prefs.interests?.filter(i => profile.defaultInterests.includes(i)).length || 0;
            const bMatches = b.prefs.interests?.filter(i => profile.defaultInterests.includes(i)).length || 0;
            // Add a small random factor so it's not identical every time
            return (bMatches - aMatches) + (Math.random() - 0.5);
          });
        } else {
          // Pure random shuffle if no interests
          pool.sort(() => Math.random() - 0.5);
        }
        
        setPersonalizedItems(pool.slice(0, 3));
      } catch (e) {
        setPersonalizedItems(CURATED_ITEMS.sort(() => Math.random() - 0.5).slice(0, 3));
      }
    };
    personalize();
  }, []);

  const Feature = ({ icon: Icon, title, desc }: any) => (
    <div className="p-6 bg-stone-50 rounded-sm border border-stone-100 hover:shadow-md transition-shadow">
       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-900 mb-4 shadow-sm">
         <Icon size={18} />
       </div>
       <h3 className="font-serif text-lg text-stone-900 mb-2">{title}</h3>
       <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <header className="mb-20 md:mb-24 flex flex-col md:flex-row items-end justify-between gap-12">
        <div className="max-w-2xl w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full mb-6">
            <Sparkles size={12} className="text-stone-500" />
            <span className="text-[10px] uppercase tracking-widest text-stone-500">Kanso AI v2.5 is Live</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-stone-900 leading-[1.1] mb-6 md:mb-8">
            The art of <br />
            <span className="italic text-stone-500">intentional</span> travel.
          </h1>
          <p className="text-stone-500 text-base md:text-xl max-w-md leading-relaxed mb-8">
            Escape the noise of generic reviews. Kanso curates deeply personal itineraries based on your unique travel DNA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button onClick={() => onChangeView(AppView.PLANNER)} className="h-14 px-8 text-base md:text-lg w-full sm:w-auto">
              Draft Your Journey
            </Button>
            <Button variant="secondary" onClick={() => onChangeView(AppView.EXPLORE)} className="h-14 px-8 w-full sm:w-auto">
              Explore Nearby
            </Button>
          </div>
        </div>
        
        <div className="hidden md:block relative w-64 h-64 opacity-50">
           <div className="absolute inset-0 border border-stone-200 rounded-full animate-[spin_10s_linear_infinite]" />
           <div className="absolute inset-4 border border-stone-200 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        </div>
      </header>

      {/* Recommended Section */}
      <section className="mb-20">
        <div className="flex justify-between items-end mb-8 border-b border-stone-200 pb-4">
          <h2 className="font-serif text-2xl md:text-3xl text-stone-800">Curated for {userName}</h2>
          <button 
            onClick={() => onChangeView(AppView.CURATED)}
            className="text-stone-500 hover:text-stone-900 text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 transition-colors p-2"
          >
            Refresh Collection <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personalizedItems.map((item) => (
            <div key={item.id} className="group cursor-pointer" onClick={() => onChangeView(AppView.CURATED)}>
              <div className="relative aspect-[4/5] overflow-hidden mb-4 rounded-sm bg-stone-100">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {item.homeDisplay?.tag && (
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-stone-900 border border-stone-100">
                    {item.homeDisplay.tag}
                  </div>
                )}
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-1 group-hover:underline decoration-1 underline-offset-4 decoration-stone-300">{item.title}</h3>
              <p className="text-stone-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} /> {item.homeDisplay?.label || item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-24">
         <h2 className="font-serif text-2xl md:text-3xl text-stone-800 mb-8 text-center">Why Kanso?</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature 
              icon={User} 
              title="Hyper-Personalized" 
              desc="We don't do generic top-10 lists. Our AI analyzes your interests to find spots that resonate with your spirit." 
            />
            <Feature 
              icon={Compass} 
              title="Intelligent Logistics" 
              desc="Optimized routes that save you time. Spend more moments experiencing and less time commuting." 
            />
             <Feature 
              icon={Globe} 
              title="Authentic Discovery" 
              desc="Grounding technology connects you with real local gems, hidden cafes, and cultural secrets." 
            />
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-12 text-center pb-24 md:pb-12 flex flex-col items-center">
         <div className="w-8 h-8 bg-stone-900 text-stone-50 rounded-full flex items-center justify-center shadow-sm mb-4">
            <Wind size={16} strokeWidth={1.5} />
         </div>
         <p className="font-serif text-2xl text-stone-900 mb-2">Kanso</p>
         <p className="text-xs text-stone-400 uppercase tracking-widest mb-6">A Product by Ainrion</p>
         <div className="flex justify-center gap-6 text-stone-400 text-sm">
            <a href="#" className="hover:text-stone-600">About</a>
            <a href="#" className="hover:text-stone-600">Privacy</a>
            <a href="#" className="hover:text-stone-600">Terms</a>
         </div>
         <p className="text-stone-300 text-[10px] mt-8">© {new Date().getFullYear()} Ainrion. All rights reserved.</p>
      </footer>
    </div>
  );
};
