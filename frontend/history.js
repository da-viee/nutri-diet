// Import the Supabase client library
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project credentials
const SUPABASE_URL = 'https://bxnmihiojfyqxhoopiic.supabase.co'; // Paste your Project URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bm1paGlvamZ5cXhob29waWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY0MDYsImV4cCI6MjA2NzgwMjQwNn0.OuKeykeh4GgOdTAuErwtDaJwQj-osJLhDaDMIwrrqME'; // Paste your anon public key here

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const historyContainer = document.getElementById('history-container');
const logoutBtn = document.getElementById('logout-btn');

// --- Main function to load and display meal history ---
async function loadHistory() {
    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Fetch all records from 'meal_history' for this user
    // Order by creation date, with the newest first.
    const { data: history, error } = await supabase
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching history:', error.message);
        historyContainer.innerHTML = '<p class="text-red-400 text-center">Could not load history.</p>';
        return;
    }

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="text-gray-400 text-center">No meal history found.</p>';
        return;
    }

    // 3. If history is found, build the HTML to display it
    let historyHtml = '';
    history.forEach(record => {
        // Format the date to be more readable
        const recordDate = new Date(record.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        historyHtml += `
            <div class="p-4 bg-black/20 rounded-xl">
                <p class="font-bold text-blue-300 mb-2">${recordDate}</p>
                <ul class="list-disc list-inside text-gray-300 space-y-1">
                    <li><strong>Breakfast:</strong> ${record.breakfast}</li>
                    <li><strong>Lunch:</strong> ${record.lunch}</li>
                    <li><strong>Dinner:</strong> ${record.dinner}</li>
                </ul>
            </div>
        `;
    });

    // 4. Replace the "Loading..." message with the generated HTML
    historyContainer.innerHTML = historyHtml;
}

// --- Logout Logic ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

// --- Run the main function when the page loads ---
loadHistory(); 