document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api'
        : 'https://market-place-q0q5.onrender.com/api';

    const loading = document.getElementById('loading');
    const productDetails = document.getElementById('productDetails');
    const errorView = document.getElementById('error');

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

        // Format price
        const formattedPrice = new Intl.NumberFormat('en-MW', {
            style: 'currency',
            currency: 'MWK'
        }).format(product.price);
        document.getElementById('productPrice').textContent = formattedPrice;

        // Owner Info
        const business = product.businessId;
        if (business) {
            document.getElementById('ownerName').textContent = business.ownerName;
            document.getElementById('businessName').textContent = business.businessName;
            document.getElementById('businessLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${business.location}`;
            document.getElementById('businessContact').innerHTML = `<i class="fas fa-phone"></i> ${business.contactInfo}`;
            document.getElementById('businessBio').textContent = business.bio || 'This business is part of the StoreSync community.';
        }

        productDetails.classList.remove('hidden');
    };

    function showError() {
        loading.classList.add('hidden');
        errorView.classList.remove('hidden');
    }

    fetchProductDetails();
});
