

import { UserManager } from './user.js'; 
const userManager = new UserManager();

let nguoiDungHienTai = null;

document.addEventListener('DOMContentLoaded', function() {
    kiemTraDangNhap();
    khoiTaoSuKien();
});

function kiemTraDangNhap() {
    const duLieu = localStorage.getItem('nguoiDungHienTai');
    
    if (!duLieu) {

        window.location.href = 'index.html'; 
        return;
    }
    
    try {
        nguoiDungHienTai = JSON.parse(duLieu);
        

        if (!nguoiDungHienTai || !nguoiDungHienTai.tenDangNhap) {
            
            localStorage.removeItem('nguoiDungHienTai');
            window.location.href = 'index.html'; 
            return;
        }
        

        hienThiThongTin();
        

        hienThiLichSuDonHang(); 
        
    } catch (e) {
        console.error('Lỗi đọc dữ liệu:', e);
        localStorage.removeItem('nguoiDungHienTai');
        window.location.href = 'index.html'; 
    }
}

function hienThiThongTin() {
    if (!nguoiDungHienTai) return;
    

    const userChiTiet = userManager.users.find(u => u.tenDangNhap === nguoiDungHienTai.tenDangNhap);

    if (userChiTiet) {
        nguoiDungHienTai.matKhau = userChiTiet.matKhau; 
    }
    

    document.getElementById('hienThiHoTen').textContent = nguoiDungHienTai.hoTen || 'Chưa cập nhật';
    document.getElementById('hienThiTenDangNhap').textContent = nguoiDungHienTai.tenDangNhap || 'Chưa cập nhật';
    document.getElementById('hienThiEmail').textContent = nguoiDungHienTai.email || 'Chưa cập nhật';
    

    if (nguoiDungHienTai.thoiGianDangNhap) {
        const thoiGian = new Date(nguoiDungHienTai.thoiGianDangNhap);
        const thoiGianFormat = formatThoiGian(thoiGian);
        document.getElementById('hienThiThoiGian').textContent = thoiGianFormat;
    } else {
        document.getElementById('hienThiThoiGian').textContent = 'Không có thông tin';
    }
}

function khoiTaoSuKien() {

    const nutSuaHoTen = document.getElementById('nutSuaHoTen');
    nutSuaHoTen.addEventListener('click', function() {
        suaThongTin('hoTen');
    });
    

    const nutSuaEmail = document.getElementById('nutSuaEmail');
    nutSuaEmail.addEventListener('click', function() {
        suaThongTin('email');
    });
    

    document.getElementById('nutDoiMatKhau').addEventListener('click', hienFormDoiMatKhau);
    document.getElementById('nutLuuMatKhau').addEventListener('click', luuMatKhau);
    document.getElementById('nutHuyMatKhau').addEventListener('click', anFormDoiMatKhau);
    

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
    

    document.getElementById('nutDangXuat').addEventListener('click', dangXuat);
}

function suaThongTin(loai) {
    const spanId = loai === 'hoTen' ? 'hienThiHoTen' : 'hienThiEmail';
    const inputId = loai === 'hoTen' ? 'inputHoTen' : 'inputEmail';
    const nutId = loai === 'hoTen' ? 'nutSuaHoTen' : 'nutSuaEmail';
    const loiId = loai === 'hoTen' ? 'loiHoTen' : 'loiEmail';
    
    const span = document.getElementById(spanId);
    const input = document.getElementById(inputId);
    const nut = document.getElementById(nutId);
    

    if (input.style.display !== 'none') {
        const giaTriMoi = input.value.trim();
        

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

            if (userManager.tonTaiEmail(giaTriMoi) && nguoiDungHienTai.email !== giaTriMoi) {
                hienLoi(loiId, 'Email này đã được sử dụng bởi tài khoản khác.');
                return;
            }
        }
        

        nguoiDungHienTai[loai] = giaTriMoi;
        

        userManager.capNhatUser(nguoiDungHienTai);
        

        const currentSession = JSON.parse(localStorage.getItem('nguoiDungHienTai'));
        currentSession[loai] = giaTriMoi;
        localStorage.setItem('nguoiDungHienTai', JSON.stringify(currentSession));

        span.textContent = giaTriMoi;
        span.style.display = 'block';
        input.style.display = 'none';
        

        nut.innerHTML = '<i class="fas fa-edit"></i> Sửa';
        nut.classList.remove('dang-sua');
        

        xoaLoi(loiId);
        

        alert(`Cập nhật ${loai === 'hoTen' ? 'họ tên' : 'email'} thành công!`);
    } 
    
    else {
        input.value = span.textContent;
        span.style.display = 'none';
        input.style.display = 'block';
        input.focus();
        

        nut.innerHTML = '<i class="fas fa-save"></i> Lưu';
        nut.classList.add('dang-sua');
        

        xoaLoi(loiId);
    }
}

function hienFormDoiMatKhau() {
    const form = document.getElementById('formDoiMatKhau');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
    

    document.getElementById('matKhauCu').value = '';
    document.getElementById('matKhauMoi').value = '';
    document.getElementById('xacNhanMatKhauMoi').value = '';
    xoaTatCaLoiMatKhau();
}

function anFormDoiMatKhau() {
    document.getElementById('formDoiMatKhau').style.display = 'none';
    document.getElementById('matKhauCu').value = '';
    document.getElementById('matKhauMoi').value = '';
    document.getElementById('xacNhanMatKhauMoi').value = '';
    xoaTatCaLoiMatKhau();
}

function luuMatKhau() {
    const matKhauCu = document.getElementById('matKhauCu').value;
    const matKhauMoi = document.getElementById('matKhauMoi').value;
    const xacNhan = document.getElementById('xacNhanMatKhauMoi').value;
    
    let hopLe = true;
    

    xoaTatCaLoiMatKhau();
    

    if (!matKhauCu) {
        hienLoi('loiMatKhauCu', 'Vui lòng nhập mật khẩu hiện tại');
        hopLe = false;
    } else if (matKhauCu !== nguoiDungHienTai.matKhau) {
        hienLoi('loiMatKhauCu', 'Mật khẩu hiện tại không đúng');
        hopLe = false;
    }
    

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
    

    if (!xacNhan) {
        hienLoi('loiXacNhanMatKhauMoi', 'Vui lòng xác nhận mật khẩu mới');
        hopLe = false;
    } else if (matKhauMoi !== xacNhan) {
        hienLoi('loiXacNhanMatKhauMoi', 'Mật khẩu xác nhận không khớp');
        hopLe = false;
    }
    
    if (hopLe) {

        nguoiDungHienTai.matKhau = matKhauMoi;
        

        userManager.capNhatUser(nguoiDungHienTai);
        

        alert('Đổi mật khẩu thành công!');
        anFormDoiMatKhau();
    }
}

function dangXuat() {
    const xacNhan = confirm('Bạn có chắc chắn muốn đăng xuất?');
    
    if (xacNhan) {

        localStorage.removeItem('nguoiDungHienTai'); 
        
        window.location.href = 'index.html'; 
        return; 
    }
}

function hienThiLichSuDonHang() {
    if (!nguoiDungHienTai) return;

    const orders = userManager.getOrderHistory(nguoiDungHienTai.tenDangNhap);

    const container = document.getElementById('lichSuDonHangContainer');
    if (!container) return;
    

    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-center">Bạn chưa có đơn hàng nào.</p>';
        return;
    }
    

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
    

    khoiTaoSuKienHuyDon();
}

function khoiTaoSuKienHuyDon() {
    document.querySelectorAll('.nut-huy-don:not(.da-huy)').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`)) {
                

                const success = userManager.cancelOrder(nguoiDungHienTai.tenDangNhap, orderId);
                
                if (success) {
                    alert(`Đơn hàng #${orderId} đã được hủy thành công!`);

                    hienThiLichSuDonHang(); 
                } else {
                    alert(`Lỗi: Không thể hủy đơn hàng #${orderId}. Chỉ có thể hủy đơn hàng 'Mới đặt'.`);
                }
            }
        });
    });
}

function formatThoiGian(date) {
    const ngay = date.getDate().toString().padStart(2, '0');
    const thang = (date.getMonth() + 1).toString().padStart(2, '0');
    const nam = date.getFullYear();
    const gio = date.getHours().toString().padStart(2, '0');
    const phut = date.getMinutes().toString().padStart(2, '0');
    
    return `${ngay}/${thang}/${nam} lúc ${gio}:${phut}`;
}

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

function formatTien(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

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