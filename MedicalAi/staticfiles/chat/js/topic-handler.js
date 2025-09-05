/**
 * Topic handler for the welcome page
 * Handles click events on suggested topics and transfers the user to the chat page
 */

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Find the suggested topics container
    const suggestedTopics = document.getElementById('suggested-topics');
    if (!suggestedTopics) {
        console.error('Suggested topics container not found');
        return;
    }
    
    // Get all the individual topic cards
    const topicCards = suggestedTopics.querySelectorAll('.grid > div');
    console.log(`Found ${topicCards.length} topic cards`);
    
    // Add click event handler to each topic card
    topicCards.forEach(card => {
        card.addEventListener('click', function(event) {
            // Stop event propagation to prevent bubbling
            event.stopPropagation();
            
            // Get only the text from this specific card
            const paragraph = this.querySelector('p');
            if (!paragraph) {
                console.error('Topic text element not found');
                return;
            }
            
            const topicText = paragraph.textContent.trim();
            console.log(`Selected topic: "${topicText}"`);
            
            // Clear any previous message first
            localStorage.removeItem('firstMessage');
            localStorage.removeItem('isDirectTopicClick');
            
            // Store the topic text and a flag indicating this came from a direct topic click
            localStorage.setItem('firstMessage', topicText);
            localStorage.setItem('isDirectTopicClick', 'true');
            
            console.log('Setting direct topic click flag for:', topicText);
            
            // Redirect to chat.html
            window.location.href = 'chat.html';
        });
    });
});
