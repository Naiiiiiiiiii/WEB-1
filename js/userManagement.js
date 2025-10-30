import { UserManager } from './user.js';


document.addEventListener('DOMContentLoaded', () => {

    const userManager = new UserManager();

    function updateSoLuongTaiKhoan() {
        const accountCount = document.getElementById('countAccount');
        if (accountCount) {
            accountCount.textContent = `Số tài khoản hiện có: ${userManager.users.length}`;
        }
    }

    // -------------------------------------------------------------
    // CẬP NHẬT HÀM HIỂN THỊ DANH SÁCH USER
    // -------------------------------------------------------------
    function hienThiDanhSachUser() {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        userManager.users.forEach((user, index) => {
            // Đếm số lượng đơn hàng (giả sử mỗi user có một mảng 'orders')
            const orderCount = (user.orders && user.orders.length) || 0; 
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.hoTen}</td>
                <td>${user.tenDangNhap}</td>
                <td>${user.email}</td>
                <td>${orderCount}</td>
                <td>
                    <button class="btn-view-orders" data-username="${user.tenDangNhap}">Xem đơn hàng (${orderCount})</button>
                    <button class="btn-reset" data-index="${index}">Reset MK</button>
                    <button class="btn-delete" data-index="${index}">Xóa</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        ganSuKienNut();
    }

    // -------------------------------------------------------------
    // CẬP NHẬT GÁN SỰ KIỆN NÚT
    // -------------------------------------------------------------
    function ganSuKienNut() {
        const resetBtns = document.querySelectorAll('.btn-reset');
        const deleteBtns = document.querySelectorAll('.btn-delete');
        const viewOrderBtns = document.querySelectorAll('.btn-view-orders'); // NÚT MỚI

        resetBtns.forEach(btn => btn.addEventListener('click', () => {
            resetMatKhau(btn.getAttribute('data-index'));
        }));

        deleteBtns.forEach(btn => btn.addEventListener('click', () => {
            xoaTaiKhoan(btn.getAttribute('data-index'));
        }));

        // GÁN SỰ KIỆN CHO NÚT XEM ĐƠN HÀNG
        viewOrderBtns.forEach(btn => btn.addEventListener('click', () => {
            hienThiDonHangCuaUser(btn.getAttribute('data-username'));
        }));
    }

    // -------------------------------------------------------------
    // HÀM HIỂN THỊ ĐƠN HÀNG CHO ADMIN
    // -------------------------------------------------------------
    function hienThiDonHangCuaUser(username) {
        const user = userManager.users.find(u => u.tenDangNhap === username);
        if (!user) {
            alert(`Không tìm thấy người dùng: ${username}`);
            return;
        }

        const orders = user.orders || [];

        let orderListHtml = `<h3 style="margin-bottom: 15px;">Lịch sử đơn hàng của: ${user.hoTen} (${username})</h3>`;
        
        if (orders.length === 0) {
            orderListHtml += `<p class="alert alert-info">Người dùng này chưa có đơn hàng nào.</p>`;
        } else {
            // Bắt đầu tạo bảng/danh sách đơn hàng
            orders.forEach(order => {
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                orderListHtml += `
                    <div class="admin-order-card">
                        <p><strong>Mã Đơn: #${order.id}</strong> - <span style="color: blue;">${order.status}</span></p>
                        <p>Ngày đặt: ${new Date(order.date).toLocaleString('vi-VN')}</p>
                        <p>Số lượng sản phẩm: ${totalItems}</p>
                        <p>Tổng tiền: <strong>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</strong></p>
                        
                        <div class="admin-order-details" style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 10px;">
                            <p style="font-weight: bold;">Chi tiết (${order.items.length} mặt hàng):</p>
                            <ul>
                                ${order.items.map(item => `
                                    <li>${item.name} (${item.size}) x ${item.quantity} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            });
        }
        
        // Hiện thông tin bằng alert hoặc ) là một modal Admin riêng
        // Tạm dùng alert/console log cho đơn giản:
        console.log(`Lịch sử đơn hàng của ${username}:`, orders);
        alert(`Kiểm tra console (F12) để xem chi tiết đơn hàng của ${username}.`);
        
        
    }

    function resetMatKhau(index) {
        if (!confirm("Bạn có muốn reset mật khẩu?")) return;

        userManager.users[index].matKhau = "123456";
        userManager.luuDanhSachUser();
        alert("Mật khẩu đã được reset thành 123456");
    }

    function xoaTaiKhoan(index) {
        if (!confirm("Bạn có muốn xóa người dùng này?")) return;

        userManager.users.splice(index, 1);
        userManager.luuDanhSachUser();
        hienThiDanhSachUser();
        updateSoLuongTaiKhoan();
        alert("Xóa tài khoản thành công!");
    }

    // Khởi tạo
    updateSoLuongTaiKhoan();
    hienThiDanhSachUser();
});