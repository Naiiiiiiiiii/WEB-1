/**
 * search-overlay.js - TÌM KIẾM DẠNG OVERLAY TRÊN TRANG CHỦ
 */

// =========================================================================
// 0. IMPORT MODULES VÀ KHỞI TẠO DỮ LIỆU
// =========================================================================
import { ProductManager } from "./ProductManager.js";

const productManager = new ProductManager();
// Lấy tất cả sản phẩm có thể hiển thị
const products = productManager.getVisibleProducts();

// Dùng IIFE để đóng gói toàn bộ logic
(function () {
  "use strict";

  // =========================================================================
  // 1. HTML OVERLAY (Không thay đổi)
  // =========================================================================
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

  // =========================================================================
  // 2. KHỞI TẠO
  // =========================================================================

  let elements = {};
  let searchTimeout = null;
  let currentFilters = {
    keyword: "",
    category: "",
    minPrice: null,
    maxPrice: null,
  };

  // Inject overlay vào body khi DOM loaded
  function injectOverlay() {
    if (document.getElementById("search-overlay")) return; // Đã tồn tại

    // 1. Tạo một DOMParser để chuyển chuỗi HTML thành các phần tử DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(SEARCH_OVERLAY_HTML, "text/html");

    // Lấy phần tử overlay chính
    const overlayElement = doc.body.firstElementChild;

    if (overlayElement) {
      // 2. CHÈN TRỰC TIẾP VÀO BODY
      document.body.appendChild(overlayElement);
    }

    // Gán elements
    elements = {
      overlay: document.getElementById("search-overlay"),
      closeBtn: document.querySelector(".search-close"),
      // ... (Giữ nguyên phần gán elements còn lại)
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

    // Kiểm tra và setup lại sự kiện
    setupEventListeners();
  }

  // =========================================================================
  // 3. OPEN/CLOSE OVERLAY
  // =========================================================================

  function openSearchOverlay() {
    // Chỉ inject nếu chưa có (tránh gọi inject nhiều lần nếu đã có)
    if (!elements.overlay || !document.getElementById("search-overlay")) {
      // Re-inject và setup lại nếu chưa tồn tại
      injectOverlay();
    }

    elements.overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scroll

    // Focus vào ô tìm kiếm
    setTimeout(() => elements.searchInput.focus(), 100);

    // Load initial results
    performSearch();
  }

  function closeSearchOverlay() {
    if (!elements.overlay) return;

    elements.overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // =========================================================================
  // 4. SEARCH LOGIC (Giống search.js)
  // =========================================================================

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * @description Tạo HTML cho một thẻ sản phẩm.
   * @param {Product} product - Instance của Product class
   */
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

    // Sử dụng phương thức của Product class
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
      // Tiêu chí 1: Tên sản phẩm
      const nameMatch = product.name.toLowerCase().includes(keyword);

      // Tiêu chí 2: Danh mục
      const productCategoryName = (
        product.category ??
        productManager.getCategoryName?.(product.categoryId) ??
        ""
      )
        .toString()
        .toLowerCase()
        .trim();

      const categoryMatch = !category || productCategoryName === category;
      // Tiêu chí 3: Khoảng giá (lấy giá hiện tại)
      const productPrice = product.price;
      const priceMatch =
        (minPrice === null || productPrice >= minPrice) &&
        (maxPrice === null || productPrice <= maxPrice);

      // Tìm kiếm nâng cao là sự kết hợp của tất cả tiêu chí
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
      // Không nên dùng map.join() cho số lượng lớn, nhưng với overlay thì tạm chấp nhận được
      const html = filteredProducts.map(createProductCard).join("");
      elements.searchResults.innerHTML = html;
    }

    // Gắn lại sự kiện 'Thêm vào giỏ' và 'Xem chi tiết' sau khi render
    attachProductEventListeners();
  }

  function performSearch() {
    elements.loadingSpinner.style.display = "block";
    elements.searchResults.innerHTML = "";
    elements.noResults.style.display = "none";

    clearTimeout(searchTimeout);
    // Dùng setTimeout để debounce search input
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
    // Dùng classList.toggle('open') và CSS transition sẽ đẹp hơn, nhưng ta dùng display cho nhanh
    elements.advancedPanel.style.display = isHidden ? "block" : "none";
  }

  function applyFilters() {
    currentFilters.category = elements.categoryFilter.value;
    const minVal = parseFloat(elements.minPriceInput.value);
    const maxVal = parseFloat(elements.maxPriceInput.value);

    // Đảm bảo giá trị là null nếu không hợp lệ
    currentFilters.minPrice = isNaN(minVal) ? null : minVal;
    currentFilters.maxPrice = isNaN(maxVal) ? null : maxVal;

    // Ẩn panel sau khi áp dụng (tùy chọn)
    elements.advancedPanel.style.display = "none";
    performSearch();
  }

  function resetFilters() {
    elements.categoryFilter.value = "";
    elements.minPriceInput.value = "";
    elements.maxPriceInput.value = "";
    elements.searchInput.value = "";
    elements.clearBtn.style.display = "none";
    // Ẩn panel nếu đang mở
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
    // Sử dụng Event Delegation trên container kết quả
    elements.searchResults.removeEventListener(
      "click",
      searchResultsClickHandler
    ); // Remove để tránh trùng lặp
    elements.searchResults.addEventListener("click", searchResultsClickHandler);
  }

  function searchResultsClickHandler(e) {
    // Xử lý nút Thêm vào giỏ
    const add = e.target.closest(".add-to-cart");
    if (add) {
      e.preventDefault();
      const id = Number(add.dataset.id);

      const product = productManager.getProductById(id);

      if (product && typeof window.addToCart === "function") {
        // CÁCH GỌI addToCart:
        // 1. Chỉ truyền 6 tham số (vì đã bỏ 'color' khỏi cart.js)
        // 2. Dùng 'OS' (One Size) hoặc 40 làm size mặc định
        window.addToCart(
          product.id,
          product.name,
          product.price,
          product.img,
          "OS", // <-- Dùng size mặc định (ví dụ: 'OS' hoặc '40')
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

    // **XỬ LÝ NÚT QUICK VIEW (XEM CHI TIẾT)**
    const view = e.target.closest(".quick-view");
    if (view) {
      // Ngăn trình duyệt chuyển hướng ngay lập tức để đóng overlay mượt mà hơn
      e.preventDefault();

      const detailUrl = view.getAttribute("href");

      // 1. Đóng Overlay
      closeSearchOverlay();

      // 2. Chuyển hướng đến trang chi tiết sản phẩm sau khi đóng overlay hoàn tất (50ms)
      setTimeout(() => {
        if (detailUrl) {
          window.location.href = detailUrl;
        }
      }, 50);

      return;
    }
  }

  // =========================================================================
  // 5. EVENT LISTENERS
  // =========================================================================

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

    // Price presets
    elements.presetBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        elements.minPriceInput.value = this.dataset.min;
        elements.maxPriceInput.value = this.dataset.max;
        applyFilters();
      });
    });
  }

  // =========================================================================
  // 6. GẮNG SỰ KIỆN CHO ICON SEARCH TRÊN HEADER
  // =========================================================================

  function initSearchIcon() {
    // Tìm icon search trong header
    const searchLink = document.querySelector('.nav-icons a[href*="search"]');

    if (searchLink) {
      searchLink.addEventListener("click", (e) => {
        e.preventDefault();
        openSearchOverlay();
      });
    }
  }

  // =========================================================================
  // 7. AUTO INIT
  // =========================================================================

  // Đảm bảo chạy sau khi DOM đã load
  document.addEventListener("DOMContentLoaded", () => {
    injectOverlay();
    initSearchIcon();
    // Sau khi inject, ẩn panel nâng cao mặc định
    if (elements.advancedPanel) elements.advancedPanel.style.display = "none";
  });

  // Export hàm public (có thể dùng trong các file khác để mở overlay)
  window.openSearchOverlay = openSearchOverlay;
  window.closeSearchOverlay = closeSearchOverlay;
})();
