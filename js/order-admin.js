import {
  getFilteredOrders,
  updateOrderStatus,
  getOrders,
} from "./order-manager.js";
import { DOM, userManager } from "./admin.js";

const ORDER_STATUS = {
  NEW: "Đang chờ xử lý",
  PROCESSED: "Đã xử lý",
  DELIVERED: "Đã giao",
  CANCELED: "Đã hủy",
};

const FINAL_STATES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED];

const STATE_TRANSITIONS = {
  [ORDER_STATUS.NEW]: [ORDER_STATUS.PROCESSED, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.PROCESSED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELED]: [],
};

let currentOrderList = [];
let currentViewingOrderId = null;

export function initOrderAdmin() {
  DOM.orderFilterApply.addEventListener("click", loadAndRenderOrders);
  DOM.orderFilterReset.addEventListener("click", resetFiltersAndLoad);
  DOM.ordersTableBody.addEventListener("click", handleTableClick);

  DOM.orderDetailClose.addEventListener("click", () => {
    DOM.orderDetailBox.style.display = "none";
    currentViewingOrderId = null;
  });

  if (DOM.orderStatusUpdateForm) {
    DOM.orderStatusUpdateForm.addEventListener("submit", handleStatusUpdateSubmit);
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

  DOM.orderDetailBox.style.display = "none";
  currentViewingOrderId = null;
}

function resetFiltersAndLoad() {
  DOM.orderFilterStatus.value = "all";
  DOM.orderFilterFrom.value = "";
  DOM.orderFilterTo.value = "";
  loadAndRenderOrders();
}

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
      customer?.hoTen || order.shipping?.fullName || order.shippingInfo?.fullName || "Khách vãng lai";

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

function handleTableClick(e) {
  const viewButton = e.target.closest(".btn-view-detail");
  if (viewButton) {
    const orderId = viewButton.dataset.id;
    showOrderDetails(orderId);
  }
}

function showOrderDetails(orderId) {
  const order = currentOrderList.find((o) => o.id === orderId);
  if (!order) {
    console.warn("⚠️ Không tìm thấy đơn hàng:", orderId);
    return;
  }

  currentViewingOrderId = orderId;

  const customer = userManager.users.find(
    (u) => u.tenDangNhap === order.userId
  );

  const customerName =
    customer?.hoTen ||
    order.shipping?.fullName ||
    order.shippingInfo?.fullName ||
    "Khách vãng lai";

  const customerEmail =
    order.shipping?.email ||
    customer?.email ||
    "N/A";

  const customerPhone =
    order.shipping?.phone ||
    order.shippingInfo?.phone ||
    customer?.soDienThoai ||
    "N/A";

  const customerAddress =
    order.shipping?.address ||
    order.shippingInfo?.address ||
    customer?.diaChiMacDinh ||
    "N/A";

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

  renderStatusSelector(order);

  DOM.orderDetailBox.style.display = "block";
  DOM.orderDetailBox.scrollIntoView({ behavior: "smooth" });
}

function renderStatusSelector(order) {
  const statusSelect = DOM.orderStatusUpdateSelect;
  if (!statusSelect) return;

  const currentStatus = order.status;
  const isFinalState = isFinalStatus(currentStatus);

  statusSelect.value = currentStatus;

  statusSelect.disabled = isFinalState;
  DOM.orderStatusUpdateBtn.disabled = isFinalState;

  if (isFinalState) {
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
    const existingMessage = statusSelect.parentElement.querySelector(
      ".final-state-message"
    );
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  populateValidStatusOptions(statusSelect, currentStatus);
}

function populateValidStatusOptions(selectElement, currentStatus) {
  selectElement.innerHTML = "";

  const currentOption = document.createElement("option");
  currentOption.value = currentStatus;
  currentOption.textContent = currentStatus;
  currentOption.selected = true;
  selectElement.appendChild(currentOption);

  const validNextStates = getValidTransitions(currentStatus);
  validNextStates.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    selectElement.appendChild(option);
  });
}

function isFinalStatus(status) {
  return FINAL_STATES.some(
    (finalStatus) =>
      status.toLowerCase().trim() === finalStatus.toLowerCase().trim()
  );
}

function getValidTransitions(currentStatus) {
  const normalizedStatus = Object.values(ORDER_STATUS).find(
    (status) => status.toLowerCase() === currentStatus.toLowerCase().trim()
  );

  if (!normalizedStatus) {
    console.warn("⚠️ Unknown status:", currentStatus);
    return [];
  }

  return STATE_TRANSITIONS[normalizedStatus] || [];
}

function validateStatusTransition(currentStatus, newStatus) {
  if (currentStatus.toLowerCase().trim() === newStatus.toLowerCase().trim()) {
    return {
      valid: false,
      reason: "Trạng thái mới giống trạng thái hiện tại",
    };
  }

  if (isFinalStatus(currentStatus)) {
    return {
      valid: false,
      reason: `Không thể thay đổi trạng thái từ "${currentStatus}" (trạng thái cuối)`,
    };
  }

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

  const validation = validateStatusTransition(currentStatus, newStatus);
  if (!validation.valid) {
    alert(`❌ ${validation.reason}`);
    DOM.orderStatusUpdateSelect.value = currentStatus;
    return;
  }

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

export { ORDER_STATUS, FINAL_STATES, validateStatusTransition, isFinalStatus };