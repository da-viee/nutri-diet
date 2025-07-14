import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://bxnmihiojfyqxhoopiic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bm1paGlvamZ5cXhob29waWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY0MDYsImV4cCI6MjA2NzgwMjQwNn0.OuKeykeh4GgOdTAuErwtDaJwQj-osJLhDaDMIwrrqME';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const settingsForm = document.getElementById('settings-form');
const regionSelect = document.getElementById('region');
const activityLevelSelect = document.getElementById('activity-level');
const sleepHoursInput = document.getElementById('sleep-hours');
const medicalHistoryInput = document.getElementById('medical-history');
const availableFoodsInput = document.getElementById('available-foods');

const regionOptions = ["North", "South", "East", "West"];
const activityOptions = {
    "Sedentary": "Sedentary (little to no exercise)",
    "Lightly Active": "Lightly Active (light exercise/sports 1-3 days/week)",
    "Moderately Active": "Moderately Active (moderate exercise/sports 3-5 days/week)",
    "Very Active": "Very Active (hard exercise/sports 6-7 days a week)"
};

function populateSelect(element, options) {
    if (Array.isArray(options)) {
        options.forEach(opt => element.innerHTML += `<option value="${opt}">${opt}</option>`);
    } else {
        for (const [value, text] of Object.entries(options)) {
            element.innerHTML += `<option value="${value}">${text}</option>`;
        }
    }
}

async function loadProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        alert('Could not load your profile. Please try again.');
        return;
    }

    populateSelect(regionSelect, regionOptions);
    populateSelect(activityLevelSelect, activityOptions);

    regionSelect.value = profile.region;
    activityLevelSelect.value = profile.activity_level;
    sleepHoursInput.value = profile.sleep_hours;
    medicalHistoryInput.value = profile.medical_history;
    availableFoodsInput.value = profile.available_foods;
}

settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    const updatedProfile = {
        id: user.id,
        updated_at: new Date(),
        region: regionSelect.value,
        activity_level: activityLevelSelect.value,
        sleep_hours: sleepHoursInput.value,
        medical_history: medicalHistoryInput.value,
        available_foods: availableFoodsInput.value
    };

    const { error } = await supabase.from('profiles').upsert(updatedProfile);

    if (error) {
        alert('Error updating profile: ' + error.message);
    } else {
        alert('Profile saved successfully!');
        window.location.href = 'dashboard.html';
    }
});

loadProfileData(); 