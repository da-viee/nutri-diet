"use client";
import { useEffect, useState, useRef } from "react";
import { FuzzyEngine } from "@/lib/fuzzy-engine";
import { translateToVisualPlate, FOOD_DATABASE, FoodItem } from "@/lib/food-db";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [visuals, setVisuals] = useState<any>(null);
  const [dailyPlan, setDailyPlan] = useState<{ breakfast: FoodItem, lunch: FoodItem, dinner: FoodItem } | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedMealDetail, setSelectedMealDetail] = useState<FoodItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReevaluate, setShowReevaluate] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [water, setWater] = useState(0);
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [waterLogs, setWaterLogs] = useState<Record<string, number>>({});
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedMealDetail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedMealDetail]);

  useEffect(() => {
    // Auto-scroll calendar to active day
    if (calendarRef.current) {
      const activeBtn = calendarRef.current.children[selectedDay] as HTMLElement;
      if (activeBtn) {
        calendarRef.current.scrollTo({ left: activeBtn.offsetLeft - 100, behavior: "smooth" });
      }
    }
  }, [selectedDay, weeklyPlan]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutriwise_survey");
      if (!saved) {
        setError("Please complete the survey first.");
        return;
      }
      const parsed = JSON.parse(saved);
      setData(parsed);
      const res = FuzzyEngine.infer({
        age: Number(parsed.age),
        weight: Number(parsed.weight),
        height: Number(parsed.height),
        activityLevel: Number(parsed.activityLevel),
        hasMedicalFlags: parsed.medicalHistory?.toLowerCase() !== "none"
      });
      setResult(res);
      const baseCalories = 2000 * res.targetCalorieMultiplier;
      setVisuals(translateToVisualPlate(baseCalories));

      // Check if 7 days have passed
      if (parsed.surveyDate) {
        const lastDate = new Date(parsed.surveyDate);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) setShowReevaluate(true);
      }

      // Build a 7-day plan based on Available Foods
      const savedPlan = localStorage.getItem("nutriwise_weekly_plan");
      if (savedPlan) {
        setWeeklyPlan(JSON.parse(savedPlan));
        setDailyPlan(JSON.parse(savedPlan)[new Date().getDay()]);
      } else {
        const available = parsed.availableFoods || [];
        const filtered = available.length > 0
          ? FOOD_DATABASE.filter(f => available.includes(f.name))
          : FOOD_DATABASE;

        const starches = filtered.filter(f => f.category === "Starch");
        const proteins = filtered.filter(f => f.category === "Protein");
        const veggies = filtered.filter(f => f.category === "Vegetable");

        const plan: any = {};
        for (let i = 0; i < 7; i++) {
          plan[i] = {
            breakfast: starches[(i + 0) % starches.length] || FOOD_DATABASE[0],
            lunch: veggies[(i + 1) % veggies.length] || FOOD_DATABASE[12],
            dinner: proteins[(i + 2) % proteins.length] || FOOD_DATABASE[7]
          };
        }
        setWeeklyPlan(plan);
        setDailyPlan(plan[new Date().getDay()]);
        localStorage.setItem("nutriwise_weekly_plan", JSON.stringify(plan));
      }

      // Load progress
      const today = new Date().toDateString();
      const savedWaterLogs = localStorage.getItem("nutriwise_water_logs");
      if (savedWaterLogs) {
        const parsedWater = JSON.parse(savedWaterLogs);
        setWaterLogs(parsedWater);
        setWater(parsedWater[today] || 0);
      } else {
        // Fallback for legacy single-value water
        const savedWater = localStorage.getItem("nutriwise_water");
        if (savedWater) {
          const val = Number(savedWater);
          setWater(val);
          const initialLogs = { [today]: val };
          setWaterLogs(initialLogs);
          localStorage.setItem("nutriwise_water_logs", JSON.stringify(initialLogs));
        }
      }

      const savedLogs = localStorage.getItem("nutriwise_logs");
      if (savedLogs) setLogs(JSON.parse(savedLogs));

      // Check Supabase Session
      checkUser();
    } catch (err) {
      setError("Error loading your health profile.");
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      syncFromCloud(session.user.id);
    }
  };

  const syncFromCloud = async (userId: string) => {
    setSyncing(true);
    try {
      // Sync Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        const localData = { ...profile, availableFoods: profile.available_foods, activityLevel: profile.activity_level };
        setData(localData);
        localStorage.setItem("nutriwise_survey", JSON.stringify(localData));
      }

      // Sync Logs for today
      const today = new Date().toISOString().split('T')[0];
      const { data: cloudLogs } = await supabase.from('journey_logs').select('*').eq('user_id', userId).eq('log_date', today).single();
      if (cloudLogs) {
        const dateStr = new Date().toDateString();
        setLogs(prev => ({ ...prev, [dateStr]: cloudLogs.meal_logs }));
        setWater(cloudLogs.water_intake);
        setWaterLogs(prev => ({ ...prev, [dateStr]: cloudLogs.water_intake }));
      }
    } catch (e) { console.error("Sync error", e); }
    setSyncing(false);
  };

  const handleAuth = async (type: 'login' | 'signup') => {
    setAuthLoading(true);
    const { data, error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    
    if (error) alert(error.message);
    else {
      setUser(data.user);
      setShowAuth(false);
      if (type === 'signup' && data.user) {
        // Initial profile sync
        const survey = JSON.parse(localStorage.getItem("nutriwise_survey") || "{}");
        await supabase.from('profiles').upsert({
          id: data.user.id,
          age: Number(survey.age),
          weight: Number(survey.weight),
          height: Number(survey.height),
          activity_level: Number(survey.activityLevel),
          available_foods: survey.availableFoods
        });
      }
    }
    setAuthLoading(false);
  };

  const syncToCloud = async (newWater?: number, newMealLogs?: string[]) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const dateStr = new Date().toDateString();
    
    await supabase.from('journey_logs').upsert({
      user_id: user.id,
      log_date: today,
      meal_logs: newMealLogs || logs[dateStr] || [],
      water_intake: newWater !== undefined ? newWater : water
    }, { onConflict: 'user_id,log_date' });
  };

  const addWater = () => {
    const today = new Date().toDateString();
    const currentVal = waterLogs[today] || 0;
    const newVal = Math.min(currentVal + 1, 12);
    
    const updated = { ...waterLogs, [today]: newVal };
    setWaterLogs(updated);
    setWater(newVal);
    localStorage.setItem("nutriwise_water_logs", JSON.stringify(updated));
    syncToCloud(newVal);
  };

  const getSelectedDateString = () => {
    const date = new Date();
    date.setDate(date.getDate() - (date.getDay() - selectedDay));
    return date.toDateString();
  };

  const toggleLog = (period: string) => {
    const dateStr = getSelectedDateString();
    const currentLogs = logs[dateStr] || [];
    const newLogs = currentLogs.includes(period)
      ? currentLogs.filter(p => p !== period)
      : [...currentLogs, period];
    
    const updated = { ...logs, [dateStr]: newLogs };
    setLogs(updated);
    localStorage.setItem("nutriwise_logs", JSON.stringify(updated));
    syncToCloud(undefined, newLogs);
  };

  const handleSwap = (category: string, period: string) => {
    if (!weeklyPlan) return;
    
    const available = (data.availableFoods || []).length > 0
      ? FOOD_DATABASE.filter(f => data.availableFoods.includes(f.name))
      : FOOD_DATABASE;
    
    const items = available.filter(f => f.category === category);
    if (items.length <= 1) return;

    const currentMeal = weeklyPlan[selectedDay][period];
    const currentIndex = items.findIndex(f => f.id === currentMeal.id);
    const nextIndex = (currentIndex + 1) % items.length;
    const nextMeal = items[nextIndex];

    const updatedPlan = { ...weeklyPlan };
    updatedPlan[selectedDay][period] = nextMeal;
    setWeeklyPlan(updatedPlan);
    setDailyPlan(updatedPlan[selectedDay]);
    localStorage.setItem("nutriwise_weekly_plan", JSON.stringify(updatedPlan));
  };

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: (width + 40) * index, behavior: "smooth" });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  if (error || !data || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10 text-center">
        <div className="glass-card p-10 max-w-md border border-white/20">
          <p className="text-white mb-6 font-bold">{error || "Loading..."}</p>
          <button onClick={() => window.location.href = "/survey"} className="btn-accent">Restart</button>
        </div>
      </div>
    );
  }

  // Calculate percentages for the CSS conic-gradient
  const vegP = 50;
  const starchP = parseInt(visuals?.plate.starch || "25");
  const proteinP = parseInt(visuals?.plate.protein || "25");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayChange = (idx: number) => {
    setSelectedDay(idx);
    if (weeklyPlan) setDailyPlan(weeklyPlan[idx]);
  };

  return (
    <>
      <main
      className="min-h-screen max-w-3xl mx-auto page-enter relative"
      style={{ padding: "40px 20px", display: "flex", flexDirection: "column", gap: "12px" }}
    >

      {/* Decorative Glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* PREMIUM MINIMALIST LOGO */}
      <header className="mb-10">
        <div className="flex flex-col mb-12">
          <h1 className="text-5xl font-[1000] tracking-[-0.08em] leading-none text-white uppercase italic">
            Nutri<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-green-400">Wise</span>
          </h1>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mt-2 ml-1">Precision Nutrition System</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = "/history"} 
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-black transition-all shadow-xl"
          >
            📜 Journey Log
          </button>
        </div>
      </header>

      {showReevaluate && (
        <div className="p-6 rounded-3xl bg-accent/10 border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <p className="text-sm font-bold text-accent">It's been a week! Time to track your progress.</p>
          <button onClick={() => window.location.href = "/survey"} className="btn-accent py-2 px-6 w-auto text-xs">Retake Survey</button>
        </div>
      )}

      {/* FULL-WIDTH CENTERED DATE SELECTOR */}
      <div
        className="flex justify-between items-end w-full gap-1 py-2 px-1"
      >
        {days.map((day, idx) => {
          const date = new Date();
          date.setDate(date.getDate() - (date.getDay() - idx));
          const dayNum = date.getDate();
          return (
            <button
              key={day}
              onClick={() => handleDayChange(idx)}
              className={`flex flex-col items-center justify-center transition-all duration-500 rounded-xl flex-1 ${selectedDay === idx
                  ? "bg-accent text-white h-[75px] border-transparent shadow-lg z-10"
                  : "bg-white/[0.03] text-muted h-[55px] border border-white/5 opacity-80"
                }`}
              style={{ minWidth: 0 }}
            >
              <span className={`text-[7px] font-black uppercase tracking-tighter mb-0.5 ${selectedDay === idx ? "text-white" : "text-muted"}`}>{day}</span>
              <span className={`${selectedDay === idx ? "text-xl" : "text-sm"} font-black`}>{dayNum}</span>
            </button>
          );
        })}
      </div>

      {/* 1. REAL SWIPEABLE CAROUSEL */}
      <section className="relative w-full">
        <div className="flex justify-center gap-4">
          <div className="inline-flex bg-white/5 p-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
            {[
              { label: "Today's Plate", id: "plate" },
              { label: "Daily Menu", id: "meals" }
            ].map((item, idx) => (
              <button
                key={item.id}
                onClick={() => scrollToSlide(idx)}
                className={`px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${(activeIndex === idx)
                  ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.4)] scale-105"
                  : "text-muted hover:text-white"
                  }`}
                style={{ minWidth: "180px" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* SPACER */}
        <div style={{ height: "8px" }}></div>

        {/* NATIVE SNAP SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
          style={{ width: "100%", gap: "40px", paddingBottom: "10px" }}
        >
          {/* SLIDE 1: PLATE */}
          <div className="w-full shrink-0 snap-center glass-card flex flex-col items-center border-white/20" style={{ padding: "32px" }}>
            <h2 className="form-label" style={{ marginBottom: "16px", fontSize: "1.2rem" }}>Visual Meal Proportion</h2>
            <p className="text-[10px] text-muted text-center max-w-[280px] mb-8 uppercase font-bold tracking-widest leading-relaxed">
              Use this plate as a guide for your serving sizes. Half should be vegetables.
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px", perspective: "1000px" }}>
              <div
                style={{
                  width: "280px",
                  height: "280px",
                  borderRadius: "50%",
                  background: `conic-gradient(
                    #4ade80 0.2deg ${vegP}%, 
                    #f59e0b ${vegP + 0.2}% ${vegP + starchP}%, 
                    #f87171 ${vegP + starchP + 0.2}% 99.8%
                  )`,
                  transform: "rotateX(55deg) rotateZ(-15deg)",
                  boxShadow: `0 1px 0 #22c55e, 0 2px 0 #22c55e, 0 3px 0 #166534, 0 4px 0 #166534, 0 5px 0 #052e16, 0 30px 100px rgba(74,222,128,0.25), inset 0 0 50px rgba(0,0,0,0.5)`,
                  border: "5px solid rgba(255,255,255,0.25)",
                  position: "relative",
                  animation: "floatPlate 4s ease-in-out infinite"
                }}
              >
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "100px", height: "100px", backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(24px)",
                  borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff", fontSize: "16px", fontWeight: "1000", textTransform: "uppercase",
                  letterSpacing: "4px", boxShadow: "0 20px 40px rgba(0,0,0,0.7)", zIndex: 10
                }}>
                  Plate
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px rgba(74,222,128,0.5)" }}></div>
                <span style={{ fontSize: "0.85rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" }}>VEG {vegP}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px rgba(245,158,11,0.5)" }}></div>
                <span style={{ fontSize: "0.85rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" }}>STARCH {starchP}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f87171", boxShadow: "0 0 10px rgba(248,113,113,0.5)" }}></div>
                <span style={{ fontSize: "0.85rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" }}>PROTEIN {proteinP}%</span>
              </div>
            </div>
            <div className="mt-12 px-6 py-2 rounded-full bg-white/5 text-muted text-[10px] font-bold uppercase tracking-widest animate-pulse border border-white/5">
              ← Swipe for Daily Menu →
            </div>
          </div>

          {/* SLIDE 2: FULL DAILY MENU */}
          <div className="w-full shrink-0 snap-center p-2">
            <h2 className="form-label" style={{ marginBottom: "24px", textAlign: "center", fontSize: "1.2rem" }}>Daily Nutrition Schedule</h2>
            <div className="space-y-6">
              {[
                { time: "08:00 AM", period: "Breakfast", meal: dailyPlan?.breakfast, icon: "🍳" },
                { time: "01:30 PM", period: "Lunch", meal: dailyPlan?.lunch, icon: "🍲" },
                { time: "07:00 PM", period: "Dinner", meal: dailyPlan?.dinner, icon: "🥘" }
              ].map(slot => (
                <div key={slot.period} className="flex flex-col gap-3 group">
                  {/* Fixed Labels on their own line */}
                  <div className="flex items-center gap-3 px-6">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{slot.time}</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">{slot.period}</span>
                  </div>

                  {/* Meal Card */}
                  <div className="relative group/card">
                    <div
                      onClick={() => slot.meal && setSelectedMealDetail(slot.meal)}
                      className="glass-card border-white/10 hover:border-accent/40 hover:bg-white/[0.07] transition-all duration-500 relative overflow-hidden cursor-pointer active:scale-[0.98] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                      style={{ padding: "24px 32px" }}
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 text-5xl group-hover:opacity-20 transition-opacity">{slot.icon}</div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex-1">
                          <h3 className={`text-2xl font-black group-hover:text-accent transition-colors leading-tight mb-2 tracking-tighter break-words ${(logs[getSelectedDateString()] || []).includes(slot.period.toLowerCase()) ? "line-through opacity-50" : ""}`}>{slot.meal?.name}</h3>
                          <p className="text-sm text-muted leading-relaxed font-medium pr-12">{slot.meal?.visualHeuristic}</p>
                        </div>

                        {/* Quick Actions Row */}
                        <div className="flex gap-3 mt-6">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleLog(slot.period.toLowerCase()); }}
                            className={`flex-1 h-12 rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 text-xs border transition-all active:scale-95 shadow-lg group/btn ${
                              (logs[getSelectedDateString()] || []).includes(slot.period.toLowerCase())
                              ? "bg-accent text-black border-transparent"
                              : "bg-white/10 hover:bg-white/20 border-white/10"
                            }`}
                          >
                            <span className="text-lg">{(logs[getSelectedDateString()] || []).includes(slot.period.toLowerCase()) ? "✓" : "🍴"}</span>
                            <span className="font-black uppercase tracking-widest">
                              {(logs[getSelectedDateString()] || []).includes(slot.period.toLowerCase()) ? "Done" : "Log Meal"}
                            </span>
                          </button>

                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSwap(slot.meal?.category || "Starch", slot.period.toLowerCase()); }}
                            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all active:scale-95 shadow-lg group/btn"
                            title="Swap Meal"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:rotate-180 transition-transform duration-500">
                              <path d="M16 3h5v5" />
                              <path d="M8 21H3v-5" />
                              <path d="M21 3L3 21" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEASUREMENTS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>

        <div className="glass-card hover:bg-white/[0.06] transition-all cursor-pointer active:scale-[0.99] group/water" style={{ padding: "40px" }} onClick={addWater}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="form-label" style={{ marginBottom: "0" }}>Hydration Tracker</h2>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover/water:scale-110 transition-transform font-bold">+</div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>💧</span>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Water Intake</p>
                  <p className="text-xl font-black">{water} / 8 <span className="text-xs text-muted font-normal">glasses</span></p>
                </div>
              </div>
            </div>
            
            {/* Water Progress Bar */}
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-accent transition-all duration-700 ease-out shadow-[0_0_15px_rgba(74,222,128,0.5)]" 
                style={{ width: `${Math.min((water / 8) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="h-px bg-white/5"></div>

            <div className="flex items-center gap-4">
              <span className="text-3xl">📈</span>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">{days[selectedDay]}'s Progress Score</p>
                <p className="text-xl font-black">
                  {Math.round(((logs[getSelectedDateString()]?.length || 0) / 3) * 100)}%
                  <span className="text-xs text-muted font-normal ml-2">Meals Logged</span>
                </p>
              </div>
            </div>

            {/* Daily Progress Bar */}
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                style={{ width: `${((logs[getSelectedDateString()]?.length || 0) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "40px" }}>
          <h2 className="form-label" style={{ marginBottom: "24px" }}>Local Measurements</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "2rem" }}>🥫</span>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800 }}>Staple</p>
                <p style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{visuals?.heuristics.staple}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "2rem" }}>✋</span>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800 }}>Protein</p>
                <p style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{visuals?.heuristics.protein}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "40px" }}>
          <h2 className="form-label" style={{ marginBottom: "24px" }}>Expert Guidance</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Dynamic Recommendations from Fuzzy Engine */}
            {result.recommendations.map((rec: string, i: number) => (
              <div key={`rec-${i}`} className="flex gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                <span className="text-xl">🩺</span>
                <p className="text-[13px] leading-relaxed text-accent font-bold">{rec}</p>
              </div>
            ))}

            {/* General Expert Tips */}
            {[
              { icon: "🥗", text: "Always start with your vegetables to manage blood sugar spikes." },
              { icon: "🚶", text: "Walk for 10 minutes after this meal to improve digestion." }
            ].map((tip, i) => (
              <div key={`tip-${i}`} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-xl">{tip.icon}</span>
                <p className="text-[13px] leading-relaxed text-muted">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      <div style={{ textAlign: "center" }}>
        <button onClick={() => window.location.href = "/survey"} className="btn-ghost" style={{ width: "auto", padding: "12px 32px" }}>
          Edit Profile
        </button>
      </div>

    </main>

    {/* ELITE POP-UP MODAL (Centered to Viewport) */}
    {selectedMealDetail && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setSelectedMealDetail(null)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedMealDetail(null)}></div>
        <div
          className="w-full max-w-sm p-10 border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative overflow-hidden animate-in zoom-in-95 duration-300"
          style={{ borderRadius: "48px", background: "rgba(10, 15, 13, 0.98)", backdropFilter: "blur(40px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Close Button */}
          <button
            onClick={() => setSelectedMealDetail(null)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          <div className="text-center">
            <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4">
              {selectedMealDetail.category}
            </div>
            <h2 className="text-2xl font-black text-white mb-8 tracking-tighter">{selectedMealDetail.name}</h2>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-accent/50 to-green-600 flex items-center justify-center text-4xl shadow-xl">
                {selectedMealDetail.category === "Starch" ? "🍚" : selectedMealDetail.category === "Protein" ? "🍗" : "🥗"}
              </div>
            </div>

            <div className="space-y-6 mb-10 text-center">
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Target Portion</p>
                <p className="text-2xl font-black text-white">{selectedMealDetail.visualHeuristic}</p>
              </div>

              <p className="text-[12px] leading-relaxed text-white font-medium italic px-4">
                "{selectedMealDetail.expertTip}"
              </p>
            </div>

            <button
              onClick={() => setSelectedMealDetail(null)}
              className="btn-accent w-full py-5 rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    )}
    {/* AUTH MODAL */}
    {showAuth && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl" onClick={() => setShowAuth(false)}>
        <div 
          className="w-full max-w-sm p-10 glass-card border-white/20 shadow-3xl animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Connect Account</h2>
          <p className="text-xs text-muted mb-8 font-bold tracking-widest uppercase">Sync your plan to any device.</p>
          
          <div className="space-y-6">
            <div>
              <label className="form-label mb-2">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label mb-2">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button 
                onClick={() => handleAuth('login')}
                disabled={authLoading}
                className="btn-ghost py-4 text-[10px] uppercase font-black"
              >
                {authLoading ? "..." : "Login"}
              </button>
              <button 
                onClick={() => handleAuth('signup')}
                disabled={authLoading}
                className="btn-accent py-4 text-[10px] uppercase font-black"
              >
                {authLoading ? "..." : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}
