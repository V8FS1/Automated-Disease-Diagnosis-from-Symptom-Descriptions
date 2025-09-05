// Search functionality for Clinexa Medical Chatbot

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchButton = document.getElementById('search-button');
    const searchModal = document.getElementById('search-modal');
    const searchModalBackdrop = document.getElementById('search-modal-backdrop');
    const searchModalClose = document.getElementById('search-modal-close');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // Only initialize if search elements exist on the page
    if (searchButton && searchModal) {
        // Open search modal when search button is clicked
        searchButton.addEventListener('click', function() {
            openSearchModal();
        });

        // Close search modal when backdrop is clicked
        searchModalBackdrop.addEventListener('click', function() {
            closeSearchModal();
        });

        // Close search modal when close button is clicked
        searchModalClose.addEventListener('click', function() {
            closeSearchModal();
        });

        // Close search modal when Escape key is pressed
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) {
                closeSearchModal();
            }
        });

        // Handle search input
        searchInput.addEventListener('input', function() {
            handleSearch(this.value.trim());
        });
    }

    // Function to open search modal
    function openSearchModal() {
        // Show the modal
        searchModal.classList.remove('hidden');
        
        // Animate the modal content
        setTimeout(() => {
            const modalContent = document.getElementById('modal-content');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
            
            // Animate the backdrop
            searchModalBackdrop.classList.add('opacity-100');
            searchModalBackdrop.classList.remove('opacity-0');
            
            // Focus the search input
            searchInput.focus();
        }, 10);
        
        // Load conversations for search
        loadConversationsForSearch();
    }

    // Function to close search modal
    function closeSearchModal() {
        // Animate the modal content out
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        
        // Animate the backdrop out
        searchModalBackdrop.classList.remove('opacity-100');
        searchModalBackdrop.classList.add('opacity-0');
        
        // Hide the modal after animation completes
        setTimeout(() => {
            searchModal.classList.add('hidden');
            
            // Clear search input
            searchInput.value = '';
            
            // Reset search results
            searchResults.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Type to search your conversations</div>';
        }, 200);
    }

    // Function to handle search
    function handleSearch(query) {
        // Clear previous results
        searchResults.innerHTML = '';
        
        if (!query) {
            searchResults.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Type to search your conversations</div>';
            return;
        }
        
        // Get conversations from localStorage
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        
        if (conversations.length === 0) {
            searchResults.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No conversations found</div>';
            return;
        }
        
        // Filter conversations based on query
        const filteredConversations = conversations.filter(conversation => {
            // Search in title
            if (conversation.title && conversation.title.toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
            
            // Search in messages
            if (conversation.messages) {
                return conversation.messages.some(message => 
                    message.content && message.content.toLowerCase().includes(query.toLowerCase())
                );
            }
            
            return false;
        });
        
        // Display results
        if (filteredConversations.length === 0) {
            searchResults.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No matching conversations found</div>';
        } else {
            filteredConversations.forEach(conversation => {
                // Create result item
                const resultItem = document.createElement('div');
                resultItem.className = 'p-3 mb-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors';
                resultItem.setAttribute('data-conversation-id', conversation.id);
                
                // Create title
                const title = document.createElement('div');
                title.className = 'font-medium text-gray-900 dark:text-white';
                title.textContent = conversation.title || 'Untitled Conversation';
                
                // Create preview
                const preview = document.createElement('div');
                preview.className = 'text-sm text-gray-500 dark:text-gray-400 truncate mt-1';
                
                // Get the last message or a matching message
                let previewText = '';
                if (conversation.messages && conversation.messages.length > 0) {
                    // Try to find a message that matches the query
                    const matchingMessage = conversation.messages.find(message => 
                        message.content && message.content.toLowerCase().includes(query.toLowerCase())
                    );
                    
                    if (matchingMessage) {
                        previewText = matchingMessage.content;
                        
                        // Highlight the matching part
                        const queryRegex = new RegExp(`(${query})`, 'gi');
                        previewText = previewText.replace(queryRegex, '<span class="bg-yellow-200 dark:bg-yellow-800">$1</span>');
                    } else {
                        // Use the last message as preview
                        previewText = conversation.messages[conversation.messages.length - 1].content;
                    }
                }
                
                preview.innerHTML = previewText || 'No preview available';
                
                // Add date
                const date = document.createElement('div');
                date.className = 'text-xs text-gray-400 dark:text-gray-500 mt-1';
                date.textContent = new Date(conversation.timestamp || Date.now()).toLocaleDateString();
                
                // Append elements
                resultItem.appendChild(title);
                resultItem.appendChild(preview);
                resultItem.appendChild(date);
                
                // Add click event
                resultItem.addEventListener('click', function() {
                    const conversationId = this.getAttribute('data-conversation-id');
                    switchToConversation(conversationId);
                    closeSearchModal();
                });
                
                // Add to results
                searchResults.appendChild(resultItem);
            });
        }
    }

    // Function to load conversations for search
    function loadConversationsForSearch() {
        // This function pre-loads conversations for faster searching
        // In a real app, this might fetch from an API
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        
        // If no conversations, show message
        if (conversations.length === 0) {
            searchResults.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No conversations found</div>';
        }
    }

    // Function to switch to a conversation
    function switchToConversation(conversationId) {
        // In a real app, this would load the conversation
        console.log('Switching to conversation:', conversationId);
        
        // Get the conversation from localStorage
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const conversation = conversations.find(conv => conv.id === conversationId);
        
        if (conversation) {
            // Clear current chat
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }
            
            // Hide welcome container if it exists
            const welcomeContainer = document.getElementById('welcome-container');
            if (welcomeContainer) {
                welcomeContainer.style.display = 'none';
            }
            
            // Hide suggested topics if they exist
            const suggestedTopics = document.getElementById('suggested-topics');
            if (suggestedTopics) {
                suggestedTopics.style.display = 'none';
            }
            
            // Load messages
            if (conversation.messages && conversation.messages.length > 0) {
                conversation.messages.forEach(message => {
                    // Use the existing addMessageToChat function
                    if (typeof addMessageToChat === 'function') {
                        addMessageToChat(message.content, message.isUser);
                    }
                });
            }
        }
    }
});

// Add animation classes to CSS
document.addEventListener('DOMContentLoaded', function() {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translate3d(0, 20px, 0);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }
        
        .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
        }
    `;
    
    // Append to head
    document.head.appendChild(style);
});
