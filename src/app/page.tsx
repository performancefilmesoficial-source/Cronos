"use client"

import * as React from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { PriorityList } from "@/components/dashboard/priority-list";
import { BigCalendar } from "@/components/dashboard/big-calendar";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataService, Demand } from "@/lib/data";

export default function Home() {
  const [demands, setDemands] = React.useState<Demand[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    setDemands(DataService.getDemands());

    // Listen for updates from other components
    const handleDataChange = () => setDemands(DataService.getDemands());
    window.addEventListener("sf-data-change", handleDataChange);
    return () => window.removeEventListener("sf-data-change", handleDataChange);
  }, []);

  const handleUpdateDemand = (updatedDemand: Demand) => {
    DataService.updateDemand(updatedDemand);
  };

  const filteredDemands = demands.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <SidebarNav />

      <main className="flex-1 h-screen overflow-hidden bg-background relative flex flex-col">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Header Section */}
        <div className="p-6 pb-2 flex items-center justify-between relative z-10 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">Task Geral</h1>
            <p className="text-muted-foreground text-xs">Gerencie suas demandas no calendário.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-72 transition-all duration-300">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-10 pr-20 bg-white/5 border-white/10 focus-visible:ring-primary/50 text-xs text-white transition-all focus:bg-white/10 focus:w-full"
              />
              <div className={cn(
                "absolute right-1 top-1 bottom-1 flex items-center transition-all duration-200",
                searchTerm ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
              )}>
                <Button
                  size="sm"
                  className="h-7 text-[10px] px-3 bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 pt-2 overflow-hidden relative z-10">
          {/* Calendar - Full Height now */}
          <div className="h-full bg-background/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <BigCalendar demands={filteredDemands} onUpdateDemand={handleUpdateDemand} />
          </div>
        </div>
      </main>

      <aside className="hidden xl:block h-screen">
        <PriorityList demands={filteredDemands} onUpdate={handleUpdateDemand} />
      </aside>
    </div>
  );
}

