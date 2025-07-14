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
// Add other elements for trackers if they exist
const waterCountEl = document.getElementById('water-count');
const addWaterBtn = document.getElementById('add-water-btn');
const subtractWaterBtn = document.getElementById('subtract-water-btn');
const lastSleepLogEl = document.getElementById('last-sleep-log');
const sleepInput = document.getElementById('sleep-input');
const logSleepBtn = document.getElementById('log-sleep-btn');

// --- Meal Database ---
const mealDatabase = {
    breakfast: { Light: "Oats with Fruit", Standard: "Bread and Scrambled Eggs", Hearty: "Boiled Yam and Egg Sauce" },
    lunch: { Light: "Chicken Salad", Standard: "White Rice and Beef Stew", Hearty: "Jollof Rice with Chicken" },
    dinner: { Light: "Light Vegetable Soup", Standard: "Grilled Fish with Roasted Potatoes", Hearty: "Beans Porridge" }
};

// --- BULLETPROOF EXPERT SYSTEM ---
function generateMealPlan(profile) {
    // Use safe fallbacks for every piece of data. This prevents crashes.
    const activity = profile.activity_level || 'Sedentary';
    const sleep = Number(profile.sleep_hours) || 7;
    const medical = (profile.medical_history || '').toLowerCase();
    const foods = (profile.available_foods || '').toLowerCase();

    // Determine required meal intensity
    let intensity;
    if (activity === 'Very Active' || activity === 'Moderately Active') {
        intensity = 'Hearty';
    } else if (activity === 'Lightly Active') {
        intensity = 'Standard';
    } else {
        intensity = 'Light';
    }

    // Adjust intensity based on sleep
    if (sleep < 6) {
        intensity = intensity === 'Hearty' ? 'Standard' : 'Light';
    }

    // Select a meal based on the final intensity
    let breakfast = mealDatabase.breakfast[intensity];
    let lunch = mealDatabase.lunch[intensity];
    let dinner = mealDatabase.dinner[intensity];

    // Apply hard expert rule for medical history
    if (medical.includes('ulcer')) {
        if (lunch.toLowerCase().includes('jollof')) {
            lunch = mealDatabase.lunch['Standard']; // Switch to a safer option
        }
    }

    return { breakfast, lunch, dinner };
}

// --- Main Function to Load Dashboard ---
async function loadDashboard() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error || !profile) {
            welcomeMessage.innerText = 'Profile not found. Please complete setup.';
            // Hide meal sections if profile fails
            document.getElementById('breakfast-recommendation').innerText = 'N/A';
            document.getElementById('lunch-recommendation').innerText = 'N/A';
            document.getElementById('dinner-recommendation').innerText = 'N/A';
            return;
        }

        const mealPlan = generateMealPlan(profile);

        welcomeMessage.innerText = `Welcome, ${user.email.split('@')[0]}!`;
        breakfastRec.innerText = mealPlan.breakfast;
        lunchRec.innerText = mealPlan.lunch;
        dinnerRec.innerText = mealPlan.dinner;

    } catch (e) {
        console.error("A critical error occurred in loadDashboard:", e);
        welcomeMessage.innerText = 'Error loading dashboard.';
    }
}

// --- Logout Logic ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

// --- Dummy Tracker Logic (to prevent crashes if HTML exists) ---
if(addWaterBtn) addWaterBtn.addEventListener('click', () => alert('Tracker functionality to be refined.'));
if(logSleepBtn) logSleepBtn.addEventListener('click', () => alert('Tracker functionality to be refined.'));


// --- Run Everything ---
loadDashboard();