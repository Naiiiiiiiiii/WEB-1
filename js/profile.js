// File: js/profile.js 

import { UserManager } from './user.js'; 
const userManager = new UserManager(); 		// Tạo UserManager để tương tác với dữ liệu Users

let nguoiDungHienTai = null;

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    kiemTraDangNhap();
    khoiTaoSuKien();
});

// =========================================================
// CHỨC NĂNG CỐT LÕI (Đăng nhập, Hiển thị)
// =========================================================

// Kiểm tra đăng nhập (FIX: Không dùng matKhau để kiểm tra phiên)
function kiemTraDangNhap() {
    const duLieu = localStorage.getItem('nguoiDungHienTai');
    
    if (!duLieu) {
        // Không có dữ liệu đăng nhập -> Chuyển hướng
        window.location.href = 'index.html'; 
        return;
    }
    
    try {
        nguoiDungHienTai = JSON.parse(duLieu);
        
        // Chỉ cần kiểm tra tenDangNhap để xác định phiên hợp lệ
        if (!nguoiDungHienTai || !nguoiDungHienTai.tenDangNhap) {
            
            localStorage.removeItem('nguoiDungHienTai');
            window.location.href = 'index.html'; 
            return;
        }
        
        // Nếu đăng nhập hợp lệ, gọi hàm hiển thị thông tin
        hienThiThongTin();
        
        // THÊM DÒNG GỌI HÀM: Hiển thị lịch sử đơn hàng
        hienThiLichSuDonHang(); 
        
    } catch (e) {
        console.error('Lỗi đọc dữ liệu:', e);
        localStorage.removeItem('nguoiDungHienTai');
        window.location.href = 'index.html'; 
    }
}

// Hiển thị thông tin
function hienThiThongTin() {
    if (!nguoiDungHienTai) return;
    
    // Lấy thông tin đầy đủ từ UserManager (bao gồm mật khẩu)
    const userChiTiet = userManager.users.find(u => u.tenDangNhap === nguoiDungHienTai.tenDangNhap);

    // Cập nhật biến toàn cục với thông tin đầy đủ (quan trọng cho chức năng đổi mật khẩu)
    if (userChiTiet) {
        nguoiDungHienTai.matKhau = userChiTiet.matKhau; 
    }
    
    // Hiển thị thông tin cơ bản
    document.getElementById('hienThiHoTen').textContent = nguoiDungHienTai.hoTen || 'Chưa cập nhật';
    document.getElementById('hienThiTenDangNhap').textContent = nguoiDungHienTai.tenDangNhap || 'Chưa cập nhật';
    document.getElementById('hienThiEmail').textContent = nguoiDungHienTai.email || 'Chưa cập nhật';
    
    // Hiển thị thời gian đăng nhập
    if (nguoiDungHienTai.thoiGianDangNhap) {
        const thoiGian = new Date(nguoiDungHienTai.thoiGianDangNhap);
        const thoiGianFormat = formatThoiGian(thoiGian);
        document.getElementById('hienThiThoiGian').textContent = thoiGianFormat;
    } else {
        document.getElementById('hienThiThoiGian').textContent = 'Không có thông tin';
    }
}


// =========================================================
// CHỨC NĂNG: SỰ KIỆN CHUNG & ĐĂNG XUẤT
// =========================================================

// Khởi tạo sự kiện
function khoiTaoSuKien() {
    // Sự kiện sửa họ tên
    const nutSuaHoTen = document.getElementById('nutSuaHoTen');
    nutSuaHoTen.addEventListener('click', function() {
        suaThongTin('hoTen');
    });
    
    // Sự kiện sửa email
    const nutSuaEmail = document.getElementById('nutSuaEmail');
    nutSuaEmail.addEventListener('click', function() {
        suaThongTin('email');
    });
    
    // Sự kiện đổi mật khẩu
    document.getElementById('nutDoiMatKhau').addEventListener('click', hienFormDoiMatKhau);
    document.getElementById('nutLuuMatKhau').addEventListener('click', luuMatKhau);
    document.getElementById('nutHuyMatKhau').addEventListener('click', anFormDoiMatKhau);
    
    // Sự kiện show/hide password
    document.querySelectorAll('.hien-mat-khau').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Sự kiện đăng xuất
    document.getElementById('nutDangXuat').addEventListener('click', dangXuat);
}

// Sửa thông tin (họ tên hoặc email)
function suaThongTin(loai) {
    const spanId = loai === 'hoTen' ? 'hienThiHoTen' : 'hienThiEmail';
    const inputId = loai === 'hoTen' ? 'inputHoTen' : 'inputEmail';
    const nutId = loai === 'hoTen' ? 'nutSuaHoTen' : 'nutSuaEmail';
    const loiId = loai === 'hoTen' ? 'loiHoTen' : 'loiEmail';
    
    const span = document.getElementById(spanId);
    const input = document.getElementById(inputId);
    const nut = document.getElementById(nutId);
    
    // Nếu đang ở chế độ sửa -> Lưu
    if (input.style.display !== 'none') {
        const giaTriMoi = input.value.trim();
        
        // Validation
        if (loai === 'hoTen') {
            if (!giaTriMoi || giaTriMoi.length < 2) {
                hienLoi(loiId, 'Họ tên phải có ít nhất 2 ký tự');
                return;
            }
        } else if (loai === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
            if (!giaTriMoi || !emailPattern.test(giaTriMoi)) {
                hienLoi(loiId, 'Email không đúng định dạng');
                return;
            }
            //  Kiểm tra trùng Email
            if (userManager.tonTaiEmail(giaTriMoi) && nguoiDungHienTai.email !== giaTriMoi) {
                hienLoi(loiId, 'Email này đã được sử dụng bởi tài khoản khác.');
                return;
            }
        }
        
        // Cập nhật thông tin trên biến
        nguoiDungHienTai[loai] = giaTriMoi;
        
        // Cập nhật thông tin vào danh sách users CHÍNH (userManager)
        userManager.capNhatUser(nguoiDungHienTai);
        
        // Lưu thông tin phiên hiện tại (nguoiDungHienTai)
        // Ta chỉ cần cập nhật hoTen và email trong key phiên.
        const currentSession = JSON.parse(localStorage.getItem('nguoiDungHienTai'));
        currentSession[loai] = giaTriMoi;
        localStorage.setItem('nguoiDungHienTai', JSON.stringify(currentSession));


        // Hiển thị lại span
        span.textContent = giaTriMoi;
        span.style.display = 'block';
        input.style.display = 'none';
        
        // Đổi nút về "Sửa"
        nut.innerHTML = '<i class="fas fa-edit"></i> Sửa';
        nut.classList.remove('dang-sua');
        
        // Xóa lỗi
        xoaLoi(loiId);
        
        // Thông báo thành công
        alert(`Cập nhật ${loai === 'hoTen' ? 'họ tên' : 'email'} thành công!`);
    } 
    
    else {
        input.value = span.textContent;
        span.style.display = 'none';
        input.style.display = 'block';
        input.focus();
        
        // Đổi nút thành "Lưu"
        nut.innerHTML = '<i class="fas fa-save"></i> Lưu';
        nut.classList.add('dang-sua');
        
        // Xóa lỗi cũ
        xoaLoi(loiId);
    }
}

// Hiện form đổi mật khẩu
function hienFormDoiMatKhau() {
    const form = document.getElementById('formDoiMatKhau');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
    
    // Reset form
    document.getElementById('matKhauCu').value = '';
    document.getElementById('matKhauMoi').value = '';
    document.getElementById('xacNhanMatKhauMoi').value = '';
    xoaTatCaLoiMatKhau();
}

// Ẩn form đổi mật khẩu
function anFormDoiMatKhau() {
    document.getElementById('formDoiMatKhau').style.display = 'none';
    document.getElementById('matKhauCu').value = '';
    document.getElementById('matKhauMoi').value = '';
    document.getElementById('xacNhanMatKhauMoi').value = '';
    xoaTatCaLoiMatKhau();
}

// Lưu mật khẩu mới
function luuMatKhau() {
    const matKhauCu = document.getElementById('matKhauCu').value;
    const matKhauMoi = document.getElementById('matKhauMoi').value;
    const xacNhan = document.getElementById('xacNhanMatKhauMoi').value;
    
    let hopLe = true;
    
    // Xóa lỗi cũ
    xoaTatCaLoiMatKhau();
    
    // Kiểm tra mật khẩu cũ
    if (!matKhauCu) {
        hienLoi('loiMatKhauCu', 'Vui lòng nhập mật khẩu hiện tại');
        hopLe = false;
    } else if (matKhauCu !== nguoiDungHienTai.matKhau) { // So sánh với matKhau đã được tải từ userManager
        hienLoi('loiMatKhauCu', 'Mật khẩu hiện tại không đúng');
        hopLe = false;
    }
    
    // Kiểm tra mật khẩu mới
    if (!matKhauMoi) {
        hienLoi('loiMatKhauMoi', 'Vui lòng nhập mật khẩu mới');
        hopLe = false;
    } else if (matKhauMoi.length < 6) {
        hienLoi('loiMatKhauMoi', 'Mật khẩu phải có ít nhất 6 ký tự');
        hopLe = false;
    } else if (matKhauMoi === matKhauCu) {
        hienLoi('loiMatKhauMoi', 'Mật khẩu mới phải khác mật khẩu cũ');
        hopLe = false;
    }
    
    // Kiểm tra xác nhận mật khẩu
    if (!xacNhan) {
        hienLoi('loiXacNhanMatKhauMoi', 'Vui lòng xác nhận mật khẩu mới');
        hopLe = false;
    } else if (matKhauMoi !== xacNhan) {
        hienLoi('loiXacNhanMatKhauMoi', 'Mật khẩu xác nhận không khớp');
        hopLe = false;
    }
    
    if (hopLe) {
        // Cập nhật mật khẩu trên biến toàn cục
        nguoiDungHienTai.matKhau = matKhauMoi;
        
        // Cập nhật mật khẩu vào danh sách users CHÍNH (userManager)
        userManager.capNhatUser(nguoiDungHienTai);
        
        // Lưu thông tin phiên hiện tại (nguoiDungHienTai) - 

        alert('Đổi mật khẩu thành công!');
        anFormDoiMatKhau();
    }
}


// Đăng xuất
function dangXuat() {
    const xacNhan = confirm('Bạn có chắc chắn muốn đăng xuất?');
    
    if (xacNhan) {
        //  Xóa session và chuyển hướng ngay lập tức
        localStorage.removeItem('nguoiDungHienTai'); 
        
        window.location.href = 'index.html'; 
        return; 
    }
}

// =========================================================
// CHỨC NĂNG: LỊCH SỬ ĐƠN HÀNG VÀ HỦY ĐƠN
// =========================================================

/**
 * Hiển thị lịch sử đơn hàng của người dùng hiện tại
 */
function hienThiLichSuDonHang() {
    if (!nguoiDungHienTai) return;

    // 1. Lấy danh sách đơn hàng chi tiết từ UserManager
    const orders = userManager.getOrderHistory(nguoiDungHienTai.tenDangNhap);

    const container = document.getElementById('lichSuDonHangContainer');
    if (!container) return;
    
    // Sắp xếp đơn hàng theo ngày giảm dần (đơn mới nhất lên đầu)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = ''; // Xóa nội dung cũ

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-center">Bạn chưa có đơn hàng nào.</p>';
        return;
    }
    
    // 2. Tạo HTML cho từng đơn hàng
    orders.forEach(order => {
        const orderHTML = `
            <div class="don-hang-item trang-thai-${order.status}">
                <div class="don-hang-header">
                    <span class="ma-don">Mã đơn: #${order.id}</span>
                    <span class="ngay-dat"><i class="fas fa-clock"></i> ${formatThoiGian(new Date(order.date))}</span>
                    <span class="trang-thai trang-thai-${order.status}">${formatTrangThai(order.status)}</span>
                </div>
                <div class="don-hang-body">
                    ${order.items.map(item => `
                        <p class="san-pham">
                            <span class="ten-sp">${item.name}</span> 
                            (Size: ${item.size || 'N/A'}, SL: ${item.quantity}) - 
                            <strong class="gia-sp">${formatTien(item.price * item.quantity)}</strong>
                        </p>
                    `).join('')}
                    <p class="tong-cong">Thành tiền: <strong>${formatTien(order.total)}</strong></p>
                </div>
                <div class="don-hang-footer">
                    ${order.status === 'new' ? 
                        `<button class="nut-huy-don" data-order-id="${order.id}">Hủy đơn hàng</button>` : 
                        `<button class="nut-huy-don da-huy" disabled>Đã ${formatTrangThai(order.status)}</button>`
                    }
                </div>
            </div>
        `;
        container.innerHTML += orderHTML;
    });
    
    // 3. Khởi tạo sự kiện hủy đơn (sau khi HTML đã được chèn)
    khoiTaoSuKienHuyDon();
}

/**
 * Khởi tạo sự kiện cho các nút Hủy đơn hàng
 */
function khoiTaoSuKienHuyDon() {
    document.querySelectorAll('.nut-huy-don:not(.da-huy)').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`)) {
                
                // Gọi phương thức hủy đơn hàng từ UserManager
                const success = userManager.cancelOrder(nguoiDungHienTai.tenDangNhap, orderId);
                
                if (success) {
                    alert(`Đơn hàng #${orderId} đã được hủy thành công!`);
                    // Tải lại danh sách đơn hàng sau khi hủy
                    hienThiLichSuDonHang(); 
                } else {
                    alert(`Lỗi: Không thể hủy đơn hàng #${orderId}. Chỉ có thể hủy đơn hàng 'Mới đặt'.`);
                }
            }
        });
    });
}


// =========================================================
// UTILITY FUNCTIONS (Hàm hỗ trợ)
// =========================================================

// Format thời gian
function formatThoiGian(date) {
    const ngay = date.getDate().toString().padStart(2, '0');
    const thang = (date.getMonth() + 1).toString().padStart(2, '0');
    const nam = date.getFullYear();
    const gio = date.getHours().toString().padStart(2, '0');
    const phut = date.getMinutes().toString().padStart(2, '0');
    
    return `${ngay}/${thang}/${nam} lúc ${gio}:${phut}`;
}

/**
 * Chuyển trạng thái đơn hàng sang tiếng Việt
 */
function formatTrangThai(status) {
    switch (status) {
        case 'new': return 'Mới đặt';
        case 'processing': return 'Đang xử lý';
        case 'shipped': return 'Đang vận chuyển';
        case 'delivered': return 'Đã giao';
        case 'canceled': return 'Đã hủy';
        default: return 'Không rõ';
    }
}

/**
 * Định dạng tiền tệ VND
 */
function formatTien(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

// Utility functions cho thông báo lỗi
function hienLoi(id, msg) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.classList.add('hien');
    }
}

function xoaLoi(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hien');
    }
}

function xoaTatCaLoiMatKhau() {
    xoaLoi('loiMatKhauCu');
    xoaLoi('loiMatKhauMoi');
    xoaLoi('loiXacNhanMatKhauMoi');
}