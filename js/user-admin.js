// File: js/user-admin.js (Quản lý Tài khoản Khách hàng)
import { userManager, DOM, updateGeneralStats } from './admin.js';

// =========================================================
// HÀM QUẢN LÝ TÀI KHOẢN
// =========================================================

/** Hiển thị danh sách tài khoản */
export function renderUserList() {
    if (!DOM.userTableBody) return;
    DOM.userTableBody.innerHTML = '';
    const users = userManager.getAllUsers();

    users.forEach(user => {
        // Chỉ hiện thị tài khoản không phải Admin (admin không tự khóa/reset)
        if (user.tenDangNhap === 'admin') return; 

        const totalOrders = user.orders ? user.orders.length : 0;
        const isLocked = user.isLocked;
        const statusText = isLocked ? 'ĐÃ KHÓA' : 'Hoạt động';
        const statusClass = isLocked ? 'status-locked' : 'status-active';

        const rowHTML = `
            <td>${user.hoTen}</td>
            <td>${user.tenDangNhap}</td>
            <td>${user.email}</td>
            <td>${totalOrders}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-reset" data-username="${user.tenDangNhap}">Reset MK</button>
                <button class="${isLocked ? 'btn-unlock' : 'btn-lock'}" data-username="${user.tenDangNhap}">
                    ${isLocked ? 'Mở khóa' : 'Khóa TK'}
                </button>
            </td>
        `;
        const row = document.createElement('tr');
        row.innerHTML = rowHTML;
        DOM.userTableBody.appendChild(row);
    });
}

/** Gán sự kiện cho các nút Reset/Khóa/Mở khóa */
export function setupUserAdminEventListeners() {
    // Xóa listener cũ trước khi thêm listener mới
    DOM.userTableBody.querySelectorAll('.btn-reset').forEach(btn => {
        btn.removeEventListener('click', handleResetPassword);
        btn.addEventListener('click', handleResetPassword);
    });

    DOM.userTableBody.querySelectorAll('.btn-lock').forEach(btn => {
        btn.removeEventListener('click', handleLockUser);
        btn.addEventListener('click', handleLockUser);
    });

    DOM.userTableBody.querySelectorAll('.btn-unlock').forEach(btn => {
        btn.removeEventListener('click', handleUnlockUser);
        btn.addEventListener('click', handleUnlockUser);
    });
}

/** Xử lý reset mật khẩu */
function handleResetPassword(e) {
    e.preventDefault();
    const username = e.currentTarget.dataset.username;
    if (!confirm(`Bạn có muốn reset mật khẩu tài khoản ${username} về 123456?`)) return;
    const success = userManager.resetPassword(username);
    if (success) {
        alert(`Mật khẩu của tài khoản ${username} đã được reset thành 123456`);
        renderUserList();
    } else {
        alert("Lỗi: Không tìm thấy tài khoản để reset.");
    }
}

/** Xử lý khóa tài khoản */
function handleLockUser(e) {
    e.preventDefault();
    const username = e.currentTarget.dataset.username;
    updateUserStatus(username, true); // Khóa
}

/** Xử lý mở khóa tài khoản */
function handleUnlockUser(e) {
    e.preventDefault();
    const username = e.currentTarget.dataset.username;
    updateUserStatus(username, false); // Mở khóa
}

/** Xử lý khóa/mở khóa tài khoản */
function updateUserStatus(username, isLocked) {
    const action = isLocked ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có muốn ${action} tài khoản ${username}?`)) return;

    const success = userManager.updateUserStatus(username, isLocked);

    if (success) {
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản ${username} thành công!`);
        renderUserList();
        updateGeneralStats(); // Cập nhật số liệu chung 
    } else {
        alert("Lỗi: Không thể thực hiện hành động này.");
    }
}