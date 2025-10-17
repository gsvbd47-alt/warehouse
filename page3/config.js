/**
 * Configuration file cho Warehouse Management System
 * Sử dụng file này nếu cần custom settings cho GitHub Pages
 */

const WAREHOUSE_CONFIG = {
    // CSV file configuration
    csv: {
        defaultFile: 'sample_data.csv',
        
        // Nếu deploy lên GitHub Pages với custom path, set baseURL
        // Ví dụ: 'https://username.github.io/warehouse-management'
        // Để trống nếu dùng relative path (auto-detect)
        baseURL: '',
        
        // Auto load CSV on startup
        autoLoad: true,
        
        // Encoding
        encoding: 'UTF-8'
    },
    
    // Warehouse configuration
    warehouse: {
        maxStackPerSlot: 9,
        stackBoxHeight: 8, // pixels
        
        // Colors
        colors: {
            filled: '#ffeb3b',    // Màu vàng cho ô đã dùng
            empty: '#ffffff',     // Màu trắng cho ô trống
            border: '#333333'     // Màu viền
        },
        
        // Stock level thresholds
        levels: {
            empty: 0,
            low: 3,      // 1-3
            medium: 6,   // 4-6
            high: 8,     // 7-8
            full: 9      // 9
        }
    },
    
    // UI Configuration
    ui: {
        showConsoleLog: true,
        showAlerts: true,
        animationDuration: 300, // ms
        
        // Auto refresh interval (0 = disabled)
        autoRefreshInterval: 0, // ms (e.g., 60000 = 1 minute)
        
        // API endpoint (if any)
        apiEndpoint: 'https://poms-be-dev.smartlogix.biz/api/standardized/v1/reports/inventories',
        apiToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiI5Mjk2MjM5MS1iYWQ1LTQxYzUtYTRkNS00YmE1MGY1NWRjYTYiLCJDbGllbnRJZCI6ImJlZGZlZWY2LTYzYjgtNDZiZi05YTljLThiMDZhNjUxYTkzMCIsIkNsaWVudENvZGUiOiJHU1YiLCJJc01hc3RlckNsaWVudCI6IkZhbHNlIiwiVXNlcm5hbWUiOiJnc3YtdGljaG9wIiwiSXNNYXN0ZXJVc2VyIjoiRmFsc2UiLCJuYmYiOjE3NjA1ODIzMzMsImV4cCI6MTc2MzE3NDMzMywiaWF0IjoxNzYwNTgyMzMzfQ.s2z8fIaPrNOKReVF7qRA6E_9-9How5LlSm4K6XrdQaU',
        showConsoleLog: true,
        showAlerts: true,
        animationDuration: 300,
        autoRefreshInterval: 0
    },
    
    // Feature flags
    features: {
        enableExport: true,
        enableFilter: true,
        enableAutoLoad: true,
        enableManualUpload: true
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(WAREHOUSE_CONFIG);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WAREHOUSE_CONFIG;
}
