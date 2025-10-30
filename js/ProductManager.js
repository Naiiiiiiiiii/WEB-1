// File: js/ProductManager.js - Quản lý Sản phẩm (ĐÃ BỔ SUNG LOGIC TỒN KHO)
import { Product } from './Product.js';
import { productDataList } from './productData.js'; 
import { categoryManager } from './category.js'; 

export class ProductManager {
    constructor() {
        this.STORAGE_KEY = 'shoestore_products';
        this.products = this.loadProducts();
    }
    
    // PHƯƠNG THỨC MỚI: Để ProductManager có thể tra cứu tên danh mục
    getCategoryName(categoryId) {
        return categoryManager.getCategoryNameById(categoryId);
    }

    // --------------------------------------------------------------------
    // PHƯƠNG THỨC CƠ BẢN (LOAD/SAVE/GET)
    // --------------------------------------------------------------------

    loadProducts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const productsData = JSON.parse(data);
                return productsData.map(p => Product.fromJSON(p));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        }
        
        // Nếu LocalStorage trống hoặc lỗi, khởi tạo từ dữ liệu thô (productDataList)
        return productDataList.map((data, index) => new Product({
            id: data.id || index + 1, 
            ...data,
            variants: data.variants || [], 
            costPrice: data.costPrice || data.price * 0.7 
        }));
    }

    saveProducts() {
        try {
            const productsData = this.products.map(p => p.toJSON());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productsData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách sản phẩm:', error);
            return false;
        }
    }

    getProductById(id) {
        // Chuyển id sang Number khi so sánh với id sản phẩm
        return this.products.find(p => p.id === Number(id));
    }

    getAllProducts(includeHidden = false) {
        if (includeHidden) {
            return this.products;
        }
        return this.products.filter(p => !p.isHidden);
    }
    
    getVisibleProducts() {
        return this.products.filter(p => !p.isHidden);
    }

    // --------------------------------------------------------------------
    // I. PHƯƠNG THỨC ADMIN (CRUD & Quản lý Tồn kho/Giá vốn)
    // --------------------------------------------------------------------

    updateProduct(id, updatedData) {
        const productIndex = this.products.findIndex(p => p.id === Number(id));
        if (productIndex === -1) return false;

        const currentProduct = this.products[productIndex];
        
        // Cập nhật dữ liệu
        const newProductData = { ...currentProduct.toJSON(), ...updatedData };
        this.products[productIndex] = new Product(newProductData);

        this.saveProducts();
        return true;
    }

    addProduct(productData) {
        const newId = this.products.length > 0 
            ? Math.max(...this.products.map(p => p.id)) + 1 
            : 1;

        const newProduct = new Product({
            ...productData,
            id: newId,
            sales: [],
            imports: [],
            initialStock: productData.initialStock || (productData.variants ? 0 : 0), 
            isHidden: false,
            variants: productData.variants || []
        });

        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    toggleHideStatus(id) {
        const product = this.getProductById(id);
        if (product) {
            product.isHidden = !product.isHidden;
            this.saveProducts();
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        // Chuyển ID sản phẩm (string) thành Number để khớp với product.id
        const productIdNum = Number(id); 
        const initialLength = this.products.length;
        
        // Lọc ra sản phẩm muốn xóa
        this.products = this.products.filter(p => p.id !== productIdNum); 
        
        if (this.products.length < initialLength) {
            this.saveProducts();
            return true;
        }
        return false;
    }

    /**
      Xử lý việc nhập hàng, cập nhật tồn kho và giá vốn.
     */
    processProductImport(productId, quantity, importPrice, size = null, note = "") {
        const product = this.getProductById(productId);

        if (product && quantity > 0 && importPrice > 0) {
            if (product.variants.length > 0 && size !== null) {
                // Xử lý biến thể
                const variant = product.variants.find(v => Number(v.size) === Number(size));
                if (variant) {
                    variant.stock = (variant.stock || 0) + quantity;
                } else {
                    // Nếu biến thể chưa tồn tại, thêm mới
                    product.variants.push({ size: size, stock: quantity });
                }
            } else {
                // Xử lý sản phẩm không có biến thể
                if (product.variants.length === 0) {
                    product.initialStock = (product.initialStock || 0) + quantity;
                }
            }
            
            // Cập nhật giá vốn chung
            product.costPrice = importPrice; 
            
            // Ghi lại lịch sử nhập
            product.imports.push({ 
                date: new Date().toISOString(), 
                qty: quantity, 
                costPrice: importPrice, 
                note: note || "Nhập hàng thủ công" + (size ? ` (Size: ${size})` : ""), 
                type: "IMPORT",
                variantSize: size 
            });

            this.saveProducts();
            return true;
        }
        return false;
    }
    
    // PHƯƠNG THỨC BỔ SUNG: GIẢM TỒN KHO KHI BÁN HÀNG
    /**
     Giảm số lượng tồn kho của một sản phẩm/biến thể.
     - ID sản phẩm.
     - Số lượng cần giảm.
     - Kích cỡ biến thể (null nếu không có biến thể).
    True nếu giảm tồn kho thành công.
     */
    decreaseStock(productId, quantity, size = null) {
        const product = this.getProductById(productId);
        if (!product || quantity <= 0) return false;

        let success = false;

        if (product.variants && product.variants.length > 0) {
            // Trường hợp có biến thể
            const variant = product.variants.find(v => Number(v.size) === Number(size));
            if (variant && variant.stock >= quantity) {
                variant.stock -= quantity;
                success = true;
            }
        } else {
            // Trường hợp không có biến thể (dùng initialStock)
            if (product.initialStock >= quantity) {
                product.initialStock -= quantity;
                success = true;
            }
        }

        if (success) {
            // Ghi lại lịch sử bán hàng (Sales)
            product.sales.push({ 
                date: new Date().toISOString(), 
                qty: quantity, 
                type: "SALE",
                variantSize: size 
            });
            this.saveProducts();
        }
        return success;
    }

    //  TĂNG TỒN KHO KHI HỦY ĐƠN HÀNG
    /**
     Tăng số lượng tồn kho của một sản phẩm/biến thể (dùng khi hoàn hàng/hủy đơn).
      - ID sản phẩm.
      - Số lượng cần tăng.
      - Kích cỡ biến thể (null nếu không có biến thể).
      True nếu tăng tồn kho thành công.
     */
    increaseStock(productId, quantity, size = null) {
        const product = this.getProductById(productId);
        if (!product || quantity <= 0) return false;

        let success = false;

        if (product.variants && product.variants.length > 0) {
            // Trường hợp có biến thể
            const variant = product.variants.find(v => Number(v.size) === Number(size));
            if (variant) {
                variant.stock += quantity;
                success = true;
            }
        } else {
            // Trường hợp không có biến thể (dùng initialStock)
            product.initialStock += quantity;
            success = true;
        }

        if (success) {
            // Có thể ghi lại lịch sử hoàn hàng/tăng kho nếu cần
            this.saveProducts();
        }
        return success;
    }

    /**
      Cập nhật giá bán dựa trên Tỉ lệ % Lợi nhuận (Margin) mong muốn.
     - ID sản phẩm.
      - Tỉ lệ % lợi nhuận (ví dụ: 20 cho 20%).
      True nếu cập nhật thành công.
     */
    updateProductPriceByMargin(id, newMarginPercent) {
        const product = this.getProductById(id);
        if (!product) return false;
        
        const margin = Number(newMarginPercent);
        if (isNaN(margin) || margin <= 0 || margin >= 100) {
             console.error('Tỉ lệ lợi nhuận không hợp lệ. Phải là số > 0 và < 100.');
             return false;
        }

        if (product.costPrice <= 0) {
            console.error('Không thể cập nhật giá khi Giá vốn = 0');
            return false;
        }
        
        // Công thức: Giá Bán = Giá Vốn / (1 - Tỉ lệ % Lợi nhuận)
        const newSalePrice = product.costPrice / (1 - (margin / 100));
        
        // Làm tròn giá bán đến 1000đ gần nhất
        const roundedPrice = Math.round(newSalePrice / 1000) * 1000;

        product.price = roundedPrice;
        product.targetProfitMargin = margin; // Lưu lại tỉ lệ % mong muốn

        this.saveProducts();
        return true;
    }

    // --------------------------------------------------------------------
    // II. PHƯƠNG THỨC END-USER (Tìm kiếm/Lọc nâng cao)
    // --------------------------------------------------------------------
    
    advancedSearch(name = '', category = 'All', minPrice = 0, maxPrice = Infinity) {
        let results = this.getVisibleProducts();
        const searchName = name.toLowerCase().trim();
        const minP = Number(minPrice);
        const maxP = Number(maxPrice);

        results = results.filter(product => {
            const nameMatch = searchName === '' || product.name.toLowerCase().includes(searchName);
            // Lọc bằng tên danh mục đã tra cứu
            const categoryMatch = category === 'All' || this.getCategoryName(product.categoryId) === category; 
            const priceMatch = product.price >= minP && product.price <= maxP;
            return nameMatch && categoryMatch && priceMatch;
        });

        return results;
    }
}
// Export instance ProductManager
export const productManager = new ProductManager();