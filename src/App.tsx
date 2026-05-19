import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Sidebar from "./components/Sidebar";
import StatsPanel from "./components/StatsPanel";
import NewsTicker from "./components/NewsTicker";
import Globe from "./components/Globe";
import { Entity, TransportType, City } from "./types";
import { CITIES } from "./data/cities";
import { Search, MapPin, Plane, Ship, Globe as GlobeIcon, Maximize, Activity } from "lucide-react";
import { cn } from "./lib/utils";

// Mock simulation generator
const generateMockEntities = (count: number): Entity[] => {
  const entities: Entity[] = [];
  for (let i = 0; i < count; i++) {
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    let to = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (to.id === from.id) to = CITIES[Math.floor(Math.random() * CITIES.length)];

    const type = Math.random() > 0.4 ? TransportType.FLIGHT : TransportType.SHIP;
    
    entities.push({
      id: `e-${i}`,
      type,
      name: type === TransportType.FLIGHT ? `FL${Math.floor(Math.random() * 9000 + 1000)}` : `SS ${from.name.substring(0, 3)}-${to.name.substring(0, 3)}`,
      from,
      to,
      currentLat: from.lat,
      currentLng: from.lng,
      speed: type === TransportType.FLIGHT ? 800 + Math.random() * 100 : 30 + Math.random() * 10,
      altitude: type === TransportType.FLIGHT ? 10000 + Math.random() * 2000 : 0,
      status: "en-route",
      progress: Math.random(),
      path: [], // Will be handled by arc in Globe
    });
  }
  return entities;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("explore");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setEntities(generateMockEntities(15));
  }, []);

  const getAiInsight = async (entity: Entity) => {
    setIsGenerating(true);
    setAiInsight(null);
    try {
      const response = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityName: entity.name,
          from: entity.from.name,
          to: entity.to.name,
          type: entity.type,
        }),
      });
      const data = await response.json();
      setAiInsight(data.report);
    } catch (err) {
      console.error(err);
      setAiInsight("Connessione alla rete di intelligence globale fallita.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedEntity) {
      setAiInsight(null);
    }
  }, [selectedEntity]);

  // Simple position update loop
  useEffect(() => {
    const interval = setInterval(() => {
      setEntities(prev => prev.map(entity => {
        let newProgress = entity.progress + 0.0005;
        if (newProgress > 1) newProgress = 0;
        return { ...entity, progress: newProgress };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const filteredCities = CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-screen bg-dark-bg overflow-hidden flex">
      <NewsTicker />
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 300], fov: 45 }}>
          <Globe 
            entities={entities} 
            selectedEntityId={selectedEntity?.id}
          />
        </Canvas>
      </div>

      {/* Overlay UI */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <StatsPanel 
        flightCount={entities.filter(e => e.type === TransportType.FLIGHT).length}
        shipCount={entities.filter(e => e.type === TransportType.SHIP).length}
      />

      {/* Main UI Overlay */}
      <div className="relative flex-1 ml-20 h-full pointer-events-none p-12">
        <div className="flex flex-col h-full pointer-events-none">
          {/* Search Bar - Centered as in design */}
          <header className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-40 pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center px-6 py-3 shadow-2xl group focus-within:border-neon-blue/50 transition-all">
              <Search className="text-slate-400 group-focus-within:text-neon-blue" size={20} />
              <input 
                type="text" 
                placeholder="Cerca città, numero volo o nave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm ml-3 flex-1 placeholder:text-slate-500 text-white outline-none"
              />
              <div className="flex gap-2 ml-4">
                <span className="px-2 py-1 rounded bg-slate-800 text-[10px] border border-slate-700 text-slate-400 uppercase font-bold tracking-widest">ESC</span>
              </div>
            </div>

            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900/95 backdrop-blur-xl rounded-2xl max-h-64 overflow-y-auto p-2 border border-slate-700/50 shadow-2xl">
                {filteredCities.map(city => (
                  <button 
                    key={city.id}
                    onClick={() => {
                      setSelectedEntity(null);
                      const to = CITIES[Math.floor(Math.random() * CITIES.length)];
                      const newRoute: Entity = {
                        id: `custom-${Date.now()}`,
                        type: Math.random() > 0.5 ? TransportType.FLIGHT : TransportType.SHIP,
                        name: (Math.random() > 0.5 ? "FL" : "SS") + " " + Math.floor(Math.random() * 9000 + 1000),
                        from: city,
                        to: to,
                        currentLat: city.lat,
                        currentLng: city.lng,
                        speed: 750,
                        altitude: 11000,
                        status: "en-route",
                        progress: 0,
                        path: [],
                      };
                      setEntities(prev => [newRoute, ...prev.slice(0, 14)]);
                      setSelectedEntity(newRoute);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{city.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">{city.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* Left Activity Panel - Keep functionality but adjust styling */}
          <div className="flex flex-col h-full max-w-sm pointer-events-auto mt-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400">Traffico in Diretta</h2>
            </div>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
              {entities.map(entity => (
                <div 
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className={cn(
                    "bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border transition-all cursor-pointer",
                    selectedEntity?.id === entity.id ? "border-neon-blue/50 bg-slate-900/80" : "border-slate-800/50 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <span className="px-1.5 py-0.5 bg-neon-blue/20 text-neon-blue text-[9px] font-bold rounded border border-neon-blue/20">
                         {entity.name}
                       </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{entity.status === 'en-route' ? 'IN VIAGGIO' : 'ARRIVATO'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-white w-8">{entity.from.id.toUpperCase()}</span>
                    <div className="flex-1 h-[1px] bg-slate-800 relative">
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-neon-blue shadow-[0_0_5px_#22d3ee]"
                        style={{ left: `${entity.progress * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white w-8 text-right">{entity.to.id.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Entity Card - "Right Information Panel" style */}
      {selectedEntity && (
        <div className="fixed top-24 right-8 w-80 flex flex-col gap-4 z-40 pointer-events-auto animate-in fade-in slide-in-from-right-8 duration-500">
          <section className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-[10px] font-bold rounded border border-neon-blue/30 uppercase">
                {selectedEntity.type === TransportType.FLIGHT ? 'Volo' : 'Nave'} {selectedEntity.name}
              </span>
              <button onClick={() => setSelectedEntity(null)} className="text-slate-500 hover:text-white transition-colors">
                <Maximize size={16} className="rotate-45" />
              </button>
            </div>

            <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <p className="text-2xl font-bold text-white tracking-tighter">{selectedEntity.from.id.toUpperCase()}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{selectedEntity.from.name}</p>
              </div>
              <div className="flex-1 border-b border-dashed border-slate-700 mx-4 mb-3 relative">
                {selectedEntity.type === TransportType.FLIGHT ? (
                  <Plane className="w-4 h-4 text-neon-blue absolute left-1/2 -translate-x-1/2 -top-2 rotate-90" />
                ) : (
                  <Ship className="w-4 h-4 text-emerald-400 absolute left-1/2 -translate-x-1/2 -top-2" />
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white tracking-tighter">{selectedEntity.to.id.toUpperCase()}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{selectedEntity.to.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-6 mb-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Velocità</p>
                <p className="text-sm font-mono text-neon-blue">{Math.round(selectedEntity.speed)} {selectedEntity.type === TransportType.FLIGHT ? 'KM/H' : 'NODI'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                  {selectedEntity.type === TransportType.FLIGHT ? 'Altitudine' : 'Progresso'}
                </p>
                <p className="text-sm font-mono text-neon-blue">
                  {selectedEntity.type === TransportType.FLIGHT ? `${Math.round(selectedEntity.altitude!).toLocaleString()} M` : `${Math.round(selectedEntity.progress * 100)}%`}
                </p>
              </div>
            </div>

            {aiInsight ? (
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 text-[10px] leading-relaxed text-slate-400 font-mono mb-6">
                <div className="text-neon-blue mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Activity size={12} /> Analisi Intelligenza Global
                </div>
                {aiInsight}
              </div>
            ) : (
              <button 
                disabled={isGenerating}
                onClick={() => getAiInsight(selectedEntity)}
                className="w-full py-3 rounded-xl bg-neon-blue/80 hover:bg-neon-blue text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {isGenerating ? "Analisi Segnali in Corso..." : "Inizializza Intelligence AI"}
              </button>
            )}
          </section>
          
          {/* Mini HUD element below the card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex justify-between items-center">
             <div>
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-tighter">Report di Stato</p>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Operazioni Normali</p>
             </div>
             <Activity className="text-slate-700" size={24} />
          </div>
        </div>
      )}

      {/* Bottom HUD elements replaced by StatsPanel, adding smaller localized ones */}
      <div className="absolute bottom-10 left-32 flex gap-4 z-40 pointer-events-auto">
        <div className="flex gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
          <button className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-[10px] font-bold rounded-lg border border-slate-700 text-slate-400 uppercase tracking-widest transition-all">Vista 2D</button>
          <button className="px-4 py-2 bg-neon-blue text-white text-[10px] font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase tracking-widest">Globo 3D</button>
        </div>
      </div>
    </div>
  );
}
