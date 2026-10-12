'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Search, MapPin, Navigation, Copy, Check, ExternalLink, 
  Building2, GraduationCap, Clock, Compass, Layers, Sparkles, X, ChevronRight 
} from 'lucide-react';
import { 
  UOP_BUILDINGS, CATEGORIES, UoPBuilding, 
  getGoogleMapsSearchUrl, getGoogleMapsDirUrl 
} from '@/lib/uop-buildings';

// Dynamically import map component with SSR disabled
const UniMapComponent = dynamic(() => import('@/components/UniMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-[#172033] rounded-2xl flex flex-col items-center justify-center text-cyan-400 p-8 border border-cyan-500/20">
      <Compass className="w-10 h-10 animate-spin mb-3 text-cyan-400" />
      <p className="text-sm font-semibold tracking-wide">Loading Portsmouth Campus Map...</p>
    </div>
  ),
});

export default function UniMapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<UoPBuilding | null>(UOP_BUILDINGS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter buildings based on search query and selected category
  const filteredBuildings = useMemo(() => {
    return UOP_BUILDINGS.filter((building) => {
      const matchesCategory = selectedCategory === 'all' || building.category === selectedCategory;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        building.name.toLowerCase().includes(q) ||
        building.shortCode.toLowerCase().includes(q) ||
        building.postcode.toLowerCase().includes(q) ||
        building.address.toLowerCase().includes(q) ||
        building.description.toLowerCase().includes(q) ||
        building.departments.some(d => d.toLowerCase().includes(q)) ||
        building.facilities.some(f => f.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const copyAddress = (building: UoPBuilding) => {
    const textToCopy = `${building.name}, ${building.address}, ${building.postcode}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(building.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0c1422] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/uni" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold">
                ← Return to Uni Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-cyan-400 tracking-tight flex items-center gap-3 break-words">
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 shrink-0" />
              Portsmouth Uni Campus Map
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 break-words">
              Interactive building locator, department search, and one-click Google Maps navigation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://myport.port.ac.uk/welcome/maps-and-directions"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#172033] hover:bg-[#1e2b45] text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:border-cyan-400"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              Official UoP Maps & Directions
            </a>
          </div>
        </header>

        {/* Search Bar & Quick Category Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by building name, acronym (e.g. SCIAMA, ELD, ANG), department, or keyword..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#172033] border-2 border-cyan-500/30 focus:border-cyan-400 rounded-2xl text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] focus:shadow-[0_0_25px_rgba(6,182,212,0.25)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    active
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-[#172033] text-slate-300 border-white/10 hover:border-cyan-500/40 hover:text-cyan-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Hub Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Popular Hubs:
            </span>
            {['library', 'sciama', 'anglesea', 'eldon', 'ravelin', 'upsu'].map((id) => {
              const b = UOP_BUILDINGS.find((item) => item.id === id);
              if (!b) return null;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBuilding(b);
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#172033] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:border-cyan-400 transition-all font-medium whitespace-nowrap"
                >
                  {b.name} ({b.shortCode})
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout: Map + Inspector / Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Interactive Map Column (7 cols) */}
          <div className="lg:col-span-7 h-[450px] sm:h-[500px] lg:h-[650px] relative">
            <UniMapComponent
              buildings={filteredBuildings}
              selectedBuilding={selectedBuilding}
              onSelectBuilding={(b) => setSelectedBuilding(b)}
            />
          </div>

          {/* Building Details & Search Results Sidebar (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 max-h-[650px] min-w-0">
            
            {/* Selected Building Details Inspector Card */}
            {selectedBuilding ? (
              <div className="bg-[#172033] rounded-2xl p-5 sm:p-6 border-2 border-cyan-500/30 shadow-xl flex flex-col justify-between space-y-4 overflow-y-auto custom-scrollbar min-w-0">
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20 mb-2">
                        {selectedBuilding.shortCode}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight break-words">
                        {selectedBuilding.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => copyAddress(selectedBuilding)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-all border border-white/5 shrink-0"
                      title="Copy Address"
                    >
                      {copiedId === selectedBuilding.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 flex items-start gap-1.5 break-words">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{selectedBuilding.address}, <strong className="text-cyan-300">{selectedBuilding.postcode}</strong></span>
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed break-words">
                    {selectedBuilding.description}
                  </p>

                  {/* Housed Departments */}
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 shrink-0" /> Departments & Faculties Inside
                    </h3>
                    <div className="flex flex-wrap gap-1.5 max-w-full">
                      {selectedBuilding.departments.map((dept, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/60 text-slate-200 text-xs border border-white/5 font-medium break-words max-w-full"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Facilities & Opening Hours */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#0c1422] p-3 rounded-xl border border-white/5 min-w-0">
                      <span className="text-slate-400 block mb-1 font-medium">Key Facilities</span>
                      <p className="text-slate-200 font-semibold break-words">{selectedBuilding.facilities.join(', ')}</p>
                    </div>
                    <div className="bg-[#0c1422] p-3 rounded-xl border border-white/5 min-w-0">
                      <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400 shrink-0" /> Hours
                      </span>
                      <p className="text-slate-200 font-semibold break-words">{selectedBuilding.openingHours || 'Standard Campus Hours'}</p>
                    </div>
                  </div>
                </div>

                {/* Google Maps Actions */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                  <a
                    href={getGoogleMapsDirUrl(selectedBuilding)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 text-center min-w-0"
                  >
                    <Navigation className="w-4 h-4 shrink-0" />
                    <span className="truncate">Walking Directions</span>
                  </a>
                  <a
                    href={getGoogleMapsSearchUrl(selectedBuilding)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 text-center min-w-0"
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">Google Maps</span>
                  </a>
                </div>
              </div>
            ) : null}

            {/* List of Matching Buildings */}
            <div className="bg-[#172033] rounded-2xl p-4 border border-cyan-500/20 flex-1 overflow-y-auto custom-scrollbar space-y-2 min-w-0">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs text-slate-400">
                <span>Matching Locations ({filteredBuildings.length})</span>
                <span>Click to view on map</span>
              </div>

              {filteredBuildings.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No buildings match "{searchQuery}"</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="mt-2 text-xs text-cyan-400 underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredBuildings.map((building) => {
                  const isSelected = selectedBuilding?.id === building.id;
                  return (
                    <button
                      key={building.id}
                      onClick={() => setSelectedBuilding(building)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2 border min-w-0 ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'bg-[#0c1422] border-white/5 hover:border-cyan-500/30 hover:bg-[#111c30]'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 shrink-0">
                            {building.shortCode}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100 truncate">{building.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{building.address}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                    </button>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
