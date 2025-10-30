
/**
 * user.js - Định nghĩa User Model và UserManager (CRUD Users).
 */

// Định nghĩa class User (Model)
class User {
    constructor(hoTen, tenDangNhap, email, matKhau, orders = [], isLocked = false) {
        this.hoTen = hoTen;
        this.tenDangNhap = tenDangNhap;
        this.email = email;
        this.matKhau = matKhau;
        this.orders = orders; 
        this.isLocked = isLocked; 
    }

    // Kiểm tra mật khẩu
    kiemTraMatKhau(matKhauNhap) {
        return this.matKhau === matKhauNhap;
    }
}

// Quản lý danh sách User với LocalStorage (Controller)
class UserManager {
    constructor() {
        this.STORAGE_KEY = 'users_shoestore'; 
        this.CURRENT_USER_KEY = 'nguoiDungHienTai'; // Key Dành cho End User
        this.ADMIN_USER_KEY = 'nguoiDungAdmin';    // 🔑 Key MỚI Dành cho Admin
        this.users = this.taiDanhSachUser();
        
        // Chạy lưu mẫu lần đầu nếu cần
        if(this.users.length > 2 && !localStorage.getItem(this.STORAGE_KEY)) {
             this.luuDanhSachUser();
        }
    }

    // Tải danh sách user từ LocalStorage
    taiDanhSachUser() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const usersData = JSON.parse(data);
                // Xử lý tương thích ngược: isLocked mặc định là false nếu không tồn tại
                return usersData.map(u => new User(
                    u.hoTen, 
                    u.tenDangNhap, 
                    u.email, 
                    u.matKhau, 
                    u.orders || [], 
                    u.isLocked || false 
                ));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách user:', error);
        }
        
        // Dữ liệu đơn hàng MẪU cho Admin
        const adminOrders = [
            {
                id: 'ORD-2025-001',
                date: new Date(Date.now() - 86400000 * 2).toISOString(), 
                status: 'delivered', 
                total: 1500000,
                items: [{ id: 'S001', name: 'Giày Thể Thao Cao Cấp', size: '42', price: 1500000, quantity: 1 }]
            },
            {
                id: 'ORD-2025-002',
                date: new Date().toISOString(), 
                status: 'new', 
                total: 2800000,
                items: [{ id: 'S003', name: 'Giày Da Oxford Đen', size: '41', price: 1400000, quantity: 2 }]
            }
        ];
        
        // Tạo tài khoản admin mặc định
        return [
            new User("Admin ShoeStore", "admin", "admin@shoestore.com", "Admin123", adminOrders, false),
            new User("Người Dùng Thử", "testuser", "test@user.com", "123456", [], false)
        ];
    }

    // Lưu danh sách user vào LocalStorage
    luuDanhSachUser() {
        try {
            const usersData = this.users.map(u => ({
                hoTen: u.hoTen,
                tenDangNhap: u.tenDangNhap,
                email: u.email,
                matKhau: u.matKhau,
                orders: u.orders,
                isLocked: u.isLocked 
            }));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usersData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách user:', error);
            return false;
        }
    }
    
    // =========================================================
    // HÀM QUẢN LÝ SESSION END USER (Giữ nguyên CURRENT_USER_KEY)
    // =========================================================
    luuUserHienTai(user) {
        try {
            const userData = {
                hoTen: user.hoTen,
                tenDangNhap: user.tenDangNhap,
                email: user.email,
                thoiGianDangNhap: new Date().toISOString()
            };
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu user hiện tại:', error);
            return false;
        }
    }

    layUserHienTai() {
        try {
            const data = localStorage.getItem(this.CURRENT_USER_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy user hiện tại:', error);
        }
        return null;
    }

    // =========================================================
    // HÀM QUẢN LÝ SESSION ADMIN (Sử dụng ADMIN_USER_KEY)
    // =========================================================
    luuAdminHienTai(user) {
        try {
            const userData = {
                hoTen: user.hoTen,
                tenDangNhap: user.tenDangNhap,
                thoiGianDangNhap: new Date().toISOString()
            };
            localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu admin hiện tại:', error);
            return false;
        }
    }

    layAdminHienTai() {
        try {
            const data = localStorage.getItem(this.ADMIN_USER_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Lỗi khi lấy admin hiện tại:', error);
            return null;
        }
    }
    
    xoaAdminHienTai() {
        localStorage.removeItem(this.ADMIN_USER_KEY);
    }
    
    // =========================================================
    // HÀM CRUD & LOGIC
    // =========================================================

    /**
     *  Thêm phương thức kiểm tra tồn tại Tên đăng nhập
     */
    tonTaiTenDangNhap(tenDangNhap) {
        return this.users.some(user => user.tenDangNhap.toLowerCase() === tenDangNhap.toLowerCase());
    }

    /**
     *  Thêm phương thức kiểm tra tồn tại Email
     */
    tonTaiEmail(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    capNhatUser(updatedUser) {
        if (!updatedUser || !updatedUser.tenDangNhap) {
            console.error("Lỗi: Dữ liệu người dùng cập nhật không hợp lệ.");
            return false;
        }

        const index = this.users.findIndex(u => u.tenDangNhap === updatedUser.tenDangNhap);

        if (index !== -1) {
            const oldUser = this.users[index];
            this.users[index] = new User(
                updatedUser.hoTen || oldUser.hoTen,
                oldUser.tenDangNhap, 
                updatedUser.email || oldUser.email,
                updatedUser.matKhau || oldUser.matKhau,
                oldUser.orders,
                oldUser.isLocked
            );
            
            this.luuDanhSachUser();
            
            // Cập nhật user hiện tại trong LocalStorage (nếu là user đang đăng nhập)
            const currentUser = this.layUserHienTai();
            if (currentUser && currentUser.tenDangNhap === updatedUser.tenDangNhap) {
                this.luuUserHienTai(this.users[index]);
            }
            return true;
        }
        return false;
    }
    
    timTaiKhoan(tenDangNhap, matKhau) {
        const user = this.users.find(
            u =>
                (u.tenDangNhap === tenDangNhap || u.email === tenDangNhap) &&
                u.kiemTraMatKhau(matKhau)
        );
        if (user && user.isLocked) {
             console.warn(`Tài khoản ${user.tenDangNhap} đã bị khóa.`);
             return null;
        }
        return user;
    }

    themTaiKhoan(hoTen, tenDangNhap, email, matKhau) {
        const user = new User(hoTen, tenDangNhap, email, matKhau);
        this.users.push(user);
        this.luuDanhSachUser(); 
        return user;
    }

    getOrderHistory(username) {
        const user = this.users.find(u => u.tenDangNhap === username);
        return user ? (user.orders || []) : [];
    }

    // =========================================================
    // PHƯƠNG THỨC ADMIN
    // =========================================================
    getAllUsers() {
        return this.users.filter(u => u.tenDangNhap !== 'admin'); 
    }

    resetPassword(username) {
        const user = this.users.find(u => u.tenDangNhap === username);
        if (user) {
            user.matKhau = '123456'; 
            this.luuDanhSachUser();
            return true;
        }
        return false;
    }

    updateUserStatus(username, isLocked) {
        const user = this.users.find(u => u.tenDangNhap === username);
        
        if (user && user.tenDangNhap !== 'admin') { 
            user.isLocked = isLocked;
            this.luuDanhSachUser();
            
            // Nếu người dùng hiện tại đang đăng nhập bị khóa, buộc đăng xuất
            const currentUser = this.layUserHienTai();
            if (currentUser && currentUser.tenDangNhap === username && isLocked) {
                localStorage.removeItem(this.CURRENT_USER_KEY); 
            }
            return true;
        }
        return false;
    }
}

export { User, UserManager };


// =======================================================
// HÀM GLOBAL KIỂM TRA ĐĂNG NHẬP
// =======================================================

const userManagerInstance = new UserManager();
window.userManager = userManagerInstance; 

/**
 * Lấy thông tin người dùng hiện tại đang đăng nhập (End User).
 */
function kiemTraDangNhap() {
    const user = userManagerInstance.layUserHienTai();
    if (user) {
        const fullUser = userManagerInstance.users.find(u => u.tenDangNhap === user.tenDangNhap);
        if (fullUser && fullUser.isLocked) {
            localStorage.removeItem(userManagerInstance.CURRENT_USER_KEY);
            return null; // Trả về null nếu bị khóa
        }
    }
    return user;
}

window.kiemTraDangNhap = kiemTraDangNhap;