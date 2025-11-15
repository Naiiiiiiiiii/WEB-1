import { ProductManager } from "./ProductManager.js";
import { categoryManager } from "./category.js";

document.addEventListener("DOMContentLoaded", () => {
  const productManager = new ProductManager();

  const allProducts = productManager.getVisibleProducts();

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const productGrid = $(".product-grid");
  const filterGroup = $(".filter-group");
  const sortSelect = $(".sort-select");
  const paginationContainer = $("#pagination-controls");

  const modal = $("#quick-view-modal");
  const modalImg = $("#modal-img");
  const modalName = $("#modal-name");
  const modalRating = $("#modal-rating");
  const modalPrice = $("#modal-price");
  const modalAddBtn = $("#modal-add-to-cart");
  const modalViewDetail = $("#modal-view-detail");

  const modalOptionsContainer = $("#modal-options-container");

  if (!productGrid) {
    return;
  }

  let currentCategory = "all";
  let currentSort = "";

  const ITEMS_PER_PAGE = 6;
  let productsPerPage = ITEMS_PER_PAGE;

  let currentPage = 1;
  let filtered = allProducts.slice();
  let totalPages = 0;

  // ===== FILE: js/renderProducts.js =====
  // Sửa function createProductCard (line 50-103)

  function createProductCard(product) {
    if (!product) return null;

    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;

    // ✅ FIX: Safe badge handling
    let badgeHtml = "";
    if (product.badge) {
      let badgeText = product.badge;

      // Nếu có method getBadgeText thì dùng, không thì fallback
      if (typeof product.getBadgeText === "function") {
        badgeText = product.getBadgeText();
      } else {
        // Fallback: Tự implement logic getBadgeText
        const badgeMap = {
          hot: "Hot",
          new: "Mới",
          sale: "Giảm giá",
          "best-seller": "Bán chạy",
        };
        badgeText = badgeMap[product.badge] || product.badge;
      }

      badgeHtml = `<div class="product-badge ${escapeHtml(
        product.badge
      )}">${escapeHtml(badgeText)}</div>`;
    }

    const imgHtml = product.img
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(
          product.name
        )}" class="product-img" loading="lazy">`
      : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`;

    const currentPrice = (product.price || 0).toLocaleString("vi-VN");
    let priceHtml = `<span class="current-price">${currentPrice}₫</span>`;

    // ✅ FIX: Safe isOnSale check
    const isOnSale = product.oldPrice && product.oldPrice > product.price;
    if (isOnSale) {
      const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
      priceHtml = `
            <span class="current-price">${currentPrice}₫</span>
            <span class="old-price">${oldPrice}₫</span>
        `;
    }

    // ✅ FIX: Safe renderStars
    let ratingHtml = "";
    if (typeof product.renderStars === "function") {
      ratingHtml = `
            <div class="product-rating">
                <div class="stars">${product.renderStars()}</div>
                <span class="rating-text">(${product.ratingCount || 0})</span>
            </div>
        `;
    } else {
      // Fallback: Render stars manually
      const rating = product.rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

      let starsHtml = "";
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
      }
      if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
      }
      for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
      }

      ratingHtml = `
            <div class="product-rating">
                <div class="stars">${starsHtml}</div>
                <span class="rating-text">(${product.ratingCount || 0})</span>
            </div>
        `;
    }

    // Get category name safely
    const categoryName =
      productManager.getCategoryName?.(product.categoryId) ||
      product.category ||
      "Không rõ";

    card.innerHTML = `
        ${badgeHtml}
        <div class="product-image">
            ${imgHtml}
            <div class="product-overlay">
                <button type="button" class="quick-view" data-id="${
                  product.id
                }">
                    Xem nhanh
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <p class="product-category">${escapeHtml(categoryName)}</p>
            ${ratingHtml}
            <div class="product-price">${priceHtml}</div>
            <button type="button" class="add-to-cart" data-id="${product.id}">
                <i class="fas fa-cart-plus" aria-hidden="true"></i>
                Thêm vào giỏ
            </button>
        </div>
    `;

    return card;
  }
  function renderPaginationControls() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = "Trước";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => goToPage(currentPage - 1));
    paginationContainer.appendChild(prevButton);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(totalPages, 5);
      if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.classList.toggle("active", i === currentPage);
      pageButton.addEventListener("click", () => goToPage(i));
      paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "Sau";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => goToPage(currentPage + 1));
    paginationContainer.appendChild(nextButton);
  }

  function renderList() {
    productGrid.innerHTML = "";

    const start = productsPerPage * (currentPage - 1);
    const end = start + productsPerPage;
    const slice = filtered.slice(start, end);

    if (slice.length === 0) {
      productGrid.innerHTML =
        '<p class="no-products">Không có sản phẩm phù hợp.</p>';
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    const frag = document.createDocumentFragment();
    slice.forEach((p) => frag.appendChild(createProductCard(p)));
    productGrid.appendChild(frag);

    renderPaginationControls();
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      renderList();
      if (productGrid.scrollIntoView) {
        productGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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

    totalPages = Math.ceil(filtered.length / productsPerPage);
    currentPage = 1;
    renderList();
  }

  function openQuickView(productId) {
    const id = Number(productId);
    const product = productManager.getProductById(id);
    if (!product || !modal) return;

    if (modalImg) {
      modalImg.src = product.img || "./img/default.avif";
      modalImg.alt = product.name;
    }
    if (modalName) {
      modalName.textContent = product.name;
    }
    
    // ✅ FIX: Safe renderStars check
    if (modalRating) {
      let starsHtml = '';
      
      if (typeof product.renderStars === "function") {
        starsHtml = product.renderStars();
      } else {
        // Fallback: Manual render
        const rating = product.rating || 0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        for (let i = 0; i < fullStars; i++) {
          starsHtml += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
          starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
          starsHtml += '<i class="far fa-star"></i>';
        }
      }
      
      modalRating.innerHTML = `${starsHtml} <span class="rating-text">(${
        product.ratingCount || 0
      })</span>`;
    }

    // ✅ FIX: Safe isOnSale check
    if (modalPrice) {
      const currentPrice = (product.price || 0).toLocaleString("vi-VN");
      let priceHtml = `<strong>${currentPrice} VNĐ</strong>`;

      const isOnSale = typeof product.isOnSale === 'function' 
        ? product.isOnSale() 
        : (product.oldPrice && product.oldPrice > product.price);

      if (isOnSale) {
        const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
        priceHtml += ` <span class="old-price">${oldPrice} VNĐ</span>`;
      }
      modalPrice.innerHTML = priceHtml;
    }

    // ✅ FIX: Dynamic sizes từ variants
    if (modalOptionsContainer) {
      const variants = product.variants || [];
      const uniqueSizes = [...new Set(variants.map(v => v.size))].filter(Boolean);
      
      let optionsHtml = '';
      
      if (uniqueSizes.length > 0) {
        const sizeOptions = uniqueSizes
          .map(size => `<option value="${escapeHtml(size)}">Size ${escapeHtml(size)}</option>`)
          .join("");

        optionsHtml = `
          <div class="form-group size-selector">
              <label for="modal-shoe-size">Chọn Kích cỡ:</label>
              <select id="modal-shoe-size" required>
                  <option value="">-- Chọn size --</option>
                  ${sizeOptions}
              </select>
          </div>
        `;
      } else {
        // Fallback nếu không có variants
        optionsHtml = `
          <div class="form-group size-selector">
              <label for="modal-shoe-size">Chọn Kích cỡ:</label>
              <select id="modal-shoe-size" required>
                  <option value="">-- Chọn size --</option>
                  <option value="39">Size 39</option>
                  <option value="40">Size 40</option>
                  <option value="41">Size 41</option>
                  <option value="42">Size 42</option>
                  <option value="43">Size 43</option>
              </select>
          </div>
        `;
      }
      
      modalOptionsContainer.innerHTML = optionsHtml;
    }

    if (modalAddBtn) modalAddBtn.dataset.id = id;

    if (modalViewDetail) {
      modalViewDetail.href = `./product-detail.html?id=${id}`;
    }

    modal.classList.add("open");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeQuickView() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    if (modalOptionsContainer) modalOptionsContainer.innerHTML = "";
  }

  productGrid.addEventListener("click", (e) => {
    const qv = e.target.closest(".quick-view");
    if (qv) {
      const id = qv.dataset.id;
      openQuickView(id);
      return;
    }
  });

  function renderFilterButtons() {
    if (!filterGroup) return;

    try {
      filterGroup.innerHTML = "";

      const allBtn = document.createElement("button");
      allBtn.className = "filter-btn active";
      allBtn.dataset.filter = "all";
      allBtn.textContent = "Tất cả";
      filterGroup.appendChild(allBtn);

      const categories = categoryManager.getAllCategories();
      if (Array.isArray(categories)) {
        categories.forEach((category) => {
          if (category && category.name) {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.dataset.filter = category.name;
            btn.textContent = category.name;
            filterGroup.appendChild(btn);
          }
        });
      }
    } catch (error) {
      console.error("Error rendering filter buttons:", error);
    }
  }

  if (filterGroup) {
    filterGroup.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (btn) {
        const filterBtns = $$(".filter-btn");
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.filter;
        applyFilters();
      }
    });
  }

  renderFilterButtons();

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  const closeBtn = modal ? modal.querySelector(".close-btn") : null;
  if (closeBtn) {
    closeBtn.addEventListener("click", closeQuickView);
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuickView();
    });
  }

  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      const product = productManager.getProductById(id);

      if (!product) {
        alert("Không tìm thấy sản phẩm!");
        return;
      }

      const sizeSelector = document.getElementById("modal-shoe-size");
      const selectedSize = sizeSelector ? sizeSelector.value : null;

      if (!selectedSize || selectedSize === "") {
        alert("Vui lòng chọn kích cỡ giày.");
        return;
      }

      // ✅ FIX: Validate stock nếu có variants
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.size?.toString() === selectedSize);
        if (variant && variant.stock <= 0) {
          alert("Rất tiếc! Size này đã hết hàng.");
          return;
        }
      }

      if (window.addToCart) {
        window.addToCart(
          product.id,
          product.name,
          product.price,
          product.img,
          selectedSize,
          "N/A",
          1
        );
        closeQuickView();
        
        // Update cart count
        if (window.updateCartCount) {
          window.updateCartCount();
        }
      }
    });
  }

  (function init() {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      productGrid.innerHTML = '<p class="no-products">Không có sản phẩm.</p>';
      return;
    }

    applyFilters();
  })();
});
