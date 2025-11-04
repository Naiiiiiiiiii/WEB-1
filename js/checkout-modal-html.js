export const CHECKOUT_OVERLAY_HTML = `
<div id="checkout-overlay" class="checkout-overlay">
    <div class="checkout-modal">
        <button id="close-checkout-btn" class="close-btn">&times;</button>
        <h2>Tiến hành Thanh toán</h2>

        <div class="checkout-steps">
            <div id="step-shipping" class="checkout-step">
                <h3>1. Thông tin Giao hàng</h3>
                <form id="shipping-form">
                    <div class="form-group">
                        <label for="fullName">Họ tên:</label>
                        <input type="text" id="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Điện thoại:</label>
                        <input 
    type="tel" 
    id="phone" 
    required 
    pattern="0[0-9]{9}" 
    title="Số điện thoại phải bắt đầu bằng 0 và có tổng cộng 10 chữ số. (Ví dụ: 0912345678)"
    maxlength="10" 
>
                    </div>
                    <div class="form-group">
                        <label for="address">Địa chỉ cụ thể:</label>
                        <input type="text" id="address" required>
                    </div>
                    <div class="form-group">
                        <label for="district">Quận/Huyện:</label>
                        <input type="text" id="district" value="Quận 3" required>
                    </div>
                    <div class="form-group">
                        <label for="province">Tỉnh/Thành:</label>
                        <input type="text" id="province" value="TP. Hồ Chí Minh" required>
                    </div>
                    <div class="form-group">
                        <label for="notes">Ghi chú (tùy chọn):</label>
                        <textarea id="notes"></textarea>
                    </div>
                    <button type="submit" id="continue-payment-btn" class="btn-primary">Tiếp tục thanh toán</button>
                </form>
            </div>

            <div id="step-payment" class="checkout-step" style="display: none;">
                <h3>2. Phương thức Thanh toán</h3>
                <div class="payment-options">
                    <label><input type="radio" name="paymentMethod" value="COD" checked> Thanh toán khi nhận hàng (COD)</label>
                    <label><input type="radio" name="paymentMethod" value="BANK_TRANSFER"> Chuyển khoản ngân hàng</label>
                </div>
                <div class="checkout-actions">
                    <button id="back-shipping-btn" class="btn-secondary">Quay lại</button>
                    <button id="continue-review-btn" class="btn-primary">Xem lại đơn hàng</button> 
                </div>
            </div>

            <div id="step-review" class="checkout-step" style="display: none;">
                <h3>3. Xem lại & Đặt hàng</h3>
                <div id="review-content">
                    <div class="review-section">
                        <h4>Thông tin nhận hàng</h4>
                        <p id="review-address-info"></p>
                    </div>
                    <div class="review-section">
                        <h4>Phương thức thanh toán</h4>
                        <p id="review-payment-method"></p>
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
                
                <div id="order-processing-message" style="display: none; text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Đơn hàng đang được xử lý. Vui lòng chờ...</p>
                </div>
            </div>
            
            <div id="order-success-message" class="checkout-step success-step" style="display: none;">
                <i class="fas fa-check-circle"></i>
                <h3>Đặt hàng thành công!</h3>
                <p>Cảm ơn bạn đã mua sắm tại ShoeStore. Dưới đây là thông tin đơn hàng của bạn.</p>
                
                <div class="review-section">
                    <h4>Thông tin đơn hàng đã đặt</h4>
                    <p>Mã đơn hàng: <strong><span id="success-order-id"></span></strong></p>
                    <p>Ngày đặt: <span id="success-order-date"></span></p>
                </div>
                
                <div class="review-section">
                    <h4>Các sản phẩm đã mua</h4>
                    <div id="success-cart-items"></div>
                </div>

                <p class="review-total">Tổng thanh toán: <span id="success-order-total">0₫</span></p>
                
                <button id="continue-shopping-btn" class="btn-primary">Tiếp tục mua sắm</button>
            </div>
        </div>
    </div>
</div>
`;