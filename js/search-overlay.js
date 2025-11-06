

import { ProductManager } from "./ProductManager.js";

const productManager = new ProductManager();

const products = productManager.getVisibleProducts();

(function () {
  "use strict";

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

				<div class="search-overlay-box-container">
					<div class="search-overlay-box">
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
					</div>
					
					<button id="overlayAdvancedToggle" class="overlay-advanced-toggle">
						<i class="fas fa-sliders-h"></i>
						Tìm kiếm nâng cao
					</button>
				</div>

				<div id="overlayAdvancedPanel" class="overlay-advanced-panel" style="display: none;">
					<h3 class="overlay-advanced-title">
						<i class="fas fa-filter"></i>
						Bộ lọc nâng cao
					</h3>
					
					<div class="overlay-advanced-filters">
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
							<label class="overlay-filter-label"><i class="fas fa-dollar-sign"></i> Khoảng giá</label>
							<div class="overlay-price-inputs">
								<input type="number" id="overlayMinPrice" class="overlay-price-input" placeholder="Từ (VNĐ)" min="0" step="100000">
								<span class="overlay-price-separator">-</span>
								<input type="number" id="overlayMaxPrice" class="overlay-price-input" placeholder="Đến (VNĐ)" min="0" step="100000">
							</div>
							<div class="overlay-price-presets">
								<button class="overlay-preset-btn" data-min="0" data-max="1000000">Dưới 1 triệu</button>
								<button class="overlay-preset-btn" data-min="1000000" data-max="3000000">1-3 triệu</button>
								<button class="overlay-preset-btn" data-min="3000000" data-max="5000000">3-5 triệu</button>
								<button class="overlay-preset-btn" data-min="5000000" data-max="999999999">Trên 5 triệu</button>
							</div>
						</div>

						<div class="overlay-filter-actions">
							<button id="overlayApplyFilters" class="overlay-btn-apply"><i class="fas fa-check"></i> Áp dụng</button>
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

      searchInput: document.getElementById("overlaySearchInput"),
      clearBtn: document.getElementById("overlayClearBtn"),
      advancedToggle: document.getElementById("overlayAdvancedToggle"),
      advancedPanel: document.getElementById("overlayAdvancedPanel"),
      categoryFilter: document.getElementById("overlayCategoryFilter"),
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
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  
  function createProductCard(product) {
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
      : `<i class="fas fa-shoe-prints product-icon"></i>`;

    const priceHtml =
      product.oldPrice && product.isOnSale()
        ? `<span class="current-price">${product.getFormattedPrice()}</span> <span class="old-price">${product.getFormattedOldPrice()}</span>`
        : `<span class="current-price">${product.getFormattedPrice()}</span>`;

    const ratingHtml = `<div class="product-rating"><div class="stars">${product.renderStars()}</div><span class="rating-text">(${
      product.ratingCount || 0
    })</span></div>`;

    return `
			<div class="product-card" data-id="${product.id}">
				${badgeHtml}
				<div class="product-image">
					${imgHtml}
					<div class="product-overlay">
						<a href="./product-detail.html?id=${product.id}" class="quick-view" data-id="${
      product.id
    }">
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

  function filterProducts() {
    const keyword = currentFilters.keyword.toLowerCase();
    const category = currentFilters.category.toLowerCase();
    const minPrice = currentFilters.minPrice;
    const maxPrice = currentFilters.maxPrice;

    return products.filter((product) => {

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

      const productPrice = product.price;
      const priceMatch =
        (minPrice === null || productPrice >= minPrice) &&
        (maxPrice === null || productPrice <= maxPrice);

      return nameMatch && categoryMatch && priceMatch;
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
    performSearch();
  }

  function clearSearch() {
    elements.searchInput.value = "";
    currentFilters.keyword = "";
    elements.clearBtn.style.display = "none";
    performSearch();
  }

  function toggleAdvancedPanel() {
    const isHidden =
      elements.advancedPanel.style.display === "none" ||
      !elements.advancedPanel.style.display;

    elements.advancedPanel.style.display = isHidden ? "block" : "none";
  }

  function applyFilters() {
    currentFilters.category = elements.categoryFilter.value;
    const minVal = parseFloat(elements.minPriceInput.value);
    const maxVal = parseFloat(elements.maxPriceInput.value);

    currentFilters.minPrice = isNaN(minVal) ? null : minVal;
    currentFilters.maxPrice = isNaN(maxVal) ? null : maxVal;

    elements.advancedPanel.style.display = "none";
    performSearch();
  }

  function resetFilters() {
    elements.categoryFilter.value = "";
    elements.minPriceInput.value = "";
    elements.maxPriceInput.value = "";
    elements.searchInput.value = "";
    elements.clearBtn.style.display = "none";

    elements.advancedPanel.style.display = "none";

    currentFilters = {
      keyword: "",
      category: "",
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
    elements.applyBtn.addEventListener("click", applyFilters);
    elements.resetBtn.addEventListener("click", resetFilters);

    elements.presetBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        elements.minPriceInput.value = this.dataset.min;
        elements.maxPriceInput.value = this.dataset.max;
        applyFilters();
      });
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
