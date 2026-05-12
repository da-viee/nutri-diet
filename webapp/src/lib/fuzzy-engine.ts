/**
 * Nutri-Diet-Wizard 2.0 - Fuzzy Logic Engine
 * 
 * Implements Mamdani Fuzzy Inference System for nutritional guidance.
 */

export type MembershipSet = Record<string, number>;

export interface UserProfile {
  age: number;
  weight: number; // kg
  height: number; // m
  activityLevel: number; // 1 (Sedentary) to 4 (Very Active)
  hasMedicalFlags: boolean;
}

export class FuzzyEngine {
  /**
   * Calculates membership degree for a trapezoidal function.
   */
  private static trapezoid(x: number, a: number, b: number, c: number, d: number): number {
    return Math.max(0, Math.min((x - a) / (b - a), 1, (d - x) / (d - c)));
  }

  /**
   * Calculates membership degree for a triangular function.
   */
  private static triangle(x: number, a: number, b: number, c: number): number {
    return Math.max(0, Math.min((x - a) / (b - a), (c - x) / (c - b)));
  }

  /**
   * Fuzzify BMI
   */
  public static fuzzifyBMI(bmi: number): MembershipSet {
    return {
      severelyUnderweight: this.trapezoid(bmi, 0, 0, 14, 16),
      underweight: this.triangle(bmi, 15, 17, 19),
      normal: this.trapezoid(bmi, 18.5, 20, 23, 25),
      overweight: this.triangle(bmi, 24, 27, 30),
      obese: this.trapezoid(bmi, 29, 32, 50, 50),
    };
  }

  /**
   * Fuzzify Age
   */
  public static fuzzifyAge(age: number): MembershipSet {
    return {
      young: this.trapezoid(age, 0, 0, 25, 35),
      middleAged: this.trapezoid(age, 25, 35, 55, 65),
      elderly: this.trapezoid(age, 55, 65, 100, 100),
    };
  }

  /**
   * Fuzzify Activity Level (1 to 4 scale)
   */
  public static fuzzifyActivity(level: number): MembershipSet {
    return {
      sedentary: this.trapezoid(level, 0, 0, 1, 1.5),
      moderate: this.triangle(level, 1.2, 2.5, 3.5),
      active: this.trapezoid(level, 3, 3.5, 5, 5),
    };
  }

  /**
   * Main Inference Logic
   */
  public static infer(profile: UserProfile): { 
    strategy: string; 
    targetCalorieMultiplier: number; 
    isEmergency: boolean;
    recommendations: string[];
  } {
    const bmiVal = profile.weight / (profile.height * profile.height);
    const bmi = this.fuzzifyBMI(bmiVal);
    const age = this.fuzzifyAge(profile.age);
    const activity = this.fuzzifyActivity(profile.activityLevel);

    // --- RULE 1: TRIAGE CIRCUIT BREAKER ---
    if (bmi.severelyUnderweight > 0.5 || (bmiVal < 16)) {
      return {
        strategy: "MEDICAL EMERGENCY TRIAGE",
        targetCalorieMultiplier: 0,
        isEmergency: true,
        recommendations: [
          "URGENT: Your BMI indicates severe malnutrition.",
          "Please do not attempt a self-guided diet plan.",
          "Seek immediate medical attention from a healthcare professional.",
          "Potential risk of Refeeding Syndrome if calories are increased too rapidly."
        ]
      };
    }

    // --- RULE 2: COMPOUND RULES ---
    let strategy = "Balanced Nutrition";
    let multiplier = 1.0;
    const recommendations: string[] = [];

    // Underweight + Active
    const underweightActive = Math.min(bmi.underweight, activity.active);
    if (underweightActive > 0.2) {
      strategy = "High Calorie Recovery";
      multiplier = 1.3;
      recommendations.push("Focus on energy-dense local foods like Pounded Yam and healthy fats.");
    }

    // Elderly + Active + Underweight (Vulnerability Rule)
    const vulnerableElderly = Math.min(age.elderly, activity.active, bmi.underweight);
    if (vulnerableElderly > 0.2) {
      strategy = "High-Density Nutrient Support";
      multiplier = 1.2;
      recommendations.push("Priority: High protein and micronutrients. Use nutrient-dense stews.");
    }

    // Obese + Sedentary
    const obeseSedentary = Math.min(bmi.obese, activity.sedentary);
    if (obeseSedentary > 0.2) {
      strategy = "Controlled Calorie Reduction";
      multiplier = 0.8;
      recommendations.push("Focus on fiber-rich vegetables (Efo Riro) and lean proteins.");
    }

    return {
      strategy,
      targetCalorieMultiplier: multiplier,
      isEmergency: false,
      recommendations
    };
  }
}
