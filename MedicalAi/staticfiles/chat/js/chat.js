// Chat functionality for the Medical Diagnosis AI Chatbot

// Get AI response from FastAPI backend
async function getModelPrediction(userMessage) {
    try {
        console.log('Sending request to AI model at port 8001');
        const response = await fetch('http://localhost:8001/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        if (!response.ok) {
            throw new Error('API error');
        }
        const data = await response.json();
        console.log('Received response from AI model:', data);
        // Return the full JSON result for downstream processing
        return data;
    } catch (error) {
        console.error('Error contacting AI backend:', error);
        return { error: 'Error contacting AI backend. Please make sure the backend server is running.' };
    }
} 

// Process the transition from welcome to chat mode
function processWelcomeToChatTransition() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    // If this is the first message, make some UI adjustments
    if (chatContainer.children.length <= 1) {
        console.log('First message detected - adjusting UI');
        
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
}

// Handle user message submission
function handleMessageSubmit(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const userMessage = messageInput.value.trim();
    
    // Redirect to chat.html after first message
    if (window.location.pathname.includes('welcome.html')) {
        window.location.href = 'chat.html';
        // Store the first message in localStorage to be processed in chat.html
        localStorage.setItem('firstMessage', userMessage);
        return;
    }
    
    // Check if this is a follow-up option selection (like "yes")
    if (typeof window.processYesResponse === 'function') {
        const followUpResponse = window.processYesResponse(userMessage);
        if (followUpResponse) {
            // Add user message to chat
            if (typeof addMessageToChat === 'function') {
                addMessageToChat(userMessage, true);
                
                // Add the follow-up response
                addMessageToChat(followUpResponse, false, true); // true for HTML content
                
                // Clear input
                messageInput.value = '';
                messageInput.style.height = 'auto';
                return;
            }
        }
    }
    
    // Check if this is the first message in chat.html (welcome container is still visible)
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer && welcomeContainer.style.display !== 'none') {
        // Process the transition to chat mode
        processWelcomeToChatTransition();
    }
    
    // Add user message to chat
    if (typeof addMessageToChat === 'function') {
        addMessageToChat(userMessage, true);
    } else {
        console.error('addMessageToChat function not available');
    }
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Create a loading message while waiting for AI response
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
    
    // Process the user message - first checking for topic matches, then falling back to disease prediction
    processUserMessage(userMessage, loadingId, chatContainer);
}

/**
 * Process a user message - checking for topic matches first, then disease prediction
 * @param {string} userMessage - The user's message to process
 * @param {string} loadingId - ID of the loading indicator
 * @param {HTMLElement} chatContainer - The chat container element
 */
async function processUserMessage(userMessage, loadingId, chatContainer) {
    console.log('🔄 [CHAT] Processing user message:', userMessage);
    
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
                    
                    // Display the topic response
                    if (typeof addMessageToChat === 'function') {
                        addMessageToChat(topicResponse, false, true); // true for HTML content
                    }
                    
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
                aiResponse = await getModelPrediction(userMessage);
                console.log("AI response:", aiResponse);
                
                // Find and remove the loading message
                const loadingMessage = document.getElementById(loadingId);
                if (loadingMessage) {
                    loadingMessage.remove();
                }
                
                // Process the response for disease diagnosis if applicable
                let processedResponse = aiResponse;
                let isDiseaseResponse = false;
                
                if (typeof window.processDiseaseResponse === 'function') {
                    if (aiResponse.result && Array.isArray(aiResponse.result)) {
                        // New structure: top 3 predictions returned as an array
                        processedResponse = window.processDiseaseResponse(aiResponse.result);
                        isDiseaseResponse = true;
                    } else if (typeof aiResponse === 'string' && (aiResponse.includes('🩺') || aiResponse.includes('Description:'))) {
                        // Old fallback
                        processedResponse = aiResponse;
                        isDiseaseResponse = true;
                    }
                }
                
                // Add the AI response with typing effect
                if (typeof addMessageToChat === 'function') {
                    // Check if the response is HTML (from disease module)
                    const isHtml = isDiseaseResponse || processedResponse.includes('<div') || processedResponse.includes('<button');
                    
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
                    
                    // We'll handle the typing animation ourselves, so we'll set a flag to prevent
                    // the original addMessageToChat function from being called again
                    window.skipNextAddMessageToChat = true;
                    
                    // Implement typing effect based on content type
                    if (isHtml) {
                        // For HTML content, we'll parse and display it properly
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(processedResponse, 'text/html');
                        
                        if (isDiseaseResponse) {
                            // For disease responses, we want to maintain the original structure
                            contentDiv.innerHTML = processedResponse;
                            
                            // Ensure smooth scrolling to the new content
                            setTimeout(() => {
                                chatContainer.scrollTo({
                                    top: chatContainer.scrollHeight,
                                    behavior: 'smooth'
                                });
                            }, 50);
                        } else {
                            // For other HTML content, process sections one by one
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
                                    setTimeout(typeNextSection, 100);
                                }
                            }
                            
                            // Start typing sections
                            typeNextSection();
                        }
                    } else {
                        // For plain text, use the original typing effect
                        let i = 0;
                        const typingSpeed = 10; // milliseconds per character
                        
                        function typeWriter() {
                            if (i < processedResponse.length) {
                                contentDiv.textContent += processedResponse.charAt(i);
                                i++;
                                chatContainer.scrollTop = chatContainer.scrollHeight;
                                setTimeout(typeWriter, typingSpeed);
                            }
                        }
                        
                        // Start typing effect
                        typeWriter();
                    }
                    
                    // Save conversation to history
                    if (typeof saveConversation === 'function') {
                        saveConversation(userMessage, aiResponse);
                    }
                } else {
                    console.error('addMessageToChat function not available');
                }
                
            } catch (backendError) {
                console.error("Error contacting AI backend:", backendError);
                // Remove loading message
                const loadingMessage = document.getElementById(loadingId);
                if (loadingMessage) {
                    loadingMessage.remove();
                }
                // Show a fallback message to the user
                if (typeof addMessageToChat === 'function') {
                    addMessageToChat("I'm sorry, I'm having trouble connecting to the prediction service. Please try again later or ask me about specific health topics like:\n\n• 'What kind of cough should make me see a doctor?'\n• 'When is a fever considered serious in adults?'\n• 'How do I know if my stomach pain needs medical attention?'\n• 'When does a skin rash mean something more serious?'", false);
                }
            }
            return; // Exit after processing either the AI response or error
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

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('chat.js: initializing with AI model integration');
    
    // Make the addMessageToChat function from clinexa.js available globally
    if (typeof addMessageToChat === 'function') {
        // Extend addMessageToChat to handle HTML content
        const originalAddMessageToChat = addMessageToChat;
        // Function to smoothly scroll chat to bottom
        function scrollChatToBottom() {
            const chatContainer = document.getElementById('chat-messages');
            if (!chatContainer) return;
            
            // Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
                // First try with smooth behavior
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: 'smooth'
                });
                
                // Fallback to instant scroll if smooth scrolling is not supported
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
                            console.log('✅ Direct topic match found:', matchedTopic.title);
                            
                            // Format the topic response
                            const topicResponse = window.formatTopicResponse(matchedTopic);
                            
                            // Display the topic response
                            if (typeof addMessageToChat === 'function') {
                                addMessageToChat(topicResponse, false, true);
                            }
                        } else {
                            console.log('❌ Direct topic match failed, falling back to standard processing');
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

    // Check if the backend server is running
    fetch('http://localhost:8001/docs')
        .then(response => {
            if (response.ok) {
                console.log('chat.js: Backend server is running on port 8001');
            }
        })
        .catch(error => {
            console.warn('chat.js: Backend server may not be running:', error.message);
        });
        
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
