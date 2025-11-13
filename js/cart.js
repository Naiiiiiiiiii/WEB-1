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

// Hàm: Tìm variant (biến thể) của sản phẩm theo size
// @param productId: ID của sản phẩm
// @param size: Size cần tìm
// @return: Variant object hoặc null nếu không tìm thấy
function findVariant(productId, size) {
  // Lấy thông tin sản phẩm từ ProductManager
  const product = productManager.getProductById(productId);
  
  // Nếu không tìm thấy sản phẩm hoặc không có variants, trả về null
  if (!product || !product.variants || product.variants.length === 0) {
    return null;
  }
  
  // Tìm variant có size khớp (convert sang string để so sánh)
  return (
    product.variants.find((v) => v.size.toString() === size.toString()) || null
  );
}

// Hàm export: Cập nhật size của item trong giỏ hàng
// @param oldItemIdentifier: Identifier cũ của item (format: "id-size")
// @param newSize: Size mới muốn đổi
// @return: true nếu cập nhật thành công, false nếu không tìm thấy item
export function updateCartItemSize(oldItemIdentifier, newSize) {
  // Lấy giỏ hàng hiện tại
  let cart = getCart();
  
  // Tìm item cần update theo identifier cũ
  const oldIndex = cart.findIndex(
    (item) => item.itemIdentifier === oldItemIdentifier
  );

  // Nếu không tìm thấy item, trả về false
  if (oldIndex === -1) return false;

  // Lấy item cũ và chuẩn bị identifier mới
  const oldItem = cart[oldIndex];
  const newSizeStr = newSize.toString();  // Convert size sang string
  const newId = oldItem.id;                // Giữ nguyên product ID
  const newIdentifier = `${newId}-${newSizeStr}`;  // Tạo identifier mới

  // Kiểm tra xem giỏ đã có item với size mới chưa
  const existingIndex = cart.findIndex(
    (item) => item.itemIdentifier === newIdentifier
  );

  // Trường hợp 1: Đã có item với size mới (và không phải item hiện tại)
  if (existingIndex > -1 && existingIndex !== oldIndex) {
    // Cộng quantity của item cũ vào item đã tồn tại
    cart[existingIndex].quantity += oldItem.quantity;
    
    // Xóa item cũ khỏi giỏ (vì đã merge vào item khác)
    cart.splice(oldIndex, 1);
  } else {
    // Trường hợp 2: Chưa có item với size mới, update item hiện tại
    
    // Lấy thông tin sản phẩm để cập nhật giá
    const product = productManager.getProductById(newId);
    let newPrice = product ? product.price : oldItem.price;

    // Nếu sản phẩm có variants, lấy giá theo variant
    if (product && product.variants && product.variants.length > 0) {
      const variant = findVariant(newId, newSizeStr);
      
      // Ưu tiên giá của variant, nếu không có thì dùng giá sản phẩm
      newPrice = variant
        ? variant.price !== undefined
          ? variant.price        // Giá của variant
          : product.price        // Giá sản phẩm nếu variant không có giá riêng
        : product.price;         // Giá sản phẩm nếu không tìm thấy variant
    }

    // Cập nhật thông tin item
    oldItem.size = newSizeStr;                 // Size mới
    oldItem.price = Number(newPrice);          // Giá mới
    oldItem.itemIdentifier = newIdentifier;    // Identifier mới
  }

  // Lưu giỏ hàng đã cập nhật vào localStorage
  saveCart(cart);

  // Re-render table giỏ hàng nếu có hàm renderCartTable
  if (window.renderCartTable) {
    window.renderCartTable();
  }

  // Cập nhật badge số lượng trên icon giỏ hàng
  if (window.updateCartCount) {
    window.updateCartCount();
  }

  return true;  // Cập nhật thành công
}

// Gán hàm vào window để các file khác có thể gọi
window.updateCartItemSize = updateCartItemSize;

// Hàm export: Tính tổng tiền của giỏ hàng
// @return: Tổng tiền (Number)
export function calculateCartTotal() {
  // Lấy giỏ hàng hiện tại
  const cart = getCart();
  
  // Dùng reduce() để cộng dồn tổng tiền
  // sum: giá trị tích lũy, bắt đầu từ 0
  // item: mỗi item trong giỏ
  // Công thức: tổng = giá × số lượng
  return cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 0),
    0  // Giá trị khởi tạo của sum
  );
}
window.calculateCartTotal = calculateCartTotal;

// Hàm export: Cập nhật badge số lượng trên icon giỏ hàng
// Được gọi sau mỗi thao tác thêm/xóa/sửa giỏ hàng
export function updateCartCount() {
  // Lấy giỏ hàng hiện tại
  const cart = getCart();
  
  // Tính tổng số lượng sản phẩm (cộng dồn quantity của tất cả items)
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Lấy element hiển thị số lượng (badge trên icon giỏ hàng)
  const countElement = document.querySelector(".cart-count");

  if (countElement) {
    // Lấy số lượng hiện tại đang hiển thị (để so sánh)
    const currentCount = parseInt(countElement.textContent) || 0;

    // Cập nhật số lượng mới
    countElement.textContent = totalCount;
    
    // Hiển thị badge nếu có sản phẩm, ẩn nếu giỏ trống
    countElement.style.display = totalCount > 0 ? "flex" : "none";

    // Nếu số lượng tăng lên, thêm animation bounce
    if (totalCount > currentCount || (totalCount > 0 && currentCount === 0)) {
      // Tìm wrapper của icon giỏ hàng
      const iconWrapper = countElement.closest(".cart-icon-wrapper");
      
      if (iconWrapper) {
        // Xóa class bounce (nếu có) để reset animation
        iconWrapper.classList.remove("bounce");
        
        // Force reflow để đảm bảo animation chạy lại
        void iconWrapper.offsetWidth;
        
        // Thêm class bounce để trigger animation
        iconWrapper.classList.add("bounce");
        
        // Xóa class sau 600ms (khi animation kết thúc)
        setTimeout(() => iconWrapper.classList.remove("bounce"), 600);
      }
    }
  }
}
// Gán vào window để các file khác có thể gọi
window.updateCartCount = updateCartCount;

// Hàm: Lấy số lượng tồn kho khả dụng cho một item trong giỏ
// @param cartItem: Item trong giỏ hàng
// @return: Số lượng tồn kho (Number)
function getAvailableStockForItem(cartItem) {
  // Lấy thông tin sản phẩm từ ProductManager
  const product = productManager.getProductById(cartItem.id);
  
  // Nếu không tìm thấy sản phẩm, tồn kho = 0
  if (!product) return 0;

  // Nếu sản phẩm có variants (theo size)
  if (product.variants && product.variants.length > 0) {
    // Nếu chưa chọn size hoặc size = "Chưa chọn"
    if (!cartItem.size || cartItem.size === "Chưa chọn") {
      // Trả về Infinity (không giới hạn) vì chưa chọn size cụ thể
      return Infinity;
    }
    
    // Tìm variant theo size
    const variant = product.variants.find(
      (v) => v.size?.toString() === cartItem.size?.toString()
    );
    
    // Trả về stock của variant, nếu không tìm thấy thì = 0
    return variant ? parseInt(variant.stock) || 0 : 0;
  }

  // Nếu không có variants, trả về initialStock
  return parseInt(product.initialStock) || 0;
}

// Hàm: Lấy số lượng hiện tại của sản phẩm trong giỏ hàng
// @param productId: ID của sản phẩm
// @param sizeString: Size của sản phẩm (string)
// @return: Số lượng hiện có trong giỏ (Number)
function getCurrentCartQty(productId, sizeString) {
  // Lấy giỏ hàng hiện tại
  const cart = getCart();
  
  // Tạo identifier để tìm item (format: "id-size")
  const identifier = `${productId}-${sizeString}`;
  
  // Tìm item trong giỏ theo identifier
  const item = cart.find((i) => i.itemIdentifier === identifier);
  
  // Trả về quantity của item, nếu không có thì = 0
  return item ? parseInt(item.quantity) || 0 : 0;
}

// Hàm export: Thêm sản phẩm vào giỏ hàng
// Hàm phức tạp nhất trong module - xử lý nhiều edge cases
// @param productId: ID sản phẩm
// @param name: Tên sản phẩm
// @param price: Giá sản phẩm
// @param img: URL ảnh sản phẩm
// @param size: Size được chọn (có thể null/undefined/"Chưa chọn")
// @param color: Màu sắc (có thể null)
// @param quantity: Số lượng muốn thêm (mặc định = 1)
// @return: true nếu thành công, false nếu thất bại
export function addToCart(
  productId,
  name,
  price,
  img,
  size,
  color,
  quantity = 1
) {
  // Validate 1: Kiểm tra user đã đăng nhập chưa
  const username = getCurrentUsername();
  if (!username) {
    // Nếu chưa đăng nhập, mở modal login
    if (window.openLoginModal) window.openLoginModal();
    return false;
  }

  // Sanitize giá: Loại bỏ tất cả ký tự không phải số
  // VD: "1.000.000₫" → "1000000"
  let priceString = String(price).replace(/[^\d]/g, "");
  const safePrice = parseInt(priceString) || 0;
  
  // Validate 2: Kiểm tra giá có bất thường không (bug nhân đôi)
  if (safePrice > 10000000000) {  // > 10 tỷ
    console.error(
      "Lỗi: Giá trị sản phẩm có vẻ bị nhân đôi. Vui lòng xóa Local Storage thủ công."
    );
    return false;
  }

  // Validate 3: Kiểm tra sản phẩm có tồn tại không
  const product = productManager.getProductById(productId);
  if (!product) return false;

  // Kiểm tra sản phẩm có variants (nhiều size) không
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Xử lý size an toàn
  let safeSize = "N/A";  // Mặc định cho sản phẩm không có variants
  
  if (hasVariants) {
    // Nếu có variants, xử lý size input
    
    // Normalize size: null/undefined → "Chưa chọn"
    const incomingSize =
      size === null || size === undefined ? "Chưa chọn" : String(size);
    
    // Kiểm tra size có tồn tại trong variants không
    const variantExists = product.variants.some(
      (v) => v.size?.toString() === incomingSize
    );
    
    // Gán safeSize: nếu variant exists thì dùng, không thì "Chưa chọn"
    safeSize = variantExists
      ? incomingSize
      : incomingSize === "Chưa chọn"
      ? "Chưa chọn"
      : "Chưa chọn";
  }

  // Xử lý màu an toàn
  const safeColor = color || "N/A";
  
  // Parse số lượng, đảm bảo >= 1
  const requestedQty = parseInt(quantity) || 1;

  // Lấy giỏ hàng hiện tại
  let cart = getCart();

  // Trường hợp 1: Sản phẩm có variants VÀ đã chọn size cụ thể
  if (hasVariants && safeSize !== "Chưa chọn") {
    // Tìm variant theo size
    const variant = product.variants.find(
      (v) => v.size?.toString() === safeSize
    );
    
    // Lấy tồn kho của variant này
    const stock = variant ? parseInt(variant.stock) || 0 : 0;

    // Lấy số lượng đã có trong giỏ của size này
    const currentInCart = getCurrentCartQty(productId, safeSize);
    
    // Tính số lượng còn có thể thêm
    const remaining = Math.max(0, stock - currentInCart);

    // Validate: Nếu không còn tồn kho
    if (remaining <= 0) {
      alert(`Size ${safeSize} đã được thêm tối đa có thể.`);
      return false;
    }

    // Số lượng thực tế thêm = min(số lượng yêu cầu, số lượng còn lại)
    const addQty = Math.min(requestedQty, remaining);
    
    // Tạo identifier duy nhất cho item (format: "id-size")
    const itemIdentifier = `${productId}-${safeSize}`;
    
    // Tìm xem item này đã có trong giỏ chưa
    const idx = cart.findIndex((i) => i.itemIdentifier === itemIdentifier);

    if (idx > -1) {
      // Item đã tồn tại: Tăng quantity
      cart[idx].quantity = (parseInt(cart[idx].quantity) || 0) + addQty;
    } else {
      // Item chưa có: Tạo mới và push vào giỏ
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

    // Nếu thêm không đủ số lượng yêu cầu, thông báo
    if (addQty < requestedQty) {
      alert(
        `Tồn kho còn ${remaining} cho Size ${safeSize}. Số lượng đã được thêm tối đa có thể.`
      );
    }

    // Lưu giỏ hàng vào localStorage
    saveCart(cart);
    
    // Cập nhật badge số lượng trên icon giỏ hàng
    if (window.updateCartCount) window.updateCartCount();
    
    return true;  // Thêm thành công
  }

  // Trường hợp 2: Sản phẩm có variants NHƯNG chưa chọn size
  if (hasVariants && safeSize === "Chưa chọn") {
    // Tạo identifier với size "Chưa chọn"
    const itemIdentifier = `${productId}-Chưa chọn`;
    
    // Kiểm tra xem đã có item "Chưa chọn" trong giỏ chưa
    const idx = cart.findIndex((i) => i.itemIdentifier === itemIdentifier);

    if (idx > -1) {
      // Nếu đã có item "Chưa chọn", không cho thêm nữa
      // Yêu cầu user phải chọn size trước
      alert("Vui lòng chọn Size trước khi thêm số lượng.");
      return false;
    } else {
      // Nếu chưa có, cho phép thêm 1 item "Chưa chọn"
      // User sẽ chọn size sau trong giỏ hàng
      cart.push({
        id: productId,
        name,
        price: safePrice,
        img,
        size: "Chưa chọn",
        color: safeColor,
        quantity: 1,  // Chỉ cho thêm 1 item
        itemIdentifier,
      });
      
      saveCart(cart);
      
      // Cập nhật badge
      if (window.updateCartCount) window.updateCartCount();
      
      return true;
    }
  }

  // Trường hợp 3: Sản phẩm KHÔNG có variants (sản phẩm đơn giản)
  
  // Lấy tồn kho ban đầu
  const initialStock = parseInt(product.initialStock) || 0;
  
  // Lấy số lượng đã có trong giỏ (dùng "N/A" làm size)
  const currentInCart = getCurrentCartQty(productId, "N/A");
  
  // Tính số lượng còn có thể thêm
  const remaining = Math.max(0, initialStock - currentInCart);

  // Validate: Kiểm tra tồn kho
  if (remaining <= 0) {
    alert("Sản phẩm đã hết hàng trong khả năng đặt thêm.");
    return false;
  }

  // Số lượng thực tế thêm
  const addQty = Math.min(requestedQty, remaining);
  
  // Tạo identifier (format: "id-N/A")
  const itemIdentifier = `${productId}-N/A`;
  
  // Tìm item trong giỏ
  const idx = cart.findIndex((i) => i.itemIdentifier === itemIdentifier);

  if (idx > -1) {
    // Item đã tồn tại: Tăng quantity
    cart[idx].quantity = (parseInt(cart[idx].quantity) || 0) + addQty;
  } else {
    // Item chưa có: Tạo mới
    cart.push({
      id: productId,
      name,
      price: safePrice,
      img,
      size: "N/A",  // Không có size
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
