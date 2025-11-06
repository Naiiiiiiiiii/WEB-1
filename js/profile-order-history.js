

const getOrders = window.getOrders;
const getCurrentUsername = window.getCurrentUsername;

let orderHistoryContainer = null;
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

function getOrdersForCurrentUser() {
    const username = getCurrentUsername();
    if (!username || !getOrders) {
        return [];
    }
    

    const allOrders = getOrders(); 

    
    
    const userOrders = allOrders.filter(order => {
        return true; 
    });

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
    

    attachToggleEventListeners();
}
window.renderOrderHistory = renderOrderHistory;

function attachToggleEventListeners() {
    document.querySelectorAll('.toggle-items-btn').forEach(button => {

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

    if (document.getElementById('order-history-container')) {
        renderOrderHistory();
    }
});