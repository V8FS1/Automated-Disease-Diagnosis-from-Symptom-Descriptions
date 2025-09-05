/**
 * Topic Matcher Module
 * Handles detection and processing of predefined health topics
 */

// Cache for topics data to avoid repeated fetch requests
let topicsCache = null;

// Track visited topics to avoid showing them again
let visitedTopics = [];

/**
 * Load topics from topics.json
 * @returns {Promise<Array>} Array of topic objects
 */
async function loadTopics() {
    if (topicsCache) {
        return topicsCache;
    }
    
    try {
        const response = await fetch('topics.json');
        if (!response.ok) {
            throw new Error('Failed to load topics');
        }
        
        const topics = await response.json();
        topicsCache = topics;
        console.log(`Loaded ${topics.length} health topics`);
        return topics;
    } catch (error) {
        console.error('Error loading topics:', error);
        return [];
    }
}

/**
 * Check if a message matches any predefined topic
 * @param {string} message - User message to check
 * @returns {Promise<Object|null>} Matching topic or null if no match
 */
async function matchTopicByTitle(message) {
    console.log('📋 [TOPIC-MATCHER] Starting topic matching for:', message);
    
    try {
        const topics = await loadTopics();
        console.log(`📋 [TOPIC-MATCHER] Loaded ${topics.length} topics for matching`);
        
        // Normalize message for comparison (lowercase, trim)
        const normalizedMessage = message.toLowerCase().trim();
        console.log('📋 [TOPIC-MATCHER] Normalized message:', normalizedMessage);
        
        // Debug: Log all available topic titles
        console.log('📋 [TOPIC-MATCHER] Available topics:');
        topics.forEach((topic, index) => {
            console.log(`   ${index + 1}. "${topic.title}"`);
        });
        
        // First try exact match
        console.log('📋 [TOPIC-MATCHER] Checking for exact matches...');
        for (const topic of topics) {
            const topicTitle = topic.title.toLowerCase().trim();
            console.log(`   Comparing "${normalizedMessage}" with "${topicTitle}"`);
            
            if (topicTitle === normalizedMessage) {
                console.log('✅ [TOPIC-MATCHER] FOUND EXACT MATCH:', topic.title);
                console.log('📋 [TOPIC-MATCHER] Topic match found – skipping disease prediction.');
                return topic;
            }
        }
        
        // If no exact match, try partial match with threshold
        console.log('📋 [TOPIC-MATCHER] No exact match found. Trying partial matches...');
        for (const topic of topics) {
            const topicTitle = topic.title.toLowerCase().trim();
            
            // Check if one is a substring of the other (with at least 80% overlap)
            const messageContainsTopic = normalizedMessage.includes(topicTitle);
            const topicContainsMessage = topicTitle.includes(normalizedMessage) && 
                                        normalizedMessage.length > topicTitle.length * 0.8;
            
            console.log(`   Partial match check for "${topicTitle}":`);  
            console.log(`   Message contains topic: ${messageContainsTopic}`);  
            console.log(`   Topic contains message: ${topicContainsMessage}`);  
            
            if (messageContainsTopic || topicContainsMessage) {
                console.log('✅ [TOPIC-MATCHER] FOUND PARTIAL MATCH:', topic.title);
                console.log('📋 [TOPIC-MATCHER] Topic match found – skipping disease prediction.');
                return topic;
            }
        }
        
        console.log('❌ [TOPIC-MATCHER] No topic match found for:', message);
        return null;
    } catch (error) {
        console.error('❌ [TOPIC-MATCHER] Error in topic matching:', error);
        return null;
    }
}

/**
 * Format a topic abstract for display
 * @param {Object} topic - Topic object
 * @returns {string} Formatted HTML for display
 */
function formatTopicResponse(topic) {
    // Store the topic ID in a data attribute for reference when "Tell me more" is clicked
    const topicId = topic.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    return `
    <div class="disease-container">
        <div class="disease-section">
            <div class="disease-title">📚 ${topic.title}</div>
            <div class="disease-content">
                ${topic.abstract}
            </div>
        </div>
        
        <div class="disease-section mt-4">
            <div class="sources-info text-sm text-gray-600 mb-2">
                <strong>Sources:</strong> 
                ${topic.sources.map(source => 
                    `<a href="${source.url}" target="_blank" class="text-blue-500 hover:underline">${source.name}</a>`
                ).join(', ')}
            </div>
        </div>
        
        <!-- Tell me more button styled like follow-up options -->
        <div class="follow-up-options mt-4" data-topic-id="${topicId}">
            <button class="option-button tell-me-more" onclick="handleTopicDetailRequest('${topicId}')">📖 Tell me more</button>
        </div>
    </div>`;
}

/**
 * Handle a request for more details about a topic
 * @param {string} topicId - ID of the topic to show more details for
 */
function handleTopicDetailRequest(topicId) {
    console.log(`Request for more details about topic: ${topicId}`);
    
    // First find and disable the button to prevent duplicate clicks
    const buttons = document.querySelectorAll(`.follow-up-options[data-topic-id="${topicId}"] .tell-me-more`);
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.innerHTML = '📖 Loading details...';
    });
    
    // Find the topic title that matches this ID
    loadTopics().then(topics => {
        const matchingTopic = topics.find(topic => {
            const generatedId = topic.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return generatedId === topicId;
        });
        
        if (matchingTopic) {
            console.log('Found matching topic for details:', matchingTopic.title);
            
            // Format the detailed content for display
            const detailedResponse = formatTopicDetailedResponse(matchingTopic);
            
            // Use the addMessageToChat function to add this as a new AI message
            if (typeof window.addMessageToChat === 'function') {
                window.addMessageToChat(detailedResponse, false, true); // true for HTML content
                
                // Add current topic to visited list
                if (!visitedTopics.includes(matchingTopic.title)) {
                    visitedTopics.push(matchingTopic.title);
                    console.log('Added to visited topics:', matchingTopic.title);
                    console.log('Visited topics list:', visitedTopics);
                }
                
                // Add a short delay before showing the follow-up topics message
                setTimeout(() => {
                    // Get remaining unvisited topics and show them with the header
                    showRemainingTopicOptions();
                }, 1000); // Delay for a second to create a natural conversation flow
            } else {
                console.error('addMessageToChat function not available');
            }
            
            // Remove or hide the button completely after successfully displaying details
            setTimeout(() => {
                buttons.forEach(button => {
                    // Find the parent follow-up-options div
                    const optionsContainer = button.closest('.follow-up-options');
                    if (optionsContainer) {
                        optionsContainer.style.display = 'none';
                    }
                });
            }, 500);
        } else {
            console.error('Could not find matching topic for ID:', topicId);
            // Re-enable the button if we couldn't find the topic
            buttons.forEach(button => {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.innerHTML = '📖 Tell me more';
            });
        }
    }).catch(error => {
        console.error('Error loading topics for detailed view:', error);
        // Re-enable the button on error
        buttons.forEach(button => {
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
            button.innerHTML = '📖 Tell me more';
        });
    });
}

/**
 * Format a topic's detailed content for display
 * @param {Object} topic - Topic object
 * @returns {string} Formatted HTML for display
 */
function formatTopicDetailedResponse(topic) {
    return `
    <div class="disease-container">
        <div class="disease-section">
            <div class="disease-content">
                ${topic.detailed}
            </div>
        </div>
    </div>`;
}

/**
 * Display remaining unvisited topics as clickable options
 */
async function showRemainingTopicOptions() {
    try {
        // Load all topics
        const allTopics = await loadTopics();
        
        // Filter out the visited topics
        const unvisitedTopics = allTopics.filter(topic => !visitedTopics.includes(topic.title));
        console.log('Unvisited topics:', unvisitedTopics.map(t => t.title));
        
        // If we have unvisited topics, display them as options with the label
        if (unvisitedTopics.length > 0) {
            // Create a combined message with the label and buttons together
            const combinedMessage = formatTopicDiscoveryMessage(unvisitedTopics);
            
            // Display the combined message in the chat
            if (typeof window.addMessageToChat === 'function') {
                window.addMessageToChat(combinedMessage, false, true); // true for HTML content
            } else {
                console.error('addMessageToChat function not available');
            }
        } else {
            // All topics have been visited, show a different message
            if (typeof window.addMessageToChat === 'function') {
                const completionMessage = `
                <div>
                    <strong>You've explored all our health topics!</strong>
                    <br><br>
                    If you're experiencing symptoms, feel free to describe them here — Clinexa can help guide you toward a possible diagnosis based on what you're feeling.
                </div>
                `;
                window.addMessageToChat(completionMessage, false, true); // Set isHtml to true for proper formatting
            }
        }
    } catch (error) {
        console.error('Error showing remaining topic options:', error);
    }
}

/**
 * Format a unified topic discovery message with label and buttons
 * @param {Array} topics - List of topic objects
 * @returns {string} HTML for the combined label and buttons with proper spacing
 */
function formatTopicDiscoveryMessage(topics) {
    // Cap at 3 topics max to avoid overwhelming the UI
    const topicsToShow = topics.slice(0, 3);
    
    // Create buttons HTML
    const buttons = topicsToShow.map(topic => {
        // Generate a safe ID to use in the onclick function
        const topicId = topic.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        
        return `<button class="option-button topic-option" onclick="handleTopicSelection('${topicId}')">📜 ${topic.title}</button>`;
    }).join('');
    
    // Combine the label and buttons with appropriate spacing
    return `
    <div class="disease-container">
        <div class="disease-section">
            <div class="disease-content">
                🧭 Discover other topics:
            </div>
            <div class="follow-up-options mt-2">${buttons}</div>
        </div>
    </div>`;
}

/**
 * Handle when a user selects one of the suggested topic options
 * @param {string} topicId - ID of the selected topic
 * @param {Event} event - The click event
 */
function handleTopicSelection(topicId, event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('Topic selection triggered with ID:', topicId);
    
    // Find the matching topic in the cache
    loadTopics().then(topics => {
        const selectedTopic = topics.find(topic => {
            const generatedId = topic.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return generatedId === topicId;
        });
        
        if (selectedTopic) {
            console.log('Selected topic:', selectedTopic.title);
            
            // BYPASS THE FORM COMPLETELY and directly process the topic
            processTopic(selectedTopic);
        } else {
            console.error('Could not find topic with ID:', topicId);
        }
    });
}

/**
 * Process a selected topic directly without form submission
 * @param {Object} topic - The selected topic object
 */
function processTopic(topic) {
    // Show the user message in the chat
    if (typeof addMessageToChat === 'function') {
        addMessageToChat(topic.title, true);
    } else {
        console.error('addMessageToChat function not available');
        return;
    }
    
    // Create loading indicator
    const loadingId = 'loading-' + Date.now();
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'w-full new-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message';
    contentDiv.textContent = 'AI is typing...';
    
    loadingDiv.appendChild(contentDiv);
    chatContainer.appendChild(loadingDiv);
    
    // DIRECTLY show the topic response without going through the disease prediction flow
    setTimeout(() => {
        // Remove loading indicator
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Format and show the topic response
        const topicResponse = formatTopicResponse(topic);
        addMessageToChat(topicResponse, false, true); // true for HTML content
        
        // Add the topic to visited list
        if (!visitedTopics.includes(topic.title)) {
            visitedTopics.push(topic.title);
            console.log('Added to visited topics:', topic.title);
        }
    }, 500); // Small delay to simulate processing
}

// Make functions available globally
window.matchTopicByTitle = matchTopicByTitle;
window.formatTopicResponse = formatTopicResponse;
window.formatTopicDetailedResponse = formatTopicDetailedResponse;
window.handleTopicDetailRequest = handleTopicDetailRequest;
window.showRemainingTopicOptions = showRemainingTopicOptions;
window.handleTopicSelection = handleTopicSelection;
