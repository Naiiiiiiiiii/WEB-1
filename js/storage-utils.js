// === AUTO-SYNC LOCALSTORAGE UTILITY ===

/**
 * Lưu dữ liệu vào localStorage với metadata
 * @param {string} key - Storage key
 * @param {any} data - Dữ liệu cần lưu
 * @param {boolean} silent - Không hiển thị log
 */
export function syncToStorage(key, data, silent = false) {
  try {
    // Use window.userManager to avoid circular dependency issues
    const currentUser = window.userManager?.layAdminHienTai?.();
    
    const payload = {
      data: data,
      timestamp: Date.now(),
      updatedBy: currentUser?.tenDangNhap || 'admin',
      version: '1.0'
    };
    
    localStorage.setItem(key, JSON.stringify(payload));
    
    window.dispatchEvent(new CustomEvent('storage-sync', {
      detail: { key, data, timestamp: payload.timestamp }
    }));
    
    if (!silent) {
      console.log(`✅ [Storage Sync] Đã lưu "${key}" lúc ${new Date().toLocaleTimeString()}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ [Storage Sync] Lỗi khi lưu "${key}":`, error);
    
    if (error.name === 'QuotaExceededError') {
      alert('⚠️ Dung lượng LocalStorage đã đầy! Hãy dọn dẹp dữ liệu cũ.');
    }
    
    return false;
  }
}

/**
 * Đọc dữ liệu từ localStorage
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    
    // Support new format with metadata
    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
      return parsed.data;
    }
    
    // Backward compatibility: return old format as-is
    return parsed;
  } catch (error) {
    console.error(`❌ [Storage Sync] Lỗi khi đọc "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Xóa item khỏi localStorage
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ [Storage Sync] Đã xóa "${key}"`);
    
    window.dispatchEvent(new CustomEvent('storage-sync', {
      detail: { key, data: null, timestamp: Date.now(), action: 'remove' }
    }));
    
    return true;
  } catch (error) {
    console.error(`❌ [Storage Sync] Lỗi khi xóa "${key}":`, error);
    return false;
  }
}

/**
 * Batch update - Lưu nhiều items cùng lúc
 */
export function batchSyncToStorage(updates) {
  const results = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    results.push(syncToStorage(key, value, true));
  });
  
  console.log(`✅ [Storage Sync] Batch update: ${results.filter(r => r).length}/${results.length} thành công`);
  
  return results.every(r => r === true);
}

/**
 * Debounced sync để tối ưu performance
 */
let syncTimeout = null;
export function debouncedSync(key, data, delay = 300) {
  clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(() => {
    syncToStorage(key, data);
  }, delay);
}

/**
 * Hiển thị thông tin storage usage
 */
export function showStorageStats() {
  try {
    let totalSize = 0;
    const items = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage.getItem(key).length;
        totalSize += size;
        items[key] = (size / 1024).toFixed(2) + ' KB';
      }
    }
    
    const totalKB = (totalSize / 1024).toFixed(2);
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
    
    console.group('📊 LocalStorage Usage');
    console.table(items);
    console.log(`Tổng: ${totalKB} KB (${totalMB} MB)`);
    console.log(`Đã sử dụng: ${percentUsed}% / 5MB`);
    console.groupEnd();
    
    if (parseFloat(percentUsed) > 80) {
      console.warn('⚠️ LocalStorage sắp đầy!');
    }
    
    return { totalSize, items, percentUsed };
  } catch (error) {
    console.error('❌ Không thể lấy storage stats:', error);
    return null;
  }
}

// Cross-tab sync listener
window.addEventListener('storage', (e) => {
  if (e.key && e.newValue) {
    console.log(`🔄 [Cross-Tab Sync] "${e.key}" đã được cập nhật từ tab khác`);
  }
});

// Custom event listener
window.addEventListener('storage-sync', (e) => {
  console.log(`🔔 [Storage Event] "${e.detail.key}" đã thay đổi`, e.detail);
});

// Export để gọi từ console
window.showStorageStats = showStorageStats;
window.syncToStorage = syncToStorage;
window.getFromStorage = getFromStorage;

// === END STORAGE UTILITY ===
