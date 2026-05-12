"use client";
import { useEffect, useState } from "react";
import { FOOD_DATABASE, FoodItem } from "@/lib/food-db";

export default function HistoryPage() {
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [waterLogs, setWaterLogs] = useState<Record<string, number>>({});
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem("nutriwise_logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedWater = localStorage.getItem("nutriwise_water_logs");
    if (savedWater) setWaterLogs(JSON.parse(savedWater));

    const savedPlan = localStorage.getItem("nutriwise_weekly_plan");
    if (savedPlan) setWeeklyPlan(JSON.parse(savedPlan));
  }, []);

  const toggleDate = (dateStr: string) => {
    setExpandedDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr]
    );
  };

  const allDates = Array.from(new Set([...Object.keys(logs), ...Object.keys(waterLogs)]))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (allDates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10 text-center page-enter">
        <div className="glass-card p-10 max-w-md border border-white/20">
          <p className="text-white mb-6 font-bold">Your Journey starts here.</p>
          <button onClick={() => window.location.href = "/dashboard"} className="btn-accent">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <main 
      className="min-h-screen max-w-3xl mx-auto page-enter relative"
      style={{ padding: "40px 20px", display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* Decorative Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <header className="mb-4">
        <button 
          onClick={() => window.location.href = "/dashboard"} 
          className="text-muted text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-2px", lineHeight: "1" }}>
          Journey <span className="text-accent">Log</span>
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "1.1rem" }}>
          Review your historical health data.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {allDates.map((dateStr, index) => {
          const date = new Date(dateStr);
          const dayOfWeek = date.getDay();
          const dayPlan = weeklyPlan ? weeklyPlan[dayOfWeek] : null;
          const dayLogs = logs[dateStr] || [];
          const waterCount = waterLogs[dateStr] || 0;
          const isExpanded = expandedDates.includes(dateStr);
          const isToday = dateStr === new Date().toDateString();

          const progress = Math.round((dayLogs.length / 3) * 100);

          return (
            <div 
              key={dateStr} 
              className={`glass-card overflow-hidden transition-all duration-300 border-white/10 ${
                isExpanded ? "border-accent/40 bg-white/[0.06]" : ""
              }`}
            >
              {/* Header / Dropdown Toggle */}
              <div 
                onClick={() => toggleDate(dateStr)}
                className="p-6 cursor-pointer flex items-center justify-between group/header"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${
                    isExpanded ? "bg-accent text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]" : "bg-white/5 text-white"
                  }`}>
                    <span className="text-[8px] font-black uppercase leading-none mb-0.5 opacity-60">
                      {date.toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black leading-none">{date.getDate()}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black tracking-tighter leading-none mb-1">
                      {isToday ? "Today" : days[dayOfWeek]}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">💧</span>
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">{waterCount}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/20"></div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">🍴</span>
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                  isExpanded ? "bg-accent text-black border-transparent rotate-180" : "bg-white/5 border-white/10 text-muted"
                }`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>

              {/* Folded Content */}
              <div className={`transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[800px] border-t border-white/5" : "max-h-0 overflow-hidden"}`}>
                <div className="p-6 space-y-8">
                  
                  {/* Progress Indicators */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Water Intake</p>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(74,222,128,0.4)]" 
                          style={{ width: `${Math.min((waterCount / 8) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Meal Progress</p>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Meals Section - Matching Dashboard Style */}
                  <div className="space-y-6">
                    {[
                      { period: "breakfast", meal: dayPlan.breakfast, label: "Breakfast", time: "Morning", icon: "🍳" },
                      { period: "lunch", meal: dayPlan.lunch, label: "Lunch", time: "Afternoon", icon: "🍲" },
                      { period: "dinner", meal: dayPlan.dinner, label: "Dinner", time: "Evening", icon: "🥘" }
                    ].map(slot => {
                      const isEaten = dayLogs.includes(slot.period);
                      return (
                        <div key={slot.period} className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 px-2">
                            <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em]">{slot.time}</span>
                            <div className="h-px flex-1 bg-white/5"></div>
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.1em]">{slot.label}</span>
                          </div>

                          <div 
                            className={`glass-card border-white/5 flex items-center justify-between gap-6 transition-all ${isEaten ? "bg-accent/5 border-accent/20 shadow-lg" : "opacity-40"}`}
                            style={{ padding: "24px 32px" }}
                          >
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-lg font-black tracking-tighter leading-tight ${isEaten ? "text-white" : "line-through text-muted"}`}>
                                {slot.meal?.name}
                              </h5>
                              <p className="text-[10px] text-muted font-medium mt-1 uppercase tracking-tighter">{slot.meal?.visualHeuristic}</p>
                            </div>
                            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-2xl transition-all ${
                              isEaten ? "bg-accent text-black" : "bg-white/5 text-muted"
                            }`}>
                              {isEaten ? "✓" : slot.icon}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center pb-12">
        <button onClick={() => window.location.href = "/dashboard"} className="btn-ghost" style={{ width: "auto", padding: "12px 32px" }}>
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
