import { userManager, DOM, updateGeneralStats } from "./admin.js";

export function renderUserList() {
  if (!DOM.userTableBody) return;
  DOM.userTableBody.innerHTML = "";
  const users = userManager.getAllUsers();

  users.forEach((user) => {
    if (user.tenDangNhap === "admin") return;

    const totalOrders = user.orders ? user.orders.length : 0;
    const isLocked = user.isLocked;
    const statusText = isLocked ? "ĐÃ KHÓA" : "Hoạt động";
    const statusClass = isLocked ? "status-locked" : "status-active";

    const rowHTML = `
            <td>${user.hoTen}</td>
            <td>${user.tenDangNhap}</td>
            <td>${user.email}</td>
            <td>${totalOrders}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-reset" data-username="${
                  user.tenDangNhap
                }">Reset MK</button>
                <button class="${
                  isLocked ? "btn-unlock" : "btn-lock"
                }" data-username="${user.tenDangNhap}">
                    ${isLocked ? "Mở khóa" : "Khóa TK"}
                </button>
            </td>
        `;
    const row = document.createElement("tr");
    row.innerHTML = rowHTML;
    DOM.userTableBody.appendChild(row);
  });
}

export function setupUserAdminEventListeners() {
  DOM.userTableBody.querySelectorAll(".btn-reset").forEach((btn) => {
    btn.removeEventListener("click", handleResetPassword);
    btn.addEventListener("click", handleResetPassword);
  });

  DOM.userTableBody.querySelectorAll(".btn-lock").forEach((btn) => {
    btn.removeEventListener("click", handleLockUser);
    btn.addEventListener("click", handleLockUser);
  });

  DOM.userTableBody.querySelectorAll(".btn-unlock").forEach((btn) => {
    btn.removeEventListener("click", handleUnlockUser);
    btn.addEventListener("click", handleUnlockUser);
  });
}

function handleResetPassword(e) {
  e.preventDefault();
  const username = e.currentTarget.dataset.username;
  if (!confirm(`Bạn có muốn reset mật khẩu tài khoản ${username} về 123456?`))
    return;
  const success = userManager.resetPassword(username);
  if (success) {
    alert(`Mật khẩu của tài khoản ${username} đã được reset thành 123456`);
    renderUserList();
  } else {
    alert("Lỗi: Không tìm thấy tài khoản để reset.");
  }
}

function handleLockUser(e) {
  e.preventDefault();
  const username = e.currentTarget.dataset.username;
  updateUserStatus(username, true);
}

function handleUnlockUser(e) {
  e.preventDefault();
  const username = e.currentTarget.dataset.username;
  updateUserStatus(username, false);
}

function updateUserStatus(username, isLocked) {
  const action = isLocked ? "khóa" : "mở khóa";
  if (!confirm(`Bạn có muốn ${action} tài khoản ${username}?`)) return;

  const success = userManager.updateUserStatus(username, isLocked);

  if (success) {
    alert(
      `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } tài khoản ${username} thành công!`
    );
    renderUserList();
    updateGeneralStats();
  } else {
    alert("Lỗi: Không thể thực hiện hành động này.");
  }
}
