
// Settings functionality for Clinexa Medical Chatbot

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings.js loaded');
    
    // Get DOM elements
    const settingsButton = document.querySelector('.border-t.border-gray-300 a[href="#"]');
    console.log('Settings button found:', settingsButton);
    
    const settingsModal = document.getElementById('settings-modal');
    console.log('Settings modal found:', settingsModal);
    
    const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
    const settingsModalClose = document.getElementById('settings-modal-close');
    const settingsDarkModeToggle = document.getElementById('settings-dark-mode-toggle');
    const saveUsernameButton = document.getElementById('save-username');
    const usernameInput = document.getElementById('username');
    const deleteArchivesButton = document.getElementById('delete-archives');
    const logOutButton = document.getElementById('log-out');

    // Initialize settings from localStorage
    initializeSettings();

    // Open settings modal when settings button is clicked
    if (settingsButton) {
        console.log('Adding click event listener to settings button');
        settingsButton.addEventListener('click', function(e) {
            console.log('Settings button clicked');
            e.preventDefault();
            openSettingsModal();
        });
    } else {
        console.log('Settings button not found');
    }

    // Close settings modal when backdrop is clicked
    settingsModalBackdrop.addEventListener('click', function() {
        closeSettingsModal();
    });

    // Close settings modal when close button is clicked
    settingsModalClose.addEventListener('click', function() {
        closeSettingsModal();
    });

    // Close settings modal when Escape key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
            closeSettingsModal();
        }
    });

    // Handle dark mode toggle
    settingsDarkModeToggle.addEventListener('click', function() {
        toggleDarkMode();
    });

    // Handle username save
    saveUsernameButton.addEventListener('click', function() {
        saveUsername();
    });

    // Handle delete archives
    deleteArchivesButton.addEventListener('click', function() {
        confirmDeleteArchives();
    });

    // Handle log out
    if (logOutButton) {
        logOutButton.addEventListener('click', function() {
            // Placeholder for log out functionality
            console.log('Log out button clicked');
            showNotification('Logged out (placeholder)', 'info');
            // In a real application, you would clear session/local storage
            // and redirect to the sign-in page.
            // Example: localStorage.clear(); window.location.href = 'signin.html';
        });
    }

    // Function to open settings modal
    function openSettingsModal() {
        console.log('Opening settings modal');
        // Show the modal container and backdrop
        settingsModalBackdrop.classList.remove('opacity-0');
        settingsModalBackdrop.classList.add('opacity-100');
        settingsModal.classList.remove('hidden');
        
        // Animate the modal content
        const modalContent = document.querySelector('#settings-modal #modal-content');
        if (modalContent) {
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
        
        // Focus the username input
        // Check if usernameInput exists before trying to focus
        if (usernameInput) {
            usernameInput.focus();
        }
    }

    // Function to close settings modal
    function closeSettingsModal() {
        // Animate the modal content out
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        
        // Animate the backdrop out
        settingsModalBackdrop.classList.remove('opacity-100');
        settingsModalBackdrop.classList.add('opacity-0');
        
        // Hide the modal after animation completes
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 200);
    }

    // Function to initialize settings from localStorage
    function initializeSettings() {
        // Load username
        const savedUsername = localStorage.getItem('username');
        const usernameInput = document.getElementById('username'); // Ensure usernameInput is accessible here
        const saveUsernameButton = document.getElementById('save-username'); // Ensure saveUsernameButton is accessible here

        if (savedUsername) {
            usernameInput.value = savedUsername;
            // Add a class for gray text for the saved username
            usernameInput.classList.add('text-gray-500', 'dark:text-gray-400');
            usernameInput.disabled = false; // Ensure it's enabled for signed-in users
             if (saveUsernameButton) { // Check if button exists
                 saveUsernameButton.disabled = false; // Enable save button
             }
        } else {
            // User is a guest
            usernameInput.value = '';
            usernameInput.placeholder = 'Sign in to set username';
            usernameInput.disabled = true; // Disable for guests
            // Remove gray text class if it was somehow applied
            usernameInput.classList.remove('text-gray-500', 'dark:text-gray-400');
             if (saveUsernameButton) { // Check if button exists
                 saveUsernameButton.disabled = true; // Disable save button
             }
        }

        // Set dark mode toggle state
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            settingsDarkModeToggle.classList.add('bg-indigo-600');
        }
        settingsDarkModeToggle.classList.toggle('bg-indigo-600', isDarkMode);
    }

    // Function to save username
    function saveUsername() {
        const usernameInput = document.getElementById('username'); // Ensure usernameInput is accessible here
        // Check if the input is disabled, which means the user is a guest
        if (usernameInput.disabled) {
            showNotification('You must be signed in to set a username.', 'error');
            return;
        }

        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('username', username);
            // Show success message
            showNotification('Username saved successfully!', 'success');
            // Update text color to gray after saving
            usernameInput.classList.add('text-gray-500', 'dark:text-gray-400');
        } else {
            showNotification('Please enter a username', 'error');
        }
    }

    // Function to toggle dark mode
    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        
        // Update toggle button state
        settingsDarkModeToggle.classList.toggle('bg-indigo-600');
    }

    // Function to confirm and delete archives
    function confirmDeleteArchives() {
        if (confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
            // Delete conversations from localStorage
            localStorage.removeItem('conversations');
            showNotification('All conversations have been deleted', 'success');
            // Optionally refresh the page or update the UI
            location.reload();
        }
    }

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}); 