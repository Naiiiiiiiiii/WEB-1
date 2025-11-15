import { ProductManager } from "./ProductManager.js";

const productManager = new ProductManager();

// (Đã xóa dòng code lỗi ở đây)

(function () {
  "use strict";

  const CATEGORY_SUGGESTIONS = ["Giày Thể Thao", "Giày Công Sở", "Giày Casual"];

  const SEARCH_OVERLAY_HTML = `
    <div id="search-overlay" class="search-overlay">
      <div class="search-overlay-content">
        <button class="search-close" aria-label="Đóng tìm kiếm">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="search-overlay-header">
          <h2 class="search-overlay-title">
            <i class="fas fa-search"></i>
            Tìm kiếm sản phẩm
          </h2>
          <p class="search-overlay-subtitle">Tìm đôi giày hoàn hảo cho bạn</p>
        </div>

        <div class="search-overlay-box-container" id="overlayBasicSearchContainer"
             style="display: flex; align-items: center; gap: 15px;">
          
          <div class="search-overlay-box" id="overlaySearchBox" style="flex-grow: 1; position: relative;">
            <i class="fas fa-search search-overlay-icon"></i>
            <input 
              type="text" 
              id="overlaySearchInput" 
              class="search-overlay-input" 
              placeholder="Tìm kiếm theo tên sản phẩm..."
              autocomplete="off">
            <button id="overlayClearBtn" class="overlay-clear-btn" style="display: none;">
              <i class="fas fa-times"></i>
            </button>

            <div id="overlayCategorySuggestions" class="overlay-suggestions-list" 
                 style="display: none; position: absolute; background: white; border: 1px solid #ddd; border-radius: 8px; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-height: 200px; 
                        overflow-y: auto; z-index: 10; top: 100%; left: 0; margin-top: 5px;">
            </div>
          </div>
          
          <button id="overlayAdvancedToggle" class="overlay-advanced-toggle">
            <i class="fas fa-sliders-h"></i>
            Tìm kiếm nâng cao
          </button>
        </div>

        <div id="overlayAdvancedPanel" class="overlay-advanced-panel" style="display: none;">
          
          <div style="text-align: right;">
            <button id="overlayBasicToggle" class="overlay-advanced-toggle" 
                    style="margin-bottom: 20px;">
              <i class="fas fa-search"></i>
              Tìm kiếm cơ bản
            </button>
          </div>
          
          <h3 class="overlay-advanced-title">
            <i class="fas fa-filter"></i>
            Bộ lọc nâng cao
          </h3>
          
          <div class="overlay-advanced-filters" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; align-items: start;">
            
            <div class="overlay-filter-group">
              <label class="overlay-filter-label"><i class="fas fa-tag"></i> Danh mục</label>
              <select id="overlayCategoryFilter" class="overlay-filter-select">
                <option value="">Tất cả danh mục</option>
                <option value="Giày thể thao">Giày thể thao</option>
                <option value="Giày công sở">Giày công sở</option>
                <option value="Giày casual">Giày casual</option>
              </select>
            </div>

            <div class="overlay-filter-group">
              <label class="overlay-filter-label"><i class="fas fa-ruler"></i> Kích thước</label>
              <select id="overlaySizeFilter" class="overlay-filter-select">
                <option value="">Tất cả kích thước</option>
                <option value="38">38</option>
                <option value="39">39</option>
                <option value="40">40</option>
                <option value="41">41</option>
                <option value="42">42</option>
                <option value="43">43</option>
              </select>
            </div>

            <div class="overlay-filter-group">
              <label class="overlay-filter-label"><i class="fas fa-dollar-sign"></i> Khoảng giá</label>
              <div class="overlay-price-inputs" style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="overlayMinPrice" class="overlay-price-input" placeholder="Từ (VNĐ)" min="0" step="100000" style="width: 100%;">
                <span class="overlay-price-separator">-</span>
                <input type="number" id="overlayMaxPrice" class="overlay-price-input" placeholder="Đến (VNĐ)" min="0" step="100000" style="width: 100%;">
              </div>
              <div class="overlay-price-presets" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                <button class="overlay-preset-btn" data-min="0" data-max="1000000">Dưới 1 triệu</button>
                <button class="overlay-preset-btn" data-min="1000000" data-max="3000000">1-3 triệu</button>
                <button class="overlay-preset-btn" data-min="3000000" data-max="5000000">3-5 triệu</button>
                <button class="overlay-preset-btn" data-min="5000000" data-max="999999999">Trên 5 triệu</button>
              </div>
            </div>

            <div class="overlay-filter-actions" style="grid-column: 1 / -1; display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
              <button id="overlayApplyFilters" class="overlay-btn-apply"><i class="fas fa-search"></i> Tìm kiếm</button>
              <button id="overlayResetFilters" class="overlay-btn-reset"><i class="fas fa-redo"></i> Đặt lại</button>
            </div>
          </div>
        </div>

        <div class="search-overlay-results">
          <div class="overlay-results-header">
            <h3 id="overlayResultsTitle" class="overlay-results-title">Kết quả tìm kiếm</h3>
            <div id="overlayResultsCount" class="overlay-results-count"></div>
          </div>

          <div id="overlayLoadingSpinner" class="overlay-loading-spinner" style="display: none;">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tìm kiếm...</p>
          </div>

          <div id="overlayNoResults" class="overlay-no-results" style="display: none;">
            <i class="fas fa-search"></i>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc</p>
          </div>

          <div id="overlaySearchResults" class="overlay-product-grid"></div>
        </div>
      </div>
    </div>
  `;

  let elements = {};
  let searchTimeout = null;
  let currentFilters = {
    keyword: "",
    category: "",
    size: "",
    minPrice: null,
    maxPrice: null,
  };

  function injectOverlay() {
    if (document.getElementById("search-overlay")) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(SEARCH_OVERLAY_HTML, "text/html");

    const overlayElement = doc.body.firstElementChild;

    if (overlayElement) {
      document.body.appendChild(overlayElement);
    }

    elements = {
      overlay: document.getElementById("search-overlay"),
      closeBtn: document.querySelector(".search-close"),

      basicSearchContainer: document.getElementById("overlayBasicSearchContainer"),
      
      searchInput: document.getElementById("overlaySearchInput"),
      clearBtn: document.getElementById("overlayClearBtn"),
      advancedToggle: document.getElementById("overlayAdvancedToggle"),
      basicToggle: document.getElementById("overlayBasicToggle"),
      advancedPanel: document.getElementById("overlayAdvancedPanel"),
      categoryFilter: document.getElementById("overlayCategoryFilter"),
      sizeFilter: document.getElementById("overlaySizeFilter"),
      minPriceInput: document.getElementById("overlayMinPrice"),
      maxPriceInput: document.getElementById("overlayMaxPrice"),
      applyBtn: document.getElementById("overlayApplyFilters"),
      resetBtn: document.getElementById("overlayResetFilters"),
      resultsTitle: document.getElementById("overlayResultsTitle"),
      resultsCount: document.getElementById("overlayResultsCount"),
      loadingSpinner: document.getElementById("overlayLoadingSpinner"),
      noResults: document.getElementById("overlayNoResults"),
      searchResults: document.getElementById("overlaySearchResults"),
      presetBtns: document.querySelectorAll(".overlay-preset-btn"),
      categorySuggestions: document.getElementById("overlayCategorySuggestions"),
    };

    setupEventListeners();
  }

  function openSearchOverlay() {
    if (!elements.overlay || !document.getElementById("search-overlay")) {
      injectOverlay();
    }

    elements.overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => elements.searchInput.focus(), 100);

    performSearch();
  }

  function closeSearchOverlay() {
    if (!elements.overlay) return;

    elements.overlay.classList.remove("active");
    document.body.style.overflow = "";

    if (elements.categorySuggestions) {
      elements.categorySuggestions.innerHTML = "";
      elements.categorySuggestions.style.display = "none";
    }
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  
  // === HÀM ĐÃ SỬA ĐỂ SỬA LỖI HIỂN THỊ ===
  function createProductCard(product) {
    // Dữ liệu 'product' ở đây là DỮ LIỆU THÔ (plain object)
    
    // 1. Badge (Nhãn)
    let badgeHtml = "";
    if (product.badge) {
        // Giả sử badgeText giống 'hot' hoặc 'sale'
        const badgeText = (product.badge === 'sale' && product.oldPrice) 
            ? `-${Math.round((1 - product.price / product.oldPrice) * 100)}%`
            : product.badge; // 'hot'
            
        badgeHtml = `<div class="product-badge ${escapeHtml(product.badge)}">${escapeHtml(badgeText)}</div>`;
    }

    // 2. Hình ảnh
    const imgHtml = product.img
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(
          product.name
        )}" class="product-img">`
      : `<i class="fas fa-shoe-prints product-icon"></i>`;

    // 3. Giá
    const formattedPrice = (product.price || 0).toLocaleString('vi-VN') + ' ₫';
    const isOnSale = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);
    
    const priceHtml = isOnSale
      ? `<span class="current-price">${formattedPrice}</span> <span class="old-price">${(product.oldPrice || 0).toLocaleString('vi-VN')} ₫</span>`
      : `<span class="current-price">${formattedPrice}</span>`;

    // 4. Rating (Đơn giản hóa)
    let ratingHtml = '';
    if (product.rating && product.rating > 0) {
        // Tạo 5 ngôi sao
        let stars = '';
        const ratingScore = Math.round(product.rating * 2) / 2; // Làm tròn 0.5
        for (let i = 1; i <= 5; i++) {
            if (i <= ratingScore) {
                stars += '⭐'; // Đầy
            } else {
                stars += '☆'; // Vơi
            }
        }
        ratingHtml = `<div class="product-rating"><div class="stars">${stars}</div><span class="rating-text">(${product.ratingCount || 0})</span></div>`;
    }

    // 5. Trả về HTML
    return `
      <div class="product-card" data-id="${product.id}">
        ${badgeHtml}
        <div class="product-image">
          ${imgHtml}
          <div class="product-overlay">
            <a href="./product-detail.html?id=${product.id}" class="quick-view" data-id="${product.id}">
              <i class="fas fa-eye"></i> Xem chi tiết
            </a>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${escapeHtml(product.name)}</h3>
          ${ratingHtml}
          <div class="product-price">${priceHtml}</div>
          <button type="button" class="add-to-cart" data-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
    `;
  }
  // === KẾT THÚC SỬA HÀM ===


  function filterProducts() {
    const keyword = currentFilters.keyword.toLowerCase();
    const category = currentFilters.category.toLowerCase();
    const size = currentFilters.size;
    const minPrice = currentFilters.minPrice;
    const maxPrice = currentFilters.maxPrice;

    // === ĐÂY LÀ CHỖ SỬA LỖI "KHÔNG CÓ KẾT QUẢ" ===
    const allProducts = productManager.getVisibleProducts();
    // === KẾT THÚC SỬA ===

    return allProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(keyword);

      const productCategoryName = (
        product.category ??
        productManager.getCategoryName?.(product.categoryId) ??
        ""
      )
        .toString()
        .toLowerCase()
        .trim();

      const categoryMatch = !category || productCategoryName === category;

      const sizeMatch =
        !size ||
        (product.variants &&
          product.variants.some((v) => v.size.toString() === size));

      const productPrice = product.price;
      const priceMatch =
        (minPrice === null || productPrice >= minPrice) &&
        (maxPrice === null || productPrice <= maxPrice);

      return nameMatch && categoryMatch && priceMatch && sizeMatch;
    });
  }

  function renderResults(filteredProducts) {
    elements.loadingSpinner.style.display = "none";
    elements.searchResults.innerHTML = "";
    elements.resultsCount.textContent = `${filteredProducts.length} kết quả`;

    if (filteredProducts.length === 0) {
      elements.noResults.style.display = "block";
    } else {
      elements.noResults.style.display = "none";

      const html = filteredProducts.map(createProductCard).join("");
      elements.searchResults.innerHTML = html;
    }

    attachProductEventListeners();
  }

  function performSearch() {
    elements.loadingSpinner.style.display = "block";
    elements.searchResults.innerHTML = "";
    elements.noResults.style.display = "none";

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      const filteredProducts = filterProducts();
      renderResults(filteredProducts);
    }, 300);
  }

  function handleSearchInput() {
    const keyword = elements.searchInput.value.trim();
    currentFilters.keyword = keyword;
    elements.clearBtn.style.display = keyword ? "flex" : "none";

    if (keyword.length > 0) {
      const matchingCategories = CATEGORY_SUGGESTIONS.filter(category => 
        category.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchingCategories.length > 0) {
        const suggestionsHtml = matchingCategories.map(category => 
          `<div class="suggestion-item" data-category-name="${escapeHtml(category)}" 
                   style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #eee;"
                   onmouseover="this.style.backgroundColor='#f9f9f9'"
                   onmouseout="this.style.backgroundColor='white'">
             ${escapeHtml(category)}
           </div>`
        ).join('');
        elements.categorySuggestions.innerHTML = suggestionsHtml;
        elements.categorySuggestions.style.display = "block";
      } else {
        elements.categorySuggestions.style.display = "none";
      }
    } else {
      elements.categorySuggestions.style.display = "none";
    }

    currentFilters.category = "";
    currentFilters.size = "";
    currentFilters.minPrice = null;
    currentFilters.maxPrice = null;

    if (elements.categoryFilter) elements.categoryFilter.value = "";
    if (elements.sizeFilter) elements.sizeFilter.value = "";
    if (elements.minPriceInput) elements.minPriceInput.value = "";
    if (elements.maxPriceInput) elements.maxPriceInput.value = "";
    
    performSearch();
  }

  function clearSearch() {
    elements.searchInput.value = "";
    currentFilters.keyword = "";
    elements.clearBtn.style.display = "none";
    
    elements.categorySuggestions.innerHTML = "";
    elements.categorySuggestions.style.display = "none";

    performSearch();
  }

  function toggleAdvancedPanel() {
    const isHidden =
      elements.advancedPanel.style.display === "none" ||
      !elements.advancedPanel.style.display;

    if (isHidden) {
      elements.advancedPanel.style.display = "block";
      elements.basicSearchContainer.style.display = "none";
      elements.categorySuggestions.style.display = "none";
    } else {
      elements.advancedPanel.style.display = "none";
      elements.basicSearchContainer.style.display = "flex";
    }
  }

  function applyFilters() {
    currentFilters.category = elements.categoryFilter.value;
    currentFilters.size = elements.sizeFilter.value;
    const minVal = parseFloat(elements.minPriceInput.value);
    const maxVal = parseFloat(elements.maxPriceInput.value);

    currentFilters.minPrice = isNaN(minVal) ? null : minVal;
    currentFilters.maxPrice = isNaN(maxVal) ? null : maxVal;
    
    currentFilters.keyword = "";
    elements.searchInput.value = "";
    elements.clearBtn.style.display = "none";
    elements.categorySuggestions.style.display = "none";
    
    performSearch();
  }

  function resetFilters() {
    elements.categoryFilter.value = "";
    elements.sizeFilter.value = "";
    elements.minPriceInput.value = "";
    elements.maxPriceInput.value = "";
    elements.searchInput.value = "";
    elements.clearBtn.style.display = "none";
    elements.categorySuggestions.style.display = "none";

    currentFilters = {
      keyword: "",
      category: "",
      size: "",
      minPrice: null,
      maxPrice: null,
    };
    
    performSearch();
  }

  function attachProductEventListeners() {
    elements.searchResults.removeEventListener(
      "click",
      searchResultsClickHandler
    );
    elements.searchResults.addEventListener("click", searchResultsClickHandler);
  }

  function searchResultsClickHandler(e) {
    const add = e.target.closest(".add-to-cart");
    if (add) {
      e.preventDefault();
      const id = Number(add.dataset.id);

      const product = productManager.getProductById(id);

      if (product && typeof window.addToCart === "function") {
        window.addToCart(
          product.id,
          product.name,
          product.price,
          product.img,
          "OS",
          1
        );
        add.classList.add("added");
        setTimeout(() => add.classList.remove("added"), 600);
      } else if (!product) {
        console.error(`LỖI: Không tìm thấy sản phẩm với ID: ${id}`);
      } else {
        console.error("LỖI: Hàm window.addToCart chưa được định nghĩa.");
      }
      return;
    }

    const view = e.target.closest(".quick-view");
    if (view) {
      e.preventDefault();

      const detailUrl = view.getAttribute("href");

      closeSearchOverlay();

      setTimeout(() => {
        if (detailUrl) {
          window.location.href = detailUrl;
        }
      }, 50);

      return;
    }
  }

  function setupEventListeners() {
    elements.closeBtn.addEventListener("click", closeSearchOverlay);
    elements.overlay.addEventListener("click", (e) => {
      if (e.target === elements.overlay) closeSearchOverlay();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && elements.overlay.classList.contains("active")) {
        closeSearchOverlay();
      }
    });

    elements.searchInput.addEventListener("input", handleSearchInput);
    elements.clearBtn.addEventListener("click", clearSearch);

    elements.advancedToggle.addEventListener("click", toggleAdvancedPanel);
    
    elements.basicToggle.addEventListener("click", toggleAdvancedPanel);
    
    elements.applyBtn.addEventListener("click", applyFilters);
    elements.resetBtn.addEventListener("click", resetFilters);

    elements.presetBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        elements.minPriceInput.value = this.dataset.min;
        elements.maxPriceInput.value = this.dataset.max;
        applyFilters();
      });
    });

    elements.categorySuggestions.addEventListener("click", (e) => {
      const target = e.target.closest(".suggestion-item"); 
      if (target) {
        const categoryName = target.dataset.categoryName;
        elements.searchInput.value = categoryName; 
        handleSearchInput(); 
      }
    });
  }

  function initSearchIcon() {
    const searchLink = document.querySelector('.nav-icons a[href*="search"]');

    if (searchLink) {
      searchLink.addEventListener("click", (e) => {
        e.preventDefault();
        openSearchOverlay();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectOverlay();
    initSearchIcon();

    if (elements.advancedPanel) elements.advancedPanel.style.display = "none";
  });

  window.openSearchOverlay = openSearchOverlay;
  window.closeSearchOverlay = closeSearchOverlay;
})();