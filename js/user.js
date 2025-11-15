import { syncToStorage, getFromStorage } from "./storage-utils.js";

class User {
  constructor(
    hoTen,
    tenDangNhap,
    email,
    matKhau,
    orders = [],
    isLocked = false,
    soDienThoai = "",
    diaChiMacDinh = ""
  ) {
    this.hoTen = hoTen;
    this.tenDangNhap = tenDangNhap;
    this.email = email;
    this.matKhau = matKhau;
    this.orders = orders;
    this.isLocked = isLocked;
    this.soDienThoai = soDienThoai;
    this.diaChiMacDinh = diaChiMacDinh;
  }

  kiemTraMatKhau(matKhauNhap) {
    return this.matKhau === matKhauNhap;
  }
}

class UserManager {
  constructor() {
    this.STORAGE_KEY = "users_shoestore";
    this.CURRENT_USER_KEY = "nguoiDungHienTai";
    this.ADMIN_USER_KEY = "nguoiDungAdmin";
    this.users = this.taiDanhSachUser();

    if (this.users.length > 2 && !localStorage.getItem(this.STORAGE_KEY)) {
      this.luuDanhSachUser();
    }
  }

  taiDanhSachUser() {
    try {
      const usersData = getFromStorage(this.STORAGE_KEY);
      if (usersData) {
        return usersData.map(
          (u) =>
            new User(
              u.hoTen,
              u.tenDangNhap,
              u.email,
              u.matKhau,
              u.orders || [],
              u.isLocked || false,
              u.soDienThoai || "",
              u.diaChiMacDinh || ""
            )
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách user:", error);
    }

    const adminOrders = [];
    return [
      new User(
        "Admin ShoeStore",
        "admin",
        "admin@shoestore.com",
        "Admin123",
        adminOrders,
        false,
        "",
        ""
      ),
      new User("Người Dùng Thử", "testuser", "test@user.com", "123456", [], false, "", ""),
    ];
  }

  luuDanhSachUser() {
    try {
      const usersData = this.users.map((u) => ({
        hoTen: u.hoTen,
        tenDangNhap: u.tenDangNhap,
        email: u.email,
        matKhau: u.matKhau,
        orders: u.orders,
        isLocked: u.isLocked,
        soDienThoai: u.soDienThoai || "",
        diaChiMacDinh: u.diaChiMacDinh || "",
      }));
      return syncToStorage(this.STORAGE_KEY, usersData);
    } catch (error) {
      console.error("Lỗi khi lưu danh sách user:", error);
      return false;
    }
  }

  luuUserHienTai(user) {
    try {
      const userData = {
        hoTen: user.hoTen,
        tenDangNhap: user.tenDangNhap,
        email: user.email,
        soDienThoai: user.soDienThoai || "",
        diaChiMacDinh: user.diaChiMacDinh || "",
        thoiGianDangNhap: new Date().toISOString(),
      };
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu user hiện tại:", error);
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
      console.error("Lỗi khi lấy user hiện tại:", error);
    }
    return null;
  }

  luuAdminHienTai(user) {
    try {
      const userData = {
        hoTen: user.hoTen,
        tenDangNhap: user.tenDangNhap,
        thoiGianDangNhap: new Date().toISOString(),
      };
      localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu admin hiện tại:", error);
      return false;
    }
  }

  layAdminHienTai() {
    try {
      const data = localStorage.getItem(this.ADMIN_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Lỗi khi lấy admin hiện tại:", error);
      return null;
    }
  }

  xoaAdminHienTai() {
    localStorage.removeItem(this.ADMIN_USER_KEY);
  }

  tonTaiTenDangNhap(tenDangNhap) {
    return this.users.some(
      (user) => user.tenDangNhap.toLowerCase() === tenDangNhap.toLowerCase()
    );
  }

  tonTaiEmail(email) {
    return this.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  capNhatUser(updatedUser) {
    if (!updatedUser || !updatedUser.tenDangNhap) {
      console.error("Lỗi: Dữ liệu người dùng cập nhật không hợp lệ.");
      return false;
    }

    const index = this.users.findIndex((u) => u.tenDangNhap === updatedUser.tenDangNhap);
    if (index !== -1) {
      const oldUser = this.users[index];
      this.users[index] = new User(
        updatedUser.hoTen ?? oldUser.hoTen,
        oldUser.tenDangNhap,
        updatedUser.email ?? oldUser.email,
        updatedUser.matKhau ?? oldUser.matKhau,
        oldUser.orders,
        oldUser.isLocked,
        updatedUser.soDienThoai ?? oldUser.soDienThoai,
        updatedUser.diaChiMacDinh ?? oldUser.diaChiMacDinh
      );

      this.luuDanhSachUser();

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
      (u) => (u.tenDangNhap === tenDangNhap || u.email === tenDangNhap) && u.kiemTraMatKhau(matKhau)
    );
    if (user && user.isLocked) {
      console.warn(`Tài khoản ${user.tenDangNhap} đã bị khóa.`);
      return null;
    }
    return user;
  }

  themTaiKhoan(hoTen, tenDangNhap, email, matKhau) {
    const user = new User(hoTen, tenDangNhap, email, matKhau, [], false, "", "");
    this.users.push(user);
    this.luuDanhSachUser();
    return user;
  }

  getOrderHistory(username) {
    const user = this.users.find((u) => u.tenDangNhap === username);
    return user ? user.orders || [] : [];
  }

  getAllUsers() {
    return this.users.filter((u) => u.tenDangNhap !== "admin");
  }

  resetPassword(username) {
    const user = this.users.find((u) => u.tenDangNhap === username);
    if (user) {
      user.matKhau = "123456";
      user.isLocked = false;
      this.luuDanhSachUser();
      return true;
    }
    return false;
  }

  updateUserStatus(username, isLocked) {
    const user = this.users.find((u) => u.tenDangNhap === username);
    if (user && user.tenDangNhap !== "admin") {
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

  capNhatDiaChiMacDinh(username, diaChiMacDinh) {
    const u = this.users.find((x) => x.tenDangNhap === username);
    if (!u) return false;
    u.diaChiMacDinh = (diaChiMacDinh || "").trim();
    this.luuDanhSachUser();
    const currentUser = this.layUserHienTai();
    if (currentUser && currentUser.tenDangNhap === username) {
      this.luuUserHienTai(u);
    }
    return true;
  }

  capNhatSoDienThoai(username, soDienThoai) {
    const u = this.users.find((x) => x.tenDangNhap === username);
    if (!u) return false;
    u.soDienThoai = (soDienThoai || "").trim();
    this.luuDanhSachUser();
    const currentUser = this.layUserHienTai();
    if (currentUser && currentUser.tenDangNhap === username) {
      this.luuUserHienTai(u);
    }
    return true;
  }
}

export { User, UserManager };

const userManagerInstance = new UserManager();
window.userManager = userManagerInstance;

function kiemTraDangNhap() {
  const saved = userManagerInstance.layUserHienTai();
  if (saved) {
    const fullUser = userManagerInstance.users.find((u) => u.tenDangNhap === saved.tenDangNhap);
    if (fullUser) {
      if (fullUser.isLocked) {
        localStorage.removeItem(userManagerInstance.CURRENT_USER_KEY);
        return null;
      }
      return {
        hoTen: fullUser.hoTen,
        tenDangNhap: fullUser.tenDangNhap,
        email: fullUser.email,
        isLocked: fullUser.isLocked,
        soDienThoai: fullUser.soDienThoai || "",
        diaChiMacDinh: fullUser.diaChiMacDinh || "",
        thoiGianDangNhap: saved.thoiGianDangNhap || null,
      };
    }
  }
  return null;
}

window.kiemTraDangNhap = kiemTraDangNhap;