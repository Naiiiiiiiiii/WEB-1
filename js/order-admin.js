
// Import các hàm quản lý đơn hàng
import { getFilteredOrders, updateOrderStatus, getOrders } from './order-manager.js';
import { DOM, userManager } from './admin.js';

let currentOrderList = []; // Lưu danh sách đơn hàng đang hiển thị
let currentViewingOrderId = null; // Lưu ID của đơn hàng đang xem chi tiết

/**
 * Khởi tạo module quản lý đơn hàng
 */
export function initOrderAdmin() {
    // Gắn sự kiện cho các nút lọc
    DOM.orderFilterApply.addEventListener('click', loadAndRenderOrders);
    DOM.orderFilterReset.addEventListener('click', resetFiltersAndLoad);
    
    // Gắn sự kiện cho bảng (sử dụng event delegation)
    DOM.ordersTableBody.addEventListener('click', handleTableClick);
    
    // Gắn sự kiện cho nút đóng panel chi tiết
    DOM.orderDetailClose.addEventListener('click', () => {
        DOM.orderDetailBox.style.display = 'none';
        currentViewingOrderId = null;
    });

    // Gắn sự kiện cho form cập nhật trạng thái
    if (DOM.orderStatusUpdateForm) {
        DOM.orderStatusUpdateForm.addEventListener('submit', handleStatusUpdateSubmit);
    }

    // Tải và hiển thị đơn hàng ngay khi module khởi tạo
    loadAndRenderOrders(); 
}

/**
 * Tải và hiển thị danh sách đơn hàng dựa trên bộ lọc
 */
export function loadAndRenderOrders() {
    const filters = {
        status: DOM.orderFilterStatus.value,
        startDate: DOM.orderFilterFrom.value,
        endDate: DOM.orderFilterTo.value,
    };
    
    // Lấy danh sách đơn hàng đã lọc
    currentOrderList = getFilteredOrders(filters);
    
    // Lấy danh sách người dùng để tra cứu tên
    const users = userManager.users || [];
    
    // Hiển thị ra bảng
    renderOrderTable(currentOrderList, users);
    
    // Ẩn panel chi tiết
    DOM.orderDetailBox.style.display = 'none';
    currentViewingOrderId = null;
}

/**
 * Reset bộ lọc và tải lại danh sách
 */
function resetFiltersAndLoad() {
    DOM.orderFilterStatus.value = 'all';
    DOM.orderFilterFrom.value = '';
    DOM.orderFilterTo.value = '';
    
    loadAndRenderOrders();
}

/**
 * Hiển thị dữ liệu đơn hàng ra bảng
 */
function renderOrderTable(orders, users) {
    const tableBody = DOM.ordersTableBody;
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ

    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">Không tìm thấy đơn hàng nào.</td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        // Tìm thông tin khách hàng từ hồ sơ (dùng tenDangNhap = userId)
        const customer = users.find(u => u.tenDangNhap === order.userId);
        
        // CẬP NHẬT ĐƯỜNG DẪN TRA CỨU TÊN
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

/**
 * Xử lý click trên bảng 
 */
function handleTableClick(e) {
    const viewButton = e.target.closest('.btn-view-detail');
    if (viewButton) {
        const orderId = viewButton.dataset.id;
        showOrderDetails(orderId);
    }
}

/**
 * Hiển thị chi tiết một đơn hàng
 */
function showOrderDetails(orderId) {
    const order = currentOrderList.find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy chi tiết đơn hàng!');
        return;
    }

    currentViewingOrderId = orderId;
    
    // --- 1. Hiển thị thông tin chung ---
    // User profile: userManager uses tenDangNhap as the key
    const customer = userManager.users.find(u => u.tenDangNhap === order.userId);
    const customerName = customer?.hoTen 
        || order.shippingInfo?.fullName 
        || 'Khách vãng lai';
    
    // 2. Email: Chỉ có trong hồ sơ người dùng (User object không có phone/address).
    const customerEmail = customer?.email || 'N/A';
    
    // 3. SĐT: Ưu tiên order.shippingInfo?.phone (vì nó là số giao hàng cụ thể).
    const customerPhone = order.shippingInfo?.phone 
        || 'N/A';
    
    // 4. Địa chỉ: Ưu tiên order.shippingInfo?.address (vì nó là địa chỉ giao hàng cụ thể).
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

    // --- 2. Hiển thị danh sách sản phẩm ---
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

    // --- 3. Cập nhật form trạng thái ---
    const statusSelect = DOM.orderStatusUpdateSelect;
    if (statusSelect) {
        statusSelect.value = order.status;
        // Vô hiệu hóa select và nút nếu đơn đã hủy
        const isCanceled = order.status.toLowerCase() === 'đã hủy';
        statusSelect.disabled = isCanceled;
        DOM.orderStatusUpdateBtn.disabled = isCanceled;
    }

    // --- 4. Hiển thị panel ---
    DOM.orderDetailBox.style.display = 'block';
    // Cuộn tới panel
    DOM.orderDetailBox.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Xử lý submit form cập nhật trạng thái
 */
function handleStatusUpdateSubmit(e) {
    e.preventDefault();
    if (!currentViewingOrderId) return;

    const newStatus = DOM.orderStatusUpdateSelect.value;
    
    // Xác nhận trước khi HỦY (vì nó ảnh hưởng tồn kho)
    if (newStatus.toLowerCase() === 'đã hủy') {
        if (!confirm('Bạn có chắc muốn HỦY đơn hàng này? Thao tác này sẽ hoàn lại tồn kho.')) {
            // Nếu không đồng ý, reset lại select về trạng thái cũ
            const order = currentOrderList.find(o => o.id === currentViewingOrderId);
            DOM.orderStatusUpdateSelect.value = order.status;
            return;
        }
    }

    // Gọi hàm cập nhật
    const success = updateOrderStatus(currentViewingOrderId, newStatus);
    
    if (success) {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        // Tải lại danh sách
        loadAndRenderOrders();
        // Tải lại chi tiết (để cập nhật trạng thái trong panel)
        showOrderDetails(currentViewingOrderId);
    } else {
        alert('Cập nhật trạng thái thất bại. Vui lòng kiểm tra console.');
    }
}

/**
 * Lấy class CSS cho từng trạng thái
 */
function getStatusClass(status) {
    const s = status.toLowerCase().trim();
    if (s === 'đã xử lý') return 'status-processed';
    if (s === 'đã giao') return 'status-delivered';
    if (s === 'đã hủy') return 'status-canceled';
    return 'status-new';
}