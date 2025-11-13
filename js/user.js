// Class User: Định nghĩa cấu trúc của một người dùng trong hệ thống
class User {
    // Constructor: Khởi tạo đối tượng User với các thông tin cần thiết
    constructor(hoTen, tenDangNhap, email, matKhau, orders = [], isLocked = false) {
        this.hoTen = hoTen;              // Họ tên đầy đủ của người dùng
        this.tenDangNhap = tenDangNhap;  // Username để đăng nhập (unique)
        this.email = email;              // Email của người dùng
        this.matKhau = matKhau;          // Mật khẩu (lưu ý: trong thực tế nên hash)
        this.orders = orders;            // Mảng lưu lịch sử đơn hàng của user
        this.isLocked = isLocked;        // Trạng thái khóa tài khoản (true = bị khóa)
    }

    // Phương thức: Kiểm tra mật khẩu có khớp không
    kiemTraMatKhau(matKhauNhap) {
        // So sánh mật khẩu nhập vào với mật khẩu đã lưu
        return this.matKhau === matKhauNhap;
    }
}

// Class UserManager: Quản lý toàn bộ danh sách người dùng
class UserManager {
    // Constructor: Khởi tạo UserManager
    constructor() {
        // Key để lưu danh sách tất cả users trong localStorage
        this.STORAGE_KEY = 'users_shoestore'; 
        
        // Key để lưu thông tin user đang đăng nhập (khách hàng)
        this.CURRENT_USER_KEY = 'nguoiDungHienTai';
        
        // Key để lưu thông tin admin đang đăng nhập
        this.ADMIN_USER_KEY = 'nguoiDungAdmin';
        
        // Tải danh sách users từ localStorage hoặc dữ liệu mẫu
        this.users = this.taiDanhSachUser();
        
        // Nếu có nhiều hơn 2 users và chưa lưu vào localStorage
        // thì lưu lại (để persist data)
        if(this.users.length > 2 && !localStorage.getItem(this.STORAGE_KEY)) {
             this.luuDanhSachUser();
        }
    }

    // Phương thức: Tải danh sách người dùng từ localStorage
    taiDanhSachUser() {
        try {
            // Đọc dữ liệu từ localStorage
            const data = localStorage.getItem(this.STORAGE_KEY);
            
            // Nếu có dữ liệu đã lưu
            if (data) {
                // Parse JSON thành array
                const usersData = JSON.parse(data);

                // Chuyển đổi mỗi object thành instance của class User
                return usersData.map(u => new User(
                    u.hoTen, 
                    u.tenDangNhap, 
                    u.email, 
                    u.matKhau, 
                    u.orders || [],           // Lịch sử đơn hàng, mặc định []
                    u.isLocked || false       // Trạng thái khóa, mặc định false
                ));
            }
        } catch (error) {
            // Log lỗi nếu có vấn đề khi đọc/parse
            console.error('Lỗi khi tải danh sách user:', error);
        }
        
        // Nếu không có dữ liệu trong localStorage, tạo dữ liệu mẫu
        // Đơn hàng mẫu cho tài khoản admin
        const adminOrders = [
            {
                id: 'ORD-2025-001',
                date: new Date(Date.now() - 86400000 * 2).toISOString(),  // 2 ngày trước
                status: 'delivered',   // Trạng thái: đã giao hàng
                total: 1500000,        // Tổng tiền
                items: [{ id: 'S001', name: 'Giày Thể Thao Cao Cấp', size: '42', price: 1500000, quantity: 1 }]
            },
            {
                id: 'ORD-2025-002',
                date: new Date().toISOString(),  // Hôm nay
                status: 'new',         // Trạng thái: đơn mới
                total: 2800000,
                items: [{ id: 'S003', name: 'Giày Da Oxford Đen', size: '41', price: 1400000, quantity: 2 }]
            }
        ];
        
        // Trả về mảng chứa 2 user mặc định: admin và testuser
        return [
            new User("Admin ShoeStore", "admin", "admin@shoestore.com", "Admin123", adminOrders, false),
            new User("Người Dùng Thử", "testuser", "test@user.com", "123456", [], false)
        ];
    }

    // Phương thức: Lưu danh sách tất cả users vào localStorage
    // @return {boolean} - true nếu lưu thành công, false nếu lỗi
    luuDanhSachUser() {
        try {
            // Map từ User objects sang plain objects để stringify
            const usersData = this.users.map(u => ({
                hoTen: u.hoTen,
                tenDangNhap: u.tenDangNhap,
                email: u.email,
                matKhau: u.matKhau,
                orders: u.orders,
                isLocked: u.isLocked 
            }));
            // Lưu vào localStorage dưới dạng JSON string
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usersData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách user:', error);
            return false;
        }
    }
    
    // Phương thức: Lưu thông tin user hiện tại đang đăng nhập (khách hàng)
    // @param {User} user - User object cần lưu
    // @return {boolean} - true nếu lưu thành công, false nếu lỗi
    luuUserHienTai(user) {
        try {
            // Chỉ lưu các thông tin cần thiết, không lưu orders và password
            const userData = {
                hoTen: user.hoTen,
                tenDangNhap: user.tenDangNhap,
                email: user.email,
                thoiGianDangNhap: new Date().toISOString() // Lưu thời gian đăng nhập
            };
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu user hiện tại:', error);
            return false;
        }
    }

    // Phương thức: Lấy thông tin user hiện tại từ localStorage
    // @return {Object|null} - User data object hoặc null nếu không có/lỗi
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

    // Phương thức: Lưu thông tin admin hiện tại đang đăng nhập
    // @param {User} user - Admin user object cần lưu
    // @return {boolean} - true nếu lưu thành công, false nếu lỗi
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

    // Phương thức: Lấy thông tin admin hiện tại từ localStorage
    // @return {Object|null} - Admin data object hoặc null
    layAdminHienTai() {
        try {
            const data = localStorage.getItem(this.ADMIN_USER_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Lỗi khi lấy admin hiện tại:', error);
            return null;
        }
    }
    
    // Phương thức: Xóa thông tin admin khỏi localStorage (đăng xuất admin)
    xoaAdminHienTai() {
        localStorage.removeItem(this.ADMIN_USER_KEY);
    }
    

    // Phương thức: Kiểm tra tên đăng nhập đã tồn tại chưa
    // @param {string} tenDangNhap - Username cần kiểm tra
    // @return {boolean} - true nếu đã tồn tại, false nếu chưa
    tonTaiTenDangNhap(tenDangNhap) {
        // some() return true nếu tìm thấy ít nhất 1 user khớp
        // toLowerCase() để so sánh không phân biệt hoa thường
        return this.users.some(user => user.tenDangNhap.toLowerCase() === tenDangNhap.toLowerCase());
    }

    // Phương thức: Kiểm tra email đã tồn tại chưa
    // @param {string} email - Email cần kiểm tra
    // @return {boolean} - true nếu đã tồn tại, false nếu chưa
    tonTaiEmail(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Phương thức: Cập nhật thông tin user
    // @param {Object} updatedUser - Object chứa thông tin mới cần cập nhật
    // @return {boolean} - true nếu cập nhật thành công, false nếu lỗi
    capNhatUser(updatedUser) {
        // Validate input
        if (!updatedUser || !updatedUser.tenDangNhap) {
            console.error("Lỗi: Dữ liệu người dùng cập nhật không hợp lệ.");
            return false;
        }

        // Tìm index của user cần cập nhật
        const index = this.users.findIndex(u => u.tenDangNhap === updatedUser.tenDangNhap);

        // Nếu tìm thấy user
        if (index !== -1) {
            const oldUser = this.users[index];
            // Tạo User object mới với thông tin được cập nhật
            // Giữ nguyên orders và isLocked, chỉ update các field khác
            this.users[index] = new User(
                updatedUser.hoTen || oldUser.hoTen,      // Họ tên mới hoặc giữ nguyên
                oldUser.tenDangNhap,                      // Username không đổi
                updatedUser.email || oldUser.email,       // Email mới hoặc giữ nguyên
                updatedUser.matKhau || oldUser.matKhau,   // Password mới hoặc giữ nguyên
                oldUser.orders,                           // Giữ nguyên orders
                oldUser.isLocked                          // Giữ nguyên lock status
            );
            // Lưu danh sách users đã cập nhật vào localStorage
            this.luuDanhSachUser();
            
            // Nếu user đang đăng nhập chính là user vừa update
            // thì cập nhật lại session current user
            const currentUser = this.layUserHienTai();
            if (currentUser && currentUser.tenDangNhap === updatedUser.tenDangNhap) {
                this.luuUserHienTai(this.users[index]);
            }
            return true;
        }
        return false; // Không tìm thấy user
    }
    
    // Phương thức: Tìm tài khoản theo username/email và password
    // @param {string} tenDangNhap - Username hoặc email để đăng nhập
    // @param {string} matKhau - Password
    // @return {User|null} - User object nếu tìm thấy và password đúng, null nếu không
    timTaiKhoan(tenDangNhap, matKhau) {
        // Tìm user có username HOẶC email khớp với tenDangNhap
        // VÀ password khớp (dùng method kiemTraMatKhau())
        const user = this.users.find(
            u =>
                (u.tenDangNhap === tenDangNhap || u.email === tenDangNhap) &&
                u.kiemTraMatKhau(matKhau)
        );
        // Kiểm tra tài khoản có bị khóa không
        if (user && user.isLocked) {
             console.warn(`Tài khoản ${user.tenDangNhap} đã bị khóa.`);
             return null; // Trả về null nếu tài khoản bị khóa
        }
        return user; // Trả về user nếu tìm thấy và không bị khóa
    }

    // Phương thức: Thêm tài khoản mới
    // @param {string} hoTen - Họ tên
    // @param {string} tenDangNhap - Username (unique)
    // @param {string} email - Email (unique)
    // @param {string} matKhau - Password
    // @return {User} - User object vừa tạo
    themTaiKhoan(hoTen, tenDangNhap, email, matKhau) {
        // Tạo User object mới
        const user = new User(hoTen, tenDangNhap, email, matKhau);
        // Thêm vào mảng users
        this.users.push(user);
        // Lưu vào localStorage
        this.luuDanhSachUser(); 
        return user;
    }

    // Phương thức: Lấy lịch sử đơn hàng của user
    // @param {string} username - Username của user cần lấy orders
    // @return {Array} - Mảng orders hoặc [] nếu không tìm thấy user
    getOrderHistory(username) {
        const user = this.users.find(u => u.tenDangNhap === username);
        return user ? (user.orders || []) : [];
    }

    // Phương thức: Lấy tất cả users (trừ admin)
    // @return {Array} - Mảng users (không bao gồm admin)
    getAllUsers() {
        // filter() loại bỏ user có tenDangNhap = 'admin'
        return this.users.filter(u => u.tenDangNhap !== 'admin'); 
    }

    // Phương thức: Reset mật khẩu user về mặc định
    // @param {string} username - Username của user cần reset
    // @return {boolean} - true nếu reset thành công, false nếu không tìm thấy
    resetPassword(username) {
        const user = this.users.find(u => u.tenDangNhap === username);
        if (user) {
            user.matKhau = '123456';  // Đặt lại password mặc định
            user.isLocked = false;    // Mở khóa tài khoản (nếu đang khóa)
            this.luuDanhSachUser();
            return true;
        }
        return false; // Không tìm thấy user
    }

    // Phương thức: Cập nhật trạng thái khóa/mở khóa tài khoản
    // @param {string} username - Username của user cần update
    // @param {boolean} isLocked - true = khóa, false = mở khóa
    // @return {boolean} - true nếu update thành công, false nếu không
    updateUserStatus(username, isLocked) {
        const user = this.users.find(u => u.tenDangNhap === username);
        
        // Chỉ cho phép thay đổi status của user thường, không cho phép khóa admin
        if (user && user.tenDangNhap !== 'admin') { 
            user.isLocked = isLocked;
            this.luuDanhSachUser();
            

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

const userManagerInstance = new UserManager();
window.userManager = userManagerInstance; 

function kiemTraDangNhap() {
    const user = userManagerInstance.layUserHienTai();
    if (user) {
        const fullUser = userManagerInstance.users.find(u => u.tenDangNhap === user.tenDangNhap);
        if (fullUser && fullUser.isLocked) {
            localStorage.removeItem(userManagerInstance.CURRENT_USER_KEY);
            return null;
        }
    }
    return user;
}

window.kiemTraDangNhap = kiemTraDangNhap;