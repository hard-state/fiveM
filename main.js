
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

// --- Initialization ---
function initStore() {
    // 1. Check if store initialized
    if (!localStorage.getItem('storeProducts')) {
        console.log("Initializing Default Store...");
        localStorage.setItem('storeProducts', JSON.stringify(defaultProducts));
    } else {
        // Migration: Ensure new services exist in old datasets
        ensureServicesMigration();
    }

    // 2. Render Products
    renderAllProducts();
}

function ensureServicesMigration() {
    let products = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const hasServices = products.some(p => p.category === 'services');
    if (!hasServices) {
        const services = defaultProducts.filter(p => p.category === 'services');
        products = [...products, ...services];
        localStorage.setItem('storeProducts', JSON.stringify(products));
    }
}

// --- Rendering ---
function renderAllProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return; // Maybe on admin page

    const products = JSON.parse(localStorage.getItem('storeProducts')) || [];
    grid.innerHTML = ''; // Clear current

    products.forEach(item => {
        // Filter Check
        if (filter !== 'all' && item.category !== filter) return;

        const el = document.createElement('div');
        el.className = 'product-card';
        el.setAttribute('data-category', item.category);
        el.style.animation = 'fadeInUp 0.5s ease-out';

        // Availability Check
        const isAvailable = item.availability !== false;
        const grayscaleStyle = !isAvailable ? 'filter: grayscale(1); opacity: 0.8;' : '';
        const badgeHtml = !isAvailable
            ? '<span class="badge" style="background: #ef4444;">نفذت الكمية</span>'
            : (item.badge ? `<span class="badge" style="background: #10b981;">${item.badge}</span>` : '');

        const buttonHtml = isAvailable
            ? `<button class="btn-buy" onclick="addToCart(this, '${item.name}', ${item.price}, '${item.img}')">إضافة للسلة</button>`
            : `<button class="btn-buy" disabled style="background: #ccc; cursor: not-allowed; transform: none; box-shadow: none;">غير متوفر</button>`;

        el.innerHTML = `
            <div class="product-image">
                <img src="${item.img}" alt="${item.name}" style="${grayscaleStyle}">
                ${badgeHtml}
            </div>
            <div class="product-content">
                <h3>${item.name}</h3>
                <div class="price-row">
                    <span class="price">${item.price} DA</span>
                    ${buttonHtml}
                </div>
            </div>
        `;
        grid.appendChild(el);
    });
}

// --- Filtering ---
window.filterCategory = function (category) {
    // 1. Update List Items (Active state)
    const listItems = document.querySelectorAll('.category-menu li');
    listItems.forEach(li => {
        if (li.getAttribute('onclick').includes(`'${category}'`)) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    // 2. Render
    renderAllProducts(category);
};


// --- Cart System ---
let cart = [];

window.addToCart = function (btn, name, price, imgSrc) {
    if (!imgSrc) {
        // Fallback
        const card = btn.closest('.product-card');
        if (card) {
            const imgEl = card.querySelector('img');
            if (imgEl) imgSrc = imgEl.src;
        }
    }

    cart.push({ name, price });
    updateCartUI();

    // Flying Animation
    if (btn && imgSrc) {
        const cartIcon = document.querySelector('.cart-btn i');
        if (cartIcon) {
            const rect = btn.getBoundingClientRect();
            const clone = document.createElement('img');
            clone.src = imgSrc;
            clone.style.cssText = `
                position: fixed; width: 50px; height: 50px; border-radius: 50%;
                top: ${rect.top}px; left: ${rect.left}px; z-index: 9999;
                transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1); object-fit: cover;
                box-shadow: 0 0 10px var(--accent-cyan);
            `;
            document.body.appendChild(clone);

            setTimeout(() => {
                const targetRect = cartIcon.getBoundingClientRect();
                clone.style.top = targetRect.top + 'px';
                clone.style.left = targetRect.left + 'px';
                clone.style.opacity = '0.5';
                clone.style.transform = 'scale(0.2)';
            }, 10);

            setTimeout(() => {
                clone.remove();
                cartIcon.parentElement.classList.add('shake-anim');
                setTimeout(() => cartIcon.parentElement.classList.remove('shake-anim'), 500);
                openCart();
            }, 800);
        }
    } else {
        openCart();
    }
};

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

function updateCartUI() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartCountSpan = document.getElementById('cartCount');
    const cartTotalSpan = document.getElementById('cartTotal');

    cartCountSpan.innerText = cart.length;

    // Total Calc
    let total = cart.reduce((acc, item) => acc + item.price, 0);
    cartTotalSpan.innerText = total + ' DA';

    // Render Items
    cartItemsDiv.innerHTML = '';
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart-msg">السلة فارغة</p>';
    } else {
        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div>
                    <span style="display:block; font-weight:bold; font-size:14px;">${item.name}</span>
                    <span style="font-size:12px; color:#aaa;">${item.price} DA</span>
                </div>
                <i class="fa-solid fa-trash remove-item" onclick="removeFromCart(${index})"></i>
            `;
            cartItemsDiv.appendChild(itemEl);
        });
    }
}

window.openCart = function () {
    document.getElementById('cartSidebar').classList.add('open');
    document.querySelector('.cart-overlay').classList.add('open');
};

window.closeCart = function () {
    document.getElementById('cartSidebar').classList.remove('open');
    document.querySelector('.cart-overlay').classList.remove('open');
};

window.checkout = function () {
    if (cart.length === 0) {
        alert('السلة فارغة!');
        return;
    }
    closeCart();

    const total = cart.reduce((acc, item) => acc + item.price, 0);
    document.getElementById('modalTotal').innerText = total + ' DA';

    const count = cart.length;
    document.getElementById('cartPreviewText').innerText = `عدد المنتجات: ${count}`;

    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    setTimeout(() => { modal.classList.add('show'); }, 10);
};

// Payment Selection
window.selectPayment = function (method) {
    document.getElementById('baridimobDetails').style.display = 'none';
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));

    event.currentTarget.classList.add('active');

    if (method === 'baridimob') {
        const details = document.getElementById('baridimobDetails');
        details.style.display = 'block';
        details.style.animation = 'fadeInUp 0.5s ease';
    }
}

window.copyToClipboard = function (text) {
    navigator.clipboard.writeText(text).then(() => alert('تم النسخ!'));
}

// Admin Utils
window.openAdminUtils = function () {
    // Basic password prompt before navigating usually handled on element, but kept here for ref
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initStore);
const modal = document.getElementById('checkoutModal');
if (modal) {
    const closeBtn = document.querySelector('.close-modal');
    window.closeModal = function () {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    closeBtn.addEventListener('click', window.closeModal);
    window.addEventListener('click', (e) => { if (e.target == modal) window.closeModal(); });
}
