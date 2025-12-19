const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://market-place-q0q5.onrender.com/api';
const businessForm = document.getElementById('businessForm');
const formMessage = document.getElementById('formMessage');

businessForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect data
    const businessData = {
        businessName: document.getElementById('businessName').value,
        ownerName: document.getElementById('ownerName').value,
        email: document.getElementById('email').value,
        location: document.getElementById('location').value,
        contactInfo: document.getElementById('contactInfo').value
    };

    // Show loading state
    const submitBtn = businessForm.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Creating Profile...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...businessData,
                password: document.getElementById('password').value
            })
        });

        const data = await response.json();

        if (response.ok) {
            formMessage.innerHTML = `<div class="success">✨ Profile Created Successfully!</div>`;
            businessForm.reset();

            // Store token and business info
            localStorage.setItem('token', data.token);
            localStorage.setItem('shopId', data.data.id);
            localStorage.setItem('businessName', data.data.businessName);

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            formMessage.innerHTML = `<div class="error">❌ ${data.error || 'Failed to create profile.'}</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        formMessage.innerHTML = '<div class="error">❌ Connection error.</div>';
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('shopId', data.data.id);
                localStorage.setItem('businessName', data.data.businessName);
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Connection error during login');
        }
    });
}

/**
 * Check if the user is a registered business owner
 */
function checkShopStatus() {
    const shopId = localStorage.getItem('shopId');
    const navDashboard = document.getElementById('navDashboard');
    if (shopId && navDashboard) {
        navDashboard.style.display = 'block';
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', checkShopStatus);
