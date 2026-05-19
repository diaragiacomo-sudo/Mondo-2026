import React from "react";
import { Plane, Ship, Activity, Globe as GlobeIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface StatsPanelProps {
  flightCount: number;
  shipCount: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ flightCount, shipCount }) => {
  const stats = [
    { label: "Voli Monitorati", value: "14.291", detail: "+12.4% PICCO", detailColor: "text-emerald-400" },
    { label: "Navi Attive", value: "8.402", detail: "FLUSSO NORMALE", detailColor: "text-slate-500" },
    { label: "Condizioni Meteo", value: "Sereno", detail: "STAZIONE 04A-TX", detailColor: "text-slate-500" },
    { label: "Stato Rete", value: "SINCRONIZZATO", detail: "LATENZA 14MS", detailColor: "text-slate-500", valueColor: "text-neon-blue" },
  ];

  return (
    <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl grid grid-cols-4 gap-6 z-40 px-4 pointer-events-none">
      {stats.map((stat, i) => (
        <div key={i} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 pointer-events-auto">
          <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold tracking-tighter">{stat.label}</p>
          <p className={cn("text-xl font-bold text-white", stat.valueColor)}>{stat.value}</p>
          <p className={cn("text-[9px] font-mono", stat.detailColor)}>{stat.detail}</p>
        </div>
      ))}
    </footer>
  );
};

export default StatsPanel;
