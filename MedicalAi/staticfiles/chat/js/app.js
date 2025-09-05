// Main JavaScript file for Clinexa - ChatGPT-like medical assistant

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
    // Start with collapsed sidebar
    document.body.classList.add('sidebar-collapsed');
    
    // Check if user is signed in (mock for now)
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'Guest';
    
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
    
    // Update profile dropdown options
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileDropdown) {
        profileDropdown.innerHTML = isSignedIn 
            ? `<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" id="settings-link">Settings</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" id="sign-out-link">Sign Out</a>`
            : `<a href="signin.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">Sign In</a>
               <a href="index.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">Sign Up</a>`;
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
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Toggle profile dropdown
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('active');
        });
    }
    
    // Handle message form submission
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
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

// Toggle sidebar visibility
function toggleSidebar() {
    const body = document.body;
    body.classList.toggle('sidebar-collapsed');
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.classList.toggle('main-content-expanded');
    }
}

// Handle message submission
function handleMessageSubmit(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const userMessage = messageInput.value.trim();
    
    // Clear welcome message and suggestions if this is the first message
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
        welcomeContainer.style.display = 'none';
    }
    
    // Add user message to chat
    addMessageToChat(userMessage, true);
    
    // Clear input
    messageInput.value = '';
    
    // In a real app, we would call the API here
    // For now, use a mock response after a short delay to simulate API call
    setTimeout(() => {
        const aiResponse = getMockAIResponse(userMessage);
        addMessageToChat(aiResponse, false);
        
        // Save conversation to session storage for guest users
        saveConversation(userMessage, aiResponse);
    }, 1000);
}

// Add a message to the chat (from either user or AI)
function addMessageToChat(message, isUser = false) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `py-5 ${isUser ? 'user-message' : 'ai-message'} new-message`;
    
    const innerContainer = document.createElement('div');
    innerContainer.className = 'max-w-3xl mx-auto flex items-start space-x-4 px-4';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-green-500'}`;
    avatarDiv.innerHTML = isUser ? '<span class="text-white text-sm">U</span>' : '<span class="text-white text-sm">AI</span>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 markdown prose';
    contentDiv.textContent = message;
    
    innerContainer.appendChild(avatarDiv);
    innerContainer.appendChild(contentDiv);
    messageDiv.appendChild(innerContainer);
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom of chat
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Mock AI response function (will be replaced with actual API call later)
function getMockAIResponse(userMessage) {
    // For now, return a placeholder response
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        return "Hello! I'm your medical assistant from Clinexa. How can I help you today?";
    } else if (userMessage.toLowerCase().includes('thank')) {
        return "You're welcome! Is there anything else I can help you with?";
    } else if (userMessage.toLowerCase().includes('symptom') || userMessage.toLowerCase().includes('pain')) {
        return "I understand you're experiencing some symptoms. Could you please provide more details about when they started, their severity, and any other relevant information? This will help me provide a better assessment.";
    } else {
        return "I'm your Clinexa medical assistant. Based on what you've shared, I need more information to provide a better assessment. Could you please describe your symptoms in more detail?";
    }
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
        
        // Update the sidebar
        loadConversationHistory();
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

// Load conversation history into sidebar
function loadConversationHistory() {
    const conversationList = document.getElementById('conversation-list');
    if (!conversationList) return;
    
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const activeConversationId = localStorage.getItem('activeConversation');
    
    if (conversations.length === 0) {
        conversationList.innerHTML = '<div class="text-sm text-gray-400 px-3 py-2">No conversations yet</div>';
        return;
    }
    
    let html = '';
    conversations.forEach(conversation => {
        const isActive = conversation.id === activeConversationId;
        html += `
            <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conversation.id}">
                ${conversation.title}
            </div>
        `;
    });
    
    conversationList.innerHTML = html;
    
    // Add event listeners to conversation items
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', function() {
            const conversationId = this.getAttribute('data-id');
            switchConversation(conversationId);
        });
    });
}

// Switch to a different conversation
function switchConversation(conversationId) {
    localStorage.setItem('activeConversation', conversationId);
    
    // In a real app, we would load the conversation messages here
    // For this demo, we'll just update the active state in the sidebar
    document.querySelectorAll('.conversation-item').forEach(item => {
        if (item.getAttribute('data-id') === conversationId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Clear the current chat and load the selected conversation
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.innerHTML = '';
        
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const conversation = conversations.find(conv => conv.id === conversationId);
        
        if (conversation && conversation.messages) {
            conversation.messages.forEach(message => {
                addMessageToChat(message.content, message.role === 'user');
            });
        }
    }
}

// Sign out function
function signOut() {
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('activeConversation');
    // In a real app, we would also clear auth tokens, etc.
    
    // Redirect to sign in page
    window.location.href = 'signin.html';
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
