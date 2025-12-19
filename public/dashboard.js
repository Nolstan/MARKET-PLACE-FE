const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://local-marketplace-backend-v0p4.onrender.com/api';
const shopId = localStorage.getItem('shopId');

if (!shopId) {
    alert('Please log in to manage your products!');
    window.location.href = 'login.html';
}

// UI Elements
const productGrid = document.getElementById('dashboardProductGrid');
const productForm = document.getElementById('productForm');
const modal = document.getElementById('productModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtns = document.querySelectorAll('.close-modal');
const openModalBtn = document.getElementById('openAddModal');
const shopNameDisplay = document.getElementById('shopNameDisplay');
const totalProductsLabel = document.getElementById('totalProducts');

/**
 * Initialize Dashboard
 */
async function init() {
    await loadShopDetails();
    await loadProducts();
}

/**
 * Fetch Shop Details
 */
async function loadShopDetails() {
    try {
        const response = await fetch(`${API_URL}/business/${shopId}`);
        const data = await response.json();
        if (data.success) {
            shopNameDisplay.innerText = data.data.businessName;
        }
    } catch (error) {
        console.error('Error loading shop details:', error);
    }
}

/**
 * Fetch and Render Products
 */
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/business/${shopId}`);
        const data = await response.json();

        if (data.success) {
            renderProducts(data.data);
            totalProductsLabel.innerText = data.data.length;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<tr><td colspan="4" class="error">Failed to load products.</td></tr>';
    }
}

/**
 * Render Table Rows
 */
function renderProducts(products) {
    if (products.length === 0) {
        productGrid.innerHTML = '<tr><td colspan="4" class="loader">You haven\'t uploaded any products yet.</td></tr>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <tr>
            <td data-label="Product">
                <div class="product-cell">
                    <img src="${product.imageUrl}" alt="${product.name}" class="table-img">
                    <div class="product-meta">
                        <span class="p-name">${product.name}</span>
                        <span class="p-id">ID: ${product._id.substring(0, 8)}</span>
                    </div>
                </div>
            </td>
            <td data-label="Price"><strong>MWK ${product.price.toLocaleString()}</strong></td>
            <td data-label="Status"><span class="status-badge">In Stock</span></td>
            <td data-label="Actions">
                <div class="actions">
                    <button onclick="editProduct('${product._id}')" class="btn-edit">Edit</button>
                    <button onclick="deleteProduct('${product._id}')" class="btn-delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Handle Add/Edit Product
 */
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('businessId', shopId); // Crucial: Link product to shop

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    } else if (!productId) {
        alert('Please upload an image for new products!');
        return;
    }

    const method = productId ? 'PUT' : 'POST';
    const endpoint = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            modal.style.display = 'none';
            productForm.reset();
            loadProducts();
            alert(productId ? 'Product Updated!' : 'Product Added!');
        } else {
            alert(data.error || 'Something went wrong');
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
});

/**
 * Open Modal for Edit
 */
window.editProduct = async (id) => {
    // In a real app, fetch single product. For now, find in local list or just set form
    // Let's at least set the ID and change title
    document.getElementById('productId').value = id;
    modalTitle.innerText = 'Edit Product';

    // Quick hack: find product in table and populate basics
    // Real improvement: Fetch GET /api/products/:id (if implemented)
    modal.style.display = 'block';
};

/**
 * Delete Product
 */
window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            loadProducts();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
};

/**
 * Modal Handling
 */
openModalBtn.onclick = () => {
    modalTitle.innerText = 'Add New Product';
    document.getElementById('productId').value = '';
    productForm.reset();
    modal.style.display = 'block';
};

closeModalBtns.forEach(btn => {
    btn.onclick = () => modal.style.display = 'none';
});

window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
};

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('shopId');
    localStorage.removeItem('token');
    localStorage.removeItem('businessName');
    window.location.href = 'index.html';
};

// Start
init();
