// File: js/order-manager.js

const ORDER_STORAGE_KEY = "orders";

// Import productManager instance để xử lý tồn kho
import { productManager } from "./ProductManager.js";

/**
 * Lấy danh sách tất cả đơn hàng đã lưu.
 */
export function getOrders() {
  try {
    const ordersString = localStorage.getItem(ORDER_STORAGE_KEY);
    return JSON.parse(ordersString) || [];
  } catch (e) {
    console.error("Lỗi khi tải đơn hàng:", e);
    return [];
  }
}

//  Lấy đơn hàng đã lọc cho trang Admin
/**
 * Lấy danh sách đơn hàng đã lọc (cho Admin).
 */
export function getFilteredOrders(filters = {}) {
  let orders = getOrders();
  const { status, startDate, endDate } = filters;

  // 1. Lọc theo trạng thái
  if (status && status !== "all") {
    // Xử lý các trạng thái đồng nghĩa
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
    // Bạn có thể mở rộng thêm các case khác nếu cần
  }

  // 2. Lọc theo ngày bắt đầu
  if (startDate) {
    try {
      const start = new Date(startDate).setHours(0, 0, 0, 0); // Bắt đầu ngày
      orders = orders.filter((o) => {
        const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
        return orderDate >= start;
      });
    } catch (e) {
      console.error("Lỗi định dạng ngày bắt đầu:", e);
    }
  }

  // 3. Lọc theo ngày kết thúc
  if (endDate) {
    try {
      const end = new Date(endDate).setHours(23, 59, 59, 999); // Kết thúc ngày
      orders = orders.filter((o) => {
        const orderDate = new Date(o.date);
        return orderDate <= end;
      });
    } catch (e) {
      console.error("Lỗi định dạng ngày kết thúc:", e);
    }
  }

  // 4. Sắp xếp mới nhất lên đầu
  orders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return orders;
}

/**
 * Lấy lịch sử đơn hàng của một người dùng cụ thể, sắp xếp theo ngày mới nhất.
 */
export function getUserOrders(userId) {
  if (!userId) return [];

  const allOrders = getOrders();

  // 1. Lọc theo userId
  const userOrders = allOrders.filter((order) => order.userId === userId);

  // 2. Sắp xếp
  userOrders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return userOrders;
}

/**
 * Lưu đơn hàng mới vào localStorage.
 */
export function placeOrder(orderData) {
  // Kiểm tra dữ liệu đầu vào
  if (
    !orderData ||
    !Array.isArray(orderData.items) ||
    orderData.items.length === 0 ||
    !orderData.userId
  ) {
    alert("Dữ liệu đơn hàng không hợp lệ.");
    return false;
  }

  // 1) PRE-CHECK: Không được thay đổi kho trong bước này
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
    // Thông báo ngắn gọn (để UX tốt)
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

  // 2) TRỪ KHO (atomic theo client-side): giờ mới trừ kho cho từng item
  for (const item of orderData.items) {
    const isVariant = item.size && item.size !== "N/A";
    const ok = productManager.decreaseStock(
      item.id,
      parseInt(item.quantity) || 0,
      isVariant ? item.size : null
    );
    if (!ok) {
      // Trong thực tế cần rollback. Ở client-side đơn giản, ta cảnh báo và dừng.
      alert(
        `Có lỗi khi trừ kho: ${item.name}${
          isVariant ? ` (Size ${item.size})` : ""
        }. Vui lòng thử lại.`
      );
      return false;
    }
  }

  // 3) LƯU ĐƠN HÀNG
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

    // Cập nhật giao diện
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

// Đảm bảo checkout-ui dùng đúng placeOrder này
window.placeOrder = placeOrder;

//  Cập nhật trạng thái đơn hàng (cho Admin)

export function updateOrderStatus(orderId, newStatus) {
  if (!orderId || !newStatus) return false;

  // Nếu trạng thái mới là "Hủy", chúng ta gọi hàm cancelOrder
  // vì nó chứa logic hoàn tồn kho.
  if (newStatus.toLowerCase().trim() === "đã hủy") {
    return cancelOrder(orderId);
  }

  // Đối với các trạng thái khác (Đã xử lý, Đã giao, v.v.)
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    console.error(`Lỗi: Không tìm thấy đơn hàng ID: ${orderId} để cập nhật.`);
    return false;
  }

  const orderToUpdate = orders[orderIndex];

  // Nếu đơn đã bị hủy thì không cho đổi trạng thái khác
  if (orderToUpdate.status.toLowerCase().trim() === "đã hủy") {
    console.warn(
      `Đơn hàng ${orderId} đã bị hủy. Không thể thay đổi trạng thái.`
    );
    return false;
  }

  // Cập nhật trạng thái mới
  orderToUpdate.status = newStatus;

  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    console.log(`Đơn hàng ${orderId} đã cập nhật trạng thái: ${newStatus}`);

    // Cập nhật lại danh sách đơn hàng của người dùng (nếu đang ở trang order history)
    if (window.renderOrderHistory) {
      window.renderOrderHistory();
    }

    return true;
  } catch (e) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", e);
    return false;
  }
}

/**
 * Hủy đơn hàng (Chỉ cho phép nếu trạng thái là 'Đang chờ xử lý').
 */
export function cancelOrder(orderId) {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    console.log(`Lỗi: Không tìm thấy đơn hàng ID: ${orderId}`);
    return false;
  }

  const orderToCancel = orders[orderIndex];
  const currentStatus = orderToCancel.status.toLowerCase().trim();

  // Chỉ hủy nếu chưa bị hủy
  if (currentStatus !== "đã hủy") {
    // BƯỚC 1: HOÀN LẠI TỒN KHO
    // (Chỉ hoàn kho nếu đơn hàng chưa bị hủy trước đó)
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

    // BƯỚC 2: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    orderToCancel.status = "Đã hủy"; // Cập nhật trạng thái

    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));

      // CẬP NHẬT GIAO DIỆN TỒN KHO TỨC THỜI
      if (window.renderInventoryTable) {
        window.renderInventoryTable();
      }
      if (window.updateProductStockUI) {
        window.updateProductStockUI();
      }

      // Cập nhật lại danh sách đơn hàng (nếu đang ở trang order history)
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
    return true; // Vẫn trả về true vì mục tiêu đã đạt được
  }
}

// EXPORT HÀM RA GLOBAL WINDOW
window.placeOrder = placeOrder;
window.getOrders = getOrders;
window.getUserOrders = getUserOrders;
window.cancelOrder = cancelOrder;

window.getFilteredOrders = getFilteredOrders;
window.updateOrderStatus = updateOrderStatus;
