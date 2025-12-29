
import React, { useState, useEffect } from 'react';
import { UserProfile, Itinerary, AppView } from '../types';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { MapPin, User, Bookmark, Trash2, ArrowRight, Settings, LogOut } from 'lucide-react';

interface ProfileProps {
  onNavigate: (view: AppView) => void;
  onSelectItinerary: (itinerary: Itinerary) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, onSelectItinerary }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, i] = await Promise.all([
          api.getUserProfile(),
          api.getItineraries()
        ]);
        setProfile(p);
        setSavedItineraries(i);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (profile) {
      await api.updateUserProfile(profile);
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    const isMobile = window.innerWidth < 768;
    onNavigate(isMobile ? AppView.AUTH : AppView.LANDING);
  };

  const handleDeleteTrip = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await api.deleteItinerary(id);
    setSavedItineraries(prev => prev.filter(i => i.id !== id));
  };

  const availableInterests = ['Food', 'History', 'Art', 'Nature', 'Shopping', 'Adventure', 'Relaxation'];

  const toggleInterest = (interest: string) => {
    if (!profile) return;
    setProfile(prev => prev ? ({
      ...prev,
      defaultInterests: prev.defaultInterests.includes(interest)
        ? prev.defaultInterests.filter(i => i !== interest)
        : [...prev.defaultInterests, interest]
    }) : null);
  };

  if (loading || !profile) {
    return <div className="pt-24 text-center text-stone-400">Loading Profile...</div>;
  }

  return (
    <div className="pt-24 pb-32 px-6 md:px-12 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 border-b border-stone-200 pb-8 gap-4">
        <div>
           <h1 className="font-serif text-5xl text-stone-900 mb-2">My Passport</h1>
           <p className="text-stone-500">Manage your identity and travel memories.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="ghost" onClick={handleLogout} className="text-stone-400 hover:text-red-600">
               <LogOut size={18} className="mr-2" /> Log Out
            </Button>
            <Button variant="ghost" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
               {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Identity */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-[#F5F4F0] p-8 rounded-sm text-center">
            <div className="w-24 h-24 bg-stone-300 rounded-full mx-auto mb-4 flex items-center justify-center text-stone-500 shadow-inner">
               <User size={40} />
            </div>
            {isEditing ? (
              <input 
                className="w-full bg-transparent border-b border-stone-400 text-center font-serif text-xl mb-2 focus:outline-none focus:border-stone-900 transition-colors"
                value={profile.name}
                onChange={e => setProfile({...profile!, name: e.target.value})}
              />
            ) : (
              <h2 className="font-serif text-2xl text-stone-900 mb-2">{profile.name}</h2>
            )}
            
            <div className="flex items-center justify-center gap-2 text-stone-500 text-sm mb-4">
              <MapPin size={14} />
              {isEditing ? (
                <input 
                  className="bg-transparent border-b border-stone-300 w-24 text-center focus:outline-none focus:border-stone-800 transition-colors"
                  value={profile.homeBase}
                  onChange={e => setProfile({...profile!, homeBase: e.target.value})}
                  placeholder="City"
                />
              ) : (
                <span>{profile.homeBase || 'Global Citizen'}</span>
              )}
            </div>

            {isEditing ? (
               <textarea 
                  className="w-full bg-transparent border border-stone-300 p-2 text-sm text-stone-600 focus:outline-none focus:border-stone-800 transition-colors rounded-sm"
                  value={profile.bio}
                  onChange={e => setProfile({...profile!, bio: e.target.value})}
                  rows={3}
               />
            ) : (
               <p className="text-stone-600 italic text-sm leading-relaxed">"{profile.bio}"</p>
            )}
          </div>

          {/* Preferences Section */}
          <div className="space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2">Travel DNA</h3>
            
            <div>
              <label className="block text-xs font-bold text-stone-900 mb-2">Default Budget</label>
              {isEditing ? (
                 <div className="flex gap-2">
                    {['Budget', 'Moderate', 'Luxury'].map(b => (
                      <button 
                        key={b}
                        onClick={() => setProfile({...profile!, defaultBudget: b as any})}
                        className={`px-2 py-1 text-xs border transition-all active:scale-95 ${profile.defaultBudget === b ? 'bg-stone-900 text-white border-stone-900' : 'text-stone-500 border-stone-200 hover:border-stone-400'}`}
                      >
                        {b}
                      </button>
                    ))}
                 </div>
              ) : (
                <span className="text-stone-600">{profile.defaultBudget}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-900 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {isEditing 
                  ? availableInterests.map(i => (
                      <button 
                        key={i} 
                        onClick={() => toggleInterest(i)}
                        className={`text-xs px-2 py-1 border rounded-full transition-all active:scale-95 ${profile.defaultInterests.includes(i) ? 'bg-stone-800 text-white' : 'text-stone-400 hover:border-stone-400'}`}
                      >
                        {i}
                      </button>
                    ))
                  : profile.defaultInterests.length > 0 
                      ? profile.defaultInterests.map(i => <span key={i} className="text-xs bg-stone-100 px-2 py-1 rounded-full text-stone-600">{i}</span>)
                      : <span className="text-xs text-stone-400">None selected</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Saved Itineraries */}
        <div className="md:col-span-2">
          <h3 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-2">
            <Bookmark size={20} className="text-stone-400" /> Saved Journeys
          </h3>

          <div className="space-y-4">
            {savedItineraries.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 border border-dashed border-stone-200 rounded-sm">
                <p className="text-stone-400 mb-4">No saved journeys yet.</p>
                <Button onClick={() => onNavigate(AppView.PLANNER)}>Plan your first trip</Button>
              </div>
            ) : (
              savedItineraries.map(itinerary => (
                <div 
                  key={itinerary.id}
                  onClick={() => onSelectItinerary(itinerary)}
                  className="group relative bg-white border border-stone-200 p-6 cursor-pointer hover:shadow-lg hover:border-stone-300 active:scale-[0.99] transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-xl text-stone-900 mb-1 group-hover:underline underline-offset-4 decoration-stone-300">
                        {itinerary.destination}
                      </h4>
                      <p className="text-xs text-stone-500 uppercase tracking-wider">
                        {itinerary.duration} Days • {itinerary.budget}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleDeleteTrip(e, itinerary.id)}
                          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10 active:scale-90"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ArrowRight size={16} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                    </div>
                  </div>
                  
                  {/* Mini Preview */}
                  <div className="mt-4 flex gap-2 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
                    {itinerary.days.slice(0, 3).map((d, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-stone-50 rounded-sm text-stone-600 border border-stone-100 whitespace-nowrap">
                        Day {d.day}: {d.theme}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
