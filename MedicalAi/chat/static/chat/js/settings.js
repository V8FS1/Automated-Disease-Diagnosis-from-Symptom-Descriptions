// Settings functionality for Clinexa Medical Chatbot

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings.js loaded');
    
    // Get DOM elements
    const settingsModal = document.getElementById('settings-modal');
    const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
    const settingsModalClose = document.getElementById('settings-modal-close');
    
    // New elements from redesigned modal
    const usernameDisplay = document.getElementById('settings-username');
    const themeSelect = document.getElementById('theme-select');
    const deleteArchivesButton = document.getElementById('delete-archives');
    const logOutButton = document.getElementById('log-out');

    // Initialize settings from localStorage
    initializeSettings();

    // Function to handle settings button click
    function handleSettingsClick(e) {
        e.preventDefault();
        e.stopPropagation();
        openSettingsModal();
        
        // Close the profile dropdown if it's open
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
            profileDropdown.classList.add('hidden');
        }
        
        openSettingsModal();
        return false;
    }

    // Use event delegation for settings buttons
    document.addEventListener('click', function(e) {
        // Check if the clicked element or any of its parents is a settings button
        const settingsButton = e.target.closest('.profile-settings-button, .border-t.border-gray-300 a[href="#"]');
        if (settingsButton) {
            handleSettingsClick(e);
        }
    });

    // Close modal when clicking the close button
    const closeButton = document.getElementById('settings-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSettingsModal();
        });
    }
    
    // Close modal when clicking outside the modal content
    const modalBackdrop = document.getElementById('settings-modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', function(e) {
            if (e.target === modalBackdrop) {
                closeSettingsModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
            closeSettingsModal();
        }
    });

    // Handle theme change
    if (themeSelect) {
        themeSelect.addEventListener('change', function(e) {
            applyTheme(e.target.value);
        });
    }

    // Handle delete archives
    if (deleteArchivesButton) {
        deleteArchivesButton.addEventListener('click', confirmDeleteArchives);
    }

    // Function to get CSRF token from meta tag
    function getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.getAttribute('content') : '';
    }

    // Function to confirm and delete archives
    async function confirmDeleteArchives() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('You must be signed in to delete conversations.');
            return;
        }

        if (confirm('Are you sure you want to delete all conversations? This action cannot be undone and will remove them permanently.')) {
            try {
                const response = await fetch('/api/conversations/delete_all/', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${authToken}`,
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('conversation_')) {
                            localStorage.removeItem(key);
                        }
                    });
                    localStorage.removeItem('conversations');
                    
                    showNotification('All conversations have been deleted', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to delete conversations.');
                }
            } catch (error) {
                console.error('Deletion error:', error);
                showNotification(error.message, 'error');
            }
        }
    }

    // Function to open settings modal
    function openSettingsModal() {
        if (!settingsModal) return;
        settingsModalBackdrop.classList.remove('opacity-0');
        settingsModal.classList.remove('hidden');
        
        const modalContent = settingsModal.querySelector('#modal-content');
        if (modalContent) {
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
            }, 10);
        }
        updateUsernameField();
    }

    // Function to close settings modal
    function closeSettingsModal() {
        if (!settingsModal) return;
        const modalContent = settingsModal.querySelector('#modal-content');
        if (modalContent) {
            modalContent.classList.add('scale-95', 'opacity-0');
        }
        settingsModalBackdrop.classList.add('opacity-0');
        
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 300);
    }

    // Function to update username field based on login status
    function updateUsernameField() {
        if (!usernameDisplay) return;
        const authToken = localStorage.getItem('authToken');
        const savedUsername = localStorage.getItem('username') || localStorage.getItem('userName');

        if (authToken && savedUsername) {
            usernameDisplay.textContent = savedUsername;
            usernameDisplay.classList.remove('text-gray-500', 'dark:text-gray-400');
            usernameDisplay.classList.add('text-gray-800', 'dark:text-gray-200');
        } else {
            usernameDisplay.textContent = 'Not signed in';
            usernameDisplay.classList.remove('text-gray-800', 'dark:text-gray-200');
            usernameDisplay.classList.add('text-gray-500', 'dark:text-gray-400');
        }
    }

    // Function to initialize settings from localStorage
    function initializeSettings() {
        updateUsernameField();
        const savedTheme = localStorage.getItem('theme') || 'system';
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
        applyTheme(savedTheme);
    }

    // Function to apply theme
    function applyTheme(theme) {
        localStorage.setItem('theme', theme);
        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', systemPrefersDark);
        } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('theme') === 'system') {
            applyTheme('system');
        }
    });
}); 