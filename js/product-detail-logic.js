
export function initializeProductDetailPage(productId, productManagerInstance) {

    let selectedSize = null;
    let selectedColor = null; 
    let quantity = 1;

    let product = productManagerInstance.getProductById(productId); 

    function initializeDefaultVariants() {
        selectedSize = null;
        selectedColor = null;
    }

    function updateVariantButtonStates() {

        product = productManagerInstance.getProductById(productId); 
        if (!product || !product.variants || product.variants.length === 0) return;

        document.querySelectorAll('.size-option').forEach(btn => {
            const size = btn.dataset.size;
            
            const variant = product.variants.find(v => {
                const matchSize = v.size && v.size.toString() === size;
                const matchColor = !selectedColor || (v.color && v.color.toString() === selectedColor); 
                return matchSize && matchColor;
            });

            const stock = variant ? variant.stock : 0;
            
            if (stock <= 0) {
                btn.disabled = true;
                btn.classList.add('out-of-stock');

                if (btn.classList.contains('active') && size === selectedSize) {
                    btn.classList.remove('active');
                    selectedSize = null; 
                }
            } else {
                btn.disabled = false;
                btn.classList.remove('out-of-stock');
            }
        });

        document.querySelectorAll('.color-option').forEach(btn => {
            const color = btn.dataset.color;
            
            const variant = product.variants.find(v => {
                const matchColor = v.color && v.color.toString() === color;
                const matchSize = !selectedSize || (v.size && v.size.toString() === selectedSize); 
                return matchColor && matchSize;
            });

            const stock = variant ? variant.stock : 0;
            
            if (stock <= 0) {
                btn.disabled = true;
                btn.classList.add('out-of-stock');
               
                if (btn.classList.contains('active') && color === selectedColor) {
                    btn.classList.remove('active');
                    selectedColor = null; 
                }
            } else {
                btn.disabled = false;
                btn.classList.remove('out-of-stock');
            }
        });
    }

    
    function updatePriceAndStockUI() {

        product = productManagerInstance.getProductById(productId); 
        if (!product) return;
        
        const priceEl = document.getElementById('product-price');
        const oldPriceEl = document.getElementById('product-old-price');
        const stockEl = document.getElementById('product-stock-status');
        const qtyInput = document.getElementById('qtyInput');
        const buyNowBtn = document.getElementById('buyNowBtn');

        let finalPrice = product.price;
        let finalOldPrice = product.oldPrice;
        let variantStock = null;
        const isVariantProduct = product.variants && product.variants.length > 0;
        const sizeRequired = isVariantProduct && document.querySelector('.size-options-group');
        const colorRequired = isVariantProduct && document.querySelector('.color-options-group');

        let shouldDisableBuy = false; 
        

        updateVariantButtonStates(); 

        if (isVariantProduct) {
            const requiredSize = sizeRequired ? selectedSize : null;
            const requiredColor = colorRequired ? selectedColor : null;
            
            if (requiredSize || requiredColor) {
                const variant = product.variants.find(v => {
                    const matchSize = !requiredSize || (v.size && v.size.toString() === requiredSize);
                    const matchColor = !requiredColor || (v.color && v.color.toString() === requiredColor);
                    return matchSize && matchColor;
                });

                if (variant) {
                    finalPrice = variant.price !== undefined ? variant.price : product.price;
                    finalOldPrice = variant.oldPrice !== undefined ? variant.oldPrice : product.oldPrice;
                    variantStock = variant.stock;
                } else if (requiredSize || requiredColor) {
                    variantStock = 0; 
                }
            } else {

                finalPrice = product.price;
                finalOldPrice = product.oldPrice;
                variantStock = 999; 
            }
        } else {

            variantStock = product.initialStock !== undefined ? product.initialStock : 0;
        }

        if (priceEl) {
            priceEl.textContent = new Intl.NumberFormat('vi-VN').format(finalPrice) + '₫';
            priceEl.dataset.price = finalPrice;
        }
        if (oldPriceEl) {
            if (finalOldPrice && finalOldPrice > finalPrice) {
                 oldPriceEl.textContent = new Intl.NumberFormat('vi-VN').format(finalOldPrice) + '₫';
                 oldPriceEl.style.display = 'inline';
            } else {
                oldPriceEl.style.display = 'none';
            }
        }

        if (stockEl) {

            if (isVariantProduct && !selectedSize && !selectedColor) { 
                stockEl.textContent = `⚠️ Vui lòng chọn Kích cỡ/Màu sắc (hoặc chọn trong Giỏ hàng)`;
                stockEl.className = 'status-warning';
                shouldDisableBuy = true;
            } else if (variantStock !== null && variantStock > 0) {
                stockEl.textContent = `✅ Còn hàng (${variantStock} sản phẩm)`;
                stockEl.className = 'status-available';
                shouldDisableBuy = false;
            } else {
                stockEl.textContent = '❌ Hết hàng cho lựa chọn này';
                stockEl.className = 'status-out-of-stock';
                shouldDisableBuy = true;
            }
        }

        if (qtyInput) {

            const maxQtyLimit = (isVariantProduct && !selectedSize && !selectedColor) ? 99 : Math.max(1, variantStock);
            qtyInput.max = maxQtyLimit;
            
            if (variantStock !== null && quantity > maxQtyLimit) {
                quantity = Math.max(1, maxQtyLimit);
                qtyInput.value = quantity;
            }
        }

        if (buyNowBtn) {
            buyNowBtn.disabled = shouldDisableBuy; 
            
            let buttonText = '<i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng';
            if (shouldDisableBuy) {
                 buttonText = '<i class="fas fa-times-circle"></i> Hết hàng';
            }
            buyNowBtn.innerHTML = buttonText;
        }
    }

    function ganSuKienChonBienThe() {

        document.querySelectorAll('.size-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return; 
                
                document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = btn.dataset.size;
                updatePriceAndStockUI();
            });
        });
        

        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return; 
                
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedColor = btn.dataset.color;
                updatePriceAndStockUI();
            });
        });
    }

    function ganSuKienSoLuong() {
        const qtyInput = document.getElementById('qtyInput');
        const qtyIncrease = document.getElementById('increaseQty');
        const qtyDecrease = document.getElementById('decreaseQty');

        function updateQuantity(newQty) {
            const maxStock = parseInt(qtyInput.max) || 99;
            quantity = Math.max(1, Math.min(newQty, maxStock));
            if (qtyInput) {
                qtyInput.value = quantity;
            }
        }

        if (qtyIncrease) qtyIncrease.addEventListener('click', () => updateQuantity(quantity + 1));
        if (qtyDecrease) qtyDecrease.addEventListener('click', () => updateQuantity(quantity - 1));

        if (qtyInput) {
            qtyInput.addEventListener('change', () => {
                const newQty = parseInt(qtyInput.value) || 1;
                updateQuantity(newQty);
            });
            qtyInput.value = quantity;
        }
    }

    function ganSuKienMuaNgay() {
        const buyNowBtn = document.getElementById('buyNowBtn');
        const qtyInput = document.getElementById('qtyInput');

        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();

                if (window.kiemTraDangNhap && !window.kiemTraDangNhap(true)) {
                    return;
                }
                

                product = productManagerInstance.getProductById(productId); 
                if (!product) return;

                const isVariantProduct = product.variants && product.variants.length > 0;
                let sizeForCart = selectedSize || null; 
                let colorForCart = selectedColor || null; 
                let finalPrice = product.price;
                let currentStock = product.initialStock !== undefined ? product.initialStock : 0;
                const qty = parseInt(qtyInput.value) || 1;
                const statusEl = document.getElementById('product-stock-status');

                if (isVariantProduct) {
                    const requiredSize = document.querySelector('.size-options-group') ? selectedSize : null;
                    const requiredColor = document.querySelector('.color-options-group') ? selectedColor : null;
                    

                    if (!requiredSize && !requiredColor) {
                        sizeForCart = "Chưa chọn";
                        colorForCart = "N/A";
                        finalPrice = product.price;
                        currentStock = 999; 
                    } else {

                        const variant = product.variants.find(v => {
                            const matchSize = !requiredSize || (v.size && v.size.toString() === requiredSize);
                            const matchColor = !requiredColor || (v.color && v.color.toString() === requiredColor);
                            return matchSize && matchColor;
                        });

                        finalPrice = (variant && variant.price !== undefined) ? variant.price : product.price;
                        currentStock = variant ? variant.stock : 0; 
                    }
                }

                if ((isVariantProduct && sizeForCart !== "Chưa chọn" && currentStock <= 0) || (sizeForCart !== "Chưa chọn" && qty > currentStock)) {
                    if (statusEl) {
                         statusEl.textContent = `Không thể mua ${qty} sản phẩm. Tồn kho chỉ còn ${currentStock}.`;
                         statusEl.className = 'status-out-of-stock';
                    }
                    return;
                }

                if (window.addToCart) {

                    const success = window.addToCart(
                        product.id,
                        product.name,
                        finalPrice,
                        product.img || 'default.jpg',
                        sizeForCart, 
                        colorForCart,
                        qty 
                    );

                    if (success) {
                        console.log(`✅ Đã thêm ${qty} sản phẩm "${product.name}" (Size: ${sizeForCart}, Color: ${colorForCart}) vào giỏ hàng.`);

                        if (window.updateCartCount) {
                            window.updateCartCount();
                        }

                        if (window.openCartModal) {
                            window.openCartModal();
                        } else {
                            window.location.href = 'cart.html';
                        }
                    }
                } else {
                    console.error("Lỗi: Không tìm thấy hàm window.addToCart. Hãy đảm bảo file cart.js đã được nhúng.");
                }
            });
        }
    }

    initializeDefaultVariants(); 
    ganSuKienChonBienThe();
    ganSuKienSoLuong();
    ganSuKienMuaNgay();
    

    updatePriceAndStockUI();
    

    window.updateProductStockUI = updatePriceAndStockUI;
    
    return {
        updateStock: updatePriceAndStockUI
    };
}