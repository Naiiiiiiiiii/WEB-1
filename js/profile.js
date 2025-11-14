import { UserManager } from './user.js';

const userManager = new UserManager();
let nguoiDungHienTai = null;

document.addEventListener('DOMContentLoaded', function() {
  kiemTraDangNhap();
  khoiTaoSuKien();
  khoiTaoRangBuocSDT_DiaChi();
});

function kiemTraDangNhap() {
  const getCurrent = typeof window.kiemTraDangNhap === 'function' ? window.kiemTraDangNhap : null;
  const user = getCurrent ? getCurrent() : null;

  if (!user || !user.tenDangNhap) {
    window.location.href = 'index.html';
    return;
  }

  nguoiDungHienTai = user;
  hienThiThongTin();
  hienThiLichSuDonHang();
}

function hienThiThongTin() {
  if (!nguoiDungHienTai) return;

  const hoTenEl = document.getElementById('hienThiHoTen');
  const tenDnEl = document.getElementById('hienThiTenDangNhap');
  const emailEl = document.getElementById('hienThiEmail');
  const timeEl = document.getElementById('hienThiThoiGian');

  if (hoTenEl) hoTenEl.textContent = nguoiDungHienTai.hoTen || 'Chưa cập nhật';
  if (tenDnEl) tenDnEl.textContent = nguoiDungHienTai.tenDangNhap || 'Chưa cập nhật';
  if (emailEl) emailEl.textContent = nguoiDungHienTai.email || 'Chưa cập nhật';

  if (timeEl) {
    if (nguoiDungHienTai.thoiGianDangNhap) {
      const thoiGian = new Date(nguoiDungHienTai.thoiGianDangNhap);
      timeEl.textContent = formatThoiGian(thoiGian);
    } else {
      timeEl.textContent = 'Không có thông tin';
    }
  }

  const sdtEl = document.getElementById('inputSoDienThoai');
  const addrEl = document.getElementById('inputDiaChiMacDinh');
  if (sdtEl) sdtEl.value = nguoiDungHienTai.soDienThoai || '';
  if (addrEl) addrEl.value = nguoiDungHienTai.diaChiMacDinh || '';
}

function khoiTaoSuKien() {
  const nutSuaHoTen = document.getElementById('nutSuaHoTen');
  if (nutSuaHoTen) {
    nutSuaHoTen.addEventListener('click', function() {
      suaThongTin('hoTen');
    });
  }

  const nutSuaEmail = document.getElementById('nutSuaEmail');
  if (nutSuaEmail) {
    nutSuaEmail.addEventListener('click', function() {
      suaThongTin('email');
    });
  }

  const nutDoi = document.getElementById('nutDoiMatKhau');
  const nutLuu = document.getElementById('nutLuuMatKhau');
  const nutHuy = document.getElementById('nutHuyMatKhau');
  if (nutDoi) nutDoi.addEventListener('click', hienFormDoiMatKhau);
  if (nutLuu) nutLuu.addEventListener('click', luuMatKhau);
  if (nutHuy) nutHuy.addEventListener('click', anFormDoiMatKhau);

  document.querySelectorAll('.hien-mat-khau').forEach(icon => {
    icon.addEventListener('click', function() {
      const input = document.getElementById(this.getAttribute('data-target'));
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        this.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  const nutDangXuat = document.getElementById('nutDangXuat');
  if (nutDangXuat) {
    nutDangXuat.addEventListener('click', dangXuat);
  }
}

function suaThongTin(loai) {
  const spanId = loai === 'hoTen' ? 'hienThiHoTen' : 'hienThiEmail';
  const inputId = loai === 'hoTen' ? 'inputHoTen' : 'inputEmail';
  const nutId = loai === 'hoTen' ? 'nutSuaHoTen' : 'nutSuaEmail';
  const loiId = loai === 'hoTen' ? 'loiHoTen' : 'loiEmail';

  const span = document.getElementById(spanId);
  const input = document.getElementById(inputId);
  const nut = document.getElementById(nutId);

  if (!span || !input || !nut) return;

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
    if (currentSession) {
      currentSession[loai] = giaTriMoi;
      localStorage.setItem('nguoiDungHienTai', JSON.stringify(currentSession));
    }

    span.textContent = giaTriMoi;
    span.style.display = 'block';
    input.style.display = 'none';

    nut.innerHTML = '<i class="fas fa-edit"></i> Sửa';
    nut.classList.remove('dang-sua');

    xoaLoi(loiId);
    alert(`Cập nhật ${loai === 'hoTen' ? 'họ tên' : 'email'} thành công!`);
  } else {
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
  if (!form) return;
  if (form.style.display === 'none' || form.style.display === '') {
    form.style.display = 'block';
  } else {
    form.style.display = 'none';
  }
  const ids = ['matKhauCu', 'matKhauMoi', 'xacNhanMatKhauMoi'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  xoaTatCaLoiMatKhau();
}

function anFormDoiMatKhau() {
  const form = document.getElementById('formDoiMatKhau');
  if (form) form.style.display = 'none';
  const ids = ['matKhauCu', 'matKhauMoi', 'xacNhanMatKhauMoi'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  xoaTatCaLoiMatKhau();
}

function luuMatKhau() {
  if (!nguoiDungHienTai) return;
  const matKhauCu = document.getElementById('matKhauCu')?.value || '';
  const matKhauMoi = document.getElementById('matKhauMoi')?.value || '';
  const xacNhan = document.getElementById('xacNhanMatKhauMoi')?.value || '';

  let hopLe = true;
  xoaTatCaLoiMatKhau();

  const full = userManager.users.find(u => u.tenDangNhap === nguoiDungHienTai.tenDangNhap);
  const mkHienTai = full ? full.matKhau : '';

  if (!matKhauCu) {
    hienLoi('loiMatKhauCu', 'Vui lòng nhập mật khẩu hiện tại');
    hopLe = false;
  } else if (matKhauCu !== mkHienTai) {
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
    const update = {
      ...full,
      matKhau: matKhauMoi
    };
    userManager.capNhatUser(update);
    alert('Đổi mật khẩu thành công!');
    anFormDoiMatKhau();
  }
}

function dangXuat() {
  const xacNhan = confirm('Bạn có chắc chắn muốn đăng xuất?');
  if (xacNhan) {
    localStorage.removeItem('nguoiDungHienTai');
    window.location.href = 'index.html';
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
          ${(order.items || []).map(item => `
            <p class="san-pham">
              <span class="ten-sp">${item.name || item.title || 'Sản phẩm'}</span>
              (Size: ${item.size || 'N/A'}, SL: ${item.quantity || 1}) -
              <strong class="gia-sp">${formatTien((item.price || 0) * (item.quantity || 1))}</strong>
            </p>
          `).join('')}
          <p class="tong-cong">Thành tiền: <strong>${formatTien(order.total || 0)}</strong></p>
        </div>
        <div class="don-hang-footer">
          ${order.status === 'new'
            ? `<button class="nut-huy-don" data-order-id="${order.id}">Hủy đơn hàng</button>`
            : `<button class="nut-huy-don da-huy" disabled>Đã ${formatTrangThai(order.status)}</button>`
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
        if (typeof userManager.cancelOrder === 'function') {
          const success = userManager.cancelOrder(nguoiDungHienTai.tenDangNhap, orderId);
          if (success) {
            alert(`Đơn hàng #${orderId} đã được hủy thành công!`);
            hienThiLichSuDonHang();
          } else {
            alert(`Lỗi: Không thể hủy đơn hàng #${orderId}. Chỉ có thể hủy đơn hàng 'Mới đặt'.`);
          }
        } else {
          alert('Chức năng hủy đơn hàng chưa được hỗ trợ.');
        }
      }
    });
  });
}

function khoiTaoRangBuocSDT_DiaChi() {
  const sdtEl = document.getElementById('inputSoDienThoai');
  const addrEl = document.getElementById('inputDiaChiMacDinh');
  const btnSaveSdt = document.getElementById('nutLuuSoDienThoai');
  const btnSaveAddr = document.getElementById('nutLuuDiaChiMacDinh');

  const gcSdt = document.getElementById('loiSoDienThoai');
  const gcAddr = document.getElementById('loiDiaChiMacDinh');

  const validatePhone = (val) => /^0\d{9}$/.test((val || '').trim());
  const validateAddress = (val) => (val || '').trim().length >= 5;

  if (btnSaveSdt && sdtEl) {
    btnSaveSdt.addEventListener('click', () => {
      const value = sdtEl.value.trim();
      if (!validatePhone(value)) {
        if (gcSdt) {
          gcSdt.textContent = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).';
          gcSdt.classList.add('hien');
        }
        sdtEl.classList.add('input-loi');
        sdtEl.focus();
        return;
      }
      if (gcSdt) gcSdt.classList.remove('hien');
      sdtEl.classList.remove('input-loi');

      const ok = userManager.capNhatSoDienThoai(nguoiDungHienTai.tenDangNhap, value);
      if (ok) {
        alert('Đã lưu số điện thoại.');
        nguoiDungHienTai.soDienThoai = value;
      } else {
        alert('Lỗi: Không thể lưu số điện thoại.');
      }
    });
  }

  if (btnSaveAddr && addrEl) {
    btnSaveAddr.addEventListener('click', () => {
      const value = addrEl.value.trim();
      if (!validateAddress(value)) {
        if (gcAddr) {
          gcAddr.textContent = 'Vui lòng nhập địa chỉ tối thiểu 5 ký tự.';
          gcAddr.classList.add('hien');
        }
        addrEl.classList.add('input-loi');
        addrEl.focus();
        return;
      }
      if (gcAddr) gcAddr.classList.remove('hien');
      addrEl.classList.remove('input-loi');

      const ok = userManager.capNhatDiaChiMacDinh(nguoiDungHienTai.tenDangNhap, value);
      if (ok) {
        alert('Đã lưu địa chỉ mặc định.');
        nguoiDungHienTai.diaChiMacDinh = value;
      } else {
        alert('Lỗi: Không thể lưu địa chỉ.');
      }
    });
  }
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
  return (amount || 0).toLocaleString('vi-VN') + '₫';
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
  ['loiMatKhauCu', 'loiMatKhauMoi', 'loiXacNhanMatKhauMoi'].forEach(xoaLoi);
}