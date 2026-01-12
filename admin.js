// Default Products (Seed Data)
const defaultProducts = [
    { id: 'p1', name: 'Lamborghini Veneno', price: 2500, category: 'cars', img: 'https://placehold.co/600x400/020c1b/00f0ff?text=Lambo+Veneno', badge: 'جديد', availability: true },
    { id: 'p2', name: 'Nissan GTR R35', price: 1500, category: 'cars', img: 'https://placehold.co/600x400/020c1b/00f0ff?text=GTR+R35', badge: null, availability: true },
    { id: 'p3', name: 'Rolls Royce Cullinan', price: 3000, category: 'cars', img: 'https://placehold.co/600x400/020c1b/00f0ff?text=Rolls+Royce', badge: 'فخم', availability: true },
    { id: 'p4', name: 'فيلا فاخرة (Vinewood)', price: 15000, category: 'real-estate', img: 'https://placehold.co/600x400/0a192f/00f0ff?text=Luxury+Villa', badge: null, availability: true },
    { id: 'p5', name: 'شقة فاخرة (الأبراج)', price: 5000, category: 'real-estate', img: 'https://placehold.co/600x400/0a192f/00f0ff?text=Luxury+Apt', badge: null, availability: true },
    { id: 'p6', name: 'قصر عصابة (Hood)', price: 20000, category: 'real-estate', img: 'https://placehold.co/600x400/0a192f/00f0ff?text=Gang+Mansion', badge: 'نادر', availability: true },
    { id: 's1', name: 'خدمة: شخصية ثانية', price: 5000, category: 'services', img: 'https://placehold.co/600x400/0f172a/00f0ff?text=New+Character', badge: 'مطلوب', availability: true },
    { id: 's2', name: 'خدمة: حذف شخصية', price: 2000, category: 'services', img: 'https://placehold.co/600x400/ef4444/ffffff?text=Delete+Char', badge: null, availability: true }
];

// --- Auth ---
async function checkPass() {
    // 1. Check Rate Limit
    const lockoutMsg = Security.checkLockout();
    if (lockoutMsg) {
        showToast(lockoutMsg, 'error');
        return;
    }

    const val = document.getElementById('adminPass').value;

    // 2. Verify Password
    const isValid = await Security.verifyPassword(val);

    if (isValid) {
        Security.resetAttempts(); // Reset strikes
        const overlay = document.getElementById('loginOverlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            initAdmin();
        }, 500);
    } else {
        // 3. Record Failure
        const isLocked = Security.recordFailure();
        if (isLocked) {
            showToast('تم قفل النظام لمدة 5 دقائق!', 'error');
        } else {
            showToast('كلمة المرور خاطئة! انتبه، المحاولات محدودة.', 'error');
        }
    }
}

// --- Admin Init ---
function initAdmin() {
    ensureServicesExist(); // Migration
    renderAdminList();
    updateStats();
}

function getProducts() {
    return JSON.parse(localStorage.getItem('storeProducts')) || [];
}

function ensureServicesExist() {
    let products = getProducts();
    if (products.length === 0) return; // Allow empty store if intentional, but usually it defaults.

    // Check if we have services
    const hasServices = products.some(p => p.category === 'services');

    if (!hasServices) {
        console.log("Migrating: Adding default services...");
        // Add the missing service products from defaultProducts
        const services = defaultProducts.filter(p => p.category === 'services');
        products = [...products, ...services];
        localStorage.setItem('storeProducts', JSON.stringify(products));
        showToast('System Update: Services Category Added');
    }
}

function saveProducts(products) {
    localStorage.setItem('storeProducts', JSON.stringify(products));
    renderAdminList();
    updateStats();
}

// --- Stats Animation ---
function updateStats() {
    const products = getProducts();
    const totalCount = products.length;
    const totalValue = products.reduce((acc, p) => acc + p.price, 0);

    animateValue("statCount", 0, totalCount, 1500);
    animateValue("statValue", 0, totalValue, 2000);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- Render List with Stagger ---
function renderAdminList() {
    const list = document.getElementById('adminList');
    if (!list) return;

    const products = getProducts();
    list.innerHTML = '';

    if (products.length === 0) {
        list.innerHTML = '<p style="color:#aaa; text-align:center;">المتجر فارغ!</p>';
        return;
    }

    products.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'admin-item';
        // Stagger Animation Delay
        div.style.animationDelay = `${index * 0.1}s`;

        // Stock Status Label
        const isAvailable = p.availability !== false; // Default true if undefined
        const stockStatus = isAvailable
            ? '<span style="color:#10b981; font-size:10px; border:1px solid #10b981; padding:2px 5px; border-radius:4px;">متوفر</span>'
            : '<span style="color:#ef4444; font-size:10px; border:1px solid #ef4444; padding:2px 5px; border-radius:4px;">نفذت الكمية</span>';

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.img}" style="width:40px; height:40px; border-radius:4px; object-fit:cover; ${!isAvailable ? 'filter:grayscale(1);' : ''}">
                <div>
                    <div style="font-weight:bold; color:white;">${p.name} ${stockStatus}</div>
                    <div style="font-size:12px; color:#aaa;">${p.price} DA | ${p.category}</div>
                </div>
            </div>
            <div style="display:flex; gap:5px;">
                 <button onclick="openEditModal(${index})" style="background:rgba(59, 130, 246, 0.2); color:#3b82f6; border:1px solid #3b82f6; padding:5px 10px; border-radius:4px; cursor:pointer;">
                    <i class="fa-solid fa-pen-to-square"></i>
                 </button>
                 <button onclick="deleteProduct(${index})" style="background:rgba(239, 68, 68, 0.2); color:#ef4444; border:1px solid #ef4444; padding:5px 10px; border-radius:4px; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                 </button>
            </div>
        `;
        list.appendChild(div);
    });
}

// --- Edit Logic ---
window.openEditModal = function (index) {
    const products = getProducts();
    const p = products[index];

    document.getElementById('editIndex').value = index;
    document.getElementById('editName').value = p.name;
    document.getElementById('editPrice').value = p.price;
    document.getElementById('editImg').value = p.img;

    const stockSwitch = document.getElementById('editStock');
    stockSwitch.checked = (p.availability !== false);

    updateStockLabel();
    stockSwitch.onchange = updateStockLabel;

    document.getElementById('editModal').style.display = 'flex';
};

function updateStockLabel() {
    const checked = document.getElementById('editStock').checked;
    const label = document.getElementById('stockLabel');
    if (checked) {
        label.innerText = 'يباع (متوفر)';
        label.style.color = '#10b981';
    } else {
        label.innerText = 'نفذت الكمية (غير متوفر)';
        label.style.color = '#ef4444';
    }
}

window.closeEditModal = function () {
    document.getElementById('editModal').style.display = 'none';
};

window.saveEditedProduct = function () {
    const index = document.getElementById('editIndex').value;
    // Sanitize Inputs
    const name = Security.sanitize(document.getElementById('editName').value);
    const price = parseInt(document.getElementById('editPrice').value);
    const img = Security.sanitize(document.getElementById('editImg').value);
    const availability = document.getElementById('editStock').checked;

    const products = getProducts();

    // Update
    products[index].name = name;
    products[index].price = price;
    products[index].img = img;
    products[index].availability = availability;

    saveProducts(products);
    showToast('تم تعديل المنتج بنجاح!');
    closeEditModal();
};


// --- Actions ---
window.addNewProduct = function () {
    // Sanitize Inputs
    const name = Security.sanitize(document.getElementById('newProdName').value);
    const price = parseInt(document.getElementById('newProdPrice').value);
    const img = Security.sanitize(document.getElementById('newProdImg').value);
    const cat = document.getElementById('newProdCat').value;

    if (!name || !price || !img) {
        showToast('يرجى ملء جميع البيانات', 'error');
        return;
    }

    const products = getProducts();
    const newProduct = {
        id: 'c' + Date.now(),
        name,
        price,
        img,
        category: cat,
        badge: 'جديد',
        availability: true
    };

    products.push(newProduct);
    saveProducts(products);

    showToast('تم إضافة المنتج بنجاح!');

    // Clear Form
    document.getElementById('newProdName').value = '';
    document.getElementById('newProdPrice').value = '';
    document.getElementById('newProdImg').value = '';
};

window.deleteProduct = function (index) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        const products = getProducts();
        products.splice(index, 1);
        saveProducts(products);
        showToast('تم حذف المنتج', 'error');
    }
};

window.resetStore = function () {
    if (confirm('تحذير: سيتم حذف جميع المنتجات وإعادة ضبط المصنع! هل أنت متأكد؟')) {
        localStorage.setItem('storeProducts', JSON.stringify(defaultProducts));
        initAdmin();
        showToast('تم إعادة ضبط المصنع!');
    }
};

// Toast Notification
window.showToast = function (msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    toast.style.boxShadow = type === 'error' ? '0 10px 30px rgba(239, 68, 68, 0.4)' : '0 10px 30px rgba(16, 185, 129, 0.4)';

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Enter Key
document.getElementById('adminPass').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPass();
});
