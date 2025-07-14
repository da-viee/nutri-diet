// Get the button and all the input fields from the survey form
const saveSurveyButton = document.getElementById('save-survey-button');
const regionInput = document.getElementById('region');
const activityLevelInput = document.getElementById('activity-level');
const sleepHoursInput = document.getElementById('sleep-hours');
const medicalHistoryInput = document.getElementById('medical-history');

// Add a click event listener to the "Save & Continue" button
saveSurveyButton.addEventListener('click', () => {
    // 1. Create an object with the user's answers
    const surveyData = {
        region: regionInput.value,
        activity_level: activityLevelInput.value,
        sleep_hours: sleepHoursInput.value,
        medical_history: medicalHistoryInput.value,
    };

    // Basic validation to ensure fields are not empty
    if (!surveyData.region || !surveyData.activity_level || !surveyData.sleep_hours || !surveyData.medical_history) {
        alert('Please fill out all survey fields before continuing.');
        return; // Stop the function if any field is empty
    }

    // 2. Convert the object to a string and save it to the browser's localStorage
    // This is how we'll access it on the next page.
    localStorage.setItem('userSurveyData', JSON.stringify(surveyData));

    // 3. Redirect to the food selection page
    window.location.href = 'food-selection.html';
});