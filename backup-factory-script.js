// Configuration
const CONFIG = {
    itemsPerPageFirst: 15,
    itemsPerPage: 16,
    company: {
        phone: '+91 98765 43210',
        email: 'info@backupfactory.com',
        website: 'www.backupfactory.com'
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
        console.log('Attempting to load BackUpFactoryPricingList.json...');
        const fileContent = await window.fs.readFile('BackUpFactoryPricingList.json', { encoding: 'utf8' });
        const data = JSON.parse(fileContent);
        console.log('File loaded successfully from file system');
        
        if (validateJSON(data)) {
            pricingData = data;
            generatePriceList();
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
    
    if (!file.name.endsWith('.json')) {
        showError('Please upload a .json file');
        return;
    }

    showLoading();

    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            console.log('JSON parsed successfully');
            
            if (!validateJSON(data)) {
                throw new Error('Invalid JSON structure');
            }
            
            pricingData = data;
            showSuccess('File loaded successfully! Generating price list...');
            
            setTimeout(() => {
                generatePriceList();
            }, 1000);
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
            showError(error.message);
        }
    };
    
    reader.onerror = () => {
        showError('Failed to read file');
    };
    
    reader.readAsText(file);
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
                    price: item.price
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
            ${createHeader()}
            ${page.number === 1 ? '<h2 class="page-title">BATTERY PRICE LIST 2025</h2>' : ''}
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
                    <img src="https://raw.githubusercontent.com/PratapSinghM/BackUpFactoryPricingPDF/master/images/logo%20factory.png" alt="Backup Factory Logo" onerror="this.style.display='none'">
                </div>
                <div class="company-name">
                    <span class="backup">BACKUP</span>
                    <span class="factory">FACTORY</span>
                </div>
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
            { "name": "iPhone 5G Battery", "price": 380 },
            { "name": "iPhone 5S Battery", "price": 350 },
            { "name": "iPhone 6G Battery", "price": 390 },
            { "name": "iPhone 6 Plus Battery", "price": 540 }
        ],
        "Samsung": [
            { "name": "Galaxy A11 Battery", "price": 390 },
            { "name": "Galaxy A71 Battery", "price": 340 },
            { "name": "Galaxy A01 Battery", "price": 370 }
        ]
    };
    
    generatePriceList();
}

// Add test button for development (remove in production)
console.log('To load sample data for testing, run: loadSampleData()');