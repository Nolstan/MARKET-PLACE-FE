const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://market-place-q0q5.onrender.com/api';
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Show loading state
    const submitBtn = document.getElementById('loginBtn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Verifying...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            loginMessage.innerHTML = `<div class="success">✅ Login Successful! Redirecting...</div>`;

            // Store token and details
            localStorage.setItem('token', data.token);
            localStorage.setItem('shopId', data.data.id);
            localStorage.setItem('businessName', data.data.businessName);
            localStorage.setItem('role', data.data.role);

            // Redirect based on role
            setTimeout(() => {
                if (data.data.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        } else {
            loginMessage.innerHTML = `<div class="error">❌ ${data.error || 'Invalid credentials'}</div>`;
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        loginMessage.innerHTML = `<div class="error">❌ Connection error. Is the server running?</div>`;
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

// Check if already logged in (Optional: could show a "Already logged in as..." message instead of raw redirect)
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // We remove the auto-redirect here to allow users to switch accounts if they want.
    // If you want auto-redirect, you can re-enable it or add a "Logout" link.
});
