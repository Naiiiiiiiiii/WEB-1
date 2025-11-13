// Import class Product để tạo và quản lý các đối tượng sản phẩm
import { Product } from './Product.js';

// Import dữ liệu sản phẩm mẫu ban đầu từ file productData.js
import { productDataList } from './productData.js'; 

// Import categoryManager để lấy tên danh mục từ ID
import { categoryManager } from './category.js'; 

// Class ProductManager: Quản lý toàn bộ danh sách sản phẩm
export class ProductManager {
    // Constructor: Khởi tạo ProductManager
    constructor() {
        // Key để lưu/đọc dữ liệu sản phẩm từ localStorage
        this.STORAGE_KEY = 'shoestore_products';
        
        // Tải danh sách sản phẩm từ localStorage hoặc dữ liệu mẫu
        this.products = this.loadProducts();
    }
    
    // Phương thức: Lấy tên danh mục từ categoryId
    getCategoryName(categoryId) {
        // Gọi hàm từ categoryManager để convert ID thành tên
        return categoryManager.getCategoryNameById(categoryId);
    }

    // Phương thức: Tải danh sách sản phẩm từ localStorage
    loadProducts() {
        try {
            // Đọc dữ liệu từ localStorage
            const data = localStorage.getItem(this.STORAGE_KEY);
            
            // Nếu có dữ liệu đã lưu
            if (data) {
                // Parse JSON string thành array
                const productsData = JSON.parse(data);
                
                // Chuyển đổi mỗi object thành instance của class Product
                return productsData.map(p => Product.fromJSON(p));
            }
        } catch (error) {
            // Log lỗi nếu có vấn đề khi đọc/parse dữ liệu
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        }
        
        // Nếu không có dữ liệu trong localStorage, dùng dữ liệu mẫu
        // Tạo instance Product cho mỗi item trong productDataList
        return productDataList.map((data, index) => new Product({
            id: data.id || index + 1,  // Tạo ID nếu chưa có
            ...data,  // Spread toàn bộ thuộc tính từ data
            variants: data.variants || [],  // Đảm bảo có mảng variants
            costPrice: data.costPrice || data.price * 0.7  // Ước tính giá vốn = 70% giá bán
        }));
    }

    // Phương thức: Lưu danh sách sản phẩm vào localStorage
    saveProducts() {
        try {
            // Chuyển đổi tất cả Product instances thành plain objects
            const productsData = this.products.map(p => p.toJSON());
            
            // Lưu vào localStorage dưới dạng JSON string
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productsData));
            
            // Trả về true nếu lưu thành công
            return true;
        } catch (error) {
            // Log lỗi nếu có vấn đề (VD: localStorage đầy)
            console.error('Lỗi khi lưu danh sách sản phẩm:', error);
            return false;
        }
    }

    // Phương thức: Tìm sản phẩm theo ID
    getProductById(id) {
        // Dùng find() để tìm sản phẩm có id khớp (chuyển về Number để so sánh)
        return this.products.find(p => p.id === Number(id));
    }

    // Phương thức: Lấy tất cả sản phẩm (có thể bao gồm sản phẩm bị ẩn)
    getAllProducts(includeHidden = false) {
        // Nếu includeHidden = true, trả về tất cả
        if (includeHidden) {
            return this.products;
        }
        // Ngược lại, chỉ trả về sản phẩm chưa bị ẩn (isHidden = false)
        return this.products.filter(p => !p.isHidden);
    }
    
    // Phương thức: Lấy danh sách sản phẩm hiển thị (không bị ẩn)
    getVisibleProducts() {
        // Lọc và chỉ trả về các sản phẩm có isHidden = false
        return this.products.filter(p => !p.isHidden);
    }

    // Phương thức: Cập nhật thông tin sản phẩm
    // @param id: ID của sản phẩm cần cập nhật
    // @param updatedData: Object chứa dữ liệu mới cần cập nhật
    // @return: true nếu thành công, false nếu không tìm thấy sản phẩm
    updateProduct(id, updatedData) {
        // Tìm index của sản phẩm trong mảng
        const productIndex = this.products.findIndex(p => p.id === Number(id));
        
        // Nếu không tìm thấy, trả về false
        if (productIndex === -1) return false;

        // Lấy sản phẩm hiện tại
        const currentProduct = this.products[productIndex];
        
        // Merge dữ liệu cũ và mới:
        // 1. currentProduct.toJSON() = lấy tất cả thuộc tính cũ
        // 2. ...updatedData = ghi đè bằng dữ liệu mới
        const newProductData = { ...currentProduct.toJSON(), ...updatedData };
        
        // Tạo Product instance mới với dữ liệu đã merge
        this.products[productIndex] = new Product(newProductData);

        // Lưu vào localStorage
        this.saveProducts();
        
        return true;  // Cập nhật thành công
    }

    // Phương thức: Thêm sản phẩm mới vào danh sách
    // @param productData: Object chứa thông tin sản phẩm mới
    // @return: Product instance vừa được tạo
    addProduct(productData) {
        // Tạo ID mới cho sản phẩm:
        // - Nếu có sản phẩm: lấy ID lớn nhất + 1
        // - Nếu chưa có sản phẩm nào: ID = 1
        const newId = this.products.length > 0 
            ? Math.max(...this.products.map(p => p.id)) + 1 
            : 1;

        // Tạo Product instance mới với dữ liệu được chuẩn hóa
        const newProduct = new Product({
            ...productData,          // Spread toàn bộ dữ liệu từ param
            id: newId,               // Gán ID mới
            sales: [],               // Khởi tạo lịch sử bán hàng rỗng
            imports: [],             // Khởi tạo lịch sử nhập hàng rỗng
            initialStock: productData.initialStock || (productData.variants ? 0 : 0), 
            isHidden: false,         // Mặc định không ẩn
            variants: productData.variants || []  // Đảm bảo có mảng variants
        });

        // Thêm sản phẩm mới vào mảng
        this.products.push(newProduct);
        
        // Lưu vào localStorage
        this.saveProducts();
        
        // Trả về sản phẩm vừa tạo
        return newProduct;
    }

    // Phương thức: Chuyển đổi trạng thái ẩn/hiện của sản phẩm
    // @param id: ID của sản phẩm
    // @return: true nếu thành công, false nếu không tìm thấy
    toggleHideStatus(id) {
        // Tìm sản phẩm theo ID
        const product = this.getProductById(id);
        
        if (product) {
            // Toggle trạng thái isHidden (true → false, false → true)
            product.isHidden = !product.isHidden;
            
            // Lưu thay đổi vào localStorage
            this.saveProducts();
            
            return true;  // Thành công
        }
        
        return false;  // Không tìm thấy sản phẩm
    }

    // Phương thức: Xóa sản phẩm khỏi danh sách
    // @param id: ID của sản phẩm cần xóa
    // @return: true nếu xóa thành công, false nếu không tìm thấy
    deleteProduct(id) {
        // Convert ID sang Number để so sánh chính xác
        const productIdNum = Number(id); 
        
        // Lưu độ dài ban đầu để kiểm tra sau
        const initialLength = this.products.length;
        
        // Lọc bỏ sản phẩm có ID khớp
        // filter() tạo mảng mới không chứa sản phẩm bị xóa
        this.products = this.products.filter(p => p.id !== productIdNum); 
        
        // Nếu độ dài giảm (có sản phẩm bị xóa)
        if (this.products.length < initialLength) {
            // Lưu vào localStorage
            this.saveProducts();
            return true;  // Xóa thành công
        }
        
        return false;  // Không tìm thấy sản phẩm để xóa
    }

    // Phương thức: Xử lý nhập hàng (tăng tồn kho)
    // @param productId: ID của sản phẩm nhập
    // @param quantity: Số lượng nhập
    // @param importPrice: Giá nhập (giá vốn)
    // @param size: Size của variant (null nếu không có variant)
    // @param note: Ghi chú nhập hàng
    // @return: true nếu thành công, false nếu thất bại
    processProductImport(productId, quantity, importPrice, size = null, note = "") {
        // Tìm sản phẩm
        const product = this.getProductById(productId);

        // Validate: sản phẩm tồn tại và số lượng/giá hợp lệ
        if (product && quantity > 0 && importPrice > 0) {
            // Trường hợp 1: Sản phẩm có variants VÀ đang nhập cho size cụ thể
            if (product.variants.length > 0 && size !== null) {
                // Tìm variant theo size
                const variant = product.variants.find(v => Number(v.size) === Number(size));
                
                if (variant) {
                    // Variant đã tồn tại: Tăng stock
                    variant.stock = (variant.stock || 0) + quantity;
                } else {
                    // Variant chưa có: Tạo mới và thêm vào mảng
                    product.variants.push({ size: size, stock: quantity });
                }
            } else {
                // Trường hợp 2: Sản phẩm không có variants
                if (product.variants.length === 0) {
                    // Tăng initialStock
                    product.initialStock = (product.initialStock || 0) + quantity;
                }
            }
            
            // Cập nhật giá vốn (cost price) cho sản phẩm
            product.costPrice = importPrice; 
            
            // Lưu lịch sử nhập hàng vào mảng imports
            product.imports.push({ 
                date: new Date().toISOString(),  // Thời gian nhập
                qty: quantity,                    // Số lượng
                costPrice: importPrice,           // Giá nhập
                note: note || "Nhập hàng thủ công" + (size ? ` (Size: ${size})` : ""),  // Ghi chú
                type: "IMPORT",                   // Loại transaction
                variantSize: size                 // Size của variant (nếu có)
            });

            // Lưu vào localStorage
            this.saveProducts();
            return true;  // Nhập hàng thành công
        }
        return false;
    }
    

    
    decreaseStock(productId, quantity, size = null) {
        const product = this.getProductById(productId);
        if (!product || quantity <= 0) return false;

        let success = false;

        if (product.variants && product.variants.length > 0) {

            const variant = product.variants.find(v => Number(v.size) === Number(size));
            if (variant && variant.stock >= quantity) {
                variant.stock -= quantity;
                success = true;
            }
        } else {

            if (product.initialStock >= quantity) {
                product.initialStock -= quantity;
                success = true;
            }
        }

        if (success) {

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

    
    increaseStock(productId, quantity, size = null) {
        const product = this.getProductById(productId);
        if (!product || quantity <= 0) return false;

        let success = false;

        if (product.variants && product.variants.length > 0) {

            const variant = product.variants.find(v => Number(v.size) === Number(size));
            if (variant) {
                variant.stock += quantity;
                success = true;
            }
        } else {

            product.initialStock += quantity;
            success = true;
        }

        if (success) {

            this.saveProducts();
        }
        return success;
    }

    
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
        

        const newSalePrice = product.costPrice / (1 - (margin / 100));
        

        const roundedPrice = Math.round(newSalePrice / 1000) * 1000;

        product.price = roundedPrice;
        product.targetProfitMargin = margin;

        this.saveProducts();
        return true;
    }

    
    advancedSearch(name = '', category = 'All', minPrice = 0, maxPrice = Infinity) {
        let results = this.getVisibleProducts();
        const searchName = name.toLowerCase().trim();
        const minP = Number(minPrice);
        const maxP = Number(maxPrice);

        results = results.filter(product => {
            const nameMatch = searchName === '' || product.name.toLowerCase().includes(searchName);

            const categoryMatch = category === 'All' || this.getCategoryName(product.categoryId) === category; 
            const priceMatch = product.price >= minP && product.price <= maxP;
            return nameMatch && categoryMatch && priceMatch;
        });

        return results;
    }
}

export const productManager = new ProductManager();