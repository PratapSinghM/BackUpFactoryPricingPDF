// Configuration
const CONFIG = {
    itemsPerPageFirst: 15,
    itemsPerPage: 16,
    company: {
        phone: '+91 8169476676',
        email: 'Backupfactory83@gmail.com',
        website: 'https://www.backupfactory.in'
    }
};

// Global variables
let pricingData = null;
let primaryColor = 'orange';
let secondaryColor = 'blue';
let customPrimaryColor = null;
let customSecondaryColor = null;

// Color definitions
const colors = {
    orange: { main: '#ff6b35', light: '#ff8c42', dark: '#e55a2b' },
    blue: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2' },
    green: { main: '#4CAF50', light: '#81C784', dark: '#388E3C' },
    purple: { main: '#9C27B0', light: '#BA68C8', dark: '#7B1FA2' },
    red: { main: '#F44336', light: '#EF5350', dark: '#D32F2F' },
    teal: { main: '#009688', light: '#4DB6AC', dark: '#00796B' },
    indigo: { main: '#3F51B5', light: '#7986CB', dark: '#303F9F' },
    black: { main: '#424242', light: '#757575', dark: '#212121' },
    gray: { main: '#6C757D', light: '#ADB5BD', dark: '#495057' },
    navy: { main: '#1B365D', light: '#2E5984', dark: '#0D1B2A' }
};

// Function to generate light and dark shades from any color
function generateColorShades(hexColor) {
    // Remove # if present
    hexColor = hexColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Generate lighter shade (increase RGB values by 20%)
    const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.3));
    const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.3));
    const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.3));
    
    // Generate darker shade (decrease RGB values by 20%)
    const darkR = Math.floor(r * 0.7);
    const darkG = Math.floor(g * 0.7);
    const darkB = Math.floor(b * 0.7);
    
    return {
        main: '#' + hexColor,
        light: `rgb(${lightR}, ${lightG}, ${lightB})`,
        dark: `rgb(${darkR}, ${darkG}, ${darkB})`
    };
}

// Apply custom color
function applyCustomColor(type) {
    if (type === 'primary') {
        const colorValue = document.getElementById('primaryColorPicker').value;
        customPrimaryColor = generateColorShades(colorValue);
        primaryColor = 'custom-primary';
        
        // Clear active state from preset options
        document.querySelectorAll('.theme-option[data-type="primary"]').forEach(opt => 
            opt.classList.remove('active'));
        
    } else if (type === 'secondary') {
        const colorValue = document.getElementById('secondaryColorPicker').value;
        customSecondaryColor = generateColorShades(colorValue);
        secondaryColor = 'custom-secondary';
        
        // Clear active state from preset options
        document.querySelectorAll('.theme-option[data-type="secondary"]').forEach(opt => 
            opt.classList.remove('active'));
    }
    
    updateTheme();
}

// Apply preset combination
function applyPreset(primary, secondary) {
    // Clear custom colors
    customPrimaryColor = null;
    customSecondaryColor = null;
    
    // Set colors
    primaryColor = primary;
    secondaryColor = secondary;
    
    // Update UI
    document.querySelectorAll('.theme-option[data-type="primary"]').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.color === primary);
    });
    
    document.querySelectorAll('.theme-option[data-type="secondary"]').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.color === secondary);
    });
    
    // Update color pickers
    document.getElementById('primaryColorPicker').value = colors[primary].main;
    document.getElementById('secondaryColorPicker').value = colors[secondary].main;
    
    updateTheme();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Backup Factory Price List Generator...');
    setupUploadHandlers();
    setupThemeHandlers();
    updateTheme(); // Initialize with default colors
    tryLoadFromFileSystem();
});

// Setup theme handlers
function setupThemeHandlers() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const colorType = option.dataset.type;
            const colorName = option.dataset.color;
            
            if (colorType === 'primary') {
                // Remove active class from primary options
                document.querySelectorAll('.theme-option[data-type="primary"]').forEach(opt => 
                    opt.classList.remove('active'));
                option.classList.add('active');
                primaryColor = colorName;
                customPrimaryColor = null; // Clear custom color
                
                // Update color picker
                document.getElementById('primaryColorPicker').value = colors[colorName].main;
                
            } else if (colorType === 'secondary') {
                // Remove active class from secondary options
                document.querySelectorAll('.theme-option[data-type="secondary"]').forEach(opt => 
                    opt.classList.remove('active'));
                option.classList.add('active');
                secondaryColor = colorName;
                customSecondaryColor = null; // Clear custom color
                
                // Update color picker
                document.getElementById('secondaryColorPicker').value = colors[colorName].main;
            }
            
            updateTheme();
        });
    });
    
    // Setup color picker change handlers
    document.getElementById('primaryColorPicker').addEventListener('change', (e) => {
        e.target.nextElementSibling.style.background = '#28a745'; // Highlight apply button
    });
    
    document.getElementById('secondaryColorPicker').addEventListener('change', (e) => {
        e.target.nextElementSibling.style.background = '#28a745'; // Highlight apply button
    });
}

// Update theme with selected colors
function updateTheme() {
    const root = document.documentElement;
    
    // Get primary color (custom or preset)
    const primary = primaryColor === 'custom-primary' ? customPrimaryColor : colors[primaryColor];
    // Get secondary color (custom or preset)
    const secondary = secondaryColor === 'custom-secondary' ? customSecondaryColor : colors[secondaryColor];
    
    root.style.setProperty('--primary-color', primary.main);
    root.style.setProperty('--primary-light', primary.light);
    root.style.setProperty('--primary-dark', primary.dark);
    root.style.setProperty('--secondary-color', secondary.main);
    root.style.setProperty('--secondary-light', secondary.light);
    root.style.setProperty('--secondary-dark', secondary.dark);
    
    // Update preview
    updateColorPreview();
    
    // If price list is already generated, regenerate with new colors
    if (pricingData && document.getElementById('priceListContainer').innerHTML) {
        generatePriceList();
    }
}

// Update color preview
function updateColorPreview() {
    const primaryPreview = document.querySelector('.preview-primary');
    const secondaryPreview = document.querySelector('.preview-secondary');
    
    const primary = primaryColor === 'custom-primary' ? customPrimaryColor : colors[primaryColor];
    const secondary = secondaryColor === 'custom-secondary' ? customSecondaryColor : colors[secondaryColor];
    
    if (primaryPreview) primaryPreview.style.background = primary.main;
    if (secondaryPreview) secondaryPreview.style.background = secondary.main;
}

// Setup upload handlers
function setupUploadHandlers() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadButton.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

// Try to load from file system
async function tryLoadFromFileSystem() {
    try {
        // Prefer Excel if present; fallback to JSON
        if (window?.fs?.readFile) {
            try {
                console.log('Attempting to load BackUpFactoryPricingList.xlsx...');
                const excelBuffer = await window.fs.readFile('BackUpFactoryPricingList.xlsx');
                const parsed = parseExcelArrayBuffer(excelBuffer);
                if (parsed && validateJSON(parsed)) {
                    pricingData = parsed;
                    generatePriceList();
                    return;
                }
            } catch (e) {
                console.log('XLSX not found or failed, trying JSON...');
            }

            try {
                console.log('Attempting to load BackUpFactoryPricingList.json...');
                const fileContent = await window.fs.readFile('BackUpFactoryPricingList.json', { encoding: 'utf8' });
                const data = JSON.parse(fileContent);
                if (validateJSON(data)) {
                    pricingData = data;
                    generatePriceList();
                    return;
                }
            } catch (e) {
                console.log('JSON not found or invalid.');
            }
        }
    } catch (error) {
        console.log('File system load failed, showing upload interface');
        console.error('Error:', error);
    }
}

// Handle file upload
function handleFile(file) {
    console.log('Processing file:', file.name);
    
    const messageArea = document.getElementById('messageArea');
    const lower = file.name.toLowerCase();
    const isExcel = lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv');

    if (!isExcel) {
        showError('Please upload an Excel file (.xlsx, .xls, .csv)');
        return;
    }

    showLoading();

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const buffer = e.target.result;
            const parsed = parseExcelArrayBuffer(buffer);

            if (!validateJSON(parsed)) {
                throw new Error('Invalid data structure from Excel');
            }

            pricingData = parsed;
            showSuccess('File loaded successfully! Generating price list...');
            setTimeout(() => generatePriceList(), 500);
        } catch (error) {
            console.error('Error parsing Excel:', error);
            showError(error.message || 'Failed to parse Excel file');
        }
    };

    reader.onerror = () => {
        showError('Failed to read file');
    };

    reader.readAsArrayBuffer(file);
}

// Parse Excel ArrayBuffer into expected JSON shape
function parseExcelArrayBuffer(buffer) {
    if (typeof XLSX === 'undefined') {
        throw new Error('Excel parser not loaded');
    }
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error('No sheets found in Excel file');
    const ws = workbook.Sheets[firstSheetName];

    // Rows keyed by header names
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true });
    if (!rows.length) throw new Error('No data rows found');

    // Discover keys by header names (case/format agnostic)
    // Enforce exact headers as requested: Brand, Name, Price, optional mAh
    const headerKeys = Object.keys(rows[0]);
    const normalize = (s) => s.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const findExact = (expected) => headerKeys.find(k => normalize(k) === expected);

    const brandKey = findExact('brand');
    const nameKey = findExact('name');
    const priceKey = findExact('price');
    const mahKey = findExact('mah');

    if (!brandKey || !nameKey || !priceKey) {
        throw new Error('Missing required headers: Brand/Name/Price');
    }

    const out = {};
    for (const row of rows) {
        const brandRaw = (row[brandKey] ?? '').toString().trim();
        const nameRaw = (row[nameKey] ?? '').toString().trim();
        const priceRaw = row[priceKey];
        const mahRaw = mahKey ? row[mahKey] : undefined;

        if (!brandRaw || !nameRaw) continue;

        // Coerce price to number
        let priceNum = null;
        if (typeof priceRaw === 'number') priceNum = priceRaw;
        else if (typeof priceRaw === 'string') {
            const m = priceRaw.replace(/[,\s]/g, '').match(/\d+(?:\.\d+)?/);
            if (m) priceNum = parseFloat(m[0]);
        }
        if (priceNum === null || Number.isNaN(priceNum)) continue;

        // Optional mAh
        let mahNum = undefined;
        if (mahRaw !== undefined && mahRaw !== null && mahRaw !== '') {
            if (typeof mahRaw === 'number') mahNum = mahRaw;
            else if (typeof mahRaw === 'string') {
                const mm = mahRaw.replace(/[,\s]/g, '').match(/\d+(?:\.\d+)?/);
                if (mm) mahNum = parseFloat(mm[0]);
            }
        }

        if (!out[brandRaw]) out[brandRaw] = [];
        const obj = { name: nameRaw, price: priceNum };
        if (typeof mahNum === 'number') obj.mAh = mahNum; // only include when valid number
        out[brandRaw].push(obj);
    }

    if (!Object.keys(out).length) throw new Error('No valid rows after parsing');
    return out;
}

// Validate JSON structure
function validateJSON(data) {
    if (typeof data !== 'object' || data === null) {
        console.error('JSON must be an object');
        return false;
    }
    
    for (const brand in data) {
        if (!Array.isArray(data[brand])) {
            console.error(`Brand "${brand}" must contain an array`);
            return false;
        }
        
        for (const item of data[brand]) {
            if (!item.name || typeof item.price !== 'number') {
                console.error('Each item must have "name" and "price"');
                return false;
            }
            // Optional: validate mAh if provided (allow empty/undefined)
            if (Object.prototype.hasOwnProperty.call(item, 'mAh')) {
                if (item.mAh === '' || item.mAh === null || typeof item.mAh === 'undefined') {
                    // treat as not provided
                } else if (typeof item.mAh !== 'number') {
                    console.error('If provided, "mAh" must be a number');
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Generate price list
function generatePriceList() {
    console.log('Generating price list...');
    
    document.getElementById('uploadSection').style.display = 'none';
    
    const container = document.getElementById('priceListContainer');
    container.innerHTML = '';
    
    let allItems = [];
    for (const brand in pricingData) {
        for (const item of pricingData[brand]) {
            allItems.push({
                brand: brand,
                name: item.name,
                price: item.price
            });
        }
    }
    
    console.log(`Total items: ${allItems.length}`);
    
    let pages = [];
    let pageNum = 1;
    
    const firstPageLimit = CONFIG.itemsPerPageFirst;
    const regularPageLimit = CONFIG.itemsPerPage;
    
    for (const brand in pricingData) {
        const brandItems = pricingData[brand];
        let index = 0;

        while (index < brandItems.length) {
            const limit = pageNum === 1 ? firstPageLimit : regularPageLimit;
            const chunk = brandItems.slice(index, index + limit);

            pages.push({
                number: pageNum,
                items: chunk.map(item => ({
                    brand: brand,
                    name: item.name,
                    price: item.price,
                    mAh: item.mAh
                }))
            });

            index += chunk.length;
            pageNum++;
        }
    }
    
    console.log(`Created ${pages.length} pages`);
    
    let serialNumber = 1;
    for (const page of pages) {
        const pageHTML = createPage(page, pages.length, serialNumber);
        container.innerHTML += pageHTML;
        serialNumber += page.items.length;
    }
    
    console.log('Price list generated successfully');
}

// Create a single page
function createPage(page, totalPages, startSerial) {
    let html = `
        <div class="page">
            <div class="watermark">BACKUP FACTORY</div>
            ${createHeaderV2()}
            ${page.number === 1 ? '<h2 class="page-title">BATTERY PRICE LIST 2026</h2>' : ''}
            <div class="content-area">
    `;
    
    let brandGroups = {};
    let serial = startSerial;
    
    for (const item of page.items) {
        if (!brandGroups[item.brand]) {
            brandGroups[item.brand] = [];
        }
        brandGroups[item.brand].push({
            ...item,
            serial: serial++
        });
    }
    
    for (const brand in brandGroups) {
        html += `
            <div class="section-header">${brand.toUpperCase()} SERIES</div>
            <table class="price-table">
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Model Description</th>
                        <th>mAh</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (const item of brandGroups[brand]) {
            html += `
                <tr>
                    <td>${item.serial}</td>
                    <td>${item.name}</td>
                    <td>${item.mAh ?? ''}</td>
                    <td><span class="price-currency">₹</span> ${item.price}</td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    html += `
            </div>
            ${createFooter(page.number, totalPages)}
        </div>
    `;
    
    return html;
}

// Create header HTML
function createHeader() {
    return `
        <div class="header">
            <div class="logo-section">
                <div class="logo">
                    <img src="https://raw.githubusercontent.com/PratapSinghM/BackUpFactoryPricingPDF/master/images/backup%20catory.png" alt="Backup Factory Logo" onerror="this.style.display='none'">
                </div>
                <div class="company-name"></div>
            </div>
            <div class="contact-info">
                <h3>Contact Us</h3>
                <p>📞 ${CONFIG.company.phone}</p>
                <p>✉️ ${CONFIG.company.email}</p>
                <p>🌐 ${CONFIG.company.website}</p>
            </div>
        </div>
    `;
}

// Header with clickable contact links and inline SVG icons.
function createHeaderV2() {
    const phone = CONFIG.company.phone || '';
    const waNumber = phone.replace(/[^\d]/g, '');
    const email = CONFIG.company.email || '';
    const website = CONFIG.company.website || '';

    return `
        <div class="header">
            <div class="logo-section">
                <div class="logo">
                    <img src="https://raw.githubusercontent.com/PratapSinghM/BackUpFactoryPricingPDF/master/images/backup%20catory.png" alt="Backup Factory Logo" onerror="this.style.display='none'">
                </div>
                <div class="company-name"></div>
            </div>
            <div class="contact-info">
                <h3>Contact Us</h3>
                <div class="ci-item">
                    <svg class="ci-icon whatsapp" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
                        <path d="M20.52 3.488A10.933 10.933 0 0011.72 0C5.248 0 .02 5.229.02 11.704c0 2.062.541 4.073 1.574 5.852L0 24l6.594-1.724a11.682 11.682 0 005.122 1.222h.004c6.47 0 11.7-5.229 11.7-11.704a11.61 11.61 0 00-3.9-8.306zm-8.8 18.827h-.003a9.81 9.81 0 01-4.993-1.367l-.357-.211-3.914 1.024 1.045-3.817-.233-.392A9.82 9.82 0 011.91 11.7C1.909 6.573 6.076 2.4 11.203 2.4c2.6 0 5.042 1.012 6.873 2.85a9.62 9.62 0 012.846 6.858c-.002 5.127-4.172 9.207-9.203 9.207zm5.291-6.935c-.289-.145-1.71-.844-1.975-.94-.266-.097-.46-.145-.654.145-.193.289-.75.94-.92 1.133-.17.193-.34.217-.629.072-.289-.145-1.221-.449-2.326-1.431-.86-.766-1.44-1.712-1.61-2.001-.17-.289-.018-.445.127-.59.13-.129.289-.338.434-.508.145-.17.193-.289.289-.482.097-.193.048-.362-.024-.508-.072-.145-.654-1.58-.896-2.164-.236-.566-.477-.49-.654-.5l-.56-.01c-.193 0-.508.073-.773.362-.266.289-1.015.992-1.015 2.418 0 1.426 1.04 2.8 1.186 2.993.145.193 2.05 3.183 4.969 4.46.695.3 1.237.478 1.66.611.697.222 1.33.191 1.83.116.558-.083 1.71-.699 1.952-1.373.241-.674.241-1.252.169-1.373-.07-.12-.262-.193-.55-.338z"/>
                    </svg>
                    <a class="ci-link" href="https://wa.me/${waNumber}" target="_blank" rel="noopener">WhatsApp: ${phone}</a>
                </div>
                <div class="ci-item">
                    <svg class="ci-icon email" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                        <path d="M3 7l9 6 9-6"></path>
                    </svg>
                    <a class="ci-link" href="mailto:${email}">${email}</a>
                </div>
                <div class="ci-item">
                    <svg class="ci-icon globe" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"></path>
                    </svg>
                    <a class="ci-link" href="${website}" target="_blank" rel="noopener">${website}</a>
                </div>
            </div>
        </div>
    `;
}

// Create footer HTML
function createFooter(pageNum, totalPages) {
    const date = new Date();
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return `
        <div class="footer">
            <span>Valid from: ${monthYear} | Prices subject to change without prior notice</span>
            <span class="page-number">Page ${pageNum} of ${totalPages}</span>
        </div>
    `;
}

// UI Helper Functions
function showError(message) {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = `
        <div class="error-message">
            <strong>Error:</strong> ${message}
        </div>
    `;
}

function showSuccess(message) {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = `
        <div class="success-message">
            ✓ ${message}
        </div>
    `;
}

function showLoading() {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Processing file...
        </div>
    `;
}

// Load sample data for testing
function loadSampleData() {
    pricingData = {
        "iPhone": [
            { "name": "iPhone 5G Battery", "price": 380, "mAh": 1650 },
            { "name": "iPhone 5S Battery", "price": 350, "mAh": 1560 },
            { "name": "iPhone 6G Battery", "price": 390, "mAh": 1960 },
            { "name": "iPhone 6 Plus Battery", "price": 540, "mAh": 2915 }
        ],
        "Samsung": [
            { "name": "Galaxy A11 Battery", "price": 390, "mAh": 1810 },
            { "name": "Galaxy A71 Battery", "price": 340, "mAh": 2750 },
            { "name": "Galaxy A01 Battery", "price": 370, "mAh": 1650 }
        ]
    };
    
    generatePriceList();
}

// Add test button for development (remove in production)
console.log('To load sample data for testing, run: loadSampleData()');
