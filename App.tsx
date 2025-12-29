
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatWidget } from './components/ChatWidget';
import { Home } from './views/Home';
import { Planner } from './views/Planner';
import { ItineraryView } from './views/ItineraryView';
import { Explore } from './views/Explore';
import { Profile } from './views/Profile';
import { Curated } from './views/Curated';
import { Auth } from './views/Auth';
import { LandingPage } from './views/LandingPage';
import { Onboarding } from './views/Onboarding';
import { AppView, Itinerary, Activity } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.AUTH);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [plannerDestination, setPlannerDestination] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [plannerKey, setPlannerKey] = useState(0); // For forcing reset

  // Initial Auth Check & Routing Logic
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        if (!user) {
          setView(window.innerWidth < 768 ? AppView.AUTH : AppView.LANDING);
        } else {
          const profile = await api.getUserProfile();
          setView(profile.hasCompletedOnboarding ? AppView.HOME : AppView.ONBOARDING);
        }
      } catch (e) {
        setView(AppView.AUTH);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleItineraryGenerated = (data: Itinerary) => {
    setItinerary(data);
    setView(AppView.ITINERARY);
  };

  const handleSelectItinerary = (data: Itinerary) => {
    setItinerary(data);
    setView(AppView.ITINERARY);
  };

  const handlePlanTrip = (destination: string) => {
    setPlannerDestination(destination);
    setPlannerKey(prev => prev + 1); // Reset state
    setView(AppView.PLANNER);
  };

  const handleViewChange = (newView: AppView) => {
    if (newView === AppView.PLANNER) {
      setPlannerDestination(''); // Clear explicit destination
      setPlannerKey(prev => prev + 1); // Force reset to step 1
    }
    setView(newView);
  };

  const handleItineraryUpdate = (dayNum: number, activities: Activity[], theme?: string) => {
    if (!itinerary) return;
    const updatedDays = itinerary.days.map(d => d.day === dayNum ? { ...d, activities, theme: theme || d.theme } : d);
    const updated = { ...itinerary, days: updatedDays };
    setItinerary(updated);
    api.updateItinerary(updated);
  };

  const handleAuthSuccess = async () => {
    const profile = await api.getUserProfile();
    setView(profile.hasCompletedOnboarding ? AppView.HOME : AppView.ONBOARDING);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#FDFCF8]">Loading...</div>;

  const renderView = () => {
    switch (view) {
      case AppView.LANDING: return <LandingPage onEnter={() => setView(AppView.AUTH)} />;
      case AppView.AUTH: return <Auth onLoginSuccess={handleAuthSuccess} />;
      case AppView.ONBOARDING: return <Onboarding onComplete={() => setView(AppView.HOME)} />;
      case AppView.HOME: return <Home onChangeView={handleViewChange} />;
      case AppView.PLANNER:
        return (
          <Planner 
            key={plannerKey}
            onBack={() => setView(AppView.HOME)} 
            onGenerated={handleItineraryGenerated} 
            initialDestination={plannerDestination}
          />
        );
      case AppView.ITINERARY:
        return itinerary ? <ItineraryView itinerary={itinerary} onBack={() => setView(AppView.HOME)} /> : <Home onChangeView={handleViewChange} />;
      case AppView.EXPLORE: return <Explore />;
      case AppView.PROFILE: return <Profile onNavigate={handleViewChange} onSelectItinerary={handleSelectItinerary} />;
      case AppView.CURATED: return <Curated onBack={() => setView(AppView.HOME)} onGenerate={handleItineraryGenerated} onPlan={handlePlanTrip} />;
      default: return <Home onChangeView={handleViewChange} />;
    }
  };

  const isMainApp = ![AppView.AUTH, AppView.LANDING, AppView.ONBOARDING].includes(view);

  return (
    <div className="min-h-screen text-stone-900 selection:bg-stone-200 selection:text-stone-900">
      {renderView()}
      {isMainApp && (
        <>
          <Navbar currentView={view} setView={handleViewChange} />
          <ChatWidget itinerary={itinerary} onUpdateItinerary={handleItineraryUpdate} />
        </>
      )}
    </div>
  );
};

export default App;
