import { importManager } from "./ImportSlip.js";
import { productManager } from "./ProductManager.js";

let DOM = {};

function initDOM() {
  DOM = {
    addImportSlipForm: document.getElementById("addImportSlipForm"),
    importSlipItemsContainer: document.getElementById(
      "importSlipItemsContainer"
    ),
    addImportSlipItemBtn: document.getElementById("addImportSlipItemBtn"),
    importSupplier: document.getElementById("importSlipSupplier"),
    importNote: document.getElementById("importSlipNote"),

    importSlipsTableBody: document.getElementById("importSlipsTableBody"),

    draftPreviewList: document.getElementById("draftPreviewList"),
    draftTotalQty: document.getElementById("draftTotalQty"),
    draftTotalValue: document.getElementById("draftTotalValue"),
    previewClearBtn: document.getElementById("previewClearBtn"),

    filterStatus: document.getElementById("importFilterStatus"),
    filterProductName: document.getElementById("importFilterName"),
    filterFromDate: document.getElementById("importFilterFrom"),
    filterToDate: document.getElementById("importFilterTo"),
    filterApplyBtn: document.getElementById("importFilterApply"),
    filterResetBtn: document.getElementById("importFilterReset"),

    editModal: document.getElementById("editImportSlipModal"),
    editForm: document.getElementById("editImportSlipForm"),
    editItemsContainer: document.getElementById("editItemsContainer"),
    editSlipNumber: document.getElementById("editSlipNumber"),
    editProductName: document.getElementById("editProductName"),
    editQuantity: document.getElementById("editImportSlipQuantity"),
    editPrice: document.getElementById("editImportSlipPrice"),
    editSize: document.getElementById("editImportSlipSize"),
    editSupplier: document.getElementById("editImportSlipSupplier"),
    editNote: document.getElementById("editImportSlipNote"),
    closeEditModalBtn: document.querySelector(
      "#editImportSlipModal .close-modal-btn"
    ),
    cancelEditBtn: document.querySelector(
      "#editImportSlipModal .cancel-modal-btn"
    ),
    editModalCloseButtons: document.querySelectorAll(
      "#editImportSlipModal .close-modal-btn, #editImportSlipModal .cancel-modal-btn"
    ),
  };
}

export function initImportAdmin() {
  if (window.importAdminInitialized) return;

  initDOM();
  setupEventListeners();
  addImportItemRow();
  renderImportSlipsList();

  window.importAdminInitialized = true;
}

function setupEventListeners() {
  if (DOM.addImportSlipForm) {
    DOM.addImportSlipForm.addEventListener("submit", handleAddImportSlip);
  }

  if (DOM.addImportSlipItemBtn) {
    DOM.addImportSlipItemBtn.addEventListener("click", () =>
      addImportItemRow()
    );
  }

  if (DOM.previewClearBtn) {
    DOM.previewClearBtn.addEventListener("click", () => {
      DOM.importSlipItemsContainer.innerHTML = "";
      addImportItemRow();
      updateDraftPreview();
    });
  }

  if (DOM.filterApplyBtn) {
    DOM.filterApplyBtn.addEventListener("click", handleFilter);
  }

  if (DOM.filterResetBtn) {
    DOM.filterResetBtn.addEventListener("click", handleResetFilter);
  }

  if (DOM.editModalCloseButtons) {
    DOM.editModalCloseButtons.forEach((btn) => {
      btn.addEventListener("click", closeEditModal);
    });
  }

  if (DOM.editForm) {
    DOM.editForm.addEventListener("submit", handleUpdateImportSlip);
  }

  if (DOM.editModal) {
    DOM.editModal.addEventListener("click", (e) => {
      if (e.target === DOM.editModal) {
        closeEditModal();
      }
    });
  }
}

function updateDraftPreview() {
  if (!DOM.draftPreviewList) return;

  const rows = Array.from(
    DOM.importSlipItemsContainer.querySelectorAll(".import-item-row")
  );
  if (rows.length === 0) {
    DOM.draftPreviewList.innerHTML =
      '<div class="muted">Chưa có sản phẩm</div>';
    DOM.draftTotalQty.textContent = "0";
    DOM.draftTotalValue.textContent = "0₫";
    return;
  }

  let totalQty = 0;
  let totalVal = 0;
  DOM.draftPreviewList.innerHTML = "";

  rows.forEach((r) => {
    const sel = r.querySelector(".import-item-select");
    const qty = Number(r.querySelector(".import-item-qty").value) || 0;
    const price = Number(r.querySelector(".import-item-price").value) || 0;
    const size = r.querySelector(".import-item-size").value || "";

    const label = sel.options[sel.selectedIndex]
      ? sel.options[sel.selectedIndex].textContent
      : "-- Chưa chọn --";
    const displayName = label.split(" - ")[0];

    totalQty += qty;
    totalVal += qty * price;

    const itemEl = document.createElement("div");
    itemEl.className = "preview-item";
    itemEl.innerHTML = `
            <div class="ellipsis">${displayName} ${
      size ? `(Size ${size})` : ""
    }</div>
            <div>${qty} x ${
      price ? price.toLocaleString("vi-VN") + "₫" : "-"
    } </div>
        `;
    DOM.draftPreviewList.appendChild(itemEl);
  });

  DOM.draftTotalQty.textContent = totalQty;
  DOM.draftTotalValue.textContent = `${totalVal.toLocaleString("vi-VN")}₫`;
}

function loadProductsToSelect() {
  return productManager.getVisibleProducts();
}

function createImportItemRow(products) {
  const row = document.createElement("div");
  row.className = "import-item-row";

  const select = document.createElement("select");
  select.className = "import-item-select";
  select.required = true;
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "-- Chọn sản phẩm --";
  select.appendChild(defaultOpt);

  products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} - Mã: ${p.id}`;
    opt.dataset.hasVariants =
      p.variants && p.variants.length > 0 ? "true" : "false";
    select.appendChild(opt);
  });

  const qty = document.createElement("input");
  qty.type = "number";
  qty.className = "import-item-qty";
  qty.min = 1;
  qty.placeholder = "SL";
  qty.required = true;
  qty.style.width = "80px";

  const price = document.createElement("input");
  price.type = "number";
  price.className = "import-item-price";
  price.min = 0;
  price.step = 1000;
  price.placeholder = "Giá";
  price.required = true;
  price.style.width = "120px";

  const size = document.createElement("input");
  size.type = "number";
  size.className = "import-item-size";
  size.placeholder = "Size";
  size.required = true;
  size.style.width = "80px";
  size.style.display = "inline-block";

  select.addEventListener("change", () => {
    updateDraftPreview();
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-delete";
  removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Xóa';
  removeBtn.addEventListener("click", () => {
    row.remove();
    updateDraftPreview();
  });

  row.appendChild(select);
  row.appendChild(qty);
  row.appendChild(price);
  row.appendChild(size);
  row.appendChild(removeBtn);

  [qty, price, size].forEach((inp) =>
    inp.addEventListener("input", updateDraftPreview)
  );

  return row;
}

function addImportItemRow() {
  const products = loadProductsToSelect();
  const row = createImportItemRow(products);
  DOM.importSlipItemsContainer.appendChild(row);
  updateDraftPreview();
}

function handleAddImportSlip(e) {
  e.preventDefault();

  const rows = Array.from(
    DOM.importSlipItemsContainer.querySelectorAll(".import-item-row")
  );
  const supplier = DOM.importSupplier.value.trim();
  const note = DOM.importNote.value.trim();

  if (rows.length === 0) {
    alert("Vui lòng thêm ít nhất 1 sản phẩm cho phiếu nhập!");
    return;
  }

  const items = [];
  for (const r of rows) {
    const select = r.querySelector(".import-item-select");
    const qtyEl = r.querySelector(".import-item-qty");
    const priceEl = r.querySelector(".import-item-price");
    const sizeEl = r.querySelector(".import-item-size");

    const productId = Number(select.value);
    const quantity = Number(qtyEl.value);
    const importPrice = Number(priceEl.value);
    const size = sizeEl && sizeEl.value ? Number(sizeEl.value) : null;

    if (!productId || quantity <= 0 || importPrice <= 0) {
      alert(
        "Vui lòng điền đầy đủ thông tin sản phẩm (sản phẩm, số lượng, giá nhập) hợp lệ!"
      );
      return;
    }

    const product = productManager.getProductById(productId);
    if (!product) {
      alert("Không tìm thấy sản phẩm (một trong các dòng)!");
      return;
    }

    if (!size || size <= 0) {
      alert(
        `Sản phẩm "${product.name}" yêu cầu nhập Size hợp lệ (lớn hơn 0)!`
      );
      return;
    }

    const variantSize = size;

    items.push({
      productId,
      productName: product.name,
      variantSize,
      quantity,
      importPrice,
      totalValue: quantity * importPrice,
    });
  }

  const newSlip = importManager.addSlip({ items, supplier, note });
  if (newSlip) {
    alert(
      `✅ Đã tạo phiếu nhập ${newSlip.slipNumber} thành công!\nTrạng thái: Nháp - Chưa hoàn thành`
    );
    DOM.addImportSlipForm.reset();
    DOM.importSlipItemsContainer.innerHTML = "";
    addImportItemRow();
    renderImportSlipsList();
  } else {
    alert("❌ Lỗi khi tạo phiếu nhập!");
  }
}

export function renderImportSlipsList(slips = null) {
  if (!DOM.importSlipsTableBody) return;

  const slipsList = slips || importManager.getAllSlips();
  DOM.importSlipsTableBody.innerHTML = "";

  if (slipsList.length === 0) {
    DOM.importSlipsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="center" style="padding: 30px;">
                    <i class="fa-solid fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
                    <p style="color: #888;">Chưa có phiếu nhập nào</p>
                </td>
            </tr>
        `;
    return;
  }

  slipsList.forEach((slip) => {
    const items =
      Array.isArray(slip.items) && slip.items.length > 0
        ? slip.items
        : [
            {
              productId: slip.productId,
              productName: slip.productName || "-",
              variantSize: slip.variantSize || null,
              quantity: slip.quantity || 0,
              importPrice: slip.importPrice || 0,
              totalValue:
                slip.totalValue || slip.quantity * slip.importPrice || 0,
            },
          ];

    const statusBadge =
      slip.status === "COMPLETED"
        ? '<span class="status-badge status-completed">Đã hoàn thành</span>'
        : '<span class="status-badge status-draft">Nháp</span>';

    const dateDisplay = new Date(slip.createdDate).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    items.forEach((it, idx) => {
      const row = document.createElement("tr");

      const slipCell =
        idx === 0 ? `<td class="nowrap">${slip.slipNumber}</td>` : "<td></td>";
      const dateCell =
        idx === 0 ? `<td class="nowrap">${dateDisplay}</td>` : "<td></td>";
      const statusCell =
        idx === 0 ? `<td class="center">${statusBadge}</td>` : "<td></td>";

      const actionsCell =
        idx === 0
          ? `
                <td class="action-buttons">
                ${
                  slip.status === "DRAFT"
                    ? `
                    <button class="btn btn-primary btn-edit-slip" data-id="${slip.id}" title="Sửa phiếu">
                        <i class="fa-solid fa-pen-to-square"></i> Sửa
                    </button>
                    <button class="btn btn-success btn-complete-slip" data-id="${slip.id}" title="Hoàn thành & Cập nhật kho">
                        <i class="fa-solid fa-check"></i> Hoàn thành
                    </button>
                    <button class="btn btn-delete btn-delete-slip" data-id="${slip.id}" title="Xóa phiếu">
                        <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                `
                    : `
                    <button class="btn btn-info btn-view-slip" data-id="${slip.id}" title="Xem chi tiết">
                        <i class="fa-solid fa-eye"></i> Xem
                    </button>
                `
                }
                </td>
            `
          : "<td></td>";

      const sizeDisplay = it.variantSize
        ? `Size ${it.variantSize}`
        : '<span class="text-muted">Không có</span>';
      const priceDisplay =
        it.importPrice || it.importPrice === 0
          ? `${Number(it.importPrice).toLocaleString("vi-VN")}₫`
          : '<span class="text-muted">-</span>';
      const totalDisplay =
        it.totalValue || it.totalValue === 0
          ? `${Number(it.totalValue).toLocaleString("vi-VN")}₫`
          : '<span class="text-muted">-</span>';

      row.innerHTML = `
                ${slipCell}
                <td>${it.productName}</td>
                <td class="center nowrap">${sizeDisplay}</td>
                <td class="right">${it.quantity}</td>
                <td class="right">${priceDisplay}</td>
                <td class="right"><strong>${totalDisplay}</strong></td>
                ${dateCell}
                ${statusCell}
                ${actionsCell}
            `;

      DOM.importSlipsTableBody.appendChild(row);
    });
  });

  attachSlipActionListeners();
}

function attachSlipActionListeners() {
  const editButtons = document.querySelectorAll(".btn-edit-slip");
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      handleEditSlip(btn.dataset.id);
    });
  });

  document.querySelectorAll(".btn-complete-slip").forEach((btn) => {
    btn.addEventListener("click", () => handleCompleteSlip(btn.dataset.id));
  });

  document.querySelectorAll(".btn-delete-slip").forEach((btn) => {
    btn.addEventListener("click", () => handleDeleteSlip(btn.dataset.id));
  });

  document.querySelectorAll(".btn-view-slip").forEach((btn) => {
    btn.addEventListener("click", () => handleViewSlip(btn.dataset.id));
  });
}

function handleEditSlip(slipId) {
  const slip = importManager.getSlipById(slipId);
  if (!slip || !slip.canEdit()) {
    alert("Không thể sửa phiếu này!");
    return;
  }

  closeEditModal(false);

  if (DOM.editSlipNumber) DOM.editSlipNumber.textContent = slip.slipNumber;
  if (DOM.editSupplier) DOM.editSupplier.value = slip.supplier || "";
  if (DOM.editNote) DOM.editNote.value = slip.note || "";

  const items =
    Array.isArray(slip.items) && slip.items.length > 0
      ? slip.items
      : [
          {
            productId: slip.productId,
            productName: slip.productName || "-",
            variantSize: slip.variantSize || null,
            quantity: slip.quantity || 0,
            importPrice: slip.importPrice || 0,
          },
        ];

  const singleGroup = document.getElementById("editSingleItemGroup");

  if (items.length > 1 || (items.length === 1 && Array.isArray(slip.items))) {
    if (singleGroup) {
      singleGroup.style.display = "none";
      const inputs = singleGroup.querySelectorAll("input, textarea");
      inputs.forEach(input => input.disabled = true);
    }
    if (DOM.editItemsContainer) DOM.editItemsContainer.innerHTML = "";

    const tableHTML = `
      <div class="form-group">
        <label>Danh sách Sản phẩm</label>
        <div style="overflow-x: auto;">
          <table class="userTable" style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 12px; text-align: left;">Sản phẩm</th>
                <th style="padding: 12px; text-align: center; width: 100px;">SL</th>
                <th style="padding: 12px; text-align: center; width: 140px;">Giá Nhập (₫)</th>
                <th style="padding: 12px; text-align: center; width: 100px;">Size</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (it, idx) => `
                <tr style="border-bottom: 1px solid #e9ecef;" data-product-id="${it.productId}" data-index="${idx}">
                  <td style="padding: 12px;">
                    <strong>${it.productName}</strong>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <input 
                      type="number" 
                      class="edit-item-qty" 
                      name="quantity-multi-${idx}" 
                      value="${it.quantity}" 
                      min="1" 
                      placeholder="SL" 
                      title="Số lượng nhập"
                      style="width: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: center;"
                      required
                    />
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <input 
                      type="number" 
                      class="edit-item-price" 
                      name="price-multi-${idx}" 
                      value="${it.importPrice}" 
                      min="0" 
                      step="1000" 
                      placeholder="Giá Nhập" 
                      title="Giá nhập (₫)"
                      style="width: 130px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: right;"
                      required
                    />
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <input 
                      type="number" 
                      class="edit-item-size" 
                      name="size-multi-${idx}" 
                      value="${it.variantSize ?? ""}" 
                      placeholder="Size" 
                      title="Size sản phẩm"
                      style="width: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: center;"
                      required
                    />
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (DOM.editItemsContainer) {
      DOM.editItemsContainer.innerHTML = tableHTML;
    }

    if (DOM.editForm) {
      DOM.editForm.dataset.isSingleItem = "false";
    }
  } else {
    if (singleGroup) singleGroup.style.display = "";

    const it = items[0] || null;
    if (DOM.editProductName)
      DOM.editProductName.textContent = it
        ? it.productName
        : slip.productName || "-";
    if (DOM.editQuantity)
      DOM.editQuantity.value = it ? it.quantity : slip.quantity || 0;
    if (DOM.editPrice)
      DOM.editPrice.value = it ? it.importPrice : slip.importPrice || 0;
    if (DOM.editSize)
      DOM.editSize.value = it ? it.variantSize || "" : slip.variantSize || "";

    if (DOM.editForm) {
      DOM.editForm.dataset.editingProductId = it
        ? it.productId
        : slip.productId;
      DOM.editForm.dataset.isSingleItem = "true";
    }
  }

  if (DOM.editForm) {
    DOM.editForm.dataset.editingId = slipId;
  }

  if (DOM.editModal) {
    DOM.editModal.style.display = "flex";
  } else {
    console.error("editModal not found in DOM");
  }
}

function handleUpdateImportSlip(e) {
  e.preventDefault();

  const slipId = Number(DOM.editForm.dataset.editingId);
  if (!slipId) {
    alert("❌ Lỗi: Không tìm thấy ID phiếu nhập đang chỉnh sửa.");
    return;
  }

  const isSingleItem = DOM.editForm.dataset.isSingleItem === "true";

  let updatedData = {};

  try {
    if (!isSingleItem) {
      const tableRows = DOM.editItemsContainer 
        ? DOM.editItemsContainer.querySelectorAll("tbody tr[data-product-id]")
        : [];

      if (tableRows.length === 0) {
        alert("❌ Không tìm thấy dữ liệu sản phẩm để cập nhật!");
        return;
      }

      const items = [];
      
      tableRows.forEach((row) => {
        const productId = Number(row.dataset.productId) || null;
        
        const productNameEl = row.querySelector("td:first-child strong");
        const productName = productNameEl ? productNameEl.textContent.trim() : "";

        const qtyInput = row.querySelector(".edit-item-qty");
        const priceInput = row.querySelector(".edit-item-price");
        const sizeInput = row.querySelector(".edit-item-size");

        const qty = Number(qtyInput?.value) || 0;
        const price = Number(priceInput?.value) || 0;
        const sizeVal = sizeInput?.value || "";
        const variantSize = sizeVal ? Number(sizeVal) : null;

        if (qty <= 0) {
          throw new Error(
            `Số lượng nhập cho sản phẩm "${productName}" phải lớn hơn 0!`
          );
        }
        if (price < 0) {
          throw new Error(
            `Giá nhập cho sản phẩm "${productName}" không được âm!`
          );
        }
        if (!variantSize || variantSize <= 0) {
          throw new Error(
            `Size nhập cho sản phẩm "${productName}" phải là một số hợp lệ (lớn hơn 0)!`
          );
        }

        items.push({
          productId,
          productName,
          variantSize,
          quantity: qty,
          importPrice: price,
          totalValue: qty * price,
        });
      });

      updatedData = {
        items,
        supplier: DOM.editSupplier.value.trim(),
        note: DOM.editNote.value.trim(),
      };
    } else {
      const qty = Number(DOM.editQuantity.value);
      const price = Number(DOM.editPrice.value);
      const newSize = DOM.editSize.value ? Number(DOM.editSize.value) : null;

      if (qty <= 0) {
        throw new Error(`Số lượng nhập phải lớn hơn 0!`);
      }
      if (price < 0) {
        throw new Error(`Giá nhập không được âm!`);
      }
      if (!newSize || newSize <= 0) {
        throw new Error(`Size nhập phải là một số hợp lệ (lớn hơn 0)!`);
      }

      const productId = Number(DOM.editForm.dataset.editingProductId);
      const productName = DOM.editProductName.textContent.trim();

      if (!productId) {
        throw new Error(
          "Không tìm thấy ID sản phẩm gốc cho phiếu nhập này. Cập nhật thất bại."
        );
      }

      updatedData = {
        productId,
        productName,
        quantity: qty,
        importPrice: price,
        variantSize: newSize,
        supplier: DOM.editSupplier.value.trim(),
        note: DOM.editNote.value.trim(),
        totalValue: qty * price,
      };
    }

    if (importManager.updateSlip(slipId, updatedData)) {
      alert("✅ Cập nhật phiếu nhập thành công!");
      closeEditModal();
      renderImportSlipsList();
    } else {
      alert("❌ Lỗi khi cập nhật phiếu nhập!");
    }
  } catch (error) {
    alert(`❌ Lỗi nhập liệu:\n${error.message}`);
  }
}

function closeEditModal(resetFormAttributes = true) {
  if (DOM.editModal) DOM.editModal.style.display = "none";

  if (DOM.editForm && resetFormAttributes) {
    DOM.editForm.reset();
    delete DOM.editForm.dataset.editingId;
    delete DOM.editForm.dataset.editingProductId;
    delete DOM.editForm.dataset.isSingleItem;
  }

  if (DOM.editItemsContainer) DOM.editItemsContainer.innerHTML = "";
  const singleGroup = document.getElementById("editSingleItemGroup");
  if (singleGroup) singleGroup.style.display = "";

  if (DOM.editProductName) DOM.editProductName.textContent = "";
  if (DOM.editQuantity) DOM.editQuantity.value = "";
  if (DOM.editPrice) DOM.editPrice.value = "";
  if (DOM.editSize) DOM.editSize.value = "";
  if (DOM.editSupplier) DOM.editSupplier.value = "";
  if (DOM.editNote) DOM.editNote.value = "";
}

function handleCompleteSlip(slipId) {
  const slip = importManager.getSlipById(slipId);
  if (!slip) {
    alert("Không tìm thấy phiếu nhập!");
    return;
  }

  let confirmMsg = `Xác nhận hoàn thành phiếu nhập:\n\nSố phiếu: ${slip.slipNumber}\n`;

  const slipItems =
    Array.isArray(slip.items) && slip.items.length > 0 ? slip.items : [slip];
  let totalValue = 0;

  confirmMsg += "Sản phẩm:\n";
  slipItems.forEach((it) => {
    confirmMsg += `- ${it.productName}${
      it.variantSize ? ` (Size ${it.variantSize})` : ""
    } x ${it.quantity} @ ${it.importPrice.toLocaleString("vi-VN")}₫\n`;
    totalValue += it.totalValue || it.quantity * it.importPrice;
  });

  confirmMsg += `\nTổng giá trị: ${totalValue.toLocaleString("vi-VN")}₫\n\n`;
  confirmMsg += "⚠️ Sau khi hoàn thành, phiếu không thể sửa đổi!";

  if (!confirm(confirmMsg)) return;

  const result = importManager.completeSlip(slipId);
  if (!result.success) {
    alert(`❌ ${result.message}`);
    return;
  }

  let allSuccess = true;

  for (const it of slipItems) {
    const note = `Phiếu nhập ${slip.slipNumber}${
      slip.supplier ? ` - NCC: ${slip.supplier}` : ""
    }`;
    const ok = productManager.processProductImport(
      it.productId,
      it.quantity,
      it.importPrice,
      it.variantSize,
      note
    );
    if (!ok) allSuccess = false;
  }

  if (allSuccess) {
    alert(
      `✅ Hoàn thành phiếu nhập ${slip.slipNumber} thành công!\n✅ Đã cập nhật tồn kho.`
    );
    renderImportSlipsList();

    const event = new CustomEvent("inventoryUpdated", {
      detail: { slipId, slipNumber: slip.slipNumber, items: slip.items },
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);
    document.dispatchEvent(event);
  } else {
    alert(
      "⚠️ Phiếu đã hoàn thành nhưng có lỗi khi cập nhật tồn kho cho một số sản phẩm!"
    );
  }
}

function handleDeleteSlip(slipId) {
  const slip = importManager.getSlipById(slipId);
  if (!slip) {
    alert("Không tìm thấy phiếu nhập!");
    return;
  }

  if (
    !confirm(
      `Xác nhận xóa phiếu nhập ${slip.slipNumber}?\n\nThao tác này không thể hoàn tác!`
    )
  ) {
    return;
  }

  if (importManager.deleteSlip(slipId)) {
    alert("✅ Đã xóa phiếu nhập!");
    renderImportSlipsList();
  } else {
    alert("❌ Không thể xóa phiếu nhập này!");
  }
}

function handleViewSlip(slipId) {
  const slip = importManager.getSlipById(slipId);
  if (!slip) {
    alert("Không tìm thấy phiếu nhập!");
    return;
  }

  let details = `\n╔═══════════════════════════════════════╗\n       CHI TIẾT PHIẾU NHẬP\n╚═══════════════════════════════════════╝\n\nSố phiếu: ${
    slip.slipNumber
  }\nTrạng thái: ${
    slip.status === "COMPLETED" ? "✅ Đã hoàn thành" : "📝 Nháp"
  }\n\n`;

  details +=
    "───────────────────────────────────────\nTHÔNG TIN SẢN PHẨM\n───────────────────────────────────────\n";

  const slipItems =
    Array.isArray(slip.items) && slip.items.length > 0 ? slip.items : [slip];
  let totalValue = 0;

  slipItems.forEach((it) => {
    details += `- ${it.productName}${
      it.variantSize ? ` (Size ${it.variantSize})` : ""
    } x ${it.quantity} @ ${it.importPrice.toLocaleString("vi-VN")}₫\n`;
    totalValue += it.totalValue || it.quantity * it.importPrice;
  });

  details += `\n───────────────────────────────────────\nTHÔNG TIN NHẬP HÀNG\n───────────────────────────────────────\nTổng giá trị: ${totalValue.toLocaleString(
    "vi-VN"
  )}₫\n${
    slip.supplier ? `Nhà cung cấp: ${slip.supplier}` : ""
  }\n\n───────────────────────────────────────\nTHỜI GIAN\n───────────────────────────────────────\nNgày tạo: ${new Date(
    slip.createdDate
  ).toLocaleString("vi-VN")}\n${
    slip.completedDate
      ? `Ngày hoàn thành: ${new Date(slip.completedDate).toLocaleString(
          "vi-VN"
        )}`
      : ""
  }\n`;

  if (slip.note)
    details += `\n───────────────────────────────────────\nGHI CHÚ\n───────────────────────────────────────\n${slip.note}\n`;

  details += "╚═══════════════════════════════════════╝\n";

  alert(details);
}

function handleFilter() {
  const filters = {
    status: DOM.filterStatus.value,
    productName: DOM.filterProductName.value,
    fromDate: DOM.filterFromDate.value,
    toDate: DOM.filterToDate.value,
  };

  const results = importManager.searchSlips(filters);
  renderImportSlipsList(results);
}

function handleResetFilter() {
  DOM.filterStatus.value = "ALL";
  DOM.filterProductName.value = "";
  DOM.filterFromDate.value = "";
  DOM.filterToDate.value = "";
  renderImportSlipsList();
}