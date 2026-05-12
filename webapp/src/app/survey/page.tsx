"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FOOD_DATABASE } from "@/lib/food-db";

export default function SurveyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    activityLevel: "1", // 1 to 4
    region: "South",
    medicalHistory: "",
    palmOilPreference: false,
    availableFoods: [] as string[]
  });
  const [heightUnit, setHeightUnit] = useState<"m" | "ft">("m");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  
  // Custom Select State
  const [activeSelect, setActiveSelect] = useState<string | null>(null);
  
  const router = useRouter();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Convert metrics before saving
      let finalHeight = Number(formData.height);
      if (heightUnit === "ft") finalHeight = finalHeight * 0.3048;

      let finalWeight = Number(formData.weight);
      if (weightUnit === "lb") finalWeight = finalWeight * 0.453592;

      const finalData = { 
        ...formData, 
        height: finalHeight.toString(), 
        weight: finalWeight.toString(),
        surveyDate: new Date().toISOString()
      };
      localStorage.setItem("nutriwise_survey", JSON.stringify(finalData));
      localStorage.removeItem("nutriwise_weekly_plan"); // Force regeneration of plan based on new data
      router.push("/dashboard");
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveSelect(null);
  };

  const CustomSelect = ({ label, value, options, field }: { label: string, value: string, options: {label: string, value: string}[], field: string }) => {
    const selectedLabel = options.find(o => o.value === value)?.label || value;
    const isOpen = activeSelect === field;

    return (
      <div className="relative">
        <label className="form-label">{label}</label>
        <div 
          className="form-input cursor-pointer flex justify-between items-center"
          onClick={() => setActiveSelect(isOpen ? null : field)}
        >
          <span>{selectedLabel}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setActiveSelect(null)}>
            <div 
              className="glass-card w-full max-w-xs overflow-hidden shadow-2xl border-white/20"
              style={{ borderRadius: "24px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 text-center font-bold text-sm uppercase tracking-widest text-muted">
                Select {label}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {options.map((opt) => (
                  <div 
                    key={opt.value}
                    className={`p-5 text-center transition-colors cursor-pointer border-b border-white/5 last:border-0 ${
                      value === opt.value ? "bg-accent/20 text-accent font-bold" : "hover:bg-white/5 text-primary"
                    }`}
                    onClick={() => updateField(field, opt.value)}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center page-enter"
      style={{ padding: "40px 24px" }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>
        
        {/* PREMIUM NUTRIWISE LOGO */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-[1000] tracking-[-0.08em] leading-none text-white uppercase italic">
            Nutri<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-green-400">Wise</span>
          </h1>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mt-2">Precision Evaluation System</p>
        </div>

        {/* Progress Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`step-dot ${step === s ? "active" : ""}`} />
          ))}
        </div>

        <div className="glass-card" style={{ padding: 40 }}>
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Core Biometrics</h2>
              <p className="text-muted mb-6">These help us calculate your BMI and metabolic needs.</p>
              
              <div>
                <label className="form-label">Your Age</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g., 25" 
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Weight ({weightUnit})</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder={weightUnit === "kg" ? "e.g., 70" : "e.g., 154"} 
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Height ({heightUnit})</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    placeholder={heightUnit === "m" ? "e.g., 1.75" : "e.g., 5.7"} 
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Lifestyle & Region</h2>
              <p className="text-muted mb-6">Tell us about your daily activity and local habits.</p>
              
              <CustomSelect 
                label="Activity Level"
                field="activityLevel"
                value={formData.activityLevel}
                options={[
                  { value: "1", label: "Sedentary (Little/No exercise)" },
                  { value: "2", label: "Lightly Active (1-2 days/week)" },
                  { value: "3", label: "Moderately Active (3-5 days/week)" },
                  { value: "4", label: "Very Active (Heavy labor/sports)" },
                ]}
              />

              <CustomSelect 
                label="Local Region"
                field="region"
                value={formData.region}
                options={[
                  { value: "North", label: "North Nigeria" },
                  { value: "South", label: "South Nigeria" },
                  { value: "East", label: "East Nigeria" },
                  { value: "West", label: "West Nigeria" },
                ]}
              />

              <div>
                <label className="form-label">Preparation Habits</label>
                <div 
                  className={`toggle-pill ${formData.palmOilPreference ? "active" : ""}`}
                  onClick={() => updateField("palmOilPreference", !formData.palmOilPreference)}
                >
                  I usually add extra palm oil to my stews
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Available Foods</h2>
              <p className="text-muted mb-6">Select the foods commonly available in your area.</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {FOOD_DATABASE.map(food => (
                  <div 
                    key={food.id}
                    className={`p-3 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition-all ${
                      formData.availableFoods.includes(food.name) 
                      ? "bg-accent border-accent text-black" 
                      : "bg-white/5 border-white/10 text-muted hover:border-white/30"
                    }`}
                    onClick={() => {
                      const current = [...formData.availableFoods];
                      if (current.includes(food.name)) {
                        updateField("availableFoods", current.filter(f => f !== food.name));
                      } else {
                        updateField("availableFoods", [...current, food.name]);
                      }
                    }}
                  >
                    {food.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "20px" }}>
                <button 
                  type="button"
                  onClick={() => setWeightUnit(weightUnit === "kg" ? "lb" : "kg")}
                  className="btn-ghost"
                  style={{ fontSize: "0.8rem", padding: "10px" }}
                >
                  Unit: {weightUnit === "kg" ? "KG → LBS" : "LBS → KG"}
                </button>
                <button 
                  type="button"
                  onClick={() => setHeightUnit(heightUnit === "m" ? "ft" : "m")}
                  className="btn-ghost"
                  style={{ fontSize: "0.8rem", padding: "10px" }}
                >
                  Unit: {heightUnit === "m" ? "M → FT" : "FT → M"}
                </button>
              </div>
            )}
            
            <button className="btn-accent" onClick={handleNext}>
              {step === 4 ? "Complete Profile" : "Continue"}
            </button>
            {step > 1 && (
              <button 
                className="btn-ghost" 
                style={{ marginTop: 12 }} 
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
