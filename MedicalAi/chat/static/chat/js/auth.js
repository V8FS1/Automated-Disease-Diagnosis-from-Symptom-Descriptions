function handleLogout() {
    const token = localStorage.getItem('authToken');
    if (token) {
        fetch('/api/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .finally(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.href = '/chat/signin/';
        });
    } else {
        window.location.href = '/chat/signin/';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileDropdown) {
        const signInLink = profileDropdown.querySelector('#profile-signin-link');
        const signUpLink = profileDropdown.querySelector('#profile-signup-link');
        const logoutButton = profileDropdown.querySelector('#profile-logout-button');

        if (token) {
            if (signInLink) signInLink.style.display = 'none';
            if (signUpLink) signUpLink.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else {
            if (signInLink) signInLink.style.display = 'block';
            if (signUpLink) signUpLink.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
            });
        }
    }

    // Also re-wire the settings modal logout button to use the central function
    const settingsLogOutButton = document.getElementById('log-out');
    if (settingsLogOutButton) {
        settingsLogOutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }
}); 