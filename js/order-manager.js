import { syncToStorage, getFromStorage } from "./storage-utils.js";

const ORDER_STORAGE_KEY = "orders";

import { productManager } from "./ProductManager.js";

export function getOrders() {
  try {
    return getFromStorage(ORDER_STORAGE_KEY, []);
  } catch (e) {
    console.error("Lỗi khi tải đơn hàng:", e);
    return [];
  }
}

export function getFilteredOrders(filters = {}) {
  let orders = getOrders();
  const { status, startDate, endDate } = filters;

  if (status && status !== "all") {

    if (status === "new") {
      orders = orders.filter(
        (o) =>
          o.status.toLowerCase().trim() === "đang chờ xử lý" ||
          o.status.toLowerCase().trim() === "mới đặt"
      );
    } else if (status === "canceled") {
      orders = orders.filter((o) => o.status.toLowerCase().trim() === "đã hủy");
    } else if (status === "processed") {
      orders = orders.filter(
        (o) => o.status.toLowerCase().trim() === "đã xử lý"
      );
    } else if (status === "delivered") {
      orders = orders.filter(
        (o) => o.status.toLowerCase().trim() === "đã giao"
      );
    }

  }

  if (startDate) {
    try {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      orders = orders.filter((o) => {
        const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
        return orderDate >= start;
      });
    } catch (e) {
      console.error("Lỗi định dạng ngày bắt đầu:", e);
    }
  }

  if (endDate) {
    try {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      orders = orders.filter((o) => {
        const orderDate = new Date(o.date);
        return orderDate <= end;
      });
    } catch (e) {
      console.error("Lỗi định dạng ngày kết thúc:", e);
    }
  }

  orders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return orders;
}

export function getUserOrders(userId) {
  if (!userId) return [];

  const allOrders = getOrders();

  const userOrders = allOrders.filter((order) => order.userId === userId);

  userOrders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return userOrders;
}

export function placeOrder(orderData) {

  if (
    !orderData ||
    !Array.isArray(orderData.items) ||
    orderData.items.length === 0 ||
    !orderData.userId
  ) {
    alert("Dữ liệu đơn hàng không hợp lệ.");
    return false;
  }

  const insufficient = [];
  for (const item of orderData.items) {
    const product = productManager.getProductById(item.id);
    const qty = parseInt(item.quantity) || 0;

    if (!product) {
      insufficient.push({
        id: item.id,
        name: item.name,
        reason: "Không tìm thấy sản phẩm",
      });
      continue;
    }

    if (product.variants && product.variants.length > 0) {
      if (!item.size || item.size === "Chưa chọn") {
        insufficient.push({
          id: item.id,
          name: item.name,
          reason: "Chưa chọn Size",
        });
        continue;
      }
      const variant = product.variants.find(
        (v) => v.size?.toString() === item.size?.toString()
      );
      const available = variant ? parseInt(variant.stock) || 0 : 0;
      if (qty > available) {
        insufficient.push({
          id: item.id,
          name: item.name,
          size: item.size,
          available,
          requested: qty,
          reason: "Vượt tồn kho",
        });
      }
    } else {
      const available = parseInt(product.initialStock) || 0;
      if (qty > available) {
        insufficient.push({
          id: item.id,
          name: item.name,
          available,
          requested: qty,
          reason: "Vượt tồn kho",
        });
      }
    }
  }

  if (insufficient.length > 0) {

    const lines = insufficient
      .slice(0, 3)
      .map((x) => {
        const base = `- ${x.name}${x.size ? ` (Size ${x.size})` : ""}`;
        return x.reason === "Vượt tồn kho"
          ? `${base}: yêu cầu ${x.requested}, còn ${x.available}`
          : `${base}: ${x.reason}`;
      })
      .join("\n");
    alert(
      `Không thể đặt hàng do thiếu hàng:\n${lines}${
        insufficient.length > 3
          ? `\n... và ${insufficient.length - 3} mặt hàng khác.`
          : ""
      }`
    );
    return false;
  }

  for (const item of orderData.items) {
    const isVariant = item.size && item.size !== "N/A";
    const ok = productManager.decreaseStock(
      item.id,
      parseInt(item.quantity) || 0,
      isVariant ? item.size : null
    );
    if (!ok) {

      alert(
        `Có lỗi khi trừ kho: ${item.name}${
          isVariant ? ` (Size ${item.size})` : ""
        }. Vui lòng thử lại.`
      );
      return false;
    }
  }

  const orders = getOrders();
  const orderId = `ORD-${Date.now()}`;
  const newOrder = {
    ...orderData,
    id: orderId,
    status: "Đang chờ xử lý",
    orderDate: new Date().toLocaleDateString("vi-VN"),
    total: orderData.total || 0,
    date: new Date().toISOString(),
    inventoryStatus: "OK",
  };

  try {
    syncToStorage(ORDER_STORAGE_KEY, orders.concat(newOrder));

    if (window.renderInventoryTable) window.renderInventoryTable();
    if (window.updateProductStockUI) window.updateProductStockUI();
    if (window.clearCart) window.clearCart();
    if (window.updateCartCount) window.updateCartCount();

    return newOrder;
  } catch (e) {
    console.error("Lỗi khi lưu đơn hàng:", e);
    alert("Có lỗi khi lưu đơn hàng. Vui lòng thử lại.");
    return false;
  }
}

window.placeOrder = placeOrder;

export function updateOrderStatus(orderId, newStatus) {
  if (!orderId || !newStatus) return false;

  if (newStatus.toLowerCase().trim() === "đã hủy") {
    return cancelOrder(orderId);
  }

  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    console.error(`Lỗi: Không tìm thấy đơn hàng ID: ${orderId} để cập nhật.`);
    return false;
  }

  const orderToUpdate = orders[orderIndex];

  if (orderToUpdate.status.toLowerCase().trim() === "đã hủy") {
    console.warn(
      `Đơn hàng ${orderId} đã bị hủy. Không thể thay đổi trạng thái.`
    );
    return false;
  }

  orderToUpdate.status = newStatus;

  try {
    syncToStorage(ORDER_STORAGE_KEY, orders);
    console.log(`Đơn hàng ${orderId} đã cập nhật trạng thái: ${newStatus}`);

    if (window.renderOrderHistory) {
      window.renderOrderHistory();
    }

    return true;
  } catch (e) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", e);
    return false;
  }
}

export function cancelOrder(orderId) {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    console.log(`Lỗi: Không tìm thấy đơn hàng ID: ${orderId}`);
    return false;
  }

  const orderToCancel = orders[orderIndex];
  const currentStatus = orderToCancel.status.toLowerCase().trim();

  if (currentStatus !== "đã hủy") {

    orderToCancel.items.forEach((item) => {
      const isIncreased = productManager.increaseStock(
        item.id,
        item.quantity,
        item.size
      );
      if (!isIncreased) {
        console.warn(
          `Cảnh báo: Không thể hoàn tồn kho cho SP ID ${item.id} - Size ${item.size} khi hủy đơn.`
        );
      }
    });

    orderToCancel.status = "Đã hủy";

    try {
      syncToStorage(ORDER_STORAGE_KEY, orders);

      if (window.renderInventoryTable) {
        window.renderInventoryTable();
      }
      if (window.updateProductStockUI) {
        window.updateProductStockUI();
      }

      if (window.renderOrderHistory) {
        window.renderOrderHistory();
      }

      return true;
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", e);
      return false;
    }
  } else {
    console.log(`Đơn hàng ${orderId} đã ở trạng thái 'Đã hủy'.`);
    return true;
  }
}

window.placeOrder = placeOrder;
window.getOrders = getOrders;
window.getUserOrders = getUserOrders;
window.cancelOrder = cancelOrder;

window.getFilteredOrders = getFilteredOrders;
window.updateOrderStatus = updateOrderStatus;
