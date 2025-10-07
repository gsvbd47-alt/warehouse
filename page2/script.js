// Warehouse data structure
let warehouseData = {
    slots: {},
    lastUpdate: null,
    maxStackPerSlot: 12 // Mỗi vị trí tối đa 9 ô
};

// Configuration
const config = {
    maxStack: 9,
    stackHeight: 8, // Chiều cao mỗi ô stack (px)
    colors: {
        filled: '#89ff3b', // Màu vàng cho phần đã dùng
        empty: '#ffffff'   // Màu trắng cho phần trống
    }
};

// Initialize warehouse layout
function initializeWarehouse() {
    // Create LE row (LE1-LE8)
    createRowSlots('row-le', 'LE', 8);
    
    // Create LD row (LD1-LD8)
    createRowSlots('row-ld', 'LD', 8);
    
    // Create LB row (LB1-LB7)
    createRowSlots('row-lb', 'LB', 7);
    
    // Create LC row (LC1-LC9)
    createRowSlots('row-lc', 'LC', 9);
    
    // Initialize LG and LF slots
    initializeFixedSlots();
    
    updateStats();
}

function createRowSlots(containerId, prefix, count) {
    const container = document.getElementById(containerId);
    for (let i = 1; i <= count; i++) {
        const slotId = `${prefix}${i}`;
        
        // Create slot wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'slot-wrapper';
        
        // Create label
        const label = document.createElement('span');
        label.className = 'slot-label';
        label.textContent = slotId;
        
        // Create slot
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.slot = slotId;
        slot.onclick = () => handleSlotClick(slotId);
        
        wrapper.appendChild(label);
        wrapper.appendChild(slot);
        container.appendChild(wrapper);
        
        // Initialize slot data
        initializeSlotData(slotId);
    }
}

function initializeFixedSlots() {
    // Initialize LG1-3 and LF1-4
    const fixedSlots = ['LG1', 'LG2', 'LG3', 'LF1', 'LF2', 'LF3', 'LF4'];
    fixedSlots.forEach(slotId => {
        const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
        if (slotElement) {
            slotElement.onclick = () => handleSlotClick(slotId);
            initializeSlotData(slotId);
        }
    });
}

function initializeSlotData(slotId) {
    warehouseData.slots[slotId] = {
        id: slotId,
        items: {}, // { 'Grid BM82A': 3, 'Grid BZ82S': 2 }
        totalCount: 0,
        maxCapacity: config.maxStack,
        lastUpdated: null
    };
}

// Calculate stock level based on percentage
function getStockLevel(totalCount) {
    if (totalCount === 0) return 'empty';
    if (totalCount <= 3) return 'low';
    if (totalCount <= 6) return 'medium';
    if (totalCount <= 8) return 'high';
    return 'full';
}

// Update slot visual with vertical stack display
function updateSlotVisual(slotId) {
    const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
    if (!slotElement) return;
    
    const slotData = warehouseData.slots[slotId];
    
    // Clear existing content
    slotElement.innerHTML = '';
    
    // Create vertical stack container
    const stackContainer = document.createElement('div');
    stackContainer.className = 'stack-container';
    
    // Create 9 stack boxes (from top to bottom)
    for (let i = config.maxStack - 1; i >= 0; i--) {
        const stackBox = document.createElement('div');
        stackBox.className = 'stack-box';
        
        // Fill boxes from bottom up
        if (i < slotData.totalCount) {
            stackBox.classList.add('filled');
        } else {
            stackBox.classList.add('empty');
        }
        
        stackContainer.appendChild(stackBox);
    }
    
    // Create text info at bottom
    const textInfo = document.createElement('div');
    textInfo.className = 'slot-info';
    
    if (slotData.totalCount > 0) {
        const items = Object.entries(slotData.items)
            .filter(([, count]) => count > 0)
            .map(([name, count]) => `${name}: ${count}`)
            .join('\n');
        textInfo.textContent = items;
        textInfo.title = items; // Tooltip
    } else {
        textInfo.textContent = 'Trống';
    }
    
    slotElement.appendChild(stackContainer);
    slotElement.appendChild(textInfo);
    
    // Set data level for styling
    const level = getStockLevel(slotData.totalCount);
    slotElement.dataset.level = level;
}

// Handle slot click
function handleSlotClick(slotId) {
    const slotData = warehouseData.slots[slotId];
    if (!slotData) return;
    
    let infoText = `=== VỊ TRÍ: ${slotId} ===\n\n`;
    infoText += `Tổng số: ${slotData.totalCount}/${slotData.maxCapacity}\n`;
    infoText += `Trạng thái: ${slotData.totalCount === 0 ? 'Trống' : 'Có hàng'}\n\n`;
    
    if (slotData.totalCount > 0) {
        infoText += `Chi tiết:\n`;
        Object.entries(slotData.items).forEach(([name, count]) => {
            if (count > 0) {
                infoText += `  • ${name}: ${count}\n`;
            }
        });
        if (slotData.lastUpdated) {
            infoText += `\nCập nhật: ${slotData.lastUpdated}`;
        }
    }
    
    alert(infoText);
}

// CSV Data Handling
function loadCSVData() {
    const fileInput = document.getElementById('csvFile');
    fileInput.onchange = handleFileUpload;
    fileInput.click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvText = e.target.result;
        parseCSV(csvText);
    };
    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
    
    // Find column indices
    const descrIndex = headers.indexOf('DESCR');
    const locIndex = headers.indexOf('LOC');
    
    if (descrIndex === -1 || locIndex === -1) {
        alert('CSV phải có cột DESCR và LOC!');
        return;
    }
    
    // Reset all slots
    Object.keys(warehouseData.slots).forEach(slotId => {
        warehouseData.slots[slotId].items = {};
        warehouseData.slots[slotId].totalCount = 0;
    });
    
    // Group data by LOC
    const locationMap = {};
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const descr = values[descrIndex];
        const loc = values[locIndex];
        
        if (!descr || !loc) continue;
        
        if (!locationMap[loc]) {
            locationMap[loc] = {};
        }
        
        if (!locationMap[loc][descr]) {
            locationMap[loc][descr] = 0;
        }
        
        locationMap[loc][descr]++;
    }
    
    // Update warehouse data
    let updatedCount = 0;
    Object.entries(locationMap).forEach(([loc, items]) => {
        if (warehouseData.slots[loc]) {
            warehouseData.slots[loc].items = items;
            warehouseData.slots[loc].totalCount = Object.values(items).reduce((sum, count) => sum + count, 0);
            warehouseData.slots[loc].lastUpdated = new Date().toISOString().split('T')[0];
            updateSlotVisual(loc);
            updatedCount++;
        }
    });
    
    updateStats();
    alert(`Đã tải thành công ${updatedCount} vị trí từ file CSV!\nTổng ${Object.keys(locationMap).length} vị trí có dữ liệu.`);
    
    // Reset file input
    document.getElementById('csvFile').value = '';
}

// Update warehouse display
function updateWarehouseDisplay() {
    Object.keys(warehouseData.slots).forEach(slotId => {
        updateSlotVisual(slotId);
    });
    updateStats();
}

// Update statistics
function updateStats() {
    const slots = Object.values(warehouseData.slots);
    const total = slots.length;
    const occupied = slots.filter(s => s.totalCount > 0).length;
    const empty = total - occupied;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    
    document.getElementById('total-slots').textContent = total;
    document.getElementById('occupied-slots').textContent = occupied;
    document.getElementById('empty-slots').textContent = empty;
    document.getElementById('usage-rate').textContent = rate + '%';
}

// Filter data
function filterData() {
    const filterOptions = [
        'all - Tất cả',
        'empty - Trống (0)',
        'low - Ít (1-3)',
        'medium - Trung bình (4-6)',
        'high - Cao (7-8)',
        'full - Đầy (9)'
    ];
    
    const filter = prompt('Chọn mức độ lọc:\n\n' + filterOptions.join('\n') + '\n\nNhập: all, empty, low, medium, high, hoặc full');
    
    if (!filter) return;
    
    const filterLower = filter.toLowerCase().trim();
    
    Object.keys(warehouseData.slots).forEach(slotId => {
        const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
        const slotData = warehouseData.slots[slotId];
        const level = getStockLevel(slotData.totalCount);
        
        if (filterLower === 'all' || level === filterLower) {
            slotElement.style.opacity = '1';
            slotElement.style.transform = 'scale(1)';
        } else {
            slotElement.style.opacity = '0.2';
            slotElement.style.transform = 'scale(0.95)';
        }
    });
}

// Reset view
function resetView() {
    Object.keys(warehouseData.slots).forEach(slotId => {
        const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
        slotElement.style.opacity = '1';
        slotElement.style.transform = 'scale(1)';
    });
}

// Export data to CSV
function exportData() {
    let csvContent = 'slot_id,descr,count,total_count,last_updated\n';
    
    Object.values(warehouseData.slots)
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach(slot => {
            if (slot.totalCount > 0) {
                Object.entries(slot.items).forEach(([descr, count]) => {
                    csvContent += `${slot.id},${descr},${count},${slot.totalCount},${slot.lastUpdated || ''}\n`;
                });
            } else {
                csvContent += `${slot.id},,,0,\n`;
            }
        });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// API Integration Example (commented out)
/*
async function loadDataFromAPI() {
    try {
        const response = await fetch('YOUR_API_ENDPOINT');
        const data = await response.json();
        
        // Process API data
        data.forEach(item => {
            if (warehouseData.slots[item.slot_id]) {
                warehouseData.slots[item.slot_id] = {
                    id: item.slot_id,
                    status: item.quantity > 0 ? 'occupied' : 'empty',
                    product: item.product,
                    quantity: item.quantity,
                    maxCapacity: item.max_capacity,
                    stockPercentage: Math.round((item.quantity / item.max_capacity) * 100),
                    lastUpdated: item.last_updated
                };
                updateSlotVisual(item.slot_id);
            }
        });
        
        updateStats();
        alert('Dữ liệu đã được tải từ API!');
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu từ API:', error);
        alert('Không thể tải dữ liệu từ API. Vui lòng thử lại!');
    }
}
*/

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeWarehouse();
    console.log('Hệ thống quản lý kho đã sẵn sàng!');
    console.log('Tổng số vị trí:', Object.keys(warehouseData.slots).length);
});

// Export functions for external use
window.warehouseAPI = {
    getData: () => warehouseData,
    updateSlot: (slotId, data) => {
        if (warehouseData.slots[slotId]) {
            Object.assign(warehouseData.slots[slotId], data);
            if (data.items) {
                warehouseData.slots[slotId].totalCount = 
                    Object.values(data.items).reduce((sum, count) => sum + count, 0);
            }
            updateSlotVisual(slotId);
            updateStats();
        }
    },
    refreshDisplay: () => updateWarehouseDisplay(),
    parseCSVText: (csvText) => parseCSV(csvText),
    getSlotInfo: (slotId) => warehouseData.slots[slotId]
};