import { CHECKOUT_OVERLAY_HTML } from './checkout-modal-html.js';

let checkoutOverlay = null;
let orderDataCache = {};
let currentUser = null;

const VIETNAM_PROVINCES = [
  "Hà Nội","Hồ Chí Minh","Hải Phòng","Đà Nẵng","Cần Thơ","An Giang","Bà Rịa - Vũng Tàu",
  "Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh","Bến Tre","Bình Định","Bình Dương",
  "Bình Phước","Bình Thuận","Cà Mau","Cao Bằng","Đắk Lắk","Đắk Nông","Điện Biên",
  "Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Tĩnh","Hải Dương",
  "Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu",
  "Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình",
  "Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh",
  "Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa",
  "Thừa Thiên Huế","Tiền Giang","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
];

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(amount||0);
}

function injectCheckoutOverlay() {
  if (document.getElementById('checkout-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', CHECKOUT_OVERLAY_HTML);
}

function initializeCheckoutDom() {
  injectCheckoutOverlay();
  checkoutOverlay = document.getElementById('checkout-overlay');
  setupEventListeners();
}

function bindClick(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

function showStep(stepName) {
  const steps = ['shipping','payment','review'];
  steps.forEach(s => {
    const el = document.getElementById(`step-${s}`);
    if (el) el.style.display = (s === stepName) ? 'block' : 'none';
  });
  if (checkoutOverlay) {
    checkoutOverlay.style.display = 'flex';
    checkoutOverlay.classList.add('open');
  }
}

function setupEventListeners() {
  if (!checkoutOverlay) return;

  bindClick('close-checkout-btn', closeCheckoutModal);
  bindClick('continue-payment-btn', handleContinueToPayment);
  bindClick('continue-review-btn', handleContinueToReview);
  bindClick('back-shipping-btn', () => showStep('shipping'));
  bindClick('back-payment-btn', () => showStep('payment'));
  bindClick('place-order-btn', handleFinalPlaceOrder);

  const shippingForm = document.getElementById('shipping-form');
  if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleContinueToPayment(e);
    });
  }

  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const bankInfo = document.getElementById('bank-transfer-info');
      if (bankInfo) bankInfo.style.display = e.target.value === 'BANK_TRANSFER' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('input[name="address-option"]').forEach(radio => {
    radio.addEventListener('change', handleAddressOptionChange);
  });

  checkoutOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckoutModal();
  });

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCheckoutModal();
    });
  }
}

export function openCheckoutModal() {
  if (!checkoutOverlay) initializeCheckoutDom();

  if (typeof window.kiemTraDangNhap !== 'function') {
    alert('Thiếu logic đăng nhập (kiemTraDangNhap).');
    return;
  }

  currentUser = window.kiemTraDangNhap();
  if (!currentUser || !currentUser.tenDangNhap) {
    alert('Vui lòng đăng nhập để thanh toán.');
    if (window.showLoginModal) window.showLoginModal();
    return;
  }

  if (!window.getCart || window.getCart().length === 0) {
    alert('Giỏ hàng trống.');
    return;
  }

  if (typeof window.checkCartBeforeCheckout === 'function' &&
      !window.checkCartBeforeCheckout()) {
    return;
  }

  if (window.closeCartModal) window.closeCartModal();

  const fullNameEl = document.getElementById('fullName');
  const phoneEl = document.getElementById('phone');
  if (fullNameEl) fullNameEl.value = currentUser.hoTen || '';
  if (phoneEl) phoneEl.value = currentUser.soDienThoai || '';

  populateProvinceDropdown();
  updateShippingForm();
  showStep('shipping');
}
window.openCheckoutModal = openCheckoutModal;

export function closeCheckoutModal() {
  if (!checkoutOverlay) return;
  checkoutOverlay.classList.remove('open');
  setTimeout(() => {
    checkoutOverlay.style.display = 'none';
  }, 300);
}
window.closeCheckoutModal = closeCheckoutModal;

function populateProvinceDropdown() {
  const provinceEl = document.getElementById('province');
  if (!provinceEl) return;
  if (provinceEl.tagName !== 'SELECT') return;

  while (provinceEl.options.length > 1) provinceEl.remove(1);
  VIETNAM_PROVINCES.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    provinceEl.appendChild(opt);
  });
}

function updateShippingForm() {
  const defAddrDisplay = document.getElementById('default-address-display');
  const rdDefault = document.getElementById('use-default-address');
  const rdNew = document.getElementById('use-new-address');
  const defAddr = currentUser ? currentUser.diaChiMacDinh : '';

  if (defAddrDisplay) {
    defAddrDisplay.textContent = defAddr || 'Chưa có địa chỉ mặc định.';
  }

  if (rdDefault && rdNew) {
    if (defAddr) {
      rdDefault.disabled = false;
      rdDefault.checked = true;
      rdNew.checked = false;
    } else {
      rdDefault.disabled = true;
      rdDefault.checked = false;
      rdNew.checked = true;
    }
  }
  handleAddressOptionChange();
}

function handleAddressOptionChange() {
  const rdNew = document.getElementById('use-new-address');
  const isNew = rdNew && rdNew.checked;
  const defAddr = currentUser ? currentUser.diaChiMacDinh : '';

  const addressInput = document.getElementById('address');
  const districtInput = document.getElementById('district');
  const provinceInput = document.getElementById('province');

  if (isNew || !defAddr) {
    if (addressInput) addressInput.disabled = false;
    if (districtInput) districtInput.disabled = false;
    if (provinceInput) provinceInput.disabled = false;

    if (defAddr && isNew) {
      if (addressInput) addressInput.value = '';
      if (districtInput) districtInput.value = '';
      if (provinceInput) {
        if (provinceInput.tagName === 'SELECT') provinceInput.value = '';
        else provinceInput.value = '';
      }
    }
  } else {
    if (addressInput) addressInput.value = defAddr;
    if (districtInput) districtInput.value = '';
    if (provinceInput) {
      if (provinceInput.tagName === 'SELECT') provinceInput.value = '';
      else provinceInput.value = '';
    }
    if (addressInput) addressInput.disabled = true;
    if (districtInput) districtInput.disabled = true;
    if (provinceInput) provinceInput.disabled = true;
  }
}

function handleContinueToPayment(e) {
  if (e) e.preventDefault();

  if (typeof window.kiemTraDangNhap === 'function') {
    currentUser = window.kiemTraDangNhap();
  }
  if (!currentUser) {
    alert('Phiên đăng nhập đã hết. Đăng nhập lại.');
    return;
  }

  if (!window.getCart || window.getCart().length === 0) {
    alert('Giỏ hàng trống.');
    return;
  }

  const form = document.getElementById('shipping-form');
  if (form && !form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const rdDefault = document.getElementById('use-default-address');
  const usingDefault = rdDefault && rdDefault.checked && !rdDefault.disabled;

  const addressDetailEl = document.getElementById('address');
  const districtEl = document.getElementById('district');
  const provinceEl = document.getElementById('province');

  const addressDetail = addressDetailEl ? addressDetailEl.value.trim() : '';
  const district = districtEl ? districtEl.value.trim() : '';
  let provinceVal = '';
  if (provinceEl) {
    if (provinceEl.tagName === 'SELECT') {
      provinceVal = provinceEl.value;
    } else {
      provinceVal = provinceEl.value.trim();
    }
  }

  if (!usingDefault) {
    if (addressDetail.length < 5) {
      alert('Địa chỉ cụ thể phải >= 5 ký tự.');
      if (addressDetailEl) addressDetailEl.focus();
      return;
    }
    if (!provinceVal) {
      alert('Chọn hoặc nhập Tỉnh/Thành.');
      if (provinceEl) provinceEl.focus();
      return;
    }
  }

  const fullAddress = usingDefault
    ? (currentUser.diaChiMacDinh || '').trim()
    : [addressDetail, district, provinceVal].filter(Boolean).join(', ');

  const getCart = window.getCart;
  const calculateCartTotal = window.calculateCartTotal;

  orderDataCache.shipping = {
    fullName: document.getElementById('fullName')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
    address: fullAddress,
    notes: document.getElementById('notes')?.value.trim() || '',
    usedDefaultAddress: usingDefault
  };
  orderDataCache.userId = currentUser.tenDangNhap;
  orderDataCache.items = (typeof getCart === 'function') ? getCart() : [];
  orderDataCache.total = (typeof calculateCartTotal === 'function') ? calculateCartTotal() : 0;

  showStep('payment');
}

function handleContinueToReview(e) {
  if (e) e.preventDefault();

  const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
  if (!paymentRadio) {
    alert('Chọn phương thức thanh toán.');
    return;
  }
  orderDataCache.payment = { method: paymentRadio.value };

  let shippingInfo = orderDataCache.shipping || {};
  if (typeof window.kiemTraDangNhap === 'function') {
    const u = window.kiemTraDangNhap();
    shippingInfo.email = (u && u.email) ? u.email : 'N/A';
  } else {
    shippingInfo.email = 'N/A';
  }

  const getCart = window.getCart;
  const calculateCartTotal = window.calculateCartTotal;
  const cartItems = (typeof getCart === 'function') ? getCart() : [];
  const totalAmount = (typeof calculateCartTotal === 'function') ? calculateCartTotal() : 0;

  updateReviewStep(shippingInfo, paymentRadio.value, cartItems, totalAmount);
  showStep('review');
}

function updateReviewStep(shippingInfo, paymentMethod, cartItems, totalAmount) {
  const addressEl = document.getElementById('review-address-info');
  if (addressEl) {
    const html =
      '<strong>' + (shippingInfo.fullName || '') + '</strong> (' +
      (shippingInfo.email || 'N/A') + ') - ' +
      (shippingInfo.phone || '') + '<br>' +
      (shippingInfo.address || '') + '<br>' +
      (shippingInfo.notes ? '<p><em>' + shippingInfo.notes + '</em></p>' : '');
    addressEl.innerHTML = html;
  }

  const payMethodEl = document.getElementById('review-payment-method');
  if (payMethodEl) {
    payMethodEl.textContent = paymentMethod === 'BANK_TRANSFER'
      ? 'Chuyển khoản ngân hàng'
      : 'Thanh toán khi nhận hàng (COD)';
  }

  const bankInfoBox = document.getElementById('review-bank-info');
  if (bankInfoBox) {
    if (paymentMethod === 'BANK_TRANSFER') {
      bankInfoBox.style.display = 'block';
      const bankNameEl = document.getElementById('review-bank-name');
      const accountNoEl = document.getElementById('review-account-number');
      const accountNameEl = document.getElementById('review-account-name');
      if (bankNameEl) bankNameEl.textContent = 'Ngân hàng Demo';
      if (accountNoEl) accountNoEl.textContent = '0123456789';
      if (accountNameEl) accountNameEl.textContent = 'Công ty Demo';
    } else {
      bankInfoBox.style.display = 'none';
    }
  }

  const itemsContainer = document.getElementById('review-cart-items');
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    (cartItems || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'review-item';
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      const displayName = item.title || item.name || 'Sản phẩm';
      div.innerHTML =
        '<div>' + displayName + ' x ' + (item.quantity || 1) + '</div>' +
        '<div>' + formatCurrency(itemTotal) + '</div>';
      itemsContainer.appendChild(div);
    });
  }

  const totalEl = document.getElementById('review-total-price');
  if (totalEl) totalEl.textContent = formatCurrency(totalAmount);
}

function handleFinalPlaceOrder(e) {
  if (e) e.preventDefault();

  if (!orderDataCache.items || !orderDataCache.shipping) {
    alert('Thiếu thông tin đơn hàng.');
    return;
  }
  if (!orderDataCache.payment || !orderDataCache.payment.method) {
    orderDataCache.payment = { method: 'COD' };
  }

  if (typeof window.placeOrder !== 'function') {
    alert('Thiếu hàm placeOrder.');
    return;
  }

  const result = window.placeOrder(orderDataCache);
  if (result) {
    alert('Đặt hàng thành công!');
    closeCheckoutModal();
  } else {
    alert('Không thể đặt đơn hàng.');
  }
}

window.forceRebindCheckoutEvents = function() {
  setupEventListeners();
};

document.addEventListener('DOMContentLoaded', () => {
  if (!checkoutOverlay) initializeCheckoutDom();
});