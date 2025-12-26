document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    const navItems = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.admin-section');
    const userTableBody = document.getElementById('userTableBody');
    const userSearchInput = document.getElementById('userSearchInput');
    const productContainer = document.getElementById('productContainer');
    const complaintTableBody = document.getElementById('complaintTableBody');
    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://market-place-q0q5.onrender.com/api';

    let allUsers = []; // Store full user list for searching

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-active');
        });
    }

    // Close sidebar when clicking a nav item on mobile
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-active');
            }
        });
    });

    // Tab Switching Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                }
            });

            // Refresh data based on section
            if (targetSection === 'users') loadUsers();
            if (targetSection === 'products') loadProducts();
            if (targetSection === 'complaints') loadComplaints();
        });
    });

    // Search Logic for Users
    userSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            renderUsers(allUsers);
            return;
        }

        const filtered = allUsers.filter(user => {
            const businessName = (user.businessName || '').toLowerCase();
            const ownerName = (user.ownerName || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const phone = (user.contactInfo || '').toLowerCase(); // Use contactInfo for phone search

            return businessName.includes(term) ||
                ownerName.includes(term) ||
                email.includes(term) ||
                phone.includes(term);
        });

        renderUsers(filtered);
    });

    // Modal Close logic
    closeModalBtns.forEach(btn => {
        btn.onclick = () => {
            modal.style.display = 'none';
        };
    });

    // Data Loaders
    async function loadUsers() {
        userTableBody.innerHTML = '<tr><td colspan="6" class="loader">Loading users...</td></tr>';
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                allUsers = data.data; // Store globally
                renderUsers(allUsers);
            } else {
                userTableBody.innerHTML = `<tr><td colspan="6" class="error">${data.error}</td></tr>`;
            }
        } catch (error) {
            console.error('Error loading users:', error);
            userTableBody.innerHTML = '<tr><td colspan="6" class="error">Failed to load users.</td></tr>';
        }
    }

    function renderUsers(users) {
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6" class="loader">No users found.</td></tr>';
            return;
        }

        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.businessName || 'N/A'}</strong></td>
                <td>${user.ownerName || 'N/A'}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.isBanned ? 'badge-danger' : 'badge-success'}">${user.isBanned ? 'Banned' : 'Active'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-reset" title="Reset Password" onclick="openResetModal('${user.ownerName}', '${user._id}')">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn-ban" title="${user.isBanned ? 'Unban' : 'Ban'} User" onclick="toggleBan('${user._id}', ${user.isBanned})">
                            <i class="fas ${user.isBanned ? 'fa-user-check' : 'fa-user-slash'}"></i>
                        </button>
                        <button class="btn-delete" title="Delete User" onclick="deleteUser('${user._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async function loadProducts() {
        productContainer.innerHTML = '<div class="loader">Loading products...</div>';
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/products/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                renderGroupedProducts(data.data);
            } else {
                productContainer.innerHTML = `<div class="error">${data.error}</div>`;
            }
        } catch (error) {
            console.error('Error loading products:', error);
            productContainer.innerHTML = '<div class="error">Failed to load products.</div>';
        }
    }

    function renderGroupedProducts(shops) {
        if (shops.length === 0) {
            productContainer.innerHTML = '<div class="loader">No products found across any shops.</div>';
            return;
        }

        productContainer.innerHTML = shops.map(shop => `
            <div class="admin-card" style="padding: 0; overflow: hidden;">
                <div class="shop-group-header">
                    <span>${shop.name} ${shop.isBanned ? '<span class="badge badge-danger">Banned</span>' : ''}</span>
                    <span class="badge badge-info">${shop.products.length} Products</span>
                </div>
                <table class="product-table">
                    <tbody>
                        ${shop.products.map(p => `
                            <tr>
                                <td style="width: 40%;"><strong>${p.name}</strong></td>
                                <td>MWK ${parseFloat(p.price).toLocaleString()}</td>
                                <td><span class="badge badge-success">Live</span></td>
                                <td style="text-align: right;">
                                    <div class="actions" style="justify-content: flex-end;">
                                        <button class="btn-edit" title="Edit Product" onclick="editProduct('${p._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-delete" title="Delete Product" onclick="deleteProduct('${p._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `).join('');
    }

    function loadComplaints() {
        const mockComplaints = [
            { id: 1, user: 'Customer A', subject: 'Late Delivery', date: '2023-10-25', status: 'Pending' },
            { id: 2, user: 'Customer B', subject: 'Wrong Item', date: '2023-10-24', status: 'Resolved' }
        ];

        complaintTableBody.innerHTML = mockComplaints.map(c => `
            <tr>
                <td>${c.user}</td>
                <td>${c.subject}</td>
                <td>${c.date}</td>
                <td><span class="badge ${c.status === 'Pending' ? 'badge-warning' : 'badge-success'}">${c.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="viewComplaint('${c.id}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    // Modal Actions (Placeholders)
    window.openResetModal = (name) => {
        modalTitle.innerText = 'Reset Password';
        modalBody.innerHTML = `<p>Are you sure you want to reset the password for <strong>${name}</strong>? A temporary password will be sent to their email.</p>`;
        modalConfirmBtn.innerText = 'Reset Password';
        modal.style.display = 'flex';
    };

    window.toggleBan = async (id, isBanned) => {
        const action = isBanned ? 'unban' : 'ban';
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/users/${id}/${action}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    alert(`User has been ${action}ned successfully.`);
                    loadUsers();
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error(`Error during ${action}:`, error);
                alert(`Failed to ${action} user.`);
            }
        }
    };

    window.deleteUser = async (id) => {
        if (confirm('CRITICAL: Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    alert('User deleted successfully.');
                    loadUsers();
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user.');
            }
        }
    };

    window.editProduct = (id) => {
        // Redirect to a specialized admin edit page or open a modal
        // For now, let's alert that this requires the business context.
        alert('Product editing for admins is being refined. Using direct database ID: ' + id);
    };

    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to delete this product? This action is permanent.')) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    alert('Product deleted successfully.');
                    loadProducts();
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product.');
            }
        }
    };

    window.viewComplaint = (id) => {
        modalTitle.innerText = 'Review Complaint';
        modalBody.innerHTML = `<p>Loading complaint details for #${id}...</p>`;
        modalConfirmBtn.innerText = 'Mark as Resolved';
        modal.style.display = 'flex';
    };

    // Initial Load
    loadUsers();

    // Logout logic
    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };
});
