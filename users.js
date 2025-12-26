const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://market-place-q0q5.onrender.com/api';

const usersGrid = document.getElementById('usersGrid');

async function loadUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            renderUsers(data.data);
        } else {
            usersGrid.innerHTML = `<tr><td colspan="5" class="error">${data.error}</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersGrid.innerHTML = '<tr><td colspan="5" class="error">Failed to load users.</td></tr>';
    }
}

function renderUsers(users) {
    if (users.length === 0) {
        usersGrid.innerHTML = '<tr><td colspan="5" class="loader">No users found.</td></tr>';
        return;
    }

    usersGrid.innerHTML = users.map(user => `
        <tr>
            <td>${user.businessName || 'N/A'}</td>
            <td>${user.ownerName || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.location || 'N/A'}</td>
            <td>${user.contactInfo || 'N/A'}</td>
            <td><span class="badge ${user.isBanned ? 'badge-danger' : 'badge-success'}">${user.isBanned ? 'Banned' : 'Active'}</span></td>
            <td>
                <div class="actions">
                    <button class="btn-ban" title="${user.isBanned ? 'Unban' : 'Ban'}" onclick="toggleBan('${user._id}', ${user.isBanned})">
                        <i class="fas ${user.isBanned ? 'fa-user-check' : 'fa-user-slash'}"></i>
                    </button>
                    <button class="btn-delete" title="Delete" onclick="deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

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

// Add styles if not present (inline for quick fix if style.css is too large)
const style = document.createElement('style');
style.textContent = `
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-ban { color: #f59e0b; cursor: pointer; border: none; background: transparent; }
    .btn-delete { color: #f43f5e; cursor: pointer; border: none; background: transparent; }
`;
document.head.appendChild(style);

window.addEventListener('DOMContentLoaded', loadUsers);
