

// IMPORT CÁC HÀM CẦN THIẾT TỪ order-manager.js
import { getUserOrders, cancelOrder } from './order-manager.js'; 
// IMPORT HÀM KIỂM TRA ĐĂNG NHẬP TỪ user.js
const kiemTraDangNhap = window.kiemTraDangNhap || (() => null);

let historyOverlay = null;
let historyContainer = null;

// Hàm tiện ích: Format tiền tệ (Giả sử đã được gán global)
const formatCurrency = window.formatCurrency || function(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm tiện ích: Format ngày
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'N/A';
    }
}

// Khởi tạo các phần tử DOM
function initializeHistoryDom() {
    // Chỉ khởi tạo nếu các phần tử chưa được gán
    if (!historyOverlay) {
        historyOverlay = document.getElementById('order-history-overlay');
        historyContainer = document.getElementById('history-list-container');
    }
    
    const closeBtn = document.getElementById('close-history-btn');
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeOrderHistoryModal);
        closeBtn.addEventListener('click', closeOrderHistoryModal);
    }
    
    // Sự kiện đóng modal khi click ra ngoài
    if (historyOverlay) {
        historyOverlay.removeEventListener('click', handleOverlayClick);
        historyOverlay.addEventListener('click', handleOverlayClick);
    }
}

function handleOverlayClick(e) {
    if (e.target === historyOverlay) {
        closeOrderHistoryModal();
    }
}

// ---------------------------------------------------------------
// RENDER UI
// ---------------------------------------------------------------

function renderOrderDetails(order) {
    let itemsHtml = order.items.map(item => `
        <div class="history-item-detail">
            <img src="${item.img || './img/default.avif'}" alt="${item.name}" class="history-item-img">
            <div class="item-info">
                <p class="item-name">${item.name}</p>
                <p class="item-variant">Size: ${item.size || 'N/A'}</p>
                <p class="item-qty">Số lượng: ${item.quantity} x ${formatCurrency(item.price)}</p>
                <p class="item-total-price">Thành tiền: <strong>${formatCurrency(item.price * item.quantity)}</strong></p>
            </div>
        </div>
    `).join('');

    return `
        <div class="order-details-wrapper">
            ${itemsHtml}
        </div>
    `;
}

function createOrderCard(order) {
    const previewItems = order.items.slice(0, 3).map(item => item.name).join(', ');
    const moreItems = order.items.length > 3 ? ` và ${order.items.length - 3} sản phẩm khác` : '';
    
    const statusLower = order.status ? order.status.toLowerCase().trim() : 'unknown';
    // Trạng thái không thể hủy
    const isNotCancelable = (statusLower === 'đã hủy' || statusLower === 'đã giao hàng' || statusLower === 'đã hoàn thành' || statusLower !== 'đang chờ xử lý');
    const statusText = order.status || 'Chưa rõ';
    
    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <span class="order-id">Mã Đơn hàng: <strong>${order.id}</strong></span>
                <span class="order-status order-status-${statusLower.replace(/\s/g, '-')}">${statusText}</span>
            </div>
            <div class="order-summary">
                <p class="order-date">Ngày đặt: ${formatDate(order.date)}</p>
                <p class="order-products">Sản phẩm: ${previewItems}${moreItems}</p>
                <p class="order-total">Tổng tiền: <strong>${formatCurrency(order.total || 0)}</strong></p>
            </div>
            <div class="order-actions">
                <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${order.id}">Xem chi tiết</button>
                <button class="btn btn-sm btn-outline-danger cancel-order-btn" data-id="${order.id}" ${isNotCancelable ? 'disabled' : ''}>${isNotCancelable ? 'Không thể hủy' : 'Hủy đơn'}</button>
            </div>
            <div class="order-full-details order-details-${order.id}" style="display:none;">
                ${renderOrderDetails(order)}
            </div>
        </div>
    `;
}

/**
 * Hiển thị lịch sử đơn hàng của người dùng hiện tại
 */
export function renderOrderHistory() {
    if (!historyContainer) {
        initializeHistoryDom();
    }
    
    const user = kiemTraDangNhap();
    
    if (!user || !user.tenDangNhap) {
        if (historyContainer) {
            historyContainer.innerHTML = `<p class="alert alert-warning">Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>`;
        }
        if (historyOverlay) {
             historyOverlay.style.display = 'flex';
             requestAnimationFrame(() => historyOverlay.classList.add('open'));
        }
        return;
    }
    
    const orders = getUserOrders(user.tenDangNhap); 
    
    historyContainer.innerHTML = '';

    if (orders.length === 0) {
        historyContainer.innerHTML = `<p class="alert alert-info">Bạn chưa có đơn hàng nào.</p>`;
    } else {
        let historyHtml = '';
        orders.forEach(order => {
            historyHtml += createOrderCard(order);
        });
        historyContainer.innerHTML = historyHtml;
        // Gắn lại sự kiện cho các nút mới
        attachHistoryEvents(orders); 
    }
    
    // Hiển thị Modal
    if (historyOverlay) {
        historyOverlay.style.display = 'flex';
        requestAnimationFrame(() => historyOverlay.classList.add('open'));
    }
}


// ---------------------------------------------------------------
// SỰ KIỆN VÀ HÀNH ĐỘNG
// ---------------------------------------------------------------

function attachHistoryEvents(orders) {
    // 1. Gắn sự kiện Xem chi tiết
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.removeEventListener('click', handleViewDetails); // Ngăn lặp sự kiện
        btn.addEventListener('click', handleViewDetails);
    });

    // 2. Gắn sự kiện Hủy đơn
    document.querySelectorAll('.cancel-order-btn').forEach(btn => {
        btn.removeEventListener('click', handleCancelOrder); // Ngăn lặp sự kiện
        btn.addEventListener('click', handleCancelOrder);
    });
}

function handleViewDetails(e) {
    const orderId = e.target.dataset.id;
    const detailsEl = document.querySelector(`.order-details-${orderId}`);
    
    if (detailsEl) {
        detailsEl.style.display = detailsEl.style.display === 'none' ? 'block' : 'none';
        e.target.textContent = detailsEl.style.display === 'none' ? 'Xem chi tiết' : 'Ẩn chi tiết';
    }
}

function handleCancelOrder(e) {
    if (e.target.disabled) return;
    
    const orderId = e.target.dataset.id;
    
    if (confirm(`Bạn có chắc muốn hủy đơn hàng ${orderId}? Đơn hàng chỉ có thể hủy nếu đang ở trạng thái "Đang chờ xử lý".`)) {
        
        // GỌI HÀM ĐÃ CHUYỂN SANG order-manager.js
        const success = cancelOrder(orderId); 
        
        if (success) {
            alert(`✅ Hủy đơn hàng ${orderId} thành công.`);
            renderOrderHistory(); // Render lại UI sau khi hủy
        } else {
            alert(`❌ Không thể hủy đơn hàng ${orderId}. Vui lòng kiểm tra trạng thái đơn hàng.`);
        }
    }
}

/**
 * Đóng Modal lịch sử đơn hàng
 */
export function closeOrderHistoryModal() {
    if (historyOverlay) {
        historyOverlay.classList.remove('open');
        setTimeout(() => historyOverlay.style.display = 'none', 300);
    }
}

// ---------------------------------------------------------------
// KHỞI TẠO
// ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', initializeHistoryDom);
window.renderOrderHistory = renderOrderHistory;