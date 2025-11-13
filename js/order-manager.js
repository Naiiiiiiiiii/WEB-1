// File: order-manager.js
// Mục đích: Quản lý đơn hàng - CRUD operations và filter logic
// Bao gồm: Lấy danh sách đơn hàng, lọc theo tiêu chí, cập nhật trạng thái

// Constant: Key để lưu đơn hàng trong localStorage
const ORDER_STORAGE_KEY = "orders";

// Import ProductManager để giảm tồn kho khi tạo đơn
import { productManager } from "./ProductManager.js";

// Hàm export: Lấy tất cả đơn hàng từ localStorage
// @return: Mảng chứa tất cả đơn hàng (Array)
export function getOrders() {
  try {
    // Đọc dữ liệu từ localStorage
    const ordersString = localStorage.getItem(ORDER_STORAGE_KEY);
    
    // Parse JSON, nếu null thì trả về mảng rỗng
    return JSON.parse(ordersString) || [];
  } catch (e) {
    // Log lỗi nếu có vấn đề khi parse
    console.error("Lỗi khi tải đơn hàng:", e);
    return [];
  }
}

// Hàm export: Lấy đơn hàng đã lọc theo các tiêu chí
// @param filters: Object chứa các tiêu chí lọc {status, startDate, endDate}
// @return: Mảng đơn hàng đã lọc và sắp xếp (Array)
export function getFilteredOrders(filters = {}) {
  // Lấy tất cả đơn hàng
  let orders = getOrders();
  
  // Destructure các tiêu chí lọc từ param
  const { status, startDate, endDate } = filters;

  // Filter 1: Lọc theo trạng thái đơn hàng
  if (status && status !== "all") {
    // Trạng thái "new" (đơn mới)
    if (status === "new") {
      orders = orders.filter(
        (o) =>
          o.status.toLowerCase().trim() === "đang chờ xử lý" ||
          o.status.toLowerCase().trim() === "mới đặt"
      );
    } 
    // Trạng thái "canceled" (đã hủy)
    else if (status === "canceled") {
      orders = orders.filter((o) => o.status.toLowerCase().trim() === "đã hủy");
    } 
    // Trạng thái "processed" (đã xử lý)
    else if (status === "processed") {
      orders = orders.filter(
        (o) => o.status.toLowerCase().trim() === "đã xử lý"
      );
    } 
    // Trạng thái "delivered" (đã giao)
    else if (status === "delivered") {
      orders = orders.filter(
        (o) => o.status.toLowerCase().trim() === "đã giao"
      );
    }
  }

  // Filter 2: Lọc theo ngày bắt đầu
  if (startDate) {
    try {
      // Set giờ về 00:00:00 để so sánh ngày
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      
      // Lọc các đơn có ngày >= startDate
      orders = orders.filter((o) => {
        const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
        return orderDate >= start;
      });
    } catch (e) {
      console.error("Lỗi định dạng ngày bắt đầu:", e);
    }
  }

  // Filter 3: Lọc theo ngày kết thúc
  if (endDate) {
    try {
      // Set giờ về 23:59:59.999 để bao gồm cả ngày cuối
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      
      // Lọc các đơn có ngày <= endDate
      orders = orders.filter((o) => {
        const orderDate = new Date(o.date);
        return orderDate <= end;
      });
    } catch (e) {
      console.error("Lỗi định dạng ngày kết thúc:", e);
    }
  }

  // Sắp xếp đơn hàng theo thời gian (mới nhất trước)
  // getTime() convert Date thành timestamp (milliseconds) để so sánh
  orders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return orders;
}

// Hàm export: Lấy danh sách đơn hàng của một user cụ thể
// @param userId: ID của user cần lấy đơn hàng
// @return: Mảng đơn hàng của user (Array)
export function getUserOrders(userId) {
  // Nếu không có userId, trả về mảng rỗng
  if (!userId) return [];

  // Lấy tất cả đơn hàng
  const allOrders = getOrders();

  // Lọc chỉ lấy đơn của user này
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
    localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify(orders.concat(newOrder))
    );

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
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
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
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));

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
