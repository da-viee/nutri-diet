// Import the Supabase client library
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project credentials
const SUPABASE_URL = 'https://bxnmihiojfyqxhoopiic.supabase.co'; // Paste your Project URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bm1paGlvamZ5cXhob29waWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY0MDYsImV4cCI6MjA2NzgwMjQwNn0.OuKeykeh4GgOdTAuErwtDaJwQj-osJLhDaDMIwrrqME'; // Paste your anon public key here

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- The rest of your existing code starts below ---

// A much more comprehensive and better-categorized food list
const foodData = {
    "Grains & Starches": ["White Rice", "Brown Rice", "Yam", "Cassava (Garri)", "Sweet Potatoes", "Irish Potatoes", "Pasta", "Bread (White/Brown)", "Oats", "Millet", "Sorghum", "Maize (Corn)", "Plantain", "Couscous", "Quinoa"],
    "Proteins (Animal)": ["Beef", "Goat Meat", "Chicken", "Turkey", "Fish (Tilapia)", "Fish (Mackerel)", "Fish (Catfish)", "Crayfish", "Snails", "Eggs", "Pork"],
    "Proteins (Plant-Based)": ["Beans (Black-eyed)", "Beans (Brown)", "Lentils", "Tofu", "Soybeans", "Chickpeas", "Green Peas", "Edamame"],
    "Leafy Green Vegetables": ["Spinach", "Kale", "Waterleaf", "Bitterleaf", "Jute Leaves (Ewedu)", "Fluted Pumpkin (Ugu)", "Lettuce", "Cabbage"],
    "Other Vegetables": ["Tomatoes", "Onions", "Bell Peppers (Green, Red, Yellow)", "Carrots", "Cucumber", "Okra", "Eggplant (Aubergine)", "Broccoli", "Cauliflower", "Green Beans"],
    "Fruits": ["Oranges", "Bananas", "Apples", "Pineapple", "Watermelon", "Mangoes", "Pawpaw (Papaya)", "Avocado Pear", "Grapes", "Berries (e.g., Strawberries)"],
    "Nuts & Seeds": ["Groundnuts (Peanuts)", "Cashew Nuts", "Walnuts", "Almonds", "Egusi (Melon Seeds)", "Ogbono Seeds", "Sesame Seeds", "Chia Seeds"],
    "Dairy & Alternatives": ["Milk (Cow)", "Yogurt (Plain)", "Cheese", "Soy Milk", "Almond Milk", "Coconut Milk"],
    "Fats & Oils": ["Palm Oil", "Vegetable Oil", "Groundnut Oil", "Olive Oil", "Butter", "Margarine"],
    "Spices & Condiments": ["Salt", "Stock Cubes (e.g., Maggi/Knorr)", "Thyme", "Curry Powder", "Ginger", "Garlic", "Chili Pepper", "Soy Sauce", "Ketchup"]
};

// Get the main container from the HTML
const foodContainer = document.getElementById('food-selection-container');

// --- Function to generate the HTML for the entire food list ---
function renderFoodList() {
    let htmlContent = ''; // Start with an empty string

    // Loop through each category in our foodData object
    for (const category in foodData) {
        // Add the category title
        htmlContent += `
            <div class="mb-4">
                <h3 class="text-2xl font-semibold text-blue-300 border-b-2 border-blue-400/50 pb-2 mb-3">${category}</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
        `;

        // Loop through each food item in the current category
        foodData[category].forEach(food => {
            htmlContent += `
                <label class="flex items-center space-x-3 cursor-pointer text-white hover:text-blue-200 transition">
                    <input type="checkbox" name="food" value="${food}" class="h-5 w-5 rounded bg-gray-700 border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800">
                    <span>${food}</span>
                </label>
            `;
        });

        // Close the grid and category divs
        htmlContent += `
                </div>
            </div>
        `;
    }

    // Replace the "Loading..." message with the full list
    foodContainer.innerHTML = htmlContent;
}

// --- Run the function when the script loads ---
renderFoodList();

// --- Add this new code at the bottom of the file ---

// Get the finish button from the HTML
const finishButton = document.getElementById('finish-setup-button');

// Add a click event listener to the button
finishButton.addEventListener('click', async () => {
    // 1. Get the currently logged-in user's data from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert('Error: You are not logged in. Redirecting to login page.');
        window.location.href = 'index.html';
        return;
    }

    // 2. Get the survey data we saved in localStorage
    const surveyDataString = localStorage.getItem('userSurveyData');
    if (!surveyDataString) {
        alert('Error: Survey data not found. Please start over.');
        window.location.href = 'survey.html';
        return;
    }
    const surveyData = JSON.parse(surveyDataString);

    // 3. Get all the checked food items
    const selectedFoods = [];
    const foodCheckboxes = document.querySelectorAll('input[name="food"]:checked');
    foodCheckboxes.forEach(checkbox => {
        selectedFoods.push(checkbox.value);
    });

    // 4. Combine all data into one object for our 'profiles' table
    const userProfile = {
        id: user.id, // The user's unique ID from Supabase Auth
        updated_at: new Date(), // The current timestamp
        region: surveyData.region,
        activity_level: surveyData.activity_level,
        sleep_hours: surveyData.sleep_hours,
        medical_history: surveyData.medical_history,
        available_foods: selectedFoods.join(', ') // Convert array to a comma-separated string
    };

    // 5. Save the data to the 'profiles' table in Supabase
    const { error } = await supabase.from('profiles').upsert(userProfile);

    if (error) {
        alert('Error saving your profile: ' + error.message);
    } else {
        // 6. If successful, clear the stored survey data and redirect to the dashboard
        localStorage.removeItem('userSurveyData');
        window.location.href = 'dashboard.html';
    }
}); 