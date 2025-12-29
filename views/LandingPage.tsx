
import React from 'react';
import { Button } from '../components/ui/Button';
import { ArrowRight, Sparkles, Map, Compass, Brain, Globe, Shield, MessageSquare, Zap, Clock, Star, Wind } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-900 animate-fade-in selection:bg-stone-900 selection:text-white overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-6 bg-[#FDFCF8]/90 backdrop-blur-sm border-b border-transparent transition-all">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-stone-900 text-stone-50 rounded-full flex items-center justify-center shadow-sm">
              <Wind size={16} strokeWidth={1.5} />
           </div>
           <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">Kanso</span>
        </div>
        <div className="flex items-center gap-8">
           <button onClick={onEnter} className="text-sm font-medium hover:text-stone-600 transition-colors">Sign In</button>
           <Button onClick={onEnter} className="h-10 px-6 text-sm">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-12 max-w-7xl mx-auto text-center relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-stone-100 rounded-full -z-10 animate-[spin_60s_linear_infinite]" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-stone-200 rounded-full -z-10 animate-[spin_40s_linear_infinite_reverse]" />

         <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full mb-8">
            <Sparkles size={14} className="text-stone-500" />
            <span className="text-xs uppercase tracking-widest text-stone-600">The Minimalist Travel AI</span>
         </div>
         
         <h1 className="font-serif text-7xl md:text-8xl leading-[1.1] mb-8 text-stone-900">
            Travel without <br/>
            <span className="italic text-stone-400">the noise.</span>
         </h1>
         
         <p className="text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Kanso strips away the clutter of modern travel planning. 
            We use advanced AI to curate deeply personal itineraries that respect your time, budget, and spirit.
         </p>
         
         <div className="flex justify-center gap-4">
            <Button onClick={onEnter} className="h-16 px-10 text-lg group">
               Plan My Trip <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" onClick={onEnter} className="h-16 px-10 text-lg">
               Explore Demo
            </Button>
         </div>
      </section>

      {/* Product Showcase - Bento Grid */}
      <section className="py-24 px-12 bg-stone-50 border-t border-stone-100">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
               <h2 className="font-serif text-4xl text-stone-900">Designed for clarity.</h2>
               <p className="text-stone-500 max-w-sm text-right">Functionality stripped to its essence, powered by the latest generation of AI.</p>
            </div>

            <div className="grid grid-cols-4 grid-rows-2 gap-6 h-[600px]">
               
               {/* 1. Main Feature: The Planner */}
               <div className="col-span-2 row-span-2 bg-white p-8 rounded-sm shadow-sm border border-stone-100 flex flex-col justify-between group overflow-hidden relative">
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-900">
                        <Brain size={24} />
                     </div>
                     <h3 className="font-serif text-3xl mb-4">Generative Itineraries</h3>
                     <p className="text-stone-500 leading-relaxed max-w-sm">
                        Tell us where, when, and who. Our AI considers millions of data points to craft a cohesive journey, complete with logistics, pricing, and hidden gems.
                     </p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-stone-50 rounded-tl-3xl border-t border-l border-stone-100 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                      <div className="space-y-3 opacity-50">
                          <div className="w-48 h-4 bg-stone-200 rounded-full" />
                          <div className="w-32 h-4 bg-stone-200 rounded-full" />
                          <div className="w-40 h-4 bg-stone-200 rounded-full" />
                      </div>
                  </div>
               </div>

               {/* 2. Map Feature */}
               <div className="col-span-1 row-span-1 bg-stone-900 text-stone-50 p-6 rounded-sm flex flex-col justify-between group cursor-pointer hover:bg-stone-800 transition-colors" onClick={onEnter}>
                  <div className="flex justify-between items-start">
                     <Map size={24} />
                     <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                     <h3 className="font-serif text-xl mb-1">Visual Discovery</h3>
                     <p className="text-stone-400 text-sm">Interactive maps grounded in reality.</p>
                  </div>
               </div>

               {/* 3. Curated Collections */}
               <div className="col-span-1 row-span-2 bg-[#E8E6E1] p-6 rounded-sm relative overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60 group-hover:opacity-70 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-end">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4">
                        <Compass size={20} className="text-stone-900" />
                     </div>
                     <h3 className="font-serif text-2xl mb-2 text-stone-900">Curated Spots</h3>
                     <p className="text-stone-700 text-sm font-medium">Hand-picked collections for the discerning traveler.</p>
                  </div>
               </div>

               {/* 4. Privacy/Safety */}
               <div className="col-span-1 row-span-1 bg-white border border-stone-200 p-6 rounded-sm flex flex-col justify-center items-center text-center">
                  <Shield size={32} className="text-stone-300 mb-4" />
                  <h3 className="font-serif text-lg mb-1">Private & Secure</h3>
                  <p className="text-stone-400 text-xs">Your data belongs to you.</p>
               </div>
            </div>
         </div>
      </section>

      {/* NEW SECTION 1: The Process (How it works) */}
      <section className="py-32 px-12 bg-[#FDFCF8]">
         <div className="max-w-7xl mx-auto">
             <div className="text-center mb-20">
                 <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">The Way of Kanso</h2>
                 <p className="text-stone-500">From chaotic tabs to a unified journey in three simple steps.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-stone-200 -z-10" />

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                       <Zap size={32} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Set Intent</h3>
                    <p className="text-stone-500 leading-relaxed max-w-xs">
                       Input your destination, budget, and travel companions. Our natural language engine understands nuance, not just keywords.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                       <Sparkles size={32} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">AI Curation</h3>
                    <p className="text-stone-500 leading-relaxed max-w-xs">
                       The model analyzes millions of possibilities, filtering for quality, proximity, and your personal taste profile.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                       <Globe size={32} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                    </div>
                    <h3 className="font-serif text-2xl mb-4">Depart</h3>
                    <p className="text-stone-500 leading-relaxed max-w-xs">
                       Receive a fully interactive map and timeline. Export to PDF, sync with calendar, or just go with the flow.
                    </p>
                </div>
             </div>
         </div>
      </section>

      {/* NEW SECTION 2: Intelligent Companion (Chat Focus) */}
      <section className="py-24 bg-stone-100">
         <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
             <div className="order-2 md:order-1 relative">
                 {/* Abstract Chat UI */}
                 <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md ml-auto relative z-10">
                     <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                        <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white">
                           <Wind size={16} />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-stone-900">Kanso Guide</div>
                           <div className="text-xs text-stone-400">Online</div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="bg-stone-50 p-3 rounded-lg rounded-tl-none text-sm text-stone-600">
                           How do I say "Where is the train station" in Japanese?
                        </div>
                        <div className="bg-stone-900 p-3 rounded-lg rounded-tr-none text-sm text-white">
                           "Eki wa doko desu ka?" (駅はどこですか). Would you like me to pronounce it?
                        </div>
                        <div className="bg-stone-50 p-3 rounded-lg rounded-tl-none text-sm text-stone-600">
                           Also, find me a quiet coffee shop nearby.
                        </div>
                     </div>
                 </div>
                 {/* Decorative Circle */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-stone-200 rounded-full scale-150 opacity-50" />
             </div>
             
             <div className="order-1 md:order-2">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full mb-6 shadow-sm">
                    <MessageSquare size={14} className="text-stone-900" />
                    <span className="text-xs uppercase tracking-widest text-stone-900">Live Assistance</span>
                 </div>
                 <h2 className="font-serif text-5xl text-stone-900 mb-6 leading-tight">Always by your side.</h2>
                 <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                    Kanso isn't just a planner; it's a co-pilot. Our integrated chat assistant handles currency conversion, translation, 
                    and emergency information in real-time, grounded by live Google Search data.
                 </p>
                 <div className="flex gap-8">
                     <div className="flex flex-col gap-1">
                        <span className="font-serif text-3xl text-stone-900">24/7</span>
                        <span className="text-xs uppercase tracking-widest text-stone-400">Availability</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="font-serif text-3xl text-stone-900">100+</span>
                        <span className="text-xs uppercase tracking-widest text-stone-400">Languages</span>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* NEW SECTION 3: Philosophy / Testimonials */}
      <section className="py-32 px-12 bg-stone-900 text-stone-50 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-stone-800 rounded-full blur-3xl" />
            <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-stone-800 rounded-full blur-3xl" />
         </div>

         <div className="max-w-4xl mx-auto text-center relative z-10">
             <Star size={32} className="mx-auto mb-8 text-stone-400" />
             <h2 className="font-serif text-4xl md:text-6xl leading-tight mb-12">
               "Kanso restored my ability to wonder. It removed the logistical anxiety and left only the pure joy of discovery."
             </h2>
             <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-stone-700 rounded-full overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" className="w-full h-full object-cover" alt="User" />
                </div>
                <div className="text-left">
                   <div className="font-serif text-xl">Elena R.</div>
                   <div className="text-stone-400 text-sm uppercase tracking-widest">Travel Photographer</div>
                </div>
             </div>
         </div>
         
         <div className="mt-24 text-center border-t border-stone-800 pt-12">
            <p className="text-stone-400 mb-6 text-sm">Ready to begin your journey?</p>
            <Button onClick={onEnter} className="bg-white text-stone-900 hover:bg-stone-200 h-16 px-12 text-lg">
               Start Planning Now
            </Button>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 text-center border-t border-stone-100 flex flex-col items-center">
         <div className="w-8 h-8 bg-stone-900 text-stone-50 rounded-full flex items-center justify-center shadow-sm mb-4">
            <Wind size={16} strokeWidth={1.5} />
         </div>
         <p className="font-serif text-2xl text-stone-900 mb-2">Kanso</p>
         <p className="text-xs text-stone-400 uppercase tracking-widest">A Product by Ainrion</p>
      </footer>

    </div>
  );
};
