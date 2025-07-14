import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project credentials
const SUPABASE_URL = 'https://bxnmihiojfyqxhoopiic.supabase.co'; // Paste your Project URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bm1paGlvamZ5cXhob29waWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY0MDYsImV4cCI6MjA2NzgwMjQwNn0.OuKeykeh4GgOdTAuErwtDaJwQj-osJLhDaDMIwrrqME'; // Paste your anon public key here
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- UI Elements ---
const loginForm = document.getElementById('login-form');
const formTitle = document.getElementById('form-title');
const formButton = document.getElementById('form-button');
const toggleLink = document.getElementById('toggle-link');
const confirmPasswordField = document.getElementById('confirm-password-field');

let isSignInMode = true;

function toggleMode() {
    isSignInMode = !isSignInMode;
    formTitle.innerText = isSignInMode ? 'Sign In' : 'Sign Up';
    formButton.innerText = isSignInMode ? 'Sign In' : 'Sign Up';
    toggleLink.innerHTML = isSignInMode ? "Don't have an account? Sign Up" : 'Already have an account? Sign In';
    confirmPasswordField.classList.toggle('hidden', isSignInMode);
}

toggleLink.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMode();
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (isSignInMode) {
        // --- Handle Sign In ---
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            // --- THIS IS THE NEW, SMART LOGIC ---
            // Check if a profile exists for this user.
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id') // We only need to check for existence, not get all data
                .eq('id', data.user.id)
                .single();

            if (profile) {
                // If profile exists, go straight to the dashboard.
                window.location.href = 'dashboard.html';
            } else {
                // If no profile, they need to do the survey.
                window.location.href = 'survey.html';
            }
        }
    } else {
        // --- Handle Sign Up ---
        const confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Sign up successful! Please sign in to continue setup.');
            toggleMode(); // Switch back to sign-in mode
        }
    }
});