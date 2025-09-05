/**
 * Disease Chat Module
 * Handles disease diagnosis chat flow with structured follow-up options
 */

// Global state to track which follow-up options have been shown
let shownSections = {
    medications: false,
    lifestyle: false,
    whenToSeeDoctor: false,
    otherPossibilities: false
};

// Current disease being discussed
let currentDisease = null;

// Store all predictions
let allPredictions = [];

// Load disease data from JSON file
let diseaseData = [];
fetch('24-Disease.json')
    .then(response => response.json())
    .then(data => {
        console.log('Disease data loaded successfully');
        diseaseData = data;
    })
    .catch(error => console.error('Error loading disease data:', error));

/**
 * Process AI response for disease diagnosis
 * @param {Array} predictions - Array of top 3 predictions with label and confidence
 * @returns {string} Formatted response with disease information
 */
function processDiseaseResponse(predictions) {
    try {
        if (!Array.isArray(predictions) || predictions.length === 0) {
            return "I'm sorry, I couldn't process the prediction results.";
        }

        // Store all predictions for later use
        allPredictions = predictions;
        const topPrediction = predictions[0];
        const diseaseName = topPrediction.label;
        const confidenceScore = topPrediction.confidence;

        // Check if confidence is below 70%
        if (confidenceScore < 70) {
            return `<div class="disease-info">
                <div class="section-title">🩺 I'm not completely confident about the diagnosis.</div>
                <div class="section-content">Could you provide a bit more detail about your symptoms? This will help me better understand what you're experiencing and give you a more accurate response.</div>
            </div>`;
        }

        // Find disease in data
        const disease = diseaseData.find(d => d.name.toLowerCase() === diseaseName.toLowerCase());
        if (!disease) {
            return "I'm sorry, I couldn't find detailed information about this condition.";
        }

        currentDisease = disease;
        resetShownSections();
        
        // Format the primary disease response (which already includes the four options)
        let response = formatDiseaseResponse(disease, confidenceScore);
        
        // Do NOT append any extra 'Other possibilities' button or section here
        // The four options are already rendered by formatDiseaseResponse
        
        return response;
    } catch (error) {
        console.error('Error processing disease response:', error);
        return "I'm sorry, I encountered an error while processing the diagnosis.";
    }
}

/**
 * Format the disease information for display
 * @param {Object} disease - The disease object
 * @param {number} confidenceScore - The confidence score of the diagnosis
 * @returns {string} Formatted HTML for the disease information
 */
function formatDiseaseResponse(disease, confidenceScore) {
    return `<div class="disease-info">
        <div class="disease-title">🩺 <strong>${disease.name}</strong> <span class='text-xs text-gray-500'>(Confidence: ${confidenceScore}%)</span></div>
        <div class="disease-section">
            <div class="section-title"><strong>Description:</strong></div>
            <div class="section-content">${formatTextWithBullets(disease.description)}</div>
        </div>
        <div class="disease-section">
            <div class="section-title"><strong>Home Care Tips:</strong></div>
            <div class="section-content">${formatTextWithBullets(disease.homeCare)}</div>
        </div>
        <div class="follow-up-options">
            <button class="option-button" onclick="handleFollowUpOption('lifestyle')">🏃 Lifestyle recommendations</button>
            <button class="option-button" onclick="handleFollowUpOption('medications')">💊 Medication recommendation</button>
            <button class="option-button" onclick="handleFollowUpOption('whenToSeeDoctor')">👨‍⚕️ When to see a doctor</button>
            <button class="option-button" onclick="handleFollowUpOption('otherPossibilities')">🩺 Other possibilities</button>
        </div>
    </div>`;
}

/**
 * Format text with bullet points for better readability
 * @param {string} text - The text to format
 * @param {string} type - The type of content being formatted
 * @returns {string} Formatted text with bullet points
 */
function formatTextWithBullets(text, type = 'default') {
    // Split by newline
    return text.split('\n\n').map(line => {
        if (line.trim() === '') return '';
        
        // Special formatting for medication section
        if (type === 'medications') {
            // Check if this is a side effect line
            if (line.startsWith('Side Effects:')) {
                // Make side effects italic, without bullet, and indented
                return `<div style="margin-left: 20px;"><i>${line}</i></div>`;
            }
        }
        
        // Default formatting with bullet points
        return `• ${line}`;
    }).join('<br>');
}

/**
 * Handle user selection of a follow-up option
 * @param {string} option - The selected option
 * @returns {string} Response for the selected option
 */
function handleFollowUpOption(option) {
    let response = '';
    
    if (option === 'restart') {
        // Reset the conversation state
        resetShownSections();
        currentDisease = null;
        allPredictions = [];
        return "What symptoms are you experiencing?";
    }
    
    // Check for currentDisease for other options
    if (!currentDisease) return "I'm sorry, I don't have information about this disease.";
    
    // Mark this section as shown BEFORE generating follow-up options
    shownSections[option] = true;
    
    // Format response based on selected option
    switch (option) {
        case 'medications':
            response = `<div class="disease-section">
                <div class="section-title"><strong>💊 Recommended Medications:</strong></div>
                <div class="section-content">${formatTextWithBullets(currentDisease.medications, 'medications')}</div>
            </div>`;
            break;
        case 'lifestyle':
            response = `<div class="disease-section">
                <div class="section-title"><strong>🏃 Lifestyle Recommendations:</strong></div>
                <div class="section-content">${formatTextWithBullets(currentDisease.lifestyle)}</div>
            </div>`;
            break;
        case 'whenToSeeDoctor':
            response = `<div class="disease-section">
                <div class="section-title"><strong>👨‍⚕️ When to See a Doctor:</strong></div>
                <div class="section-content">${formatTextWithBullets(currentDisease.whenToSeeDoctor)}</div>
            </div>`;
            break;
        case 'otherPossibilities':
            if (allPredictions.length > 1) {
                // Get alternative predictions (excluding the top one)
                const alternatives = allPredictions.slice(1);
                const possibilitiesContent = alternatives.map((pred, index) => {
                    return `<button class="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" onclick="handleAlternativePrediction('${pred.label}', ${pred.confidence})">
                        ${index + 2}. ${pred.label} — ${pred.confidence}%
                    </button>`;
                }).join('<br>');
                
                response = `<div class="disease-section">
                    <div class="section-title"><strong>🩺 Other Possibilities Considered:</strong></div>
                    <div class="section-content">Based on your symptoms, I also considered these conditions but found them less likely to match your case:</div>
                    <div class="section-content mt-2">${possibilitiesContent}</div>
                </div>`;
            } else {
                response = `<div class="disease-section">
                    <div class="section-title"><strong>🩺 Other Possibilities:</strong></div>
                    <div class="section-content">No other conditions were considered with high confidence.</div>
                </div>`;
            }
            break;
    }
    
    // Add remaining follow-up options (which will NOT include 'Other possibilities' if just clicked)
    response += generateFollowUpOptions();
    
    return response;
}

/**
 * Generate follow-up options based on what hasn't been shown yet
 * @returns {string} HTML for follow-up options
 */
function generateFollowUpOptions() {
    let options = [];
    // Only show medical-related options that haven't been shown yet, in the correct order
    if (!shownSections.lifestyle) {
        options.push(`<button class="option-button" onclick="handleFollowUpOption('lifestyle')">🏃 Lifestyle recommendations</button>`);
    }
    if (!shownSections.medications) {
        options.push(`<button class="option-button" onclick="handleFollowUpOption('medications')">💊 Medication recommendation</button>`);
    }
    if (!shownSections.whenToSeeDoctor) {
        options.push(`<button class="option-button" onclick="handleFollowUpOption('whenToSeeDoctor')">👨‍⚕️ When to see a doctor</button>`);
    }
    // Always show 'Other possibilities' if it hasn't been clicked yet
    if (!shownSections.otherPossibilities && allPredictions.length > 1) {
        options.push(`<button class="option-button" onclick="handleFollowUpOption('otherPossibilities')">🩺 Other possibilities</button>`);
    }
    // Only show "New symptoms" button if ALL THREE medical options have been shown
    if (shownSections.medications && shownSections.lifestyle && shownSections.whenToSeeDoctor) {
        options.push(`<button class="option-button" onclick="handleFollowUpOption('restart')">🩺 New symptoms?</button>`);
    }
    return `<div class="follow-up-options">${options.join('')}</div>`;
}

/**
 * Handle click on alternative prediction
 * @param {string} diseaseName - The name of the selected disease
 * @param {number} confidenceScore - The confidence score of the selected disease
 */
function handleAlternativePrediction(diseaseName, confidenceScore) {
    // Find the disease in our data
    const disease = diseaseData.find(d => d.name.toLowerCase() === diseaseName.toLowerCase());
    if (!disease) return;
    
    // Update current disease
    currentDisease = disease;
    
    // Reset shown sections
    resetShownSections();
    
    // Format and display the disease information
    const response = formatDiseaseResponse(disease, confidenceScore);
    
    // Add the response to the chat
    if (typeof addMessageToChat === 'function') {
        addMessageToChat(response, false, true);
    }
}

/**
 * Process user message for "yes" responses
 * @param {string} userMessage - The user's message
 * @returns {boolean|string} False if not a yes response, or the response content
 */
function processYesResponse(userMessage) {
    // Check if this is a "yes" response
    const yesPattern = /^(yes|yeah|yep|sure|ok|okay|y)$/i;
    if (!yesPattern.test(userMessage.trim())) return false;
    
    // If no disease is being discussed, this isn't a follow-up yes
    if (!currentDisease) return false;
    
    // If all sections have been shown, treat as restart
    if (shownSections.medications && shownSections.lifestyle && shownSections.whenToSeeDoctor && shownSections.otherPossibilities) {
        resetShownSections();
        currentDisease = null;
        allPredictions = [];
        return "What symptoms are you experiencing?";
    }
    
    // Show all remaining sections in order
    let response = '';
    
    if (!shownSections.medications) {
        shownSections.medications = true;
        response += `<div class="disease-section">
            <div class="section-title"><strong>💊 Recommended Medications:</strong></div>
            <div class="section-content">${formatTextWithBullets(currentDisease.medications, 'medications')}</div>
        </div>`;
    }
    
    if (!shownSections.lifestyle) {
        shownSections.lifestyle = true;
        response += `<div class="disease-section">
            <div class="section-title"><strong>🏃 Lifestyle Recommendations:</strong></div>
            <div class="section-content">${formatTextWithBullets(currentDisease.lifestyle)}</div>
        </div>`;
    }
    
    if (!shownSections.whenToSeeDoctor) {
        shownSections.whenToSeeDoctor = true;
        response += `<div class="disease-section">
            <div class="section-title"><strong>👨‍⚕️ When to See a Doctor:</strong></div>
            <div class="section-content">${formatTextWithBullets(currentDisease.whenToSeeDoctor)}</div>
        </div>`;
    }
    
    if (!shownSections.otherPossibilities) {
        shownSections.otherPossibilities = true;
        let possibilitiesContent = '';
        if (allPredictions.length > 1) {
            // Get alternative predictions (excluding the top one)
            const alternatives = allPredictions.slice(1);
            possibilitiesContent = alternatives.map((pred, index) => {
                const disease = diseaseData.find(d => d.name.toLowerCase() === pred.label.toLowerCase());
                if (disease) {
                    return `<button class="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" onclick="handleAlternativePrediction('${pred.label}', ${pred.confidence})">
                        ${index + 2}. ${pred.label} — ${pred.confidence}%
                    </button>`;
                }
                return `${index + 2}. ${pred.label} — ${pred.confidence}%`;
            }).join('<br>');
        } else {
            possibilitiesContent = "No other conditions were considered with high confidence.";
        }
        
        response += `<div class="disease-section">
            <div class="section-title"><strong>🩺 Other Possibilities Considered:</strong></div>
            <div class="section-content">Based on your symptoms, I also considered these conditions but found them less likely to match your case:</div>
            <div class="section-content mt-2">${possibilitiesContent}</div>
        </div>`;
    }
    
    // Add restart option
    response += `<div class="follow-up-options">
        <button class="option-button" onclick="handleFollowUpOption('restart')">🩺 New symptoms?</button>
    </div>`;
    
    return response;
}

/**
 * Reset the shown sections state
 */
function resetShownSections() {
    shownSections = {
        medications: false,
        lifestyle: false,
        whenToSeeDoctor: false,
        otherPossibilities: false
    };
}

// Make functions available globally
window.processDiseaseResponse = processDiseaseResponse;
window.handleFollowUpOption = handleFollowUpOption;
window.processYesResponse = processYesResponse;
window.handleAlternativePrediction = handleAlternativePrediction;
