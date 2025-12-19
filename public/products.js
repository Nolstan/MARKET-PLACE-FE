document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const loading = document.getElementById('loading');
    const noProducts = document.getElementById('noProducts');
    const searchInput = document.getElementById('searchInput');
    const categoryPills = document.getElementById('categoryPills');

    let allProducts = [];
    let currentCategory = 'all';

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api'
        : 'https://local-marketplace-backend-v0p4.onrender.com/api';

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            const data = await res.json();

            if (data.success) {
                allProducts = data.data;
                renderProducts(allProducts);
                setupCategories(allProducts);
            } else {
                showNoProducts();
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            showNoProducts();
        } finally {
            loading.classList.add('hidden');
        }
    };

    const setupCategories = (products) => {
        const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'pill';
            btn.textContent = cat;
            btn.dataset.category = cat;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = cat;
                filterProducts();
            });
            categoryPills.appendChild(btn);
        });
    };

    const renderProducts = (products) => {
        productGrid.innerHTML = '';

        if (products.length === 0) {
            noProducts.classList.remove('hidden');
            return;
        }

        noProducts.classList.add('hidden');

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Format price to currency
            const formattedPrice = new Intl.NumberFormat('en-MW', {
                style: 'currency',
                currency: 'MWK'
            }).format(product.price);

            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="product-badge">${product.category || 'Local'}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-business"><i class="fas fa-user"></i> By ${product.businessId?.ownerName || 'Local Seller'}</p>
                    <p class="product-desc">${truncateText(product.description, 60)}</p>
                    <div class="product-footer">
                        <span class="product-price">${formattedPrice}</span>
                            <button class="btn-details" onclick="window.location.href='product-details.html?id=${product._id}'">View Details</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    };

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const filterProducts = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = allProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                (p.businessId?.ownerName || '').toLowerCase().includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
            return matchesSearch && matchesCategory;
        });
        renderProducts(filtered);
    };

    searchInput.addEventListener('input', filterProducts);

    // Initial fetch
    fetchProducts();
});
