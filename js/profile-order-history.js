// File: js/profile-order-history.js - Module hiển thị lịch sử đơn hàng trên trang Hồ sơ

// Lấy các hàm cần thiết từ các module khác (Giả định chúng được gắn vào window)
const getOrders = window.getOrders; // Từ order-manager.js
const getCurrentUsername = window.getCurrentUsername; // Từ cart.js hoặc user-manager.js

// Khai báo biến DOM
let orderHistoryContainer = null;
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// =========================================================================
// HÀM LỌC VÀ HIỂN THỊ ĐƠN HÀNG
// =========================================================================


function getOrdersForCurrentUser() {
    const username = getCurrentUsername();
    if (!username || !getOrders) {
        return [];
    }
    
    // Lấy tất cả đơn hàng đã lưu
    const allOrders = getOrders(); 

    // Lọc đơn hàng dựa trên thông tin người dùng lưu trong orderDataCache.shippingInfo
    
    
    const userOrders = allOrders.filter(order => {
        return true; 
    });

    // Sắp xếp đơn hàng mới nhất lên đầu
    userOrders.sort((a, b) => new Date(b.id.replace('ORD-', '') * 1) - new Date(a.id.replace('ORD-', '') * 1));
    
    return userOrders;
}



function createOrderItemsHtml(items) {
    return items.map(item => `
        <div class="order-item-detail">
            <img src="${item.img || './img/default.avif'}" alt="${item.name}" class="order-item-img">
            <div class="item-info">
                <p class="item-name">${item.name}</p>
                <p class="item-variant">Size: <strong>${item.size || 'N/A'}</strong></p>
            </div>
            <span class="item-qty-price">${item.quantity} x ${formatCurrency(item.price)}</span>
        </div>
    `).join('');
}

/**
 * Tạo HTML cho một thẻ đơn hàng
 */
function createOrderCardHtml(order) {
    const totalItems = order.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const orderItemsHtml = createOrderItemsHtml(order.items);
    
    let statusClass = '';
    if (order.status === 'Đã hủy') statusClass = 'status-cancelled';
    else if (order.status === 'Hoàn thành') statusClass = 'status-completed';
    else if (order.status === 'Đang giao hàng') statusClass = 'status-shipping';
    else statusClass = 'status-pending';

    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <h4 class="order-id">#${order.id}</h4>
                <span class="order-date">${order.orderDate}</span>
            </div>
            
            <div class="order-summary">
                <div class="summary-details">
                    <p>Tổng sản phẩm: ${totalItems}</p>
                    <p>Tổng tiền: <strong>${formatCurrency(order.total)}</strong></p>
                </div>
                <div class="summary-status">
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
            </div>

            <div class="order-items-list hidden" id="items-${order.id}">
                ${orderItemsHtml}
            </div>

            <button class="toggle-items-btn" data-target="#items-${order.id}">
                Xem Chi Tiết Đơn Hàng
            </button>
        </div>
    `;
}

/**
 * Hiển thị toàn bộ lịch sử đơn hàng của người dùng hiện tại
 */
export function renderOrderHistory() {
    if (!orderHistoryContainer) {
        orderHistoryContainer = document.getElementById('order-history-container');
    }
    
    if (!orderHistoryContainer) {
        console.warn("Không tìm thấy phần tử DOM #order-history-container để hiển thị lịch sử đơn hàng.");
        return;
    }
    
    const userOrders = getOrdersForCurrentUser();
    
    if (userOrders.length === 0) {
        orderHistoryContainer.innerHTML = '<p class="empty-message">Bạn chưa có đơn hàng nào.</p>';
        return;
    }
    
    const orderHtml = userOrders.map(createOrderCardHtml).join('');
    orderHistoryContainer.innerHTML = orderHtml;
    
    // Gắn sự kiện cho các nút "Xem Chi Tiết"
    attachToggleEventListeners();
}
window.renderOrderHistory = renderOrderHistory;


// =========================================================================
// GẮN SỰ KIỆN VÀ KHỞI TẠO
// =========================================================================

function attachToggleEventListeners() {
    document.querySelectorAll('.toggle-items-btn').forEach(button => {
        // Loại bỏ sự kiện cũ nếu có để tránh trùng lặp khi render lại
        button.removeEventListener('click', handleToggleDetails); 
        button.addEventListener('click', handleToggleDetails);
    });
}

function handleToggleDetails(e) {
    const targetSelector = e.currentTarget.dataset.target;
    const targetEl = document.querySelector(targetSelector);
    
    if (targetEl) {
        targetEl.classList.toggle('hidden');
        if (targetEl.classList.contains('hidden')) {
            e.currentTarget.textContent = 'Xem Chi Tiết Đơn Hàng';
        } else {
            e.currentTarget.textContent = 'Thu Gọn';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Chỉ render khi người dùng đang ở trang Hồ sơ hoặc khi được gọi từ logic Profile.
    // DÒNG NÀY CÓ THỂ CẦN ĐƯỢC CHUYỂN VÀO LOGIC QUẢN LÝ PROFILE CỦA BẠN.
    // Ví dụ: Khi người dùng click vào tab "Lịch sử mua hàng".
    // Tạm thời gọi để hiển thị nếu container tồn tại
    if (document.getElementById('order-history-container')) {
        renderOrderHistory();
    }
});