// Import ProductManager để lấy thông tin sản phẩm khi cần
import { ProductManager } from "./ProductManager.js";
const productManager = new ProductManager();

// Key để lưu thông tin người dùng hiện tại trong localStorage
const USER_MANAGER_KEY = "nguoiDungHienTai";

// Hàm: Lấy username của người dùng đang đăng nhập
function getCurrentUsername() {
  try {
    // Đọc dữ liệu người dùng từ localStorage
    const currentUserData = localStorage.getItem(USER_MANAGER_KEY);
    
    if (currentUserData) {
      // Parse JSON và lấy username
      const user = JSON.parse(currentUserData);
      return user.tenDangNhap;
    }
  } catch (e) {
    // Log lỗi nếu có vấn đề khi đọc hoặc parse
    console.error("Lỗi khi đọc current user:", e);
  }
  
  // Trả về null nếu không có người dùng đăng nhập
  return null;
}

// Hàm export: Lấy giỏ hàng của người dùng hiện tại
export function getCart() {
  // Lấy username của người dùng đang đăng nhập
  const username = getCurrentUsername();
  
  // Nếu chưa đăng nhập, trả về giỏ hàng rỗng
  if (!username) {
    return [];
  }
  
  // Tạo key riêng cho giỏ hàng của từng user (cart_username)
  const cartKey = `cart_${username}`;
  
  try {
    // Đọc dữ liệu giỏ hàng từ localStorage
    const cartString = localStorage.getItem(cartKey);
    
    // Parse JSON, nếu null thì dùng mảng rỗng
    const cart = JSON.parse(cartString) || [];
    
    // Chuẩn hóa dữ liệu từng item trong giỏ hàng
    return cart.map((item) => ({
      ...item,  // Giữ nguyên các thuộc tính cũ
      price: Number(item.price) || 0,  // Đảm bảo price là số
      quantity: parseInt(item.quantity) || 0,  // Đảm bảo quantity là số nguyên
      // Tạo identifier duy nhất cho item (kết hợp id và size)
      itemIdentifier: item.itemIdentifier || `${item.id}-${item.size || "N/A"}`,
    }));
  } catch (e) {
    // Log lỗi nếu có vấn đề khi đọc/parse
    console.error("Lỗi khi tải giỏ hàng:", e);
    return [];
  }
}

// Gán hàm vào window để các file khác có thể gọi
window.getCart = getCart;

// Hàm: Lưu giỏ hàng vào localStorage
function saveCart(cart) {
  // Lấy username của người dùng đang đăng nhập
  const username = getCurrentUsername();
  
  // Nếu chưa đăng nhập, không thể lưu
  if (!username) {
    console.warn("Không thể lưu giỏ hàng: Người dùng chưa đăng nhập.");
    return;
  }
  
  // Tạo key riêng cho giỏ hàng của user này
  const cartKey = `cart_${username}`;
  
  // Lưu giỏ hàng vào localStorage dưới dạng JSON string
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function findVariant(productId, size) {
  const product = productManager.getProductById(productId);
  if (!product || !product.variants || product.variants.length === 0) {
    return null;
  }
  return (
    product.variants.find((v) => v.size.toString() === size.toString()) || null
  );
}

export function updateCartItemSize(oldItemIdentifier, newSize) {
  let cart = getCart();
  const oldIndex = cart.findIndex(
    (item) => item.itemIdentifier === oldItemIdentifier
  );

  if (oldIndex === -1) return false;

  const oldItem = cart[oldIndex];
  const newSizeStr = newSize.toString();
  const newId = oldItem.id;
  const newIdentifier = `${newId}-${newSizeStr}`;

  const existingIndex = cart.findIndex(
    (item) => item.itemIdentifier === newIdentifier
  );

  if (existingIndex > -1 && existingIndex !== oldIndex) {
    cart[existingIndex].quantity += oldItem.quantity;
    cart.splice(oldIndex, 1);
  } else {
    const product = productManager.getProductById(newId);
    let newPrice = product ? product.price : oldItem.price;

    if (product && product.variants && product.variants.length > 0) {
      const variant = findVariant(newId, newSizeStr);
      newPrice = variant
        ? variant.price !== undefined
          ? variant.price
          : product.price
        : product.price;
    }

    oldItem.size = newSizeStr;
    oldItem.price = Number(newPrice);
    oldItem.itemIdentifier = newIdentifier;
  }

  saveCart(cart);

  if (window.renderCartTable) {
    window.renderCartTable();
  }

  if (window.updateCartCount) {
    window.updateCartCount();
  }

  return true;
}
window.updateCartItemSize = updateCartItemSize;

export function calculateCartTotal() {
  const cart = getCart();
  return cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 0),
    0
  );
}
window.calculateCartTotal = calculateCartTotal;

export function updateCartCount() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const countElement = document.querySelector(".cart-count");

  if (countElement) {
    const currentCount = parseInt(countElement.textContent) || 0;

    countElement.textContent = totalCount;
    countElement.style.display = totalCount > 0 ? "flex" : "none";

    if (totalCount > currentCount || (totalCount > 0 && currentCount === 0)) {
      const iconWrapper = countElement.closest(".cart-icon-wrapper");
      if (iconWrapper) {
        iconWrapper.classList.remove("bounce");
        void iconWrapper.offsetWidth;
        iconWrapper.classList.add("bounce");
        setTimeout(() => iconWrapper.classList.remove("bounce"), 600);
      }
    }
  }
}
window.updateCartCount = updateCartCount;

function getAvailableStockForItem(cartItem) {
  const product = productManager.getProductById(cartItem.id);
  if (!product) return 0;

  if (product.variants && product.variants.length > 0) {
    if (!cartItem.size || cartItem.size === "Chưa chọn") {

      return Infinity;
    }
    const variant = product.variants.find(
      (v) => v.size?.toString() === cartItem.size?.toString()
    );
    return variant ? parseInt(variant.stock) || 0 : 0;
  }

  return parseInt(product.initialStock) || 0;
}

function getCurrentCartQty(productId, sizeString) {
  const cart = getCart();
  const identifier = `${productId}-${sizeString}`;
  const item = cart.find((i) => i.itemIdentifier === identifier);
  return item ? parseInt(item.quantity) || 0 : 0;
}

export function addToCart(
  productId,
  name,
  price,
  img,
  size,
  color,
  quantity = 1
) {
  const username = getCurrentUsername();
  if (!username) {
    if (window.openLoginModal) window.openLoginModal();
    return false;
  }

  let priceString = String(price).replace(/[^\d]/g, "");
  const safePrice = parseInt(priceString) || 0;
  if (safePrice > 10000000000) {
    console.error(
      "Lỗi: Giá trị sản phẩm có vẻ bị nhân đôi. Vui lòng xóa Local Storage thủ công."
    );
    return false;
  }

  const product = productManager.getProductById(productId);
  if (!product) return false;

  const hasVariants = product.variants && product.variants.length > 0;
  let safeSize = "N/A";
  if (hasVariants) {

    const incomingSize =
      size === null || size === undefined ? "Chưa chọn" : String(size);
    const variantExists = product.variants.some(
      (v) => v.size?.toString() === incomingSize
    );
    safeSize = variantExists
      ? incomingSize
      : incomingSize === "Chưa chọn"
      ? "Chưa chọn"
      : "Chưa chọn";
  }

  const safeColor = color || "N/A";
  const requestedQty = parseInt(quantity) || 1;

  let cart = getCart();

  if (hasVariants && safeSize !== "Chưa chọn") {
    const variant = product.variants.find(
      (v) => v.size?.toString() === safeSize
    );
    const stock = variant ? parseInt(variant.stock) || 0 : 0;

    const currentInCart = getCurrentCartQty(productId, safeSize);
    const remaining = Math.max(0, stock - currentInCart);

    if (remaining <= 0) {
      alert(`Size ${safeSize} đã được thêm tối đa có thể.`);
      return false;
    }

    const addQty = Math.min(requestedQty, remaining);
    const itemIdentifier = `${productId}-${safeSize}`;
    const idx = cart.findIndex((i) => i.itemIdentifier === itemIdentifier);

    if (idx > -1) {
      cart[idx].quantity = (parseInt(cart[idx].quantity) || 0) + addQty;
    } else {
      cart.push({
        id: productId,
        name,
        price: safePrice,
        img,
        size: safeSize,
        color: safeColor,
        quantity: addQty,
        itemIdentifier,
      });
    }

    if (addQty < requestedQty) {
      alert(
        `Tồn kho còn ${remaining} cho Size ${safeSize}. Số lượng đã được thêm tối đa có thể.`
      );
    }

    saveCart(cart);
    if (window.updateCartCount) window.updateCartCount();
    return true;
  }

  if (hasVariants && safeSize === "Chưa chọn") {
    const itemIdentifier = `${productId}-Chưa chọn`;
    const idx = cart.findIndex((i) => i.itemIdentifier === itemIdentifier);

    if (idx > -1) {

      alert("Vui lòng chọn Size trước khi thêm số lượng.");
      return false;
    } else {
      cart.push({
        id: productId,
        name,
        price: safePrice,
        img,
        size: "Chưa chọn",
        color: safeColor,
        quantity: 1,
        itemIdentifier,
      });
      saveCart(cart);
      if (window.updateCartCount) window.updateCartCount();
      return true;
    }
  }

  const initialStock = parseInt(product.initialStock) || 0;
  const currentInCart = getCurrentCartQty(productId, "N/A");
  const remaining = Math.max(0, initialStock - currentInCart);

  if (remaining <= 0) {
    alert("Sản phẩm đã hết hàng trong khả năng đặt thêm.");
    return false;
  }

  const addQty = Math.min(requestedQty, remaining);
  const itemIdentifier = `${productId}-N/A`;
  const idx = cart.findIndex((i) => i.itemIdentifier === itemIdentifier);

  if (idx > -1) {
    cart[idx].quantity = (parseInt(cart[idx].quantity) || 0) + addQty;
  } else {
    cart.push({
      id: productId,
      name,
      price: safePrice,
      img,
      size: "N/A",
      color: safeColor,
      quantity: addQty,
      itemIdentifier,
    });
  }

  if (addQty < requestedQty) {
    alert(`Tồn kho còn ${remaining}. Số lượng đã được thêm tối đa có thể.`);
  }

  saveCart(cart);
  if (window.updateCartCount) window.updateCartCount();
  return true;
}
window.addToCart = addToCart;

export function updateCartItemQuantity(itemIdentifier, newQuantity) {
  const toInt = (v) => {
    const n = parseInt(v);
    return isNaN(n) || n < 1 ? 1 : n;
  };

  let cart = getCart();
  const item = cart.find((i) => i.itemIdentifier === itemIdentifier);
  if (!item) return;

  const requestedQty = toInt(newQuantity);
  const currentQty = parseInt(item.quantity) || 1;

  const available = getAvailableStockForItem(item);

  if (available !== Infinity && requestedQty > available) {
    item.quantity = available > 0 ? available : 1;
    if (available <= 0) {
      alert("Sản phẩm đã hết hàng cho lựa chọn hiện tại.");
    } else {
      alert(`Tồn kho hiện tại chỉ còn ${available}.`);
    }
  } else {
    item.quantity = requestedQty;
  }

  if (item.quantity < 1) {
    removeCartItem(itemIdentifier);
    return;
  }

  saveCart(cart);

  if (window.updateCartCount) window.updateCartCount();
  if (window.renderCartTable) window.renderCartTable();
}
window.updateCartItemQuantity = updateCartItemQuantity;

export function removeCartItem(itemIdentifier) {
  let cart = getCart();
  const initialLength = cart.length;

  cart = cart.filter((i) => i.itemIdentifier !== itemIdentifier);

  if (cart.length < initialLength) {
    saveCart(cart);
  }
  if (window.updateCartCount) window.updateCartCount();
  if (window.renderCartTable) window.renderCartTable();
}
window.removeCartItem = removeCartItem;

export function clearCart() {
  const username = getCurrentUsername();
  if (username) {
    localStorage.removeItem(`cart_${username}`);
  }
  if (window.updateCartCount) window.updateCartCount();
  if (window.renderCartTable) window.renderCartTable();
}
window.clearCart = clearCart;

export function renderSizeSelector(cartItem) {
  const product = productManager.getProductById(cartItem.id);

  if (!product || !product.variants || product.variants.length === 0) {
    if (cartItem.size === "N/A") {
      return "";
    }
    return `Size: ${cartItem.size}`;
  }

  const uniqueSizes = [
    ...new Set(product.variants.map((v) => v.size.toString())),
  ];
  let html = `<select class="cart-size-selector form-select form-select-sm" data-id="${cartItem.itemIdentifier}">`;
  const isSizeMissing = cartItem.size === "Chưa chọn";
  if (isSizeMissing) {
    html += `<option value="Chưa chọn" selected disabled>-- Chọn Size --</option>`;
  }
  uniqueSizes.forEach((size) => {
    const variant = findVariant(cartItem.id, size);
    const stock = variant ? variant.stock || 0 : 0;
    const disabled = stock <= 0 ? "disabled" : "";
    const selected =
      !isSizeMissing && cartItem.size.toString() === size.toString()
        ? "selected"
        : "";
    const stockText = stock <= 0 ? " (Hết hàng)" : "";
    html += `<option value="${size}" ${selected} ${disabled}>${size} ${stockText}</option>`;
  });
  html += `</select>`;
  if (isSizeMissing) {
    html += `<div class="text-danger mt-1 small">Bắt buộc chọn Size</div>`;
  }
  return html;
}
window.renderSizeSelector = renderSizeSelector;

export function handleCartTableEvents() {
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("cart-size-selector")) {
      const selectEl = e.target;
      const oldIdentifier = selectEl.dataset.id;
      const newSize = selectEl.value;

      if (newSize !== "Chưa chọn") {
        updateCartItemSize(oldIdentifier, newSize);
      }
    }
  });
}
window.handleCartTableEvents = handleCartTableEvents;

export function checkCartBeforeCheckout() {
  const cart = getCart();

  const missingSizeItem = cart.find((item) => item.size === "Chưa chọn");
  if (missingSizeItem) {
    alert(
      `Vui lòng chọn Kích cỡ cho sản phẩm: "${missingSizeItem.name}" trước khi thanh toán.`
    );
    return false;
  }

  const missingColorItem = cart.find((item) => {
    const product = productManager.getProductById(item.id);

    return (
      product &&
      product.colors &&
      product.colors.length > 0 &&
      (item.color === "Chưa chọn" || item.color === "N/A" || !item.color)
    );
  });

  if (missingColorItem) {
    alert(
      `Vui lòng chọn Màu sắc cho sản phẩm: "${missingColorItem.name}" trước khi thanh toán.`
    );
    return false;
  }

  return true;
}
window.checkCartBeforeCheckout = checkCartBeforeCheckout;

export function placeOrder(orderData) {
  if (!window.checkCartBeforeCheckout()) {
    return false;
  }

  const newOrder = {
    ...orderData,
    id: `ORD-${Date.now()}`,
  };

  console.log("Đơn hàng đã được đặt thành công!");

  window.clearCart();

  if (window.updateProductStockUI) {
    window.updateProductStockUI();
  }

  return newOrder;
}
window.placeOrder = placeOrder;

updateCartCount();
handleCartTableEvents();
