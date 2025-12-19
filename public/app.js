const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api'
    : 'https://local-marketplace-backend-v0p4.onrender.com/api';
const productGrid = document.getElementById('productGrid');

/**
 * Animate counter values
 */
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current.toLocaleString() + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Fetch and animate hero stats
 */
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const result = await response.json();
        if (result.success) {
            animateValue("productCounter", 0, result.data.products, 2000);
            animateValue("shopCounter", 0, result.data.shops, 2000);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Remove misleading fake stats
        document.getElementById('productCounter').innerText = '0+';
        document.getElementById('shopCounter').innerText = '0+';
    }
}

let allProducts = [];

/**
 * Fetch discovery products from the backend
 */
async function loadProducts() {
    try {
        loadStats(); // Call stats loading as well
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        allProducts = data.data;
        renderProducts(allProducts);

        // Add search event listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allProducts.filter(p =>
                    p.name.toLowerCase().includes(term) ||
                    (p.businessId?.ownerName || '').toLowerCase().includes(term)
                );
                renderProducts(filtered);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = `
            <div class="loader">
                Unable to load products. <br>
                <small>This usually happens if the database is disconnected or the server is down.</small>
            </div>`;
    }
}

/**
 * Render product cards into the grid
 */
function renderProducts(products) {
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<div class="loader">No products found. Start exploring!</div>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl || 'https://via.placeholder.com/400x300?text=Product'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <span class="product-shop">By ${product.businessId?.ownerName || 'Local Seller'}</span>
                <div class="product-footer">
                    <span class="product-price">MWK ${product.price.toLocaleString()}</span>
                    <button class="btn-buy" onclick="window.location.href='product-details.html?id=${product._id}'">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize
window.addEventListener('DOMContentLoaded', loadProducts);
