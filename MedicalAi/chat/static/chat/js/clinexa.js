// Main JavaScript file for Clinexa - Medical AI Chatbot

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Check for dark mode preference
    checkDarkModePreference();
    
    // Add event listeners
    setupEventListeners();
});

// Initialize the application
function initApp() {
    // Check if user is signed in
    const authToken = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName') || 'Guest';
    const isSignedIn = !!authToken;
    
    // Update UI based on sign-in status
    updateUIForAuthStatus(isSignedIn, userName);
    
    // Initialize conversation history in sidebar (if signed in)
    if (isSignedIn) {
        loadConversationHistory();
    }
}

// Update UI elements based on authentication status
function updateUIForAuthStatus(isSignedIn, userName) {
    // Update welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = isSignedIn 
            ? `Welcome back, ${userName}, how can I help you?` 
            : 'Welcome to Clinexa, how can I help you?';
    }
    
    // Update profile dropdown options (always, including welcome page)
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileDropdown) {
        profileDropdown.innerHTML = isSignedIn 
            ? `<a href="#" class="profile-settings-button block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                  <div class="flex items-center">
                      <svg class="mr-3 h-4 w-4 text-gray-500 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                  </div>
              </a>
              <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" id="sign-out-link">
                  <div class="flex items-center">
                      <svg class="mr-3 h-4 w-4 text-gray-500 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                  </div>
              </a>`
            : `<a href="/chat/signin/" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                  <div class="flex items-center">
                      <svg class="mr-3 h-4 w-4 text-gray-500 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                  </div>
              </a>
              <a href="/chat/index/" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                  <div class="flex items-center">
                      <svg class="mr-3 h-4 w-4 text-gray-500 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign Up
                  </div>
              </a>`;
        
        // Add event listener for sign out link if user is signed in
        if (isSignedIn) {
            const signOutLink = profileDropdown.querySelector('#sign-out-link');
            if (signOutLink) {
                signOutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof handleLogout === 'function') {
                        handleLogout();
                    } else {
                        // Fallback to the old method if handleLogout is not available
                        signOut();
                    }
                });
            }
        }
    }
    
    // Update sidebar content
    const conversationList = document.getElementById('conversation-list');
    if (conversationList) {
        if (!isSignedIn) {
            conversationList.innerHTML = '<div class="text-sm text-gray-400 px-3 py-2">Sign in to see your conversation history</div>';
        }
    }
}

// Setup event listeners for the application
function setupEventListeners() {
    // Toggle sidebar - ChatGPT style with toggle button moving inside sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarToggleInside = document.getElementById('sidebar-toggle-inside');
    const sidebarContainer = document.getElementById('sidebar-container');
    const mainContent = document.getElementById('main-content');
    const newChatButton = document.getElementById('new-chat-button');
    
    if (sidebarToggle && sidebarToggleInside && sidebarContainer) {
        // Function to toggle sidebar visibility
        const toggleSidebar = () => {
            const isVisible = sidebarContainer.classList.contains('visible');
            
            // Toggle sidebar visibility
            sidebarContainer.classList.toggle('visible');
            
            // Get the new chat and search buttons
            const newChatButton = document.getElementById('new-chat-button');
            const searchButton = document.getElementById('search-button');

            // Toggle sidebar-toggle button and action buttons visibility
            if (isVisible) {
                // When collapsing sidebar
                sidebarToggle.classList.remove('hidden');
                // Hide new chat and search buttons
                if (newChatButton) newChatButton.classList.add('hidden');
                if (searchButton) searchButton.classList.add('hidden');
            } else {
                // When expanding sidebar
                sidebarToggle.classList.add('hidden');
                // Show new chat and search buttons
                if (newChatButton) newChatButton.classList.remove('hidden');
                if (searchButton) searchButton.classList.remove('hidden');
            }
            
            // Toggle main content margin on desktop
            if (window.innerWidth >= 768) { // md breakpoint
                mainContent.classList.toggle('sidebar-visible');
            }
            
            // Hide/show the main toggle button based on sidebar visibility
            if (!isVisible) {
                // When opening sidebar, hide the main toggle
                sidebarToggle.style.visibility = 'hidden';
            } else {
                // When closing sidebar, show the main toggle
                sidebarToggle.style.visibility = 'visible';
            }
        };
        
        // Click on main toggle button (outside sidebar)
        sidebarToggle.addEventListener('click', toggleSidebar);
        
        // Click on toggle button inside sidebar
        sidebarToggleInside.addEventListener('click', toggleSidebar);
        
        // New chat button functionality
        if (newChatButton) {
            newChatButton.addEventListener('click', function() {
                // Clear current chat
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.innerHTML = '';
                }
                
                // Show welcome container if it exists
                const welcomeContainer = document.getElementById('welcome-container');
                if (welcomeContainer) {
                    welcomeContainer.style.display = 'block';
                }
                
                // Show suggested topics if they exist
                const suggestedTopics = document.getElementById('suggested-topics');
                if (suggestedTopics) {
                    suggestedTopics.style.display = 'flex';
                }
                
                // Close sidebar on mobile
                if (window.innerWidth < 768) {
                    toggleSidebar();
                }
            });
        }
        
        // Close sidebar when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarContainer.classList.contains('visible')) {
                toggleSidebar();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth < 768 && mainContent.classList.contains('sidebar-visible')) {
                mainContent.classList.remove('sidebar-visible');
            } else if (window.innerWidth >= 768 && sidebarContainer.classList.contains('visible')) {
                mainContent.classList.add('sidebar-visible');
            }
        });
    }
    
    // Handle message input changes to update send button appearance
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('button[type="submit"]');
    if (messageInput && sendButton) {
        // Initial state - gray button when empty
        updateSendButtonState(messageInput, sendButton);
        
        // Listen for input changes
        messageInput.addEventListener('input', function() {
            updateSendButtonState(messageInput, sendButton);
        });
    }
    
    // Toggle profile dropdown
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (profileDropdown.classList.contains('hidden')) {
                // Show dropdown with animation
                profileDropdown.classList.remove('hidden');
                setTimeout(() => {
                    profileDropdown.classList.remove('scale-95', 'opacity-0');
                    profileDropdown.classList.add('scale-100', 'opacity-100');
                }, 10);
            } else {
                // Hide dropdown with animation
                profileDropdown.classList.add('scale-95', 'opacity-0');
                profileDropdown.classList.remove('scale-100', 'opacity-100');
                setTimeout(() => {
                    profileDropdown.classList.add('hidden');
                }, 200);
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (!profileDropdown.classList.contains('hidden')) {
                profileDropdown.classList.add('scale-95', 'opacity-0');
                profileDropdown.classList.remove('scale-100', 'opacity-100');
                setTimeout(() => {
                    profileDropdown.classList.add('hidden');
                }, 200);
            }
        });
    }
    
    // Handle suggested topic clicks
    const suggestedTopics = document.querySelectorAll('#suggested-topics div');
    suggestedTopics.forEach(topic => {
        topic.addEventListener('click', function() {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.value = this.textContent.trim();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
    });
    
    // Handle sign out
    const signOutLink = document.getElementById('sign-out-link');
    if (signOutLink) {
        signOutLink.addEventListener('click', function(e) {
            e.preventDefault();
            signOut();
        });
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}


// Add a message to the chat (from either user or AI)
function addMessageToChat(message, isUser = false) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    // Create the message container with appropriate styling
    const messageDiv = document.createElement('div');
    
    if (isUser) {
        // User message - right-aligned with avatar
        messageDiv.className = 'flex w-full justify-end new-message';
        
        // Create user avatar with the same profile icon as in the top bar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'w-10 h-10 flex items-center justify-center ml-3';
        avatarDiv.innerHTML = `<svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 dark:text-gray-300">
            <path d="M12.0001 13.09C14.4909 13.09 16.5101 11.0708 16.5101 8.58C16.5101 6.08919 14.4909 4.07 12.0001 4.07C9.5093 4.07 7.49011 6.08919 7.49011 8.58C7.49011 11.0708 9.5093 13.09 12.0001 13.09Z" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.98008 11.91C8.97008 11.91 8.97008 11.91 8.96008 11.92" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16.9701 12.82C19.5601 14.4 21.3201 17.19 21.5001 20.4C21.5101 20.69 21.2801 20.93 20.9901 20.93H3.01007C2.72007 20.93 2.49007 20.69 2.50007 20.4C2.68007 17.21 4.43007 14.43 6.99007 12.85" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        
        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'user-message';
        contentDiv.textContent = message;
        
        // Add elements to the message div
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(avatarDiv);
    } else {
        // AI message - plain text without container
        messageDiv.className = 'w-full new-message';
        
        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-message';
        contentDiv.textContent = message;
        
        // Add content to the message div
        messageDiv.appendChild(contentDiv);
    }
    
    chatContainer.appendChild(messageDiv);
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
}

// Save conversation to history
function saveConversation(userMessage, aiResponse) {
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    
    if (isSignedIn) {
        // For signed-in users, save to localStorage (would be server in real app)
        let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        
        // Check if this is a new conversation or continuing an existing one
        let currentConversation;
        if (conversations.length === 0 || localStorage.getItem('activeConversation') === null) {
            // Create a new conversation
            currentConversation = {
                id: Date.now().toString(),
                title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
                messages: []
            };
            conversations.push(currentConversation);
            localStorage.setItem('activeConversation', currentConversation.id);
        } else {
            // Get the active conversation
            const activeConversationId = localStorage.getItem('activeConversation');
            currentConversation = conversations.find(conv => conv.id === activeConversationId);
            if (!currentConversation) {
                currentConversation = {
                    id: Date.now().toString(),
                    title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
                    messages: []
                };
                conversations.push(currentConversation);
                localStorage.setItem('activeConversation', currentConversation.id);
            }
        }
        
        // Add messages to the conversation
        currentConversation.messages.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );
        
        // Save back to localStorage
        localStorage.setItem('conversations', JSON.stringify(conversations));
        
        // Update the sidebar with retry logic
        refreshSidebarWithRetry();
    } else {
        // For guest users, save to sessionStorage (temporary)
        let sessionConversation = JSON.parse(sessionStorage.getItem('guestConversation') || '[]');
        sessionConversation.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );
        sessionStorage.setItem('guestConversation', JSON.stringify(sessionConversation));
    }
}

// Refresh sidebar with retry logic
async function refreshSidebarWithRetry() {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            await loadConversationHistory();
            break; // Success, exit retry loop
        } catch (error) {
            retryCount++;
            console.warn(`Sidebar refresh attempt ${retryCount} failed:`, error);
            
            if (retryCount >= maxRetries) {
                console.error('Failed to refresh sidebar after all retries');
                break;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 300 * retryCount));
        }
    }
}

// Make the function globally available
window.refreshSidebarWithRetry = refreshSidebarWithRetry;

// Load conversation history into sidebar
async function loadConversationHistory() {
    const conversationList = document.getElementById('conversation-list');
    if (!conversationList) return;
    
    // Show loading state
    conversationList.innerHTML = '<div class="text-sm text-gray-400 px-3 py-2">Loading conversations...</div>';

    try {
        // Get auth token
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            conversationList.innerHTML = '<div class="text-sm text-gray-400 px-3 py-2">Sign in to see your conversation history</div>';
            return;
        }

        // Fetch conversations from the API with retry logic
        let response;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                response = await fetch('/api/conversations/', {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    break; // Success, exit retry loop
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                retryCount++;
                console.warn(`Conversation fetch attempt ${retryCount} failed:`, error);
                
                if (retryCount >= maxRetries) {
                    throw error; // Re-throw if all retries failed
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
            }
        }

        const conversations = await response.json();
        
        // Get active conversation ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const activeConversationId = urlParams.get('id');

        if (conversations.length === 0) {
            conversationList.innerHTML = '<div class="text-sm text-gray-400 px-3 py-2">No conversations yet</div>';
            return;
        }
        
        let html = '';
        conversations.forEach(conversation => {
            const isActive = conversation.id.toString() === activeConversationId;
            const title = conversation.title || 'New Chat';
            const date = new Date(conversation.created_at).toLocaleDateString();
            
            const activeClass = isActive ? 'bg-gray-100 dark:bg-gray-800' : '';
            html += `
                <a href="/chat/chat/?id=${conversation.id}" 
                   class="conversation-item flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white ${activeClass}">
                    <span class="truncate">${title}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">${date}</span>
                </a>
            `;
        });
        
        conversationList.innerHTML = html;

    } catch (error) {
        console.error('Error loading conversations:', error);
        conversationList.innerHTML = '<div class="text-sm text-red-400 px-3 py-2">Error loading conversations</div>';
    }
}

// Switch to a different conversation
function switchConversation(conversationId) {
    // Update URL with the new conversation ID
    const url = new URL(window.location.href);
    url.searchParams.set('id', conversationId);
    
    // If we're already on the chat page, just update the URL and load the conversation
    if (window.location.pathname.includes('chat')) {
        window.history.pushState({}, '', url);
        if (window.loadConversation) {
            window.loadConversation(conversationId);
        }
    } else {
        // Otherwise, navigate to the chat page with the conversation ID
        window.location.href = `/chat/chat/?id=${conversationId}`;
    }
    
    // Update UI to show active conversation
    document.querySelectorAll('#conversation-list a').forEach(item => {
        const itemHref = item.getAttribute('href');
        const itemId = itemHref ? new URLSearchParams(itemHref.split('?')[1] || '').get('id') : null;
        const isActive = itemId === conversationId;
        
        if (isActive) {
            item.classList.add('bg-gray-100', 'dark:bg-gray-800');
            item.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        } else {
            item.classList.remove('bg-gray-100', 'dark:bg-gray-800');
            item.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        }
    });
    
    // Hide welcome container and suggested topics if they exist
    const welcomeContainer = document.getElementById('welcome-container');
    const suggestedTopics = document.getElementById('suggested-topics');
    
    if (welcomeContainer) {
        welcomeContainer.style.display = 'none';
    }
    
    if (suggestedTopics) {
        suggestedTopics.style.display = 'none';
    }
}

// Sign out function
function signOut() {
    // Use the handleLogout function from auth.js if available
    if (typeof handleLogout === 'function') {
        handleLogout();
    } else {
        // Fallback to old method
        localStorage.removeItem('isSignedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('activeConversation');
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        
        // Redirect to sign in page
        window.location.href = '/chat/signin/';
    }
}

// Toggle between light and dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// Check for saved dark mode preference
function checkDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
}

// Update send button appearance based on input content
function updateSendButtonState(inputElement, buttonElement) {
    const svgIcon = buttonElement.querySelector('svg');
    
    if (inputElement.value.trim() === '') {
        // Empty input - light gray button with dark icon (second image)
        buttonElement.classList.remove('bg-gray-800', 'bg-black');
        buttonElement.classList.add('bg-gray-200', 'hover:bg-gray-300');
        
        if (svgIcon) {
            svgIcon.classList.remove('text-white');
            svgIcon.classList.add('text-gray-600');
        }
        
        buttonElement.disabled = true;
    } else {
        // Has text - dark navy/black button with white icon (first image)
        buttonElement.classList.remove('bg-gray-200', 'hover:bg-gray-300');
        buttonElement.classList.add('bg-gray-800', 'hover:bg-gray-700');
        
        if (svgIcon) {
            svgIcon.classList.remove('text-gray-600');
            svgIcon.classList.add('text-white');
        }
        
        buttonElement.disabled = false;
    }
}
