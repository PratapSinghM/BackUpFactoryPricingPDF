// Configuration
const CONFIG = {
    itemsPerPageFirst: 15,  // First page (has title)
    itemsPerPage: 16,        // Subsequent pages
    company: {
        phone: '+91 98765 43210',
        email: 'info@backupfactory.com',
        website: 'www.backupfactory.com'
    }
};

// Global variables
let pricingData = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Backup Factory Price List Generator...');
    setupUploadHandlers();
    tryLoadFromFileSystem();
});

// Setup upload handlers
function setupUploadHandlers() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');

    // Click handlers
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadButton.addEventListener('click', () => fileInput.click());

    // Drag and drop handlers
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

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

// Try to load from file system
async function tryLoadFromFileSystem() {
    try {
        console.log('Attempting to load BatteryPricing.json...');
        const fileContent = await window.fs.readFile('BatteryPricing.json', { encoding: 'utf8' });
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
    
    // Hide upload section
    document.getElementById('uploadSection').style.display = 'none';
    
    // Clear container
    const container = document.getElementById('priceListContainer');
    container.innerHTML = '';
    
    // Prepare all items with brand info
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
    
    // Create pages
    let pages = [];
    let currentPage = [];
    let pageNum = 1;
    
    // First page can hold fewer items
    const firstPageLimit = CONFIG.itemsPerPageFirst;
    const regularPageLimit = CONFIG.itemsPerPage;
    
for (const brand in pricingData) {
    const brandItems = pricingData[brand];
    let index = 0;

    // Always start a new page for each brand
    while (index < brandItems.length) {
        const limit = pageNum === 1 ? firstPageLimit : regularPageLimit;

        // Take up to `limit` items for this page
        const chunk = brandItems.slice(index, index + limit);

        // Store this page with only this brand's items
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
    
    // Generate HTML for each page
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
    
    // Group items by brand
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
    
    // Create tables for each brand
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
                    <div class="battery-icon"></div>
                    <span class="plug-icon">🔌</span>
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

// Sample data for testing
function loadSampleData() {
    pricingData = {
        "iPhone": [
            { "name": "iPhone 5G Battery", "price": 380 },
            { "name": "iPhone 5S Battery", "price": 350 },
            { "name": "iPhone 6G Battery", "price": 390 },
            { "name": "iPhone 6 Plus Battery", "price": 540 },
            { "name": "iPhone 6S Battery", "price": 390 },
            { "name": "iPhone 6S Plus Battery", "price": 540 },
            { "name": "iPhone 7G Battery", "price": 420 },
            { "name": "iPhone 7 Plus Battery", "price": 530 },
            { "name": "iPhone 8G Battery", "price": 420 },
            { "name": "iPhone 8 Plus Battery", "price": 530 },
            { "name": "iPhone X Battery", "price": 590 },
            { "name": "iPhone XR Battery", "price": 600 },
            { "name": "iPhone XS Battery", "price": 670 },
            { "name": "iPhone XS Max Battery", "price": 750 },
            { "name": "iPhone 11 Battery", "price": 600 },
            { "name": "iPhone 11 Pro Battery", "price": 690 },
            { "name": "iPhone 11 Pro Max Battery", "price": 830 },
            { "name": "iPhone 12 Battery", "price": 650 },
            { "name": "iPhone 12 Mini Battery", "price": 600 },
            { "name": "iPhone 12 Pro Battery", "price": 650 },
            { "name": "iPhone 12 Pro Max Battery", "price": 950 },
            { "name": "iPhone 13 Battery", "price": 680 },
            { "name": "iPhone 13 Mini Battery", "price": 650 },
            { "name": "iPhone 13 Pro Battery", "price": 800 },
            { "name": "iPhone 13 Pro Max Battery", "price": 950 },
            { "name": "iPhone 14 Battery", "price": 600 },
            { "name": "iPhone 14 Plus Battery", "price": 950 },
            { "name": "iPhone 14 Pro Battery", "price": 850 },
            { "name": "iPhone 14 Pro Max Battery", "price": 950 },
            { "name": "iPhone 15 Battery", "price": 650 },
            { "name": "iPhone 15 Plus Battery", "price": 1050 },
            { "name": "iPhone 15 Pro Battery", "price": 1080 },
            { "name": "iPhone 15 Pro Max Battery", "price": 1280 },
            { "name": "iPhone SE 2020 Battery", "price": 400 },
            { "name": "iPhone SE3 Battery", "price": 450 }
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
