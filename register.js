const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://market-place-q0q5.onrender.com/api';
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const businessData = {
            businessName: document.getElementById('businessName').value,
            ownerName: document.getElementById('ownerName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            location: document.getElementById('location').value,
            contactInfo: document.getElementById('contactInfo').value
        };

        // Show loading state
        const submitBtn = document.getElementById('registerBtn');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Creating Shop...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(businessData)
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.innerHTML = `<div class="success">✨ Registration Successful! Launching Dashboard...</div>`;

                // Store token and details
                localStorage.setItem('token', data.token);
                localStorage.setItem('shopId', data.data.id);
                localStorage.setItem('businessName', data.data.businessName);

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                registerMessage.innerHTML = `<div class="error">❌ ${data.error || 'Failed to create shop'}</div>`;
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            registerMessage.innerHTML = `<div class="error">❌ Connection error. Is the server running?</div>`;
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    // We remove the auto-redirect here to allow users to see the registration page 
    // even if they have a stale token or want to create a second shop.
});
