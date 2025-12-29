
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    api.getUserProfile().then(setProfile);
  }, []);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleFinish = async () => {
    if (profile) {
      await api.updateUserProfile({ ...profile, hasCompletedOnboarding: true });
      onComplete();
    }
  };

  const steps = [
    {
      id: 1,
      question: "What should we call you?",
      subtext: "We'll use this to personalize your experience.",
      input: (
        <input 
          value={profile?.name || ''}
          onChange={(e) => profile && setProfile({...profile, name: e.target.value})}
          className="w-full text-4xl font-serif border-b-2 border-stone-200 py-4 focus:outline-none focus:border-stone-900 bg-transparent"
          placeholder="Your Name"
          autoFocus
        />
      ),
      isValid: (profile?.name?.length || 0) > 0
    },
    {
      id: 2,
      question: "Where is your home base?",
      subtext: "To help us suggest trips near and far.",
      input: (
        <input 
          value={profile?.homeBase || ''}
          onChange={(e) => profile && setProfile({...profile, homeBase: e.target.value})}
          className="w-full text-4xl font-serif border-b-2 border-stone-200 py-4 focus:outline-none focus:border-stone-900 bg-transparent"
          placeholder="e.g. New York, London"
          autoFocus
        />
      ),
      isValid: (profile?.homeBase?.length || 0) > 0
    },
    {
      id: 3,
      question: "How do you like to travel?",
      subtext: "Select a few interests to tune our AI.",
      input: (
        <div className="flex flex-wrap gap-3 mt-4">
          {['Food', 'History', 'Art', 'Nature', 'Shopping', 'Adventure', 'Relaxation'].map(interest => (
            <button
              key={interest}
              onClick={() => {
                if (!profile) return;
                const current = profile.defaultInterests;
                const updated = current.includes(interest) 
                  ? current.filter(i => i !== interest)
                  : [...current, interest];
                setProfile({...profile, defaultInterests: updated});
              }}
              className={`px-6 py-3 rounded-full border transition-all duration-200 ${
                profile?.defaultInterests.includes(interest)
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-200 text-stone-500 hover:border-stone-400'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      ),
      isValid: (profile?.defaultInterests?.length || 0) > 0
    }
  ];

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 md:p-24 bg-[#FDFCF8] animate-fade-in">
      {/* Progress */}
      <div className="w-full max-w-xl mx-auto flex gap-2">
        {steps.map(s => (
          <div 
            key={s.id} 
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= s.id ? 'bg-stone-900' : 'bg-stone-100'}`} 
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
         <span className="text-stone-400 text-sm uppercase tracking-widest mb-4">Step {step} of {steps.length}</span>
         <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 leading-tight">{currentStep.question}</h2>
         <p className="text-stone-500 text-lg mb-12">{currentStep.subtext}</p>
         
         <div className="mb-12">
            {currentStep.input}
         </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-xl mx-auto flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          disabled={step === 1}
          className={step === 1 ? 'opacity-0' : 'opacity-100'}
        >
          Back
        </Button>
        
        <Button 
          onClick={step === steps.length ? handleFinish : handleNext}
          disabled={!currentStep.isValid}
          className="group"
        >
          {step === steps.length ? "Finish Setup" : "Continue"} 
          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
