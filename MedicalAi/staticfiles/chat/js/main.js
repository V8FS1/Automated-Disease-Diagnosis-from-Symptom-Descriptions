// Main JavaScript file for the Medical Diagnosis AI Chatbot

// Toggle password visibility
function togglePasswordVisibility(inputId, eyeIconId, eyeOffIconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeIconId);
    const eyeOffIcon = document.getElementById(eyeOffIconId);
    
    if (passwordInput && eyeIcon && eyeOffIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        }
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check dark mode preference
    checkDarkModePreference();
    
    // Initialize auto-resizing textareas
    initAutoResizeTextareas();
    
    // Setup dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Setup password visibility toggles
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            togglePasswordVisibility('password', 'eyeIcon', 'eyeOffIcon');
        });
    }
    
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => {
            togglePasswordVisibility('confirm-password', 'confirmEyeIcon', 'confirmEyeOffIcon');
        });
    }
});

// Toggle between light and dark mode with the light bulb
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

// Auto-resize textarea based on content
function autoResizeTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set minimum height (equivalent to rows="1")
    const minHeight = 24; // Approximate height of one line of text
    
    // Calculate new height based on scrollHeight
    const newHeight = Math.max(textarea.scrollHeight, minHeight);
    
    // Set the new height
    textarea.style.height = newHeight + 'px';
}

// Initialize auto-resize for textareas
function initAutoResizeTextareas() {
    const textareas = document.querySelectorAll('textarea.resize-none');
    
    textareas.forEach(textarea => {
        // Initial resize
        autoResizeTextarea(textarea);
        
        // Add event listeners for input changes
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        
        // Also resize on focus to handle any changes that might have happened
        textarea.addEventListener('focus', function() {
            autoResizeTextarea(this);
        });
    });
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');
            
            // Add error message if not exists
            const errorId = `${input.id}-error`;
            if (!document.getElementById(errorId)) {
                const errorMsg = document.createElement('p');
                errorMsg.id = errorId;
                errorMsg.className = 'text-red-500 text-xs mt-1';
                errorMsg.textContent = 'This field is required';
                input.parentNode.appendChild(errorMsg);
            }
        } else {
            input.classList.remove('border-red-500');
            const errorMsg = document.getElementById(`${input.id}-error`);
            if (errorMsg) errorMsg.remove();
        }
    });
    
    return isValid;
}

// Password matching validation
function validatePasswordMatch(passwordId, confirmPasswordId) {
    const password = document.getElementById(passwordId);
    const confirmPassword = document.getElementById(confirmPasswordId);
    const errorId = `${confirmPasswordId}-error`;
    
    if (password.value !== confirmPassword.value) {
        confirmPassword.classList.add('border-red-500');
        
        // Add error message if not exists
        if (!document.getElementById(errorId)) {
            const errorMsg = document.createElement('p');
            errorMsg.id = errorId;
            errorMsg.className = 'text-red-500 text-xs mt-1';
            errorMsg.textContent = 'Passwords do not match';
            confirmPassword.parentNode.appendChild(errorMsg);
        }
        return false;
    } else {
        confirmPassword.classList.remove('border-red-500');
        const errorMsg = document.getElementById(errorId);
        if (errorMsg) errorMsg.remove();
        return true;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkDarkModePreference();
    
    // Add event listeners for forms if they exist
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm('signup-form') && validatePasswordMatch('password', 'confirm-password')) {
                // Mock signup - in a real app, this would call an API
                window.location.href = 'welcome.html';
            }
        });
    }
    
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm('signin-form')) {
                // Mock signin - in a real app, this would call an API
                window.location.href = 'welcome.html';
            }
        });
    }
    
    // Add event listener for dark mode toggle if it exists
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
});
