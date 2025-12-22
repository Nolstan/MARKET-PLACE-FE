document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://market-place-q0q5.onrender.com/api';

    // Page elements
    const loading = document.getElementById('loading');
    const productDetails = document.getElementById('productDetails');
    const errorView = document.getElementById('error');

    // Order Modal Elements
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const orderModal = document.getElementById('orderModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const orderForm = document.getElementById('orderForm');
    const customerPhoneInput = document.getElementById('customerPhone');
    const orderStatus = document.getElementById('orderStatus');

    let sellerId = null; // To be populated on product load

    if (!productId) {
        showError();
        return;
    }

    const fetchProductDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/products/${productId}`);
            const data = await res.json();

            if (data.success) {
                renderDetails(data.data);
            } else {
                showError();
            }
        } catch (err) {
            console.error('Error fetching product details:', err);
            showError();
        } finally {
            loading.classList.add('hidden');
        }
    };

    const renderDetails = (product) => {
        document.title = `${product.name} | StoreSync`;

        document.getElementById('productImage').src = product.imageUrl;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productCategory').textContent = product.category || 'Local Choice';
        document.getElementById('productDescription').textContent = product.description;

        const formattedPrice = new Intl.NumberFormat('en-MW', {
            style: 'currency',
            currency: 'MWK'
        }).format(product.price);
        document.getElementById('productPrice').textContent = formattedPrice;

        const business = product.businessId;
        if (business) {
            sellerId = business._id; // Capture seller ID
            document.getElementById('ownerName').textContent = business.ownerName;
            document.getElementById('businessName').textContent = business.businessName;
            document.getElementById('businessLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${business.location}`;
            document.getElementById('businessContact').innerHTML = `<i class="fas fa-phone"></i> ${business.contactInfo}`;
            document.getElementById('businessBio').textContent = business.bio || 'This business is part of the StoreSync community.';
            
            // Show the place order button if the business is active
            if(business.isActive) {
                placeOrderBtn.classList.remove('hidden');
            } else {
                placeOrderBtn.classList.add('hidden');
                placeOrderBtn.disabled = true;
                // Optionally inform user the seller is inactive
                const inactiveNote = document.createElement('p');
                inactiveNote.innerHTML = `Seller is not active, call them direct: <a href="tel:${business.contactInfo}">${business.contactInfo}</a>`;
                inactiveNote.style.color = 'var(--text-muted)';
                placeOrderBtn.parentElement.appendChild(inactiveNote);
            }
        }

        productDetails.classList.remove('hidden');
    };

    function showError() {
        loading.classList.add('hidden');
        errorView.classList.remove('hidden');
    }

    // --- Order Modal Logic ---
    placeOrderBtn.addEventListener('click', () => {
        orderModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        orderModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.add('hidden');
        }
    });

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerPhone = customerPhoneInput.value;

        if (!customerPhone || !productId || !sellerId) {
            showOrderStatus('Something went wrong. Please refresh and try again.', 'error');
            return;
        }

        const orderData = {
            customerPhone,
            productId,
            sellerId,
        };

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
            const data = await res.json();

            if (data.success) {
                showOrderStatus('Order placed successfully! The seller will contact you.', 'success');
                orderForm.reset();
                setTimeout(() => {
                    orderModal.classList.add('hidden');
                    orderStatus.style.display = 'none';
                }, 3000);
            } else {
                showOrderStatus(data.error || 'Failed to place order. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Order submission error:', err);
            showOrderStatus('An unexpected error occurred. Please check your connection.', 'error');
        }
    });

    function showOrderStatus(message, type) {
        orderStatus.textContent = message;
        orderStatus.className = type; // 'success' or 'error'
        orderStatus.style.display = 'block';
    }
    
    // Hide the button initially until we confirm the seller is active
    placeOrderBtn.classList.add('hidden');

    fetchProductDetails();
});
