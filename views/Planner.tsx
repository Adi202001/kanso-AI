
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { UserPreferences, Itinerary, TravelSuggestions } from '../types';
import { generateItinerary, getTravelSuggestions } from '../services/geminiService';
import { api } from '../services/api';
import { ArrowLeft, Check, Clock, ArrowRight, Bookmark, Calendar, Users, Baby, Activity, AlertTriangle, Plane, Hotel, ExternalLink, Circle } from 'lucide-react';

interface PlannerProps {
  onBack: () => void;
  onGenerated: (itinerary: Itinerary) => void;
  initialDestination?: string;
}

const ThinkingLog = ({ message: customMessage }: { message?: string }) => {
  const [message, setMessage] = useState(customMessage || "Analyzing your request...");
  
  const steps = [
    "Consulting local guides...",
    "Checking weather patterns...",
    "Finding hidden culinary gems...",
    "Optimizing route logistics...",
    "Checking opening hours...",
    "Finalizing your experience..."
  ];

  useEffect(() => {
    if (customMessage) return;
    let i = 0;
    const interval = setInterval(() => {
      setMessage(steps[i % steps.length]);
      i++;
    }, 1800);
    return () => clearInterval(interval);
  }, [customMessage]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in py-12">
       <div className="w-16 h-16 rounded-full border-2 border-stone-100 border-t-stone-900 animate-spin" />
       <p className="font-serif text-xl text-stone-800">{message}</p>
       <p className="text-xs uppercase tracking-widest text-stone-400">Kanso AI is designing your trip</p>
    </div>
  );
};

export const Planner: React.FC<PlannerProps> = ({ onBack, onGenerated, initialDestination }) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'flights' | 'stays'>('flights');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [suggestions, setSuggestions] = useState<TravelSuggestions | null>(null);
  const [isFlightSelected, setIsFlightSelected] = useState(true);
  const [isHotelSelected, setIsHotelSelected] = useState(true);
  
  const [prefs, setPrefs] = useState<UserPreferences>({
    destination: initialDestination || '',
    days: 3,
    startDate: '',
    travelers: 1,
    groupComposition: [],
    budget: 'Moderate',
    interests: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, saved] = await Promise.all([
          api.getUserProfile(),
          api.getItineraries()
        ]);

        setPrefs(p => ({
          ...p,
          budget: profile.defaultBudget || 'Moderate',
          interests: profile.defaultInterests || []
        }));
        setSavedItineraries(saved);
      } catch (e) {
        console.error("Failed to load planner data", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (initialDestination) {
      setPrefs(prev => ({ ...prev, destination: initialDestination }));
      setStep(2);
    }
  }, [initialDestination]);

  const handleInterestToggle = (interest: string) => {
    setPrefs(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGroupToggle = (type: string) => {
    setPrefs(prev => ({
      ...prev,
      groupComposition: prev.groupComposition.includes(type)
        ? prev.groupComposition.filter(t => t !== type)
        : [...prev.groupComposition, type]
    }));
  };

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getTravelSuggestions(prefs);
      setSuggestions(data);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch travel suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generateItinerary(prefs);
      if (suggestions) {
        result.suggestions = {
          flight: isFlightSelected ? suggestions.flight : { airline: "TBD", price: "---", route: "---", note: "" },
          hotel: isHotelSelected ? suggestions.hotel : { name: "TBD", price: "---", rating: "---", description: "" }
        };
      }
      onGenerated(result);
    } catch (err: any) {
      setError(err.message || 'Could not generate itinerary.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFCF8]">
         <ThinkingLog message={step === 3 ? "Finding best travel deals..." : "Crafting your journey..."} />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 px-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <button onClick={onBack} className="mb-8 text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest active:scale-95 w-fit">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex-1">
        {/* Progress */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-stone-900' : 'bg-stone-200'}`} />
          ))}
        </div>

        {/* Step 1: Destination */}
        {step === 1 && (
          <div className="animate-fade-in space-y-12">
            <div className="space-y-8">
              <h2 className="font-serif text-4xl text-stone-900">Where is your next adventure?</h2>
              <div className="relative">
                <input
                  type="text"
                  value={prefs.destination}
                  onChange={(e) => setPrefs({...prefs, destination: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && prefs.destination && setStep(2)}
                  placeholder="e.g. Kyoto, Paris, Cape Town"
                  className="w-full text-3xl md:text-5xl font-serif border-b-2 border-stone-200 py-4 focus:border-stone-900 focus:outline-none bg-transparent placeholder-stone-300 transition-colors"
                  autoFocus
                />
              </div>
              <div className="pt-4">
                 <Button onClick={() => setStep(2)} disabled={!prefs.destination}>Next Step</Button>
              </div>
            </div>

            {/* Saved Plans */}
            <div className="pt-8 border-t border-stone-100">
                <h3 className="text-sm uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                   <Bookmark size={14} /> Saved Journeys
                </h3>
                {savedItineraries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedItineraries.map((itinerary) => (
                      <div key={itinerary.id} onClick={() => onGenerated(itinerary)} className="group p-5 border border-stone-200 bg-white hover:shadow-lg transition-all cursor-pointer rounded-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif text-xl text-stone-900">{itinerary.destination}</h4>
                          <ArrowRight size={16} />
                        </div>
                        <div className="text-xs text-stone-500">{itinerary.duration} Days • {itinerary.budget}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-300 text-xs italic">No saved trips found.</p>
                )}
            </div>
          </div>
        )}

        {/* Step 2: Logistics */}
        {step === 2 && (
          <div className="animate-fade-in space-y-12">
            <h2 className="font-serif text-4xl text-stone-900">Details of your journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-stone-500 text-sm uppercase tracking-widest block">How many days?</label>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setPrefs(p => ({...p, days: Math.max(1, p.days - 1)}))} className="w-12 h-12 rounded-full border border-stone-300 flex items-center justify-center">-</button>
                    <span className="font-serif text-3xl w-8 text-center">{prefs.days}</span>
                    <button onClick={() => setPrefs(p => ({...p, days: Math.min(14, p.days + 1)}))} className="w-12 h-12 rounded-full border border-stone-300 flex items-center justify-center">+</button>
                  </div>
                </div>
                <div className="space-y-4">
                   <label className="text-stone-500 text-sm uppercase tracking-widest block">Starting Date</label>
                   <div className="relative border-b-2 border-stone-200">
                      <input type="date" value={prefs.startDate} onChange={(e) => setPrefs({...prefs, startDate: e.target.value})} className="w-full py-3 bg-transparent font-serif text-xl" />
                      <Calendar className="absolute right-0 top-3 text-stone-400" size={20} />
                   </div>
                </div>
            </div>
            <div className="pt-8 flex gap-4">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next Step</Button>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Interests */}
        {step === 3 && (
          <div className="animate-fade-in space-y-8">
            <h2 className="font-serif text-4xl text-stone-900">What inspires you?</h2>
            <div className="grid grid-cols-3 gap-4">
              {['Budget', 'Moderate', 'Luxury'].map((b) => (
                <button key={b} onClick={() => setPrefs({...prefs, budget: b as any})} className={`py-4 px-2 border transition-all ${prefs.budget === b ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-500'}`}>{b}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {['Food', 'History', 'Art', 'Nature', 'Shopping', 'Adventure', 'Relaxation'].map(interest => (
                <button key={interest} onClick={() => handleInterestToggle(interest)} className={`px-6 py-3 rounded-full border transition-all ${prefs.interests.includes(interest) ? 'bg-stone-100 border-stone-900 text-stone-900' : 'border-stone-200 text-stone-500'}`}>{interest}</button>
              ))}
            </div>
            {error && <div className="p-4 bg-red-50 text-red-600 flex gap-2"><AlertTriangle size={18} />{error}</div>}
            <div className="pt-8 flex gap-4">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={fetchSuggestions}>See Recommendations</Button>
            </div>
          </div>
        )}

        {/* Step 4: Suggestions with Selectable Tabs */}
        {step === 4 && suggestions && (
          <div className="animate-fade-in space-y-8">
             <div className="space-y-2">
               <h2 className="font-serif text-4xl text-stone-900">Travel Essentials</h2>
               <p className="text-stone-500 italic">Select your preferred options to include in the itinerary.</p>
             </div>

             {/* Tab Navigation */}
             <div className="flex border-b border-stone-200">
                <button 
                  onClick={() => setActiveTab('flights')}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'flights' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                   <Plane size={16} /> 
                   Flights 
                   {isFlightSelected && <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('stays')}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'stays' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                >
                   <Hotel size={16} /> 
                   Stays 
                   {isHotelSelected && <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />}
                </button>
             </div>

             {/* Tab Content */}
             <div className="min-h-[350px]">
                {activeTab === 'flights' && (
                  <div 
                    onClick={() => setIsFlightSelected(!isFlightSelected)}
                    className={`p-10 bg-white border cursor-pointer transition-all relative overflow-hidden group rounded-sm animate-fade-in ${isFlightSelected ? 'border-stone-900 ring-1 ring-stone-900 shadow-2xl' : 'border-stone-200 opacity-60'}`}
                  >
                     <div className="absolute top-6 right-6 z-20">
                        {isFlightSelected ? (
                          <div className="bg-stone-900 text-white rounded-full p-1.5"><Check size={16} /></div>
                        ) : (
                          <div className="text-stone-200"><Circle size={24} /></div>
                        )}
                     </div>
                     <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Plane size={240} />
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isFlightSelected ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                              <Plane size={20} />
                           </div>
                           <span className={`text-xs uppercase tracking-[0.2em] font-bold ${isFlightSelected ? 'text-stone-900' : 'text-stone-400'}`}>Recommended Route</span>
                        </div>
                        
                        <div>
                           <h3 className="font-serif text-3xl text-stone-900 mb-1">{suggestions.flight.airline}</h3>
                           <p className="text-stone-500 font-medium">{suggestions.flight.route}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-serif text-stone-900">{suggestions.flight.price}</span>
                           <span className="text-sm text-stone-400">estimated return</span>
                        </div>

                        <p className="text-sm text-stone-400 italic max-w-md">{suggestions.flight.note}</p>

                        <a 
                          href={`https://www.google.com/search?q=flights+to+${prefs.destination}+${prefs.startDate}`} 
                          target="_blank" 
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-stone-900 hover:underline pt-4 border-t border-stone-100"
                        >
                          Compare on Google Flights <ExternalLink size={14} />
                        </a>
                     </div>
                  </div>
                )}

                {activeTab === 'stays' && (
                  <div 
                    onClick={() => setIsHotelSelected(!isHotelSelected)}
                    className={`p-10 bg-white border cursor-pointer transition-all relative overflow-hidden group rounded-sm animate-fade-in ${isHotelSelected ? 'border-stone-900 ring-1 ring-stone-900 shadow-2xl' : 'border-stone-200 opacity-60'}`}
                  >
                     <div className="absolute top-6 right-6 z-20">
                        {isHotelSelected ? (
                          <div className="bg-stone-900 text-white rounded-full p-1.5"><Check size={16} /></div>
                        ) : (
                          <div className="text-stone-200"><Circle size={24} /></div>
                        )}
                     </div>
                     <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Hotel size={240} />
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isHotelSelected ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                              <Hotel size={20} />
                           </div>
                           <span className={`text-xs uppercase tracking-[0.2em] font-bold ${isHotelSelected ? 'text-stone-900' : 'text-stone-400'}`}>Top Pick</span>
                        </div>
                        
                        <div>
                           <h3 className="font-serif text-3xl text-stone-900 mb-1">{suggestions.hotel.name}</h3>
                           <div className="flex items-center gap-1">
                              {Array.from({length: Math.floor(parseFloat(suggestions.hotel.rating)) || 5}).map((_, i) => (
                                <Check key={i} size={14} className={isHotelSelected ? 'text-stone-900' : 'text-stone-300'} />
                              ))}
                              <span className="text-xs text-stone-400 ml-2">({suggestions.hotel.rating} Rating)</span>
                           </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-serif text-stone-900">{suggestions.hotel.price}</span>
                           <span className="text-sm text-stone-400">avg. per night</span>
                        </div>

                        <p className="text-stone-500 leading-relaxed max-w-md">{suggestions.hotel.description}</p>

                        <a 
                          href={`https://www.google.com/search?q=hotels+in+${prefs.destination}+${suggestions.hotel.name}`} 
                          target="_blank" 
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-stone-900 hover:underline pt-4 border-t border-stone-100"
                        >
                          View Hotel Details <ExternalLink size={14} />
                        </a>
                     </div>
                  </div>
                )}
             </div>

             <div className="pt-8 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-stone-100">
                <Button variant="secondary" onClick={() => setStep(3)} className="w-full md:w-auto">Back</Button>
                <div className="text-center md:text-left">
                   <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Selections</p>
                   <div className="flex gap-4">
                      <span className={`text-xs ${isFlightSelected ? 'text-stone-900' : 'text-stone-300'}`}>Flight</span>
                      <span className={`text-xs ${isHotelSelected ? 'text-stone-900' : 'text-stone-300'}`}>Hotel</span>
                   </div>
                </div>
                <Button onClick={handleSubmit} className="w-full md:w-64 h-14">Generate Itinerary</Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
