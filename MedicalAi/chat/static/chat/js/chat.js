// Chat functionality for the Medical Diagnosis AI Chatbot

// Helper function to log conversation state changes
function logConversationState(action, conversationId) {
    console.log(`🔄 [CONVERSATION] ${action}:`, {
        previousId: window.currentConversationId,
        newId: conversationId,
        timestamp: new Date().toISOString()
    });
}

// Get AI response from the Django backend
async function getModelPrediction(userMessage) {
    try {
        console.log('Sending request to Django backend at /api/chat/predict/');
        
        // Get authentication and CSRF tokens
        const authToken = localStorage.getItem('authToken');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        
        // Get conversation ID if it exists
        const conversationId = window.currentConversationId || null;
        
        // Prepare the request data
        const requestData = {
            message: userMessage,
            conversation_id: conversationId
        };
        
        console.log('🔄 [API REQUEST] Current conversation state:', {
            currentConversationId: window.currentConversationId,
            sendingConversationId: conversationId,
            message: userMessage
        });
        console.log('Sending request data:', requestData);
        
        // Set up headers
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken
        };
        
        // Add authorization header if user is authenticated
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }

        // Make the API request
        const response = await fetch('/api/chat/predict/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData),
            credentials: 'same-origin'
        });

        // Check if the response is OK
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: errorData
            });
            
            // Throw a more descriptive error
            throw new Error(
                errorData.detail || 
                errorData.error || 
                errorData.message || 
                `API request failed with status ${response.status}: ${response.statusText}`
            );
        }
        
        // Parse the response
        const data = await response.json();
        console.log('📥 [API RESPONSE] Received response from Django backend:', data);
        console.log('🔍 [API RESPONSE] Response structure check:', {
            hasStatus: 'status' in data,
            hasData: 'data' in data,
            hasConversationId: 'conversation_id' in data,
            hasIsNewConversation: 'is_new_conversation' in data,
            conversationId: data.conversation_id,
            isNewConversation: data.is_new_conversation
        });
        
        // Handle different response formats
        if (data.status === 'success' && data.data) {
            return data;
        } else if (data.status === 'not_found') {
            return { 
                description: data.message || 'No matching conditions found.',
                status: 'not_found'
            };
        } else {
            throw new Error(data.message || 'Unexpected response format from server');
        }
    } catch (error) {
        console.error('Error contacting Django backend:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Rethrow the error with more context
        const enhancedError = new Error(`Failed to get prediction: ${error.message}`);
        enhancedError.originalError = error;
        throw enhancedError;
    }
} 

// Process the transition from welcome to chat mode
function processWelcomeToChatTransition() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    console.log('Adjusting UI for conversation mode.');
    
    // Hide welcome container if it exists
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
        welcomeContainer.style.display = 'none';
        welcomeContainer.style.height = '0';
        welcomeContainer.style.overflow = 'hidden';
        welcomeContainer.style.margin = '0';
        welcomeContainer.style.padding = '0';
        console.log('Welcome container hidden');
    }
    const warningContainer = document.getElementById('warning-message');
    if (warningContainer) {
        warningContainer.style.position = 'absolute';
        warningContainer.style.bottom = '15px';
        warningContainer.style.left = '50%';
        warningContainer.style.transform = 'translate(-50%)';
        console.log('Warning message hidden');
    }
    // Hide suggested topics if they exist
    const suggestedTopics = document.getElementById('suggested-topics');
    if (suggestedTopics) {
        suggestedTopics.style.display = 'none';
        console.log('Suggested topics hidden');
    }
    
    // Reset the main content container's margin
    const mainContentContainer = document.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
    if (mainContentContainer) {
        mainContentContainer.style.marginTop = '0';
        mainContentContainer.style.paddingTop = '16px';
        console.log('Reset main content container margin');
    }
    
    // Make the chat input sticky at the bottom
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    if (messageForm && messageForm.parentElement) {
        const chatInputContainer = messageForm.parentElement;
        chatInputContainer.setAttribute('style', 'position: sticky; bottom: 0; margin-bottom: 1rem; margin-top: 1rem; background-color: transparent; padding-top: 0.5rem; z-index: 10;');
        console.log('Chat input made sticky');
    }
    
    // Apply welcome page text box styling
    if (messageInput) {
        messageInput.className = 'block w-full px-4 py-3 pr-16 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none rounded-xl';
        messageInput.placeholder = 'Message Clinexa...';
        console.log('Applied welcome page text box styling');
    }
    
    // Configure chat messages container for proper display
    chatContainer.style.height = 'calc(100vh - 240px)'; // Adjusted height to leave room for input
    chatContainer.style.overflowY = 'auto'; // Only the messages area scrolls
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.paddingRight = '8px';
    chatContainer.style.marginTop = '0'; // No top margin needed
    chatContainer.style.position = 'relative';
    chatContainer.style.zIndex = '5';
    
    // Make sure the parent container doesn't scroll
    const mainContent = document.querySelector('main.flex-1');
    if (mainContent) {
        mainContent.style.overflowY = 'hidden';
    }
    
    console.log('Chat container styles applied - only messages area scrollable');
}

// Handle user message submission
async function handleMessageSubmit(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const userMessage = messageInput.value.trim();
    
    if (window.location.pathname.includes('welcome')) {
        localStorage.setItem('firstMessage', userMessage);
        window.location.href = '/chat/chat/';
        return; 
    }
    
    // Check if this is a follow-up option selection (like "yes")
    if (typeof window.processYesResponse === 'function') {
        const followUpResponse = window.processYesResponse(userMessage);
        if (followUpResponse) {
            if (typeof addMessageToChat === 'function') {
                addMessageToChat(userMessage, true);
                addMessageToChat(followUpResponse, false, true);
                messageInput.value = '';
                messageInput.style.height = 'auto';
                return;
            }
        }
    }
    
    addMessageToChat(userMessage, true);
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    processWelcomeToChatTransition();
    
    const isNewSymptomMessage = !['yes', 'no', 'lifestyle', 'medications', 'when to see doctor', 'new symptoms']
        .some(term => userMessage.toLowerCase().includes(term));
        
    if (isNewSymptomMessage) {
        window.currentDisease = null;
        window.pendingFollowUpSections = [];
        if (window.followUpTimeout) {
            clearTimeout(window.followUpTimeout);
            window.followUpTimeout = null;
        }
    }
    
    const loadingId = 'loading-' + Date.now();
    const chatContainer = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'w-full new-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message';
    contentDiv.textContent = 'AI is typing...';
    
    loadingDiv.appendChild(contentDiv);
    
    contentDiv.animate(
        [ { opacity: 0.5 }, { opacity: 1 }, { opacity: 0.5 } ],
        { duration: 1500, iterations: Infinity }
    );
    
    chatContainer.appendChild(loadingDiv);
    
    if (userMessage.toLowerCase().trim() === 'yes' && window.currentDisease) {
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) loadingMessage.remove();
        addMessageToChat(userMessage, true);
        showAllFollowUpSections();
    } else if (userMessage.toLowerCase().trim() === 'new symptoms') {
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) loadingMessage.remove();
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.innerHTML = '';
        window.currentDisease = null;
        window.pendingFollowUpSections = [];
        addMessageToChat("Hello! I'm your medical assistant. What symptoms are you experiencing?", false);
    } else {
        processUserMessage(userMessage, loadingId, chatContainer);
    }
}

/**
 * Process a user message - checking for topic matches first, then disease prediction
 * @param {string} userMessage - The user's message to process
 * @param {string} loadingId - ID of the loading indicator
 * @param {HTMLElement} chatContainer - The chat container element
 */
async function processUserMessage(userMessage, loadingId, chatContainer) {
    console.log('🔄 [CHAT] Processing user message:', userMessage);
    
    // Check if this is a new symptom message (not a follow-up interaction)
    const isNewSymptomMessage = !['yes', 'no', 'lifestyle', 'medications', 'when to see doctor', 'new symptoms']
        .some(term => userMessage.toLowerCase().includes(term));
    
    // If it's a new symptom message, reset the follow-up state
    if (isNewSymptomMessage) {
        console.log('🆕 [CHAT] New symptom message detected, resetting follow-up state');
        window.currentDisease = null;
        window.pendingFollowUpSections = [];
        // Clear any existing timeouts
        if (window.followUpTimeout) {
            clearTimeout(window.followUpTimeout);
            window.followUpTimeout = null;
        }
    }
    
    try {
        // FIRST PRIORITY: Check if the message matches a predefined health topic
        console.log('🔍 [CHAT] Step 1: Checking for topic match before disease prediction');
        let topicMatched = false;
        
        if (typeof window.matchTopicByTitle === 'function') {
            console.log('🔍 [CHAT] Topic matcher function found, attempting to match...');
            try {
                const matchedTopic = await window.matchTopicByTitle(userMessage);
                
                // If we found a matching topic, display its abstract instead of disease prediction
                if (matchedTopic) {
                    console.log('✅ [CHAT] TOPIC MATCH CONFIRMED:', matchedTopic.title);
                    console.log('⚠️ [CHAT] Skipping disease prediction, showing topic abstract instead');
                    topicMatched = true;
                    
                    // Remove loading message
                    const loadingMessage = document.getElementById(loadingId);
                    if (loadingMessage) {
                        loadingMessage.remove();
                    }
                    
                    // Format the topic response
                    const topicResponse = window.formatTopicResponse(matchedTopic);
                    console.log('📄 [CHAT] Displaying topic response for:', matchedTopic.title);
                    
                    // Display the topic response as HTML
                    addMessageToChat(topicResponse, false, true);
                    
                    return; // Exit early - don't proceed to disease prediction
                } else {
                    console.log('❌ [CHAT] No topic match found, proceeding to disease prediction');
                }
            } catch (topicError) {
                console.error('❌ [CHAT] Error in topic matching:', topicError);
                console.log('⚠️ [CHAT] Continuing to disease prediction due to error in topic matching');
                // Continue to disease prediction if topic matching fails
            }
        } else {
            console.error('❌ [CHAT] window.matchTopicByTitle function not found!');
            console.log('⚠️ [CHAT] Make sure topic-matcher.js is loaded before chat.js');
        }
        
        // SECOND PRIORITY: Only if no topic matched, try disease prediction
        if (!topicMatched) {
            let aiResponse;
            try {
                // Get the AI's prediction
                const predictionResult = await getModelPrediction(userMessage);
                
                // Remove loading message
                const loadingMessage = document.getElementById(loadingId);
                if (loadingMessage) {
                    loadingMessage.remove();
                }

                // Check if the prediction result has the expected format
                if (predictionResult) {
                    // Update conversation ID if provided in response
                    if (predictionResult.conversation_id) {
                        logConversationState('UPDATING', predictionResult.conversation_id);
                        window.currentConversationId = predictionResult.conversation_id;
                        
                        // Test: Verify the conversation ID was stored correctly
                        console.log('🧪 [TEST] Conversation ID storage test:', {
                            stored: window.currentConversationId,
                            expected: predictionResult.conversation_id,
                            match: window.currentConversationId === predictionResult.conversation_id
                        });
                        
                        // Update URL to include conversation ID if it's a new conversation
                        if (predictionResult.is_new_conversation) {
                            const url = new URL(window.location.href);
                            url.searchParams.set('conversation_id', predictionResult.conversation_id);
                            window.history.pushState({}, '', url);
                            console.log('📝 Updated URL with new conversation ID');
                        }
                    }
                    
                    if (predictionResult.status === 'not_found') {
                        // Handle case where no matching condition was found
                        addMessageToChat(predictionResult.description || "I couldn't find any matching conditions. Could you provide more details about your symptoms?", false);
                        
                        // Refresh sidebar if this is a new conversation
                        if (predictionResult.is_new_conversation && typeof refreshSidebarWithRetry === 'function') {
                            setTimeout(() => refreshSidebarWithRetry(), 500);
                        }
                        return;
                    }
                    console.log("📦 Received prediction result:", predictionResult);

                    if (predictionResult.status === 'success' && predictionResult.data?.predictions) {
                        const predictions = predictionResult.data.predictions;
                        console.log("✅ Valid response detected. Predictions:", predictions);

                        // Use the dedicated function from disease-chat.js to process and format the response
                        console.log('Calling processDiseaseResponse with predictions:', predictions);
                        
                        // Check if processDiseaseResponse is available
                        if (typeof window.processDiseaseResponse !== 'function') {
                            console.error('❌ processDiseaseResponse function not found! Make sure disease-chat.js is loaded.');
                            console.log('Available window properties:', Object.keys(window).filter(k => k.includes('process') || k.includes('disease') || k.includes('Disease')));
                            throw new Error('Disease processing functions not loaded');
                        }
                        
                        try {
                            const formattedResponse = window.processDiseaseResponse(predictions);
                            console.log('Formatted response from processDiseaseResponse:', formattedResponse);
                            addMessageToChat(formattedResponse, false, true); // true for HTML content
                            
                            // Refresh sidebar if this is a new conversation
                            if (predictionResult.is_new_conversation && typeof refreshSidebarWithRetry === 'function') {
                                setTimeout(() => refreshSidebarWithRetry(), 500);
                            }
                        } catch (processError) {
                            console.error('Error processing disease response:', processError);
                            // Fallback response if processing fails
                            const fallbackText = `Based on your symptoms, you might have <strong>${predictions[0].name}</strong> with a confidence of ${(predictions[0].confidence * 100).toFixed(1)}%.`;
                            addMessageToChat(fallbackText, false, true);
                            
                            // Refresh sidebar if this is a new conversation
                            if (predictionResult.is_new_conversation && typeof refreshSidebarWithRetry === 'function') {
                                setTimeout(() => refreshSidebarWithRetry(), 500);
                            }
                        }
                    } else if (predictionResult.data?.disease) {
                        // Handle fallback for single disease object if predictions array is not present
                        console.log('Processing single disease response:', predictionResult.data.disease);
                        const disease = predictionResult.data.disease;
                        const fallbackPredictions = [{
                            label: disease.name,
                            name: disease.name, // Ensure name is available
                            confidence: disease.confidence || 0.8, // Default confidence if not provided
                            // Include any other disease properties that might be needed
                            ...disease
                        }];
                        
                        try {
                            if (typeof window.processDiseaseResponse === 'function') {
                                const formattedResponse = window.processDiseaseResponse(fallbackPredictions);
                                addMessageToChat(formattedResponse, false, true);
                                
                                // Refresh sidebar if this is a new conversation
                                if (predictionResult.is_new_conversation && typeof refreshSidebarWithRetry === 'function') {
                                    setTimeout(() => refreshSidebarWithRetry(), 500);
                                }
                            } else {
                                throw new Error('processDiseaseResponse not available');
                            }
                        } catch (error) {
                            console.error('Error processing single disease response:', error);
                            const fallbackText = `Based on your symptoms, you might have <strong>${disease.name}</strong>${disease.confidence ? ` with a confidence of ${(disease.confidence * 100).toFixed(1)}%` : ''}.`;
                            addMessageToChat(fallbackText, false, true);
                            
                            // Refresh sidebar if this is a new conversation
                            if (predictionResult.is_new_conversation && typeof refreshSidebarWithRetry === 'function') {
                                setTimeout(() => refreshSidebarWithRetry(), 500);
                            }
                        }
                    } else {
                        // Handle cases where the response format is unexpected
                        addMessageToChat(predictionResult.message || "I received an unusual response from the server.", false);
                        
                        // Refresh sidebar if this is a new conversation
                        if (predictionResult.is_new_conversation && typeof refreshSidebarWithRetry === 'function') {
                            setTimeout(() => refreshSidebarWithRetry(), 500);
                        }
                    }
                } else {
                    throw new Error('Empty response from API');
                }
            } catch (error) {
                console.error('An error occurred during prediction:', error);
                // Remove loading message on error
                const loadingMessage = document.getElementById(loadingId);
                if (loadingMessage) {
                    loadingMessage.remove();
                }
                addMessageToChat('Sorry, an error occurred while analyzing your symptoms. Please check the console for details and try again.', false);
            }
        }

        // This code should never be reached since we either:  
        // 1. Return early after handling a topic match
        // 2. Return after handling the AI response or error
        console.error('Unexpected code path in processUserMessage');
        return;
    } catch (error) {
        console.error('Error processing message:', error);
        // If there's an error, still remove the loading message
        const loadingMessage = document.getElementById(loadingId);
        if (loadingMessage) {
            loadingMessage.remove();
        }
        // Add a fallback message
        if (typeof window.addMessageToChat === 'function') {
            window.addMessageToChat("I'm sorry, I couldn't process your request. Please try again.", false);
        } else {
            console.error('addMessageToChat function not found');
        }
    }
}

// Global variables for follow-up state
window.currentDisease = null;
window.pendingFollowUpSections = [];

// Function to show follow-up options
function showFollowUpOptions() {
    if (!window.currentDisease) {
        console.log('No current disease data available for follow-up options');
        return;
    }
    
    // Don't show options if they're already visible
    if (document.querySelector('.follow-up-options')) {
        console.log('Follow-up options already visible');
        return;
    }
    
    console.log('Showing follow-up options for disease:', window.currentDisease.disease);
    
    const options = [
        { 
            emoji: '💊', 
            text: 'Recommended medication',
            key: 'medications',
            description: window.currentDisease.medications || 'No medication information available.'
        },
        { 
            emoji: '🏃', 
            text: 'Lifestyle recommendations',
            key: 'lifestyle',
            description: window.currentDisease.lifestyle || 'No specific lifestyle recommendations available.'
        },
        { 
            emoji: '👨\u200d⚕️', 
            text: 'When to see a doctor',
            key: 'when_to_see_doctor',
            description: window.currentDisease.when_to_see_doctor || 'Consult a doctor if symptoms persist or worsen.'
        }
    ];
    
    // Filter out options that don't have any content
    const validOptions = options.filter(opt => 
        window.currentDisease[opt.key] && 
        typeof window.currentDisease[opt.key] === 'string' && 
        window.currentDisease[opt.key].trim() !== ''
    );
    
    if (validOptions.length === 0) {
        console.log('No valid follow-up options available');
        return;
    }
    
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ai-message';
    
    // Create message content
    const messageContent = `
        <div class="message-content">
            <div class="flex items-start">
                <div class="message-avatar">
                    <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span class="text-blue-600 dark:text-blue-300">🤖</span>
                    </div>
                </div>
                <div class="message-bubble">
                    <p class="text-gray-800 dark:text-gray-200 mb-2">Would you like to know more about this condition?</p>
                    <div class="follow-up-options">
                        ${validOptions.map((option, index) => `
                            <button class="option-button" data-key="${option.key}">
                                <span class="emoji">${option.emoji}</span>
                                <span class="text">${option.text}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    messageDiv.innerHTML = messageContent;
    
    // Add to chat
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.appendChild(messageDiv);
        
        // Add event listeners to the buttons
        messageDiv.querySelectorAll('.option-button').forEach((button, index) => {
            button.addEventListener('click', () => {
                const option = validOptions[index];
                if (option) {
                    handleFollowUpOption(option);
                }
            });
        });
        
        // Scroll to the bottom
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Handle follow-up option selection
function handleFollowUpOption(option) {
    if (!window.currentDisease) {
        console.error('No current disease available');
        return;
    }

    console.log('Handling follow-up option:', option);
    
    // Add user's selection to chat
    const selectedOption = document.createElement('div');
    selectedOption.className = 'message user-message';
    selectedOption.innerHTML = `
        <div class="message-content">
            <div class="message-text">${option === 'lifestyle' ? '🏃 Lifestyle recommendations' : 
                                      option === 'medications' ? '💊 Medication recommendation' : 
                                      '👨‍⚕️ When to see a doctor'}</div>
        </div>`;
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(selectedOption);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Remove all option buttons
    document.querySelectorAll('.option-button').forEach(btn => btn.remove());
    
    // Show typing indicator
    showTypingIndicator();
    
    // Clear any existing timeouts to prevent multiple responses
    if (window.followUpTimeout) {
        clearTimeout(window.followUpTimeout);
    }
    
    // Simulate API call delay
    window.followUpTimeout = setTimeout(() => {
        hideTypingIndicator();
        
        // Generate response based on the selected option
        let response = '';
        
        switch(option) {
            case 'lifestyle':
                response = `
                    <div class="disease-section" style="margin-bottom: 16px;">
                        <div class="section-title" style="margin-bottom: 6px; color: #111; font-weight: 500;">
                            <strong>🏃 Lifestyle Recommendations:</strong>
                        </div>
                        <div class="section-content" style="line-height: 1.5; color: #333;">
                            ${window.currentDisease.lifestyle ? window.currentDisease.lifestyle.replace(/\n/g, '<br>') : 'No lifestyle recommendations available.'}
                        </div>
                    </div>`;
                break;
                
            case 'medications':
                response = `
                    <div class="disease-section" style="margin-bottom: 16px;">
                        <div class="section-title" style="margin-bottom: 6px; color: #111; font-weight: 500;">
                            <strong>💊 Medication Recommendation:</strong>
                        </div>
                        <div class="section-content" style="line-height: 1.5; color: #333;">
                            ${window.currentDisease.medications ? window.currentDisease.medications.replace(/\n/g, '<br>') : 'No medication information available.'}
                        </div>
                    </div>`;
                break;
                
            case 'whenToSeeDoctor':
                response = `
                    <div class="disease-section" style="margin-bottom: 16px;">
                        <div class="section-title" style="margin-bottom: 6px; color: #111; font-weight: 500;">
                            <strong>👨‍⚕️ When to See a Doctor:</strong>
                        </div>
                        <div class="section-content" style="line-height: 1.5; color: #333;">
                            ${window.currentDisease.whenToSeeDoctor ? window.currentDisease.whenToSeeDoctor.replace(/\n/g, '<br>') : 'No specific guidance available. Consult a doctor if symptoms persist or worsen.'}
                        </div>
                    </div>`;
                break;
        }
        
        // Add the response to the chat
        addMessageToChat(response, false, true);
        
        // Show remaining follow-up options
        showRemainingFollowUpOptions(option);
        
        // Clear the follow-up timeout reference
        window.followUpTimeout = null;
        
    }, 300); // Short delay before showing the response
}

// Show remaining follow-up options
function showRemainingFollowUpOptions(selectedOption) {
    const options = [
        { key: 'lifestyle', text: '🏃 Lifestyle recommendations' },
        { key: 'medications', text: '💊 Medication recommendation' },
        { key: 'whenToSeeDoctor', text: '👨‍⚕️ When to see a doctor' }
    ].filter(opt => opt.key !== selectedOption);
    
    if (options.length > 0) {
        const optionsHtml = options.map(opt => `
            <button class="option-button" 
                onclick="handleFollowUpOption('${opt.key}')"
                style="background-color: #f1f1f1; border: 1px solid #ddd; border-radius: 18px; padding: 10px 16px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; color: #333; text-align: left; width: 100%; max-width: 400px; margin-bottom: 8px;"
                onmouseover="this.style.backgroundColor='#e9e9e9'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
                onmouseout="this.style.backgroundColor='#f1f1f1'; this.style.transform='none'; this.style.boxShadow='none';">
                ${opt.text}
            </button>
        `).join('');
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'follow-up-options';
        optionsContainer.style.marginTop = '16px';
        optionsContainer.innerHTML = optionsHtml;
        
        // Add the options to the chat
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.appendChild(optionsContainer);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        
        // Trigger reflow
        void messageDiv.offsetWidth;
        
        // Add the show class with a delay
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    } else {
        // No more options, show restart button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-start mt-4';
        
        const newSymptomsBtn = document.createElement('button');
        newSymptomsBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors';
        newSymptomsBtn.textContent = '🧠 Ask about different symptoms';
        newSymptomsBtn.onclick = function() {
            // Clear the current disease and restart the conversation
            window.currentDisease = null;
            // Clear the chat
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = '';
            // Show initial greeting
            addMessageToChat("Hello! I'm your medical assistant. What symptoms are you experiencing?", false);
        };
        
        buttonContainer.appendChild(newSymptomsBtn);
        
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.appendChild(buttonContainer);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        
        // Trigger reflow
        void messageDiv.offsetWidth;
        
        // Add the show class with a delay
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

// Show all follow-up sections automatically
function showAllFollowUpSections() {
    if (!window.currentDisease) return;
    
    console.log('Showing all follow-up sections for:', window.currentDisease.disease);
    
    const sections = [
        { 
            key: 'medications',
            emoji: '💊',
            title: 'Recommended medication',
            description: window.currentDisease.medications || 'No medication information available.'
        },
        { 
            key: 'lifestyle',
            emoji: '🏃',
            title: 'Lifestyle recommendations',
            description: window.currentDisease.lifestyle || 'No specific lifestyle recommendations available.'
        },
        { 
            key: 'when_to_see_doctor',
            emoji: '👨\u200d⚕️',
            title: 'When to see a doctor',
            description: window.currentDisease.when_to_see_doctor || 'Consult a doctor if symptoms persist or worsen.'
        }
    ];
    
    // Filter out sections that don't have content
    const validSections = sections.filter(section => 
        window.currentDisease[section.key] && 
        typeof window.currentDisease[section.key] === 'string' && 
        window.currentDisease[section.key].trim() !== ''
    );
    
    if (validSections.length === 0) {
        console.log('No valid sections to show');
        return;
    }
    
    // Show each section with a delay
    validSections.forEach((section, index) => {
        setTimeout(() => {
            const response = `
                <div class="flex items-start">
                    <div class="flex-shrink-0 mr-3">
                        <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span class="text-blue-600 dark:text-blue-300">🤖</span>
                        </div>
                    </div>
                    <div class="message-bubble">
                        <div class="flex items-center mb-1">
                            <span class="mr-2 text-lg">${section.emoji}</span>
                            <strong class="text-gray-800 dark:text-gray-200">${section.title}:</strong>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300">${section.description}</p>
                    </div>
                </div>
            `;
            
            addMessageToChat(response, false, true);
            
            // If this is the last section, show the "New symptoms?" button
            if (index === validSections.length - 1) {
                setTimeout(showNewSymptomsButton, 1000);
            }
        }, index * 2000); // 2 second delay between sections
    });
}

// Show the "New symptoms?" button
function showNewSymptomsButton() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    // Check if the button already exists
    if (document.querySelector('.new-symptoms-btn')) return;
    
    // Create container for the new symptoms button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-center mt-6 mb-4';
    
    // Create the new symptoms button
    const newSymptomsBtn = document.createElement('button');
    newSymptomsBtn.className = 'new-symptoms-btn flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full transition-all duration-200 transform hover:scale-105';
    newSymptomsBtn.innerHTML = `
        <span class="mr-2 text-xl">🩺</span>
        <span class="font-medium">New symptoms?</span>
    `;
    
    newSymptomsBtn.onclick = () => {
        // Clear the current disease and focus the input
        window.currentDisease = null;
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.focus();
            messageInput.placeholder = 'Describe your symptoms...';
        }
        
        // Remove the button
        buttonContainer.remove();
    };
    
    // Add button to container and container to chat
    buttonContainer.appendChild(newSymptomsBtn);
    chatContainer.appendChild(buttonContainer);
    
    // Scroll to the bottom
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// 🌐 Load conversation from backend
async function loadConversation(conversationId) {
    processWelcomeToChatTransition();
    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            console.error('Not authenticated');
            return;
        }

        // 🔧 Fix fetch URL
        const response = await fetch(`/api/conversations/${conversationId}/`, {
            headers: {
                'Authorization': `Token ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load conversation');
        }

        const conversation = await response.json();

        // Clear chat UI
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }

        // Render each message
        if (conversation.messages && conversation.messages.length > 0) {
            conversation.messages.forEach(message => {
                const messageText = message.text || message.content;
                const isUser = message.is_user;

                if (isUser) {
                    addMessageToChat(messageText, true, false);
                } else {
                    // This is an AI message, try to parse and format it.
                    try {
                        const parsedData = JSON.parse(messageText);
                        if (parsedData && parsedData.predictions && typeof window.processDiseaseResponse === 'function') {
                            const formattedHtml = window.processDiseaseResponse(parsedData.predictions);
                            addMessageToChat(formattedHtml, false, true);
                        } else {
                            addMessageToChat(messageText, false, false);
                        }
                    } catch (e) {
                        // Not JSON, or some other error, treat as plain text.
                        addMessageToChat(messageText, false, false);
                    }
                }
            });
        }

        // Refresh sidebar
        if (window.loadConversationHistory) {
            window.loadConversationHistory();
        }

    } catch (error) {
        console.error('Error loading conversation:', error);

        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm p-2';
            errorDiv.textContent = 'Error loading conversation. Please try again.';
            chatMessages.appendChild(errorDiv);
        }
    }
}

// Add a message to the chat
function addMessageToChat(message, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;
    
    const messageContent = document.createElement('div');
    messageContent.className = `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
    }`;
    messageContent.textContent = message;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// Initialize conversation state
function initializeConversationState() {
    // Check URL for conversation ID
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation_id');
    
    if (conversationId) {
        logConversationState('INITIALIZING_FROM_URL', conversationId);
        window.currentConversationId = conversationId;
    } else {
        logConversationState('INITIALIZING_NEW', null);
        window.currentConversationId = null;
    }
    
    console.log('🔄 [INIT] Conversation state initialized:', {
        currentConversationId: window.currentConversationId,
        urlConversationId: conversationId
    });
}

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('chat.js: initializing with AI model integration');
    
    // Check for conversation ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');
    
    if (conversationId) {
        // Load the specific conversation
        loadConversation(conversationId);
    }
    
    // Handle new chat button click
    const newChatButton = document.getElementById('new-chat-button');
    if (newChatButton) {
        console.log("Sidebar conversation clicked:", conversationId);
        newChatButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear current conversation ID
            logConversationState('CLEARING', null);
            window.currentConversationId = null;
            
            // Clear chat messages
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }
            
            // Reload the page to start fresh
            window.location.href = '/chat/chat/';
        });
    }
    
    // Load conversations when the page loads
    if (window.loadConversationHistory) {
        window.loadConversationHistory();
    }
    
    // Make the addMessageToChat function from clinexa.js available globally
    if (typeof addMessageToChat === 'function') {
        // Extend addMessageToChat to handle HTML content
        const originalAddMessageToChat = addMessageToChat;
        // Function to smoothly scroll chat to bottom
        function scrollChatToBottom() {
            const chatContainer = document.getElementById('chat-messages');
            if (!chatContainer) return;
            requestAnimationFrame(() => {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    if (Math.abs(chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight) > 100) {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }, 100);
            });
        }

        window.addMessageToChat = function(message, isUser = false, isHtml = false) {
            // Check if we should skip this call (for AI messages with typing animation)
            if (!isUser && window.skipNextAddMessageToChat) {
                window.skipNextAddMessageToChat = false;
                return;
            }

            const chatContainer = document.getElementById('chat-messages');
            if (!chatContainer) return;

            // Create the message container with appropriate styling
            const messageDiv = document.createElement('div');

            if (isUser) {
                // User message - right-aligned with avatar
                messageDiv.className = 'flex w-full justify-end new-message';

                // Create user avatar that matches the top header profile icon
                const avatarDiv = document.createElement('div');
                // Changed from 'items-end' to 'items-start' to align with the first line of text
                avatarDiv.className = 'ml-2 flex-shrink-0 flex items-start';

                // Check if user has a custom profile picture
                const userProfilePic = localStorage.getItem('userProfilePic');

                if (userProfilePic) {
                    // Use the custom profile picture if available
                    avatarDiv.innerHTML = `
                        <img src="${userProfilePic}" alt="User" class="h-8 w-8 rounded-full object-cover">
                    `;
                } else {
                    // Use the same SVG icon as in the header (plain, no background)
                    avatarDiv.innerHTML = `
                        <div class="h-8 w-8 flex items-center justify-center text-gray-700 dark:text-gray-300">
                            <svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6">
                                <path d="M12.0001 13.09C14.4909 13.09 16.5101 11.0708 16.5101 8.58C16.5101 6.08919 14.4909 4.07 12.0001 4.07C9.5093 4.07 7.49011 6.08919 7.49011 8.58C7.49011 11.0708 9.5093 13.09 12.0001 13.09Z" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.98008 11.91C8.97008 11.91 8.97008 11.91 8.96008 11.92" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16.9701 12.82C19.5601 14.4 21.3201 17.19 21.5001 20.4C21.5101 20.69 21.2801 20.93 20.9901 20.93H3.01007C2.72007 20.93 2.49007 20.69 2.50007 20.4C2.68007 17.21 4.43007 14.43 6.99007 12.85" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    `;
                }

                // Create content div for user message
                const contentDiv = document.createElement('div');
                contentDiv.className = 'user-message';
                contentDiv.textContent = message;

                // Add content and avatar to the message div
                messageDiv.appendChild(contentDiv);
                messageDiv.appendChild(avatarDiv);
            } else {
                // AI message - left-aligned without avatar for ChatGPT style
                messageDiv.className = 'w-full new-message';

                // Create content div for AI message
                const contentDiv = document.createElement('div');
                contentDiv.className = 'ai-message';
                
                if (isHtml) {
                    // Set HTML content directly
                    contentDiv.innerHTML = message;
                } else {
                    contentDiv.textContent = message;
                }
                
                // Add content to the message div
                messageDiv.appendChild(contentDiv);
            }
            
            // Add message to the container
            chatContainer.appendChild(messageDiv);
            
            // Scroll to bottom after a small delay to ensure content is rendered
            setTimeout(scrollChatToBottom, 50);
            
            // Add a subtle fade-in animation
            messageDiv.animate(
                [
                    { opacity: 0, transform: 'translateY(10px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                {
                    duration: 300,
                    easing: 'ease-out'
                }
            );
        };
        console.log('chat.js: extended addMessageToChat function to handle HTML content');
    }
    
    // Check if there's a first message from welcome.html
    const firstMessage = localStorage.getItem('firstMessage');
    const isDirectTopicClick = localStorage.getItem('isDirectTopicClick') === 'true';
    
    if (firstMessage) {
        console.log('Processing first message from welcome page:', firstMessage);
        console.log('Is direct topic click:', isDirectTopicClick);
        
        // Add the user message to the chat
        if (typeof addMessageToChat === 'function') {
            addMessageToChat(firstMessage, true);
            
            // Process the welcome to chat transition
            processWelcomeToChatTransition();
            
            // Create a loading message while waiting for response
            const loadingId = 'loading-' + Date.now();
            const chatContainer = document.getElementById('chat-messages');
            const loadingDiv = document.createElement('div');
            loadingDiv.id = loadingId;
            loadingDiv.className = 'w-full new-message';
            
            // Create content div for AI typing message
            const contentDiv = document.createElement('div');
            contentDiv.className = 'ai-message';
            contentDiv.textContent = 'AI is typing...';
            
            // Only add the content div
            loadingDiv.appendChild(contentDiv);
            
            // Add a subtle pulse animation
            contentDiv.animate(
                [
                    { opacity: 0.5 },
                    { opacity: 1 },
                    { opacity: 0.5 }
                ],
                {
                    duration: 1500,
                    iterations: Infinity
                }
            );
            
            chatContainer.appendChild(loadingDiv);
            
            // If this is a direct topic click, look up the topic and display it directly
            if (isDirectTopicClick && typeof window.matchTopicByTitle === 'function' &&
                typeof window.formatTopicResponse === 'function') {
                
                console.log('⚠️ Direct topic click detected, bypassing normal flow');
                
                // Look up the topic directly
                window.matchTopicByTitle(firstMessage)
                    .then(matchedTopic => {
                        // Remove loading message
                        const loadingMessage = document.getElementById(loadingId);
                        if (loadingMessage) {
                            loadingMessage.remove();
                        }
                        
                        if (matchedTopic) {
                            console.log(' Direct topic match found:', matchedTopic.title);

                            // Format the topic response
                            const topicResponse = window.formatTopicResponse(matchedTopic);

                            // Display the AI response as HTML
                            addMessageToChat(topicResponse, false, true);
                        } else {
                            console.log(' Direct topic match failed, falling back to standard processing');
                            // Fall back to standard message processing
                            processUserMessage(firstMessage, loadingId, chatContainer);
                        }
                    })
                    .catch(error => {
                        console.error('Error during direct topic matching:', error);
                        // Fall back to standard message processing
                        processUserMessage(firstMessage, loadingId, chatContainer);
                    });
            } else {
                // No direct topic flag or missing functions, use standard processing
                processUserMessage(firstMessage, loadingId, chatContainer);
            }
                
            // Clear the first message and flag from localStorage
            localStorage.removeItem('firstMessage');
            localStorage.removeItem('isDirectTopicClick');
        } else {
            console.error('addMessageToChat function not available');
        }
    }
    
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        console.log("chat.js: attaching handler to message-form");
        messageForm.addEventListener('submit', handleMessageSubmit);
    } else {
        console.log("chat.js: message-form not found");
    }

    // Enable send button when there is input and update its appearance
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('button[type="submit"]');
    if (messageInput && sendButton) {
        const updateSendButtonState = () => {
            const hasText = messageInput.value.trim().length > 0;
            sendButton.disabled = !hasText;
            
            // For dark mode, the styling is handled by CSS classes
            // The disabled state is already managed by the disabled attribute
            // and the CSS selectors :disabled and :not(:disabled)
        };
        updateSendButtonState();
        messageInput.addEventListener('input', updateSendButtonState);
        
        // Add event listener for Enter key to send message
        messageInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default newline
                
                // Only submit if there's content and the button is not disabled
                if (messageInput.value.trim() !== '' && !sendButton.disabled) {
                    // Trigger form submission
                    messageForm.dispatchEvent(new Event('submit'));
                }
            }
            // If Shift+Enter is pressed, allow default behavior (new line)
        });
    }

    // Add event listener for option button clicks
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('option-button')) {
            const option = event.target.getAttribute('onclick');
            if (option) {
                // Extract the option from onclick="handleFollowUpOption('option')"  
                const optionMatch = option.match(/handleFollowUpOption\(['"](.*?)['"]\)/);  
                if (optionMatch && optionMatch[1]) {  
                    const selectedOption = optionMatch[1];  
                    if (typeof window.handleFollowUpOption === 'function') {  
                        const response = window.handleFollowUpOption(selectedOption);  
                        if (response) {  
                            // Set flag to prevent duplicate message
                            window.skipNextAddMessageToChat = true;
                            
                            // Create a loading message while waiting
                            const loadingId = 'loading-' + Date.now();
                            const chatContainer = document.getElementById('chat-messages');
                            const loadingDiv = document.createElement('div');
                            loadingDiv.id = loadingId;
                            loadingDiv.className = 'w-full new-message';
                            
                            // Create content div for AI typing message
                            const loadingContent = document.createElement('div');
                            loadingContent.className = 'ai-message';
                            loadingContent.textContent = 'AI is typing...';
                            
                            // Only add the content div
                            loadingDiv.appendChild(loadingContent);
                            
                            // Add a subtle pulse animation
                            loadingContent.animate(
                                [
                                    { opacity: 0.5 },
                                    { opacity: 1 },
                                    { opacity: 0.5 }
                                ],
                                {
                                    duration: 1500,
                                    iterations: Infinity
                                }
                            );
                            
                            chatContainer.appendChild(loadingDiv);
                            
                            // Use setTimeout to simulate a short processing time
                            setTimeout(() => {
                                // Remove loading message
                                const loadingMessage = document.getElementById(loadingId);
                                if (loadingMessage) {
                                    loadingMessage.remove();
                                }
                                
                                // Create a new message div for AI response with typing effect
                                const messageDiv = document.createElement('div');
                                messageDiv.className = 'w-full new-message';
                                
                                // Create content div for AI message
                                const contentDiv = document.createElement('div');
                                contentDiv.className = 'ai-message';
                                
                                // Add empty content div to message div
                                messageDiv.appendChild(contentDiv);
                                
                                // Add message div to chat container
                                chatContainer.appendChild(messageDiv);
                                
                                // For follow-up options or restart message, we want to maintain the original response structure
                                if (response.includes('disease-section') || response.includes('follow-up-options') || response.includes('What symptoms are you experiencing?')) {
                                    // This is a disease follow-up response or restart message, preserve the HTML structure
                                    contentDiv.innerHTML = response;
                                    
                                    // Ensure smooth scrolling to the new content
                                    setTimeout(() => {
                                        chatContainer.scrollTo({
                                            top: chatContainer.scrollHeight,
                                            behavior: 'smooth'
                                        });
                                    }, 50);
                                } else {
                                    // For non-disease responses, use the typing effect
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(response, 'text/html');
                                    const sections = doc.querySelectorAll('*:not(script):not(style)');
                                    let sectionIndex = 0;
                                    
                                    function typeNextSection() {
                                        if (sectionIndex < sections.length) {
                                            const section = sections[sectionIndex];
                                            // Skip empty text nodes
                                            if (section.textContent && section.textContent.trim() !== '') {
                                                contentDiv.appendChild(section);
                                                chatContainer.scrollTop = chatContainer.scrollHeight;
                                            }
                                            sectionIndex++;
                                            setTimeout(typeNextSection, 100); // Shorter delay for better typing effect
                                        }
                                    }
                                    
                                    // Start typing sections
                                    typeNextSection();
                                }
                            }, 500); // Short delay to make the typing indicator visible
                        }  
                    }  
                }  
            }  
        }  
    });
});

// ▶️ Load conversation if URL has ID
document.addEventListener('DOMContentLoaded', function () {
    // Initialize conversation state
    initializeConversationState();
    
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation_id');

    if (conversationId) {
        console.log("🌐 Detected conversation ID on load:", conversationId);
        loadConversation(conversationId);
    } else {
        console.log("ℹ️ No conversation ID in URL");
    }
});

// ➕ Handle new chat
const newChatButton = document.getElementById('new-chat-button');
if (newChatButton) {
    newChatButton.addEventListener('click', function (e) {
        e.preventDefault();

        // Clear chat and redirect to clean slate
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }

        // Clear current conversation ID
        logConversationState('CLEARING', null);
        window.currentConversationId = null;

        const url = new URL(window.location.href);
        url.searchParams.delete('conversation_id');
        window.history.pushState({}, '', url);

        window.location.href = '/chat/chat/';
    });
}

