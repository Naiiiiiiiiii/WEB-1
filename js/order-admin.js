/**
 * Order Admin Module - Enhanced với State Machine validation
 * @version 2.0.0
 */

import {
  getFilteredOrders,
  updateOrderStatus,
  getOrders,
} from "./order-manager.js";
import { DOM, userManager } from "./admin.js";

// ==================== CONSTANTS ====================

/**
 * Định nghĩa trạng thái đơn hàng
 */
const ORDER_STATUS = {
  NEW: "Đang chờ xử lý",
  PROCESSED: "Đã xử lý",
  DELIVERED: "Đã giao",
  CANCELED: "Đã hủy",
};

/**
 * Các trạng thái cuối (final states) - không thể thay đổi
 */
const FINAL_STATES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED];

/**
 * State transition rules - quy tắc chuyển đổi trạng thái
 * @type {Object.<string, string[]>}
 */
const STATE_TRANSITIONS = {
  [ORDER_STATUS.NEW]: [ORDER_STATUS.PROCESSED, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.PROCESSED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.DELIVERED]: [], // Final state - không thể chuyển
  [ORDER_STATUS.CANCELED]: [], // Final state - không thể chuyển
};

// ==================== STATE ====================

let currentOrderList = [];
let currentViewingOrderId = null;

// ==================== INITIALIZATION ====================

export function initOrderAdmin() {
  DOM.orderFilterApply.addEventListener("click", loadAndRenderOrders);
  DOM.orderFilterReset.addEventListener("click", resetFiltersAndLoad);
  DOM.ordersTableBody.addEventListener("click", handleTableClick);

  DOM.orderDetailClose.addEventListener("click", () => {
    DOM.orderDetailBox.style.display = "none";
    currentViewingOrderId = null;
  });

  if (DOM.orderStatusUpdateForm) {
    DOM.orderStatusUpdateForm.addEventListener(
      "submit",
      handleStatusUpdateSubmit
    );
  }

  loadAndRenderOrders();
}

// ==================== DATA LOADING ====================

export function loadAndRenderOrders() {
  const filters = {
    status: DOM.orderFilterStatus.value,
    startDate: DOM.orderFilterFrom.value,
    endDate: DOM.orderFilterTo.value,
  };

  currentOrderList = getFilteredOrders(filters);
  const users = userManager.users || [];

  renderOrderTable(currentOrderList, users);

  DOM.orderDetailBox.style.display = "none";
  currentViewingOrderId = null;
}

function resetFiltersAndLoad() {
  DOM.orderFilterStatus.value = "all";
  DOM.orderFilterFrom.value = "";
  DOM.orderFilterTo.value = "";
  loadAndRenderOrders();
}

// ==================== RENDERING ====================

function renderOrderTable(orders, users) {
  const tableBody = DOM.ordersTableBody;
  tableBody.innerHTML = "";

  if (orders.length === 0) {
    tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6" style="text-align: center; padding: 24px; color: #666;">
                    <i class="fa-solid fa-inbox" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 8px;"></i>
                    <p>Không tìm thấy đơn hàng nào.</p>
                </td>
            </tr>
        `;
    return;
  }

  orders.forEach((order) => {
    const customer = users.find((u) => u.tenDangNhap === order.userId);
    const customerName =
      customer?.hoTen || order.shippingInfo?.fullName || "Khách vãng lai";

    const row = document.createElement("tr");
    row.dataset.orderId = order.id;

    row.innerHTML = `
            <td>${order.id}</td>
            <td>${
              order.orderDate ||
              new Date(order.date).toLocaleDateString("vi-VN")
            }</td>
            <td>${customerName} (${order.userId || "N/A"})</td>
            <td class="right">${(order.total || 0).toLocaleString(
              "vi-VN"
            )}₫</td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-info btn-view-detail" data-id="${
                  order.id
                }">
                    <i class="fa-solid fa-eye"></i> Xem
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// ==================== ORDER DETAILS ====================

function handleTableClick(e) {
  const viewButton = e.target.closest(".btn-view-detail");
  if (viewButton) {
    const orderId = viewButton.dataset.id;
    showOrderDetails(orderId);
  }
}

/**
 * Hiển thị chi tiết đơn hàng
 * @param {string} orderId - ID đơn hàng
 */
function showOrderDetails(orderId) {
  const order = currentOrderList.find((o) => o.id === orderId);
  if (!order) {
    console.warn("⚠️ Không tìm thấy đơn hàng:", orderId);
    return;
  }

  currentViewingOrderId = orderId;

  // Get customer info
  const customer = userManager.users.find(
    (u) => u.tenDangNhap === order.userId
  );
  const customerName =
    customer?.hoTen || order.shippingInfo?.fullName || "Khách vãng lai";
  const customerEmail = customer?.email || "N/A";
  const customerPhone = order.shippingInfo?.phone || "N/A";
  const customerAddress = order.shippingInfo?.address || "N/A";

  // Render customer info
  DOM.orderDetailMeta.innerHTML = `
        <div><strong>Mã đơn:</strong> ${order.id}</div>
        <div><strong>Ngày đặt:</strong> ${
          order.orderDate || new Date(order.date).toLocaleDateString("vi-VN")
        }</div>
        <div><strong>Tổng tiền:</strong> <span style="color: #d9534f; font-weight: bold;">${(
          order.total || 0
        ).toLocaleString("vi-VN")}₫</span></div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
        <div><strong>Tên KH:</strong> ${customerName}</div>
        <div><strong>Email:</strong> ${customerEmail}</div>
        <div><strong>SĐT:</strong> ${customerPhone}</div>
        <div><strong>Địa chỉ:</strong> ${customerAddress}</div>
    `;

  // Render items
  let itemsHtml = "<ul>";
  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      itemsHtml += `
                <li>
                    <div class="item-info">
                        ${item.name}
                        <span>(Size: ${item.size} | SL: ${item.quantity})</span>
                    </div>
                    <div class="item-price">
                        ${(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </div>
                </li>
            `;
    });
  } else {
    itemsHtml += "<li>Không có thông tin sản phẩm.</li>";
  }
  itemsHtml += "</ul>";
  DOM.orderDetailItems.innerHTML = itemsHtml;

  // ✅ FIX: Render status selector với validation
  renderStatusSelector(order);

  // Show detail box
  DOM.orderDetailBox.style.display = "block";
  DOM.orderDetailBox.scrollIntoView({ behavior: "smooth" });
}

/**
 * ✅ NEW: Render status selector với business logic validation
 * @param {Object} order - Order object
 */
function renderStatusSelector(order) {
  const statusSelect = DOM.orderStatusUpdateSelect;
  if (!statusSelect) return;

  const currentStatus = order.status;
  const isFinalState = isFinalStatus(currentStatus);

  // Set current value
  statusSelect.value = currentStatus;

  // ✅ Disable nếu là final state
  statusSelect.disabled = isFinalState;
  DOM.orderStatusUpdateBtn.disabled = isFinalState;

  if (isFinalState) {
    // Thêm message giải thích tại sao không thể thay đổi
    const existingMessage = statusSelect.parentElement.querySelector(
      ".final-state-message"
    );
    if (!existingMessage) {
      const message = document.createElement("div");
      message.className = "final-state-message";
      message.style.cssText =
        "color: #856404; background: #fff3cd; padding: 8px 12px; border-radius: 4px; margin-top: 8px; font-size: 13px;";
      message.innerHTML = `
                <i class="fa-solid fa-info-circle"></i>
                Đơn hàng đã ở trạng thái cuối <strong>"${currentStatus}"</strong> - không thể thay đổi.
            `;
      statusSelect.parentElement.appendChild(message);
    }
  } else {
    // Remove message nếu có
    const existingMessage = statusSelect.parentElement.querySelector(
      ".final-state-message"
    );
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  // ✅ Chỉ hiển thị các options hợp lệ
  populateValidStatusOptions(statusSelect, currentStatus);
}

/**
 * ✅ NEW: Populate dropdown với chỉ các trạng thái hợp lệ
 * @param {HTMLSelectElement} selectElement - Select element
 * @param {string} currentStatus - Trạng thái hiện tại
 */
function populateValidStatusOptions(selectElement, currentStatus) {
  // Clear existing options
  selectElement.innerHTML = "";

  // Add current status (always first)
  const currentOption = document.createElement("option");
  currentOption.value = currentStatus;
  currentOption.textContent = currentStatus;
  currentOption.selected = true;
  selectElement.appendChild(currentOption);

  // Add valid next states
  const validNextStates = getValidTransitions(currentStatus);
  validNextStates.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    selectElement.appendChild(option);
  });
}

// ==================== STATUS VALIDATION ====================

/**
 * ✅ NEW: Kiểm tra xem status có phải final state không
 * @param {string} status - Trạng thái cần kiểm tra
 * @returns {boolean}
 */
function isFinalStatus(status) {
  return FINAL_STATES.some(
    (finalStatus) =>
      status.toLowerCase().trim() === finalStatus.toLowerCase().trim()
  );
}

/**
 * ✅ NEW: Lấy danh sách trạng thái hợp lệ có thể chuyển đổi
 * @param {string} currentStatus - Trạng thái hiện tại
 * @returns {string[]} Mảng các trạng thái hợp lệ
 */
function getValidTransitions(currentStatus) {
  // Normalize status
  const normalizedStatus = Object.values(ORDER_STATUS).find(
    (status) => status.toLowerCase() === currentStatus.toLowerCase().trim()
  );

  if (!normalizedStatus) {
    console.warn("⚠️ Unknown status:", currentStatus);
    return [];
  }

  return STATE_TRANSITIONS[normalizedStatus] || [];
}

/**
 * ✅ NEW: Validate xem có thể chuyển từ currentStatus sang newStatus không
 * @param {string} currentStatus - Trạng thái hiện tại
 * @param {string} newStatus - Trạng thái mới
 * @returns {{valid: boolean, reason?: string}}
 */
function validateStatusTransition(currentStatus, newStatus) {
  // Nếu không thay đổi thì OK
  if (currentStatus.toLowerCase().trim() === newStatus.toLowerCase().trim()) {
    return {
      valid: false,
      reason: "Trạng thái mới giống trạng thái hiện tại",
    };
  }

  // Kiểm tra final state
  if (isFinalStatus(currentStatus)) {
    return {
      valid: false,
      reason: `Không thể thay đổi trạng thái từ "${currentStatus}" (trạng thái cuối)`,
    };
  }

  // Kiểm tra transition hợp lệ
  const validTransitions = getValidTransitions(currentStatus);
  const isValid = validTransitions.some(
    (status) => status.toLowerCase().trim() === newStatus.toLowerCase().trim()
  );

  if (!isValid) {
    return {
      valid: false,
      reason: `Không thể chuyển từ "${currentStatus}" sang "${newStatus}". Chỉ có thể chuyển sang: ${
        validTransitions.join(", ") || "không có"
      }.`,
    };
  }

  return { valid: true };
}

// ==================== STATUS UPDATE ====================

/**
 * Xử lý submit form cập nhật trạng thái
 * @param {Event} e - Submit event
 */
function handleStatusUpdateSubmit(e) {
  e.preventDefault();

  if (!currentViewingOrderId) {
    alert("❌ Không tìm thấy đơn hàng!");
    return;
  }

  const order = currentOrderList.find((o) => o.id === currentViewingOrderId);
  if (!order) {
    alert("❌ Không tìm thấy đơn hàng!");
    return;
  }

  const currentStatus = order.status;
  const newStatus = DOM.orderStatusUpdateSelect.value;

  // ✅ VALIDATE: Kiểm tra transition hợp lệ
  const validation = validateStatusTransition(currentStatus, newStatus);
  if (!validation.valid) {
    alert(`❌ ${validation.reason}`);
    // Reset về trạng thái cũ
    DOM.orderStatusUpdateSelect.value = currentStatus;
    return;
  }

  // ✅ CONFIRM: Đặc biệt cho "Đã hủy" (hoàn tồn kho)
  if (newStatus.toLowerCase().trim() === ORDER_STATUS.CANCELED.toLowerCase()) {
    if (
      !confirm(
        "⚠️ Bạn có chắc muốn HỦY đơn hàng này?\n\nThao tác này sẽ hoàn lại tồn kho và không thể hoàn tác."
      )
    ) {
      DOM.orderStatusUpdateSelect.value = currentStatus;
      return;
    }
  }

  // ✅ CONFIRM: Đặc biệt cho "Đã giao" (final state)
  if (newStatus.toLowerCase().trim() === ORDER_STATUS.DELIVERED.toLowerCase()) {
    if (
      !confirm(
        "✅ Xác nhận đơn hàng đã được giao thành công?\n\nSau khi xác nhận, trạng thái này sẽ không thể thay đổi."
      )
    ) {
      DOM.orderStatusUpdateSelect.value = currentStatus;
      return;
    }
  }

  // Update status
  const success = updateOrderStatus(currentViewingOrderId, newStatus);

  if (success) {
    alert("✅ Cập nhật trạng thái đơn hàng thành công!");
    loadAndRenderOrders();
    showOrderDetails(currentViewingOrderId);
  } else {
    alert("❌ Cập nhật trạng thái thất bại. Vui lòng kiểm tra console.");
    DOM.orderStatusUpdateSelect.value = currentStatus;
  }
}

// ==================== UTILITIES ====================

/**
 * Get CSS class cho status badge
 * @param {string} status - Order status
 * @returns {string} CSS class name
 */
function getStatusClass(status) {
  const s = status.toLowerCase().trim();

  switch (s) {
    case ORDER_STATUS.PROCESSED.toLowerCase():
      return "status-processed";
    case ORDER_STATUS.DELIVERED.toLowerCase():
      return "status-delivered";
    case ORDER_STATUS.CANCELED.toLowerCase():
      return "status-canceled";
    default:
      return "status-new";
  }
}

// ==================== EXPORTS ====================

export { ORDER_STATUS, FINAL_STATES, validateStatusTransition, isFinalStatus };
