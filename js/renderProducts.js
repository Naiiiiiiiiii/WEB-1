/**
 * renderProducts.js
 */
import { ProductManager } from "./ProductManager.js"; // Import ProductManager

console.log("LOG 1: renderProducts.js loaded.");

document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo ProductManager VÀ LẤY DỮ LIỆU
  const productManager = new ProductManager();
  // Lấy các sản phẩm được phép hiển thị cho khách hàng
  const allProducts = productManager.getVisibleProducts();

  console.log("LOG 2: All Products loaded (visible only):", allProducts);

  // --- Helpers ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /**
   Chuyển đổi ký tự HTML đặc biệt để chống XSS.
   */
  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Elements ---
  const productGrid = $(".product-grid");
  const filterBtns = $$(".filter-btn");
  const sortSelect = $(".sort-select");
  const loadMoreBtn = $(".load-more-btn");

  // modal elements
  const modal = $("#quick-view-modal");
  const modalImg = $("#modal-img");
  const modalName = $("#modal-name");
  const modalRating = $("#modal-rating");
  const modalPrice = $("#modal-price");
  const modalAddBtn = $("#modal-add-to-cart");
  const modalViewDetail = $("#modal-view-detail");

  // Phần tử chứa bộ chọn size trong modal (Cần có ID này trong HTML)
  const modalOptionsContainer = $("#modal-options-container");

  if (!productGrid) {
    console.error(
      "LỖI: .product-grid element not found in DOM. Cannot render."
    );
    return;
  }

  // --- State (Giữ nguyên) ---
  let currentCategory = "all";
  let currentSort = "";
  let perPage = 6;
  let currentPage = 1;
  let filtered = allProducts.slice();

  // --- Create product card (ĐÃ FIX LỖI GIÁ KÉP TRÊN GRID) ---
  function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;

    const badgeText = product.getBadgeText();
    const badgeHtml = product.badge
      ? `<div class="product-badge ${escapeHtml(product.badge)}">${escapeHtml(
          badgeText
        )}</div>`
      : "";

    const imgHtml = product.img
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(
          product.name
        )}" class="product-img">`
      : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`;

    const currentPrice = (product.price || 0).toLocaleString("vi-VN");
    let priceHtml = `<span class="current-price">${currentPrice} VNĐ</span>`;

    // Nếu có giá cũ và đang khuyến mãi, thêm giá cũ vào
    if (product.oldPrice && product.isOnSale()) {
      const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
      priceHtml = `<span class="current-price">${currentPrice} VNĐ</span> <span class="old-price">${oldPrice} VNĐ</span>`;
    }

    const ratingHtml = `<div class="product-rating"><div class="stars">${product.renderStars()}</div><span class="rating-text">(${
      product.ratingCount || 0
    })</span></div>`;

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-image">
        ${imgHtml}
        <div class="product-overlay">
          <button type="button" class="quick-view" data-id="${
            product.id
          }">Xem nhanh</button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-category">${escapeHtml(product.category)}</p>
        ${ratingHtml}
        <div class="product-price">
          ${priceHtml} 
        </div>
        <button type="button" class="add-to-cart" data-id="${product.id}">
          <i class="fas fa-cart-plus" aria-hidden="true"></i> Thêm vào giỏ
        </button>
      </div>
    `;
    return card;
  }

  // --- Render functions  ---
  function renderList() {
    productGrid.innerHTML = "";
    const end = perPage * currentPage;
    const slice = filtered.slice(0, end);

    console.log(
      `LOG 3: Rendering ${slice.length} products (page ${currentPage}).`
    );

    if (slice.length === 0) {
      productGrid.innerHTML =
        '<p class="no-products">Không có sản phẩm phù hợp.</p>';
      if (loadMoreBtn) loadMoreBtn.style.display = "none";
      return;
    }

    const frag = document.createDocumentFragment();
    slice.forEach((p) => frag.appendChild(createProductCard(p)));
    productGrid.appendChild(frag);

    if (loadMoreBtn) {
      if (filtered.length > end) loadMoreBtn.style.display = "block";
      else loadMoreBtn.style.display = "none";
    }
  }

  function applyFilters() {
    if (!allProducts || !Array.isArray(allProducts)) {
      filtered = [];
    } else if (currentCategory === "all") {
      filtered = allProducts.slice();
    } else {
      const normalized = (currentCategory || "").toLowerCase().trim();
      filtered = allProducts.filter((p) => {
        const name = (
          productManager.getCategoryName?.(p.categoryId) ??
          p.category ??
          ""
        )
          .toString()
          .toLowerCase()
          .trim();
        return name === normalized;
      });
    }

    if (currentSort === "price-asc") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (currentSort === "newest") {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (currentSort === "best-seller") {
      filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }

    currentPage = 1;
    renderList();
  }

  // --- Quick view (modal)  ---
  function openQuickView(productId) {
    const id = Number(productId);
    const product = productManager.getProductById(id);
    if (!product || !modal) return;

    // Điền thông tin vào modal
    if (modalImg) {
      modalImg.src = product.img || "./img/default.avif";
      modalImg.alt = product.name;
    }
    if (modalName) {
      modalName.textContent = product.name;
    }
    if (modalRating) {
      modalRating.innerHTML = `${product.renderStars()} <span class="rating-text">(${
        product.ratingCount || 0
      })</span>`;
    }

    // Logic hiển thị giá trong Modal (FIX LỖI KÉP THỨ 2)
    if (modalPrice) {
      const currentPrice = (product.price || 0).toLocaleString("vi-VN");
      let priceHtml = `<strong>${currentPrice} VNĐ</strong>`;

      // Nếu có giá cũ và đang khuyến mãi, thêm giá cũ vào
      if (product.oldPrice && product.isOnSale()) {
        const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
        priceHtml += ` <span class="old-price">${oldPrice} VNĐ</span>`;
      }
      modalPrice.innerHTML = priceHtml;
    }

    //LOGIC HIỂN THỊ CHỌN SIZE TRONG MODAL
    if (modalOptionsContainer) {
      // Dữ liệu size (Bạn có thể thay đổi tùy theo kho hàng)
      const sizeOptions = [39, 40, 41, 42, 43]
        .map((size) => `<option value="${size}">EU ${size}</option>`)
        .join("");

      modalOptionsContainer.innerHTML = `
        <div class="form-group size-selector">
          <label for="modal-shoe-size">Chọn Kích cỡ:</label>
          <select id="modal-shoe-size" required>
            <option value="">-- Chọn size --</option>
            ${sizeOptions}
          </select>
        </div>
      `;
    }

    if (modalAddBtn) modalAddBtn.dataset.id = id;

    if (modalViewDetail) {
      modalViewDetail.href = `./product-detail.html?id=${id}`;
    }

    // show modal
    modal.classList.add("open");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeQuickView() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    // Dọn dẹp HTML size khi đóng modal
    if (modalOptionsContainer) modalOptionsContainer.innerHTML = "";
  }

  // --- Event listeners  ---

  // 1. Xem nhanh (Quick View)
  productGrid.addEventListener("click", (e) => {
    const qv = e.target.closest(".quick-view");
    if (qv) {
      const id = qv.dataset.id;
      openQuickView(id);
      return;
    }
  });

  // 2. Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  // 3. Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  // 4. Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      currentPage++;
      renderList();
    });
  }

  // 5. Close modal
  const closeBtn = modal ? modal.querySelector(".close-btn") : null;
  if (closeBtn) {
    closeBtn.addEventListener("click", closeQuickView);
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuickView();
    });
  }

  // 6. Thêm vào giỏ từ modal
  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      const product = productManager.getProductById(id);

      // LOGIC LẤY SIZE VÀ BẮT BUỘC CHỌN SIZE
      const sizeSelector = document.getElementById("modal-shoe-size");
      const selectedSize = sizeSelector ? sizeSelector.value : null;

      if (!selectedSize || selectedSize === "") {
        alert("Vui lòng chọn kích cỡ giày.");
        return; // Ngăn chặn nếu chưa chọn size
      }

      // Giả định hàm addToCart toàn cục tồn tại (trong main.js)
      if (product && window.addToCart) {
        window.addToCart(
          product.id,
          product.name,
          product.price,
          product.img,
          selectedSize, // Dùng size đã chọn
          "N/A",
          1
        );
        closeQuickView();
      }
    });
  }

  // --- Init (Khởi tạo ban đầu) ---
  (function init() {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      productGrid.innerHTML = '<p class="no-products">Không có sản phẩm.</p>';
      console.log("LỖI (LOG 4): Khởi tạo thất bại: allProducts rỗng.");
      return;
    }

    applyFilters(); // Lần render đầu tiên
    console.log("LOG 5: Initialization complete. Products should be rendered.");
  })();
});
