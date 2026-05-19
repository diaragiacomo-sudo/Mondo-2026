import React from "react";
import { Search, Plane, Ship, Activity, History, Settings, LogIn, Maximize } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "explore", icon: Search, label: "Explore" },
    { id: "flights", icon: Plane, label: "Air Traffic" },
    { id: "maritime", icon: Ship, label: "Maritime" },
    { id: "stats", icon: Activity, label: "Real-time Stats" },
    { id: "history", icon: History, label: "Travel History" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-8 z-50 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/50">
      <div className="mb-12">
        <div className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Maximize className="text-white" size={24} />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all duration-300 group relative",
              activeTab === item.id 
                ? "bg-slate-800/80 border border-neon-blue/50 text-neon-blue" 
                : "text-slate-500 hover:text-neon-blue"
            )}
          >
            <item.icon size={22} />
            <span className="absolute left-20 bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
          <LogIn size={20} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
