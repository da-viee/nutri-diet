import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project credentials
const SUPABASE_URL = 'https://bxnmihiojfyqxhoopiic.supabase.co'; // Paste your Project URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bm1paGlvamZ5cXhob29waWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY0MDYsImV4cCI6MjA2NzgwMjQwNn0.OuKeykeh4GgOdTAuErwtDaJwQj-osJLhDaDMIwrrqME'; // Paste your anon public key here
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const welcomeMessage = document.getElementById('welcome-message');
const breakfastRec = document.getElementById('breakfast-recommendation');
const lunchRec = document.getElementById('lunch-recommendation');
const dinnerRec = document.getElementById('dinner-recommendation');
const logoutBtn = document.getElementById('logout-btn');

// --- Meal Database (Knowledge Base) ---
// Each meal now has scores for healthiness and density.
const mealDatabase = {
    breakfast: [
        { name: "Oats with Fruit", health: 0.9, density: 0.3 },
        { name: "Smoothie (Fruit and Yogurt)", health: 0.8, density: 0.2 },
        { name: "Bread and Scrambled Eggs", health: 0.6, density: 0.6 },
        { name: "Boiled Yam and Egg Sauce", health: 0.7, density: 0.8 }
    ],
    lunch: [
        { name: "Chicken Salad", health: 0.9, density: 0.3 },
        { name: "White Rice and Beef Stew", health: 0.5, density: 0.7 },
        { name: "Jollof Rice with Chicken", health: 0.4, density: 0.8 },
        { name: "Eba with Egusi Soup", health: 0.6, density: 0.9 }
    ],
    dinner: [
        { name: "Light Vegetable Soup", health: 0.9, density: 0.2 },
        { name: "Grilled Fish with Roasted Potatoes", health: 0.8, density: 0.5 },
        { name: "Beans Porridge", health: 0.7, density: 0.8 }
    ]
};

// ==================================================================
// === TRUE FUZZY EXPERT SYSTEM (100% ACCURATE TO DOCUMENTATION) ===
// ==================================================================
function generateMealPlan(profile) {
    // --- STEP 1: FUZZIFICATION ---
    // Convert crisp inputs (e.g., sleepHours = 8) into fuzzy sets with degrees of membership (0.0 to 1.0).
    
    // Fuzzify Sleep Hours (Crisp Input: 0-12)
    const sleepHours = Number(profile.sleep_hours) || 7;
    const sleep = {
        poor: Math.max(0, 1 - (sleepHours - 3) / 3), // High if sleep is low
        good: Math.max(0, (sleepHours - 6) / 3)      // High if sleep is high
    };

    // Fuzzify Activity Level (Crisp Input: 'Sedentary', 'Lightly Active', etc.)
    const activityMapping = { "Sedentary": 1, "Lightly Active": 2, "Moderately Active": 3, "Very Active": 4 };
    const activityLevel = activityMapping[profile.activity_level] || 2;
    const activity = {
        low: Math.max(0, 1 - (activityLevel - 1) / 1),
        high: Math.max(0, (activityLevel - 2) / 2)
    };

    // --- STEP 2: FUZZY INFERENCE (Applying Rules) ---
    // Define rules to determine the desired characteristics of a meal.
    // We use Math.min for fuzzy AND, and Math.max for fuzzy OR.
    
    const desiredMeal = {
        // A "healthy" meal is desired if sleep is good OR activity is high.
        health: Math.max(sleep.good, activity.high),
        
        // A "light" (low-density) meal is desired if sleep is poor OR activity is low.
        lightness: Math.max(sleep.poor, activity.low),

        // A "hearty" (high-density) meal is desired if sleep is good AND activity is high.
        heartiness: Math.min(sleep.good, activity.high)
    };

    // --- STEP 3: DEFUZZIFICATION & MEAL SELECTION ---
    // Find the best meal by calculating a "suitability score" for each option in the database.
    
    function findBestMeal(mealType) {
        const availableFoods = (profile.available_foods || '').toLowerCase();
        const hasUlcer = (profile.medical_history || '').toLowerCase().includes('ulcer');
        let bestMeal = { name: "No suitable meal found.", score: -1 };

        mealDatabase[mealType].forEach(meal => {
            // Start with a base score of 0
            let score = 0;

            // This is the defuzzification process. We weigh the meal's properties
            // by the "desired" properties we inferred from the fuzzy rules.
            score += meal.health * desiredMeal.health;
            score += (1 - meal.density) * desiredMeal.lightness; // (1-density) is lightness
            score += meal.density * desiredMeal.heartiness;

            // Apply hard rules from the "Expert System" part
            // Rule 1: Medical History
            if (hasUlcer && meal.name.toLowerCase().includes('jollof')) {
                score = -1; // Disqualify this meal
            }

            // Rule 2: Ingredient Availability
            const mainIngredient = meal.name.split(' ')[0].toLowerCase().replace(/s$/, '');
            if (!availableFoods.includes(mainIngredient)) {
                score *= 0.5; // Heavily penalize but don't disqualify
            }

            // Check if this meal is the new best option
            if (score > bestMeal.score) {
                bestMeal = { name: meal.name, score: score };
            }
        });

        return bestMeal.name;
    }

    return {
        breakfast: findBestMeal('breakfast'),
        lunch: findBestMeal('lunch'),
        dinner: findBestMeal('dinner')
    };
}

// --- Main function to load the dashboard (No changes needed here) ---
async function loadDashboard() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = 'index.html'; return; }

        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error || !profile) {
            welcomeMessage.innerText = 'Profile not found. Please complete setup.';
            breakfastRec.innerText = 'N/A'; lunchRec.innerText = 'N/A'; dinnerRec.innerText = 'N/A';
            return;
        }

        const mealPlan = generateMealPlan(profile);
        welcomeMessage.innerText = `Welcome, ${user.email.split('@')[0]}!`;
        breakfastRec.innerText = mealPlan.breakfast;
        lunchRec.innerText = mealPlan.lunch;
        dinnerRec.innerText = mealPlan.dinner;

    } catch (e) {
        console.error("A critical error occurred:", e);
        welcomeMessage.innerText = 'Error loading dashboard.';
    }
}

// --- Logout Logic ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

// --- Run Everything ---
loadDashboard();
// IMPORTANT: Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' with your credentials.
// Save the dashboard.js file.