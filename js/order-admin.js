

import { getFilteredOrders, updateOrderStatus, getOrders } from './order-manager.js';
import { DOM, userManager } from './admin.js';

let currentOrderList = [];
let currentViewingOrderId = null;

export function initOrderAdmin() {

    DOM.orderFilterApply.addEventListener('click', loadAndRenderOrders);
    DOM.orderFilterReset.addEventListener('click', resetFiltersAndLoad);
    

    DOM.ordersTableBody.addEventListener('click', handleTableClick);
    

    DOM.orderDetailClose.addEventListener('click', () => {
        DOM.orderDetailBox.style.display = 'none';
        currentViewingOrderId = null;
    });

    if (DOM.orderStatusUpdateForm) {
        DOM.orderStatusUpdateForm.addEventListener('submit', handleStatusUpdateSubmit);
    }

    loadAndRenderOrders(); 
}

export function loadAndRenderOrders() {
    const filters = {
        status: DOM.orderFilterStatus.value,
        startDate: DOM.orderFilterFrom.value,
        endDate: DOM.orderFilterTo.value,
    };
    

    currentOrderList = getFilteredOrders(filters);
    

    const users = userManager.users || [];
    

    renderOrderTable(currentOrderList, users);
    

    DOM.orderDetailBox.style.display = 'none';
    currentViewingOrderId = null;
}

function resetFiltersAndLoad() {
    DOM.orderFilterStatus.value = 'all';
    DOM.orderFilterFrom.value = '';
    DOM.orderFilterTo.value = '';
    
    loadAndRenderOrders();
}

function renderOrderTable(orders, users) {
    const tableBody = DOM.ordersTableBody;
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">Không tìm thấy đơn hàng nào.</td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {

        const customer = users.find(u => u.tenDangNhap === order.userId);
        

        const customerName = customer?.hoTen 
            || order.shippingInfo?.fullName 
            || 'Khách vãng lai';
        
        const row = document.createElement('tr');
        row.dataset.orderId = order.id;
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.orderDate || new Date(order.date).toLocaleDateString('vi-VN')}</td>
            <td>${customerName} (${order.userId || 'N/A'})</td>
            <td class="right">${(order.total || 0).toLocaleString('vi-VN')} ₫</td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-info btn-view-detail" data-id="${order.id}">
                    <i class="fa-solid fa-eye"></i> Xem
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function handleTableClick(e) {
    const viewButton = e.target.closest('.btn-view-detail');
    if (viewButton) {
        const orderId = viewButton.dataset.id;
        showOrderDetails(orderId);
    }
}

function showOrderDetails(orderId) {
    const order = currentOrderList.find(o => o.id === orderId);
    if (!order) {
        // alert('Không tìm thấy chi tiết đơn hàng!');
        return;
    }

    currentViewingOrderId = orderId;
    

    const customer = userManager.users.find(u => u.tenDangNhap === order.userId);
    const customerName = customer?.hoTen 
        || order.shippingInfo?.fullName 
        || 'Khách vãng lai';
    

    const customerEmail = customer?.email || 'N/A';
    

    const customerPhone = order.shippingInfo?.phone 
        || 'N/A';
    

    const customerAddress = order.shippingInfo?.address 
        || 'N/A';
    
    
    DOM.orderDetailMeta.innerHTML = `
        <div><strong>Mã đơn:</strong> ${order.id}</div>
        <div><strong>Ngày đặt:</strong> ${order.orderDate || new Date(order.date).toLocaleDateString('vi-VN')}</div>
        <div><strong>Tổng tiền:</strong> <span style="color: #d9534f; font-weight: bold;">${(order.total || 0).toLocaleString('vi-VN')} ₫</span></div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
        <div><strong>Tên KH:</strong> ${customerName}</div>
        <div><strong>Email:</strong> ${customerEmail}</div>
        <div><strong>SĐT:</strong> ${customerPhone}</div>
        <div><strong>Địa chỉ:</strong> ${customerAddress}</div>
    `;

    let itemsHtml = '<ul>';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHtml += `
                <li>
                    <div class="item-info">
                        ${item.name}
                        <span>(Size: ${item.size} | SL: ${item.quantity})</span>
                    </div>
                    <div class="item-price">
                        ${(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                </li>
            `;
        });
    } else {
        itemsHtml += '<li>Không có thông tin sản phẩm.</li>';
    }
    itemsHtml += '</ul>';
    DOM.orderDetailItems.innerHTML = itemsHtml;

    const statusSelect = DOM.orderStatusUpdateSelect;
    if (statusSelect) {
        statusSelect.value = order.status;

        const isCanceled = order.status.toLowerCase() === 'đã hủy';
        statusSelect.disabled = isCanceled;
        DOM.orderStatusUpdateBtn.disabled = isCanceled;
    }

    DOM.orderDetailBox.style.display = 'block';

    DOM.orderDetailBox.scrollIntoView({ behavior: 'smooth' });
}

function handleStatusUpdateSubmit(e) {
    e.preventDefault();
    if (!currentViewingOrderId) return;

    const newStatus = DOM.orderStatusUpdateSelect.value;
    

    if (newStatus.toLowerCase() === 'đã hủy') {
        if (!confirm('Bạn có chắc muốn HỦY đơn hàng này? Thao tác này sẽ hoàn lại tồn kho.')) {

            const order = currentOrderList.find(o => o.id === currentViewingOrderId);
            DOM.orderStatusUpdateSelect.value = order.status;
            return;
        }
    }

    const success = updateOrderStatus(currentViewingOrderId, newStatus);
    
    if (success) {
        alert('Cập nhật trạng thái đơn hàng thành công!');

        loadAndRenderOrders();

        showOrderDetails(currentViewingOrderId);
    } else {
        alert('Cập nhật trạng thái thất bại. Vui lòng kiểm tra console.');
    }
}

function getStatusClass(status) {
    const s = status.toLowerCase().trim();
    if (s === 'đã xử lý') return 'status-processed';
    if (s === 'đã giao') return 'status-delivered';
    if (s === 'đã hủy') return 'status-canceled';
    return 'status-new';
}