import { User, UserManager } from "./user.js";

const LOGIN_MODAL_HTML = `
    <div id="login-register-modal" class="modal login-register-modal-override" style="display: none;">
        <div class="modal-content login-modal-content">
            
            <button class="modal-close" id="closeLoginModal" aria-label="Đóng">&times;</button>
            
            <div class="khung-dang-nhap">
                <a href="#" class="nut-tro-ve modal-close">
                    <i class="fas fa-arrow-left"></i>
                </a>

                <div class="tieu-de-form">
                    <div class="logo-form">
                        <i class="fas fa-shoe-prints"></i>
                        <h1>ShoeStore</h1>
                    </div>
                    <p>Chào mừng bạn quay trở lại!</p>
                </div>

                <div class="cac-tab">
                    <button class="nut-tab active" data-tab="dang-nhap">
                        <i class="fas fa-sign-in-alt"></i>
                        Đăng nhập
                    </button>
                    <button class="nut-tab" data-tab="dang-ky">
                        <i class="fas fa-user-plus"></i>
                        Đăng ký
                    </button>
                </div>

                <div class="khung-form active" data-tab-content="dang-nhap">
                    <form id="formDangNhap">
                        <div class="nhom-input">
                            <label for="tenDangNhap">Tên đăng nhập / Email</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-user icon-truoc"></i>
                                <input type="text" id="tenDangNhap" name="tenDangNhap" placeholder="Nhập tên đăng nhập hoặc Email">
                            </div>
                            <div class="thong-bao-loi" id="loiTenDangNhap"></div>
                        </div>

                        <div class="nhom-input">
                            <label for="matKhau">Mật khẩu</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-lock icon-truoc"></i>
                                <input type="password" id="matKhau" name="matKhau" placeholder="Nhập mật khẩu">
                                <i class="fas fa-eye icon-sau hien-mat-khau" data-target="matKhau"></i>
                            </div>
                            <div class="thong-bao-loi" id="loiMatKhau"></div>
                        </div>

                        
                        <button type="submit" class="nut-gui">
                            <span class="chu-nut">Đăng nhập</span>
                            <div class="loading" id="loadingDangNhap"></div>
                        </button>
                        <div class="thong-bao-thanh-cong" id="thongBaoDangNhap"></div>
                    </form>
                </div>

                <div class="khung-form" data-tab-content="dang-ky">
                    <form id="formDangKy">
                        <div class="nhom-input">
                            <label for="hoTenDangKy">Họ tên</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-user-alt icon-truoc"></i>
                                <input type="text" id="hoTenDangKy" name="hoTenDangKy" placeholder="Nguyễn Văn A">
                            </div>
                            <div class="thong-bao-loi" id="loiHoTenDangKy"></div>
                        </div>
                        
                        <div class="nhom-input">
                            <label for="tenDangKy">Tên đăng nhập</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-user icon-truoc"></i>
                                <input type="text" id="tenDangKy" name="tenDangKy" placeholder="Ví dụ: anvana">
                            </div>
                            <div class="thong-bao-loi" id="loiTenDangKy"></div>
                        </div>
                        
                        <div class="nhom-input">
                            <label for="emailDangKy">Email</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-envelope icon-truoc"></i>
                                <input type="email" 
    id="emailDangKy" 
    name="emailDangKy" 
    placeholder="an@example.com"
    oninput="this.setCustomValidity('')" 
>
                            </div>
                            <div class="thong-bao-loi" id="loiEmailDangKy"></div>
                        </div>

                        <div class="nhom-input">
                            <label for="matKhauDangKy">Mật khẩu</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-lock icon-truoc"></i>
                                <input type="password" id="matKhauDangKy" name="matKhauDangKy" placeholder="Ít nhất 6 ký tự">
                                <i class="fas fa-eye icon-sau hien-mat-khau" data-target="matKhauDangKy"></i>
                            </div>
                            <div class="thong-bao-loi" id="loiMatKhauDangKy"></div>
                        </div>

                        <div class="nhom-input">
                            <label for="xacNhanMatKhau">Xác nhận mật khẩu</label>
                            <div class="o-nhap-lieu">
                                <i class="fas fa-lock icon-truoc"></i>
                                <input type="password" id="xacNhanMatKhau" name="xacNhanMatKhau" placeholder="Nhập lại mật khẩu">
                                <i class="fas fa-eye icon-sau hien-mat-khau" data-target="xacNhanMatKhau"></i>
                            </div>
                            <div class="thong-bao-loi" id="loiXacNhanMatKhau"></div>
                        </div>

                        <button type="submit" class="nut-gui">
                            <span class="chu-nut">Đăng ký</span>
                            <div class="loading" id="loadingDangKy"></div>
                        </button>
                        <div class="thong-bao-thanh-cong" id="thongBaoDangKy"></div>
                    </form>
                </div>
            </div>

        </div>
    </div>
`;

const userManager = new UserManager();

function hienLoi(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

function anLoi(id) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = "";
    el.style.display = "none";
  }
}

function hienLoading(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

function anLoading(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function chuyenTab(tabName) {
  const nutTabElements = document.querySelectorAll(".nut-tab");

  nutTabElements.forEach((nut) => {
    if (nut.getAttribute("data-tab") === tabName) {
      nut.classList.add("active");
    } else {
      nut.classList.remove("active");
    }
  });

  document.querySelectorAll(".khung-form").forEach((khung) => {
    if (khung.getAttribute("data-tab-content") === tabName) {
      khung.classList.add("active");
    } else {
      khung.classList.remove("active");
    }
  });

  document.querySelectorAll(".thong-bao-loi").forEach((el) => anLoi(el.id));
  document
    .querySelectorAll(".thong-bao-thanh-cong")
    .forEach((el) => (el.style.display = "none"));
}

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function xuLyDangNhap(e) {
  e.preventDefault();

  anLoi("loiTenDangNhap");
  anLoi("loiMatKhau");
  document.getElementById("thongBaoDangNhap").style.display = "none";

  const tenDangNhap = document.getElementById("tenDangNhap").value.trim();
  const matKhau = document.getElementById("matKhau").value;

  let hopLe = true;

  if (!tenDangNhap) {
    hienLoi("loiTenDangNhap", "Vui lòng nhập tên đăng nhập hoặc email");
    hopLe = false;
  }

  if (!matKhau) {
    hienLoi("loiMatKhau", "Vui lòng nhập mật khẩu");
    hopLe = false;
  }

  if (hopLe) {
    hienLoading("loadingDangNhap");

    setTimeout(() => {
      const user = userManager.timTaiKhoan(tenDangNhap, matKhau);
      anLoading("loadingDangNhap");

      if (user) {
        userManager.luuUserHienTai(user);

        const thongBao = document.getElementById("thongBaoDangNhap");
        thongBao.textContent = `Đăng nhập thành công! Chào mừng ${user.hoTen}`;
        thongBao.style.display = "block";

        capNhatUIHeader();

        setTimeout(() => {
          window.closeLoginModal();
        }, 1500);
      } else {
        hienLoi(
          "loiMatKhau",
          "Tên đăng nhập, email hoặc mật khẩu không chính xác."
        );
      }
    }, 800);
  }
}

function xuLyDangKy(e) {
  e.preventDefault();

  document.querySelectorAll(".thong-bao-loi").forEach((el) => anLoi(el.id));
  document.getElementById("thongBaoDangKy").style.display = "none";

  const hoTen = document.getElementById("hoTenDangKy").value.trim();
  const tenDangKy = document.getElementById("tenDangKy").value.trim();
  const email = document.getElementById("emailDangKy").value.trim();
  const matKhau = document.getElementById("matKhauDangKy").value;
  const xacNhan = document.getElementById("xacNhanMatKhau").value;

  let hopLe = true;

  if (!hoTen) {
    hienLoi("loiHoTenDangKy", "Vui lòng nhập họ tên");
    hopLe = false;
  }

  if (!tenDangKy || tenDangKy.length < 3) {
    hienLoi("loiTenDangKy", "Tên đăng nhập phải có ít nhất 3 ký tự");
    hopLe = false;
  }

  if (!email || !regexEmail.test(email)) {
    hienLoi("loiEmailDangKy", "Vui lòng nhập email hợp lệ");
    hopLe = false;
  }

  if (!matKhau || matKhau.length < 6) {
    hienLoi("loiMatKhauDangKy", "Mật khẩu phải có ít nhất 6 ký tự");
    hopLe = false;
  }

  if (matKhau && matKhau !== xacNhan) {
    hienLoi("loiXacNhanMatKhau", "Mật khẩu xác nhận không khớp");
    hopLe = false;
  }

  if (hopLe) {
    if (userManager.tonTaiTenDangNhap(tenDangKy)) {
      hienLoi("loiTenDangKy", "Tên đăng nhập đã được sử dụng");
      hopLe = false;
    }

    if (userManager.tonTaiEmail(email)) {
      hienLoi("loiEmailDangKy", "Email đã được sử dụng");
      hopLe = false;
    }
  }

  if (hopLe) {
    hienLoading("loadingDangKy");

    setTimeout(() => {
      const newUser = userManager.themTaiKhoan(
        hoTen,
        tenDangKy,
        email,
        matKhau
      );

      anLoading("loadingDangKy");

      const thongBao = document.getElementById("thongBaoDangKy");
      thongBao.textContent = `Đăng ký thành công! Chào mừng ${newUser.hoTen}. Đang chuyển sang Đăng nhập...`;
      thongBao.style.display = "block";

      setTimeout(() => {
        chuyenTab("dang-nhap");

        document.getElementById("tenDangNhap").value = tenDangKy;
        document.getElementById(
          "thongBaoDangNhap"
        ).textContent = `Đăng ký thành công! Vui lòng Đăng nhập.`;
        document.getElementById("thongBaoDangNhap").style.display = "block";
        document.getElementById("thongBaoDangKy").style.display = "none";
      }, 1500);
    }, 800);
  }
}

function capNhatUIHeader() {
  const currentUser = userManager.layUserHienTai();
  const userLink = document.getElementById("user-login-link");

  if (userLink) {
    userLink.removeEventListener("click", handleUserClick);

    if (currentUser) {
      userLink.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span style="margin-left: 5px; font-size: 14px;">${currentUser.hoTen}</span>
            `;

      userLink.addEventListener("click", handleUserClick);
    } else {
      userLink.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Đăng nhập
            `;

      userLink.addEventListener("click", handleUserClick);
    }
  }
}

window.capNhatUIHeader = capNhatUIHeader;

function handleUserClick(e) {
  e.preventDefault();
  const currentUser = userManager.layUserHienTai();

  if (currentUser) {
    window.location.href = "profile.html";
  } else {
    window.openLoginModal();
  }
}

window.closeLoginModal = function () {
  const loginModal = document.getElementById("login-register-modal");
  if (loginModal) {
    loginModal.style.display = "none";

    const formDangNhap = document.getElementById("formDangNhap");
    const formDangKy = document.getElementById("formDangKy");
    if (formDangNhap) formDangNhap.reset();
    if (formDangKy) formDangKy.reset();

    document.querySelectorAll(".thong-bao-loi").forEach((el) => anLoi(el.id));
    document
      .querySelectorAll(".thong-bao-thanh-cong")
      .forEach((el) => (el.style.display = "none"));
  }
};

window.openLoginModal = function () {
  const loginModal = document.getElementById("login-register-modal");
  if (loginModal) {
    loginModal.style.display = "flex";
    chuyenTab("dang-nhap");
  }
};

function khoiTaoSuKienModal() {
  document.body.insertAdjacentHTML("beforeend", LOGIN_MODAL_HTML);

  const loginModal = document.getElementById("login-register-modal");
  const formDangNhap = document.getElementById("formDangNhap");
  const formDangKy = document.getElementById("formDangKy");
  const closeButtons = document.querySelectorAll(".modal-close");
  const nutTabElements = document.querySelectorAll(".nut-tab");

  if (!loginModal) {
    console.error("Lỗi: Không tìm thấy Modal");
    return;
  }

  nutTabElements.forEach((nut) => {
    nut.addEventListener("click", function () {
      chuyenTab(this.getAttribute("data-tab"));
    });
  });

  document.querySelectorAll(".hien-mat-khau").forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = document.getElementById(this.getAttribute("data-target"));
      if (input.type === "password") {
        input.type = "text";
        this.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        this.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });

  if (formDangNhap) formDangNhap.addEventListener("submit", xuLyDangNhap);
  if (formDangKy) formDangKy.addEventListener("submit", xuLyDangKy);

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.closeLoginModal();
    });
  });

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      window.closeLoginModal();
    }
  });

  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", function () {
      const inputId = this.id;

      let errorId = `loi${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`;

      const errorElement = document.getElementById(errorId);
      if (errorElement && errorElement.style.display !== "none") {
        anLoi(errorId);
      }
    });
  });

  const userLink = document.getElementById("user-login-link");
  if (userLink) {
    userLink.addEventListener("click", handleUserClick);
  }

  capNhatUIHeader();

  console.log("🔑 Tài khoản demo: admin / Admin123");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", khoiTaoSuKienModal);
} else {
  khoiTaoSuKienModal();
}
