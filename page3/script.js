// Warehouse data structure
let warehouseData = {
    slots: {},
    lastUpdate: null,
    maxStackPerSlot: 9
};

// Configuration
const config = {
    maxStack: 9,
    stackHeight: 8,
    colors: {
        filled: '#ffeb3b',
        empty: '#ffffff'
    }
};

// Initialize warehouse layout
function initializeWarehouse() {
    createRowSlots('row-le', 'LE', 8);
    createRowSlots('row-ld', 'LD', 8);
    createRowSlots('row-lb', 'LB', 7);
    createRowSlots('row-lc', 'LC', 9);
    initializeFixedSlots();
    updateStats();
}

function createRowSlots(containerId, prefix, count) {
    const container = document.getElementById(containerId);
    for (let i = 1; i <= count; i++) {
        const slotId = `${prefix}${i}`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'slot-wrapper';
        
        const label = document.createElement('span');
        label.className = 'slot-label';
        label.textContent = slotId;
        
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.slot = slotId;
        slot.onclick = () => handleSlotClick(slotId);
        
        wrapper.appendChild(label);
        wrapper.appendChild(slot);
        container.appendChild(wrapper);
        
        initializeSlotData(slotId);
    }
}

function initializeFixedSlots() {
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
        items: {},
        totalCount: 0,
        maxCapacity: config.maxStack,
        lastUpdated: null
    };
}

function getStockLevel(totalCount) {
    if (totalCount === 0) return 'empty';
    if (totalCount <= 3) return 'low';
    if (totalCount <= 6) return 'medium';
    if (totalCount <= 8) return 'high';
    return 'full';
}

function updateSlotVisual(slotId) {
    const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
    if (!slotElement) return;
    
    const slotData = warehouseData.slots[slotId];
    
    slotElement.innerHTML = '';
    
    const stackContainer = document.createElement('div');
    stackContainer.className = 'stack-container';
    
    for (let i = config.maxStack - 1; i >= 0; i--) {
        const stackBox = document.createElement('div');
        stackBox.className = 'stack-box';
        
        if (i < slotData.totalCount) {
            stackBox.classList.add('filled');
        } else {
            stackBox.classList.add('empty');
        }
        
        stackContainer.appendChild(stackBox);
    }
    
    const textInfo = document.createElement('div');
    textInfo.className = 'slot-info';
    
    if (slotData.totalCount > 0) {
        const items = Object.entries(slotData.items)
            .filter(([, count]) => count > 0)
            .map(([name, count]) => `${name}: ${count}`)
            .join('\n');
        textInfo.textContent = items;
        textInfo.title = items;
    } else {
        textInfo.textContent = 'Trống';
    }
    
    slotElement.appendChild(stackContainer);
    slotElement.appendChild(textInfo);
    
    const level = getStockLevel(slotData.totalCount);
    slotElement.dataset.level = level;
}

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
        console.log('✅ Đã tải dữ liệu từ file upload');
    };
    reader.readAsText(file);
}

function reloadDefaultCSV() {
    autoLoadCSV();
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
    
    const descrIndex = headers.indexOf('DESCR');
    const locIndex = headers.indexOf('LOC');
    
    if (descrIndex === -1 || locIndex === -1) {
        alert('CSV phải có cột DESCR và LOC!');
        return;
    }
    
    Object.keys(warehouseData.slots).forEach(slotId => {
        warehouseData.slots[slotId].items = {};
        warehouseData.slots[slotId].totalCount = 0;
    });
    
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
    
    document.getElementById('csvFile').value = '';
}

function updateWarehouseDisplay() {
    Object.keys(warehouseData.slots).forEach(slotId => {
        updateSlotVisual(slotId);
    });
    updateStats();
}

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

function resetView() {
    Object.keys(warehouseData.slots).forEach(slotId => {
        const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
        slotElement.style.opacity = '1';
        slotElement.style.transform = 'scale(1)';
    });
}

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

async function autoLoadCSV() {
    const csvFileName = 'sample_data.csv';
    
    let baseURL = window.location.origin;
    const pathname = window.location.pathname;
    
    if (pathname !== '/' && pathname !== '/index.html') {
        const folder = pathname.substring(0, pathname.lastIndexOf('/'));
        baseURL += folder;
    }
    
    const fullURL = baseURL + '/' + csvFileName;
    
    console.log('🔍 Đang tải CSV từ:', fullURL);
    
    try {
        const response = await fetch(csvFileName);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const csvText = await response.text();
        parseCSV(csvText);
        
        console.log(`✅ Đã tự động tải dữ liệu từ ${csvFileName}`);
    } catch (error) {
        console.warn('⚠️ Không thể tự động tải file CSV:', error.message);
        console.log('📁 Đường dẫn thử: ', fullURL);
        console.log('💡 Bạn có thể upload file CSV thủ công bằng nút "Tải Dữ Liệu CSV Khác"');
        console.log('📝 Đảm bảo file sample_data.csv nằm cùng thư mục với index.html');
    }
}


async function loadDataFromAPI() {
    const url = WAREHOUSE_CONFIG?.ui?.apiEndpoint || 'https://poms-be-dev.smartlogix.biz/api/standardized/v1/reports/inventories';
    const token = WAREHOUSE_CONFIG?.ui?.apiToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiI5Mjk2MjM5MS1iYWQ1LTQxYzUtYTRkNS00YmE1MGY1NWRjYTYiLCJDbGllbnRJZCI6ImJlZGZlZWY2LTYzYjgtNDZiZi05YTljLThiMDZhNjUxYTkzMCIsIkNsaWVudENvZGUiOiJHU1YiLCJJc01hc3RlckNsaWVudCI6IkZhbHNlIiwiVXNlcm5hbWUiOiJnc3YtdGljaG9wIiwiSXNNYXN0ZXJVc2VyIjoiRmFsc2UiLCJuYmYiOjE3NjA1ODIzMzMsImV4cCI6MTc2MzE3NDMzMywiaWF0IjoxNzYwNTgyMzMzfQ.s2z8fIaPrNOKReVF7qRA6E_9-9How5LlSm4K6XrdQaU';

    const payload = {
        storerkey: ["RM3"],
        fieldNames: [
            "whseid", "storerkey", "owner", "owner_2",
            "sku", "upccode", "manufacturersku", "altsku",
            "lot", "loc", "descr", "qty"
        ]
    };

    try {
        console.log("🔄 Gửi request tới API:", url);

        const response = await fetch(url, {
            userID: "92962391-bad5-41c5-a4d5-4ba50f55dca6",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token,       // ✅ API yêu cầu header này, không phải Authorization
                "whseid": "RM3"     // ✅ cũng bắt buộc có
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("❌ API trả về không phải JSON:", text);
            throw new Error("Invalid JSON response");
        }

        if (!response.ok) {
            console.error("📩 Phản hồi lỗi:", data);
            throw new Error(`HTTP ${response.status}`);
        }

        if (!data?.data?.length) {
            alert("⚠️ API không có dữ liệu (rỗng)");
            return;
        }

        // ✅ Chuyển kết quả API thành CSV text để tái sử dụng hàm parseCSV()
        const apiCSV = "DESCR,LOC\n" + data.data
            .map(item => `${item.descr || ''},${item.loc || ''}`)
            .join("\n");

        parseCSV(apiCSV);
        console.log(`✅ Đã tải ${data.data.length} dòng từ API`);
    } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu API:", error);
        alert(`Lỗi khi tải dữ liệu API: ${error.message}`);
    }
}
window.loadDataFromAPI = loadDataFromAPI;


document.addEventListener('DOMContentLoaded', function() {
    initializeWarehouse();
    // Ưu tiên dùng API nếu có endpoint
    if (WAREHOUSE_CONFIG?.ui?.apiEndpoint) {
        loadDataFromAPI();
    } else {
        autoLoadCSV();
    }
    console.log('Hệ thống quản lý kho đã sẵn sàng!');
});

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
    getSlotInfo: (slotId) => warehouseData.slots[slotId],
    loadCSVFromURL: async (url) => {
        try {
            const response = await fetch(url);
            const csvText = await response.text();
            parseCSV(csvText);
            console.log(`✅ Đã tải dữ liệu từ ${url}`);
        } catch (error) {
            console.error('Lỗi khi tải CSV từ URL:', error);
        }
    },
    reloadDefault: () => autoLoadCSV()
};
