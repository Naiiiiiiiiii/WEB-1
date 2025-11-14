export const CHECKOUT_OVERLAY_HTML = `
<div id="checkout-overlay" class="checkout-overlay" style="display:none;">
  <div class="checkout-modal">
    <button id="close-checkout-btn" class="close-btn" aria-label="Đóng">&times;</button>
    <h2>Tiến hành Thanh toán</h2>

    <div class="checkout-steps">
      <!-- STEP SHIPPING -->
      <div id="step-shipping" class="checkout-step">
        <h3>1. Thông tin Giao hàng</h3>
        <form id="shipping-form" novalidate>
          <div class="form-group">
            <label for="fullName">Họ tên:</label>
            <input type="text" id="fullName" required>
          </div>
          <div class="form-group">
            <label for="phone">Điện thoại:</label>
            <input type="tel" id="phone" required pattern="0[0-9]{9}" maxlength="10"
                   title="Số điện thoại bắt đầu bằng 0 và có 10 chữ số">
          </div>

          <!-- Chọn địa chỉ -->
            <div class="form-group">
              <label>Địa chỉ nhận hàng:</label>
              <div class="address-option-group" style="display:flex; gap:18px; flex-wrap:wrap;">
                <label style="display:block;">
                  <input type="radio" name="address-option" id="use-default-address" value="default">
                  Sử dụng địa chỉ mặc định
                  <div id="default-address-display" style="margin-top:4px; font-size:12px; color:#555;"></div>
                </label>
                <label style="display:block;">
                  <input type="radio" name="address-option" id="use-new-address" value="new">
                  Nhập địa chỉ mới
                </label>
              </div>
            </div>

          <div class="form-group">
            <label for="address">Địa chỉ cụ thể:</label>
            <input type="text" id="address" required placeholder="Số nhà, tên đường">
          </div>
          <div class="form-group">
            <label for="district">Quận/Huyện:</label>
            <input type="text" id="district" required placeholder="Quận/Huyện">
          </div>
          <div class="form-group">
            <label for="province">Tỉnh/Thành:</label>
            <select id="province" required>
              <option value="">Chọn Tỉnh/Thành phố</option>
            </select>
          </div>
          <div class="form-group">
            <label for="notes">Ghi chú (tùy chọn):</label>
            <textarea id="notes"></textarea>
          </div>

          <div class="checkout-actions">
            <button type="button" id="continue-payment-btn" class="btn-primary">Tiếp tục thanh toán</button>
          </div>
        </form>
      </div>

      <!-- STEP PAYMENT -->
      <div id="step-payment" class="checkout-step" style="display:none;">
        <h3>2. Phương thức Thanh toán</h3>
        <div class="payment-options">
          <label><input type="radio" name="paymentMethod" value="COD" checked> Thanh toán khi nhận hàng (COD)</label>
          <label style="margin-left:18px;"><input type="radio" name="paymentMethod" value="BANK_TRANSFER"> Chuyển khoản ngân hàng</label>
        </div>

        <div id="bank-transfer-info" style="display:none; margin-top:12px; padding:12px; border:1px solid #eee; background:#fafafa;">
          <strong>Thông tin chuyển khoản (demo)</strong>
          <p>Ngân hàng: <span id="demo-bank-name">Ngân hàng Demo</span></p>
          <p>Số tài khoản: <code id="demo-account-number">0123456789</code></p>
          <p>Chủ tài khoản: <span id="demo-account-name">Công ty Demo</span></p>
        </div>

        <div class="checkout-actions" style="margin-top:16px;">
          <button id="back-shipping-btn" class="btn-secondary">Quay lại</button>
          <button id="continue-review-btn" class="btn-primary">Xem lại đơn hàng</button>
        </div>
      </div>

      <!-- STEP REVIEW -->
      <div id="step-review" class="checkout-step" style="display:none;">
        <h3>3. Xem lại & Đặt hàng</h3>
        <div id="review-content">
          <div class="review-section">
            <h4>Thông tin nhận hàng</h4>
            <p id="review-address-info"></p>
          </div>
          <div class="review-section">
            <h4>Phương thức thanh toán</h4>
            <p id="review-payment-method"></p>
            <div id="review-bank-info" style="display:none; margin-top:8px; padding:8px; border:1px dashed #ddd;">
              <strong>Thông tin chuyển khoản:</strong>
              <p>Ngân hàng: <span id="review-bank-name"></span></p>
              <p>Số tài khoản: <code id="review-account-number"></code></p>
              <p>Chủ tài khoản: <span id="review-account-name"></span></p>
            </div>
          </div>
          <div class="review-section">
            <h4>Chi tiết đơn hàng</h4>
            <div id="review-cart-items"></div>
            <p class="review-total">Tổng cộng: <span id="review-total-price">0₫</span></p>
          </div>
          <div class="checkout-actions">
            <button id="back-payment-btn" class="btn-secondary">Quay lại</button>
            <button id="place-order-btn" class="btn-primary">HOÀN TẤT ĐẶT HÀNG</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;