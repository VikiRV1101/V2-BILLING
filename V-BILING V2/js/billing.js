let cart = [];
let lastInvoice = null;
let selectedCategory = 'All';

async function loadBilling() {
    try {
        const billingModule = document.getElementById('billingModule');
        if (!billingModule) return; // Guard against missing element

        const categories = await getAllItems('categories').catch(err => {
            console.error('Error fetching categories:', err);
            return [];
        });

        billingModule.innerHTML = `
            <div class="pos-layout">
                <div class="products-panel">
                    <div class="product-search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" id="billingSearch" class="search-input" placeholder="Search delicious products..." oninput="renderPOSProducts()">
                    </div>
                    
                    <div class="category-pills flex gap-10 mb-30" style="flex-wrap: wrap; align-items: center;">
                        <button class="btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-outline'}" onclick="filterPOSProducts('All')">All</button>
                        ${categories.map(c => `
                            <button class="btn ${selectedCategory === c.name ? 'btn-primary' : 'btn-outline'}" onclick="filterPOSProducts('${c.name}')">${c.name}</button>
                        `).join('')}
                    </div>
    
                    <div class="product-card-grid" id="posProductGallery">
                        <!-- Products -->
                    </div>
                </div>
                
                <div class="card cart-card">
                    <div class="cart-header">
                        <h2 style="font-size: 1.5rem;"><i class="fas fa-shopping-basket" style="color: var(--primary);"></i> Cart</h2>
                        <span class="badge" id="cartCount" style="background: var(--primary); color: #fff; padding: 5px 12px; border-radius: 20px;">0 Items</span>
                    </div>
                    
                    <div class="cart-list" id="cartItemsList">
                        <!-- Items -->
                    </div>
                    
                    <div class="cart-total-section" style="font-family: 'Segoe UI', sans-serif; border-top: 2px solid #dee2e6; padding-top: 20px; margin-top: 20px;">
                        <div class="customer-info mb-20">
                            <input type="text" id="custName" class="form-control mb-10" placeholder="Customer Name" style="border: 1px solid #ced4da; border-radius: 4px;">
                            <input type="text" id="custPhone" class="form-control mb-10" placeholder="Phone Number" style="border: 1px solid #ced4da; border-radius: 4px;">
                        </div>
                        
                        <div class="total-summary" style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
                            <div class="flex justify-between mb-10" style="font-size: 0.95rem; color: #495057;">
                                <span>Subtotal</span>
                                <span id="cartSubtotal">₹ 0.00</span>
                            </div>
                            <div class="flex justify-between mb-10 align-center">
                                <span style="font-size: 0.95rem; color: #495057;">Discount</span>
                                <div class="flex gap-5" style="width: 120px;">
                                    <input type="number" id="discountValue" value="0" oninput="updateTotals()" style="width: 60px; padding: 4px; border: 1px solid #ced4da; border-radius: 4px;">
                                    <select id="discountType" onchange="updateTotals()" style="width: 50px; padding: 4px; border: 1px solid #ced4da; border-radius: 4px;">
                                        <option value="₹">₹</option>
                                        <option value="%">%</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex justify-between mt-15 pt-15 border-top" style="border-top-color: #dee2e6;">
                                <span style="font-size: 1.25rem; font-weight: 700; color: #007bff;">Total</span>
                                <span id="cartNetTotal" style="font-size: 1.25rem; font-weight: 700; color: #007bff;">₹ 0.00</span>
                            </div>
                        </div>
    
                        <div class="flex gap-10 mt-20">
                             <button class="btn btn-primary" onclick="checkout()" style="flex: 2; padding: 15px; background: #007bff; border: none; font-weight: 600; font-size: 1rem; text-transform: uppercase;">
                                <i class="fas fa-check"></i> CHECKOUT
                            </button>
                            <button class="btn btn-outline" onclick="clearCart()" style="flex: 1; border-color: #dc3545; color: #dc3545;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <button class="btn btn-outline btn-block mt-10" onclick="sendToWhatsApp()" style="border-color: #25D366; color: #25D366; background: transparent;">
                            <i class="fab fa-whatsapp"></i> WhatsApp Bill
                        </button>
                    </div>
                </div>
            </div>
        `;
        renderPOSProducts();
        renderCart();
    } catch (e) {
        console.error('Error loading billing module:', e);
        showToast('Failed to load billing module: ' + e.message, 'danger');
    }
}

async function renderPOSProducts() {
    const list = await getAllItems('products');
    const search = document.getElementById('billingSearch').value.toLowerCase();
    const gallery = document.getElementById('posProductGallery');

    const filtered = list.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    gallery.innerHTML = filtered.map(p => `
        <div class="item-card" onclick="addToCart(${p.id})">
            <div class="item-image" style="background-image: url('${(p.image && !p.image.startsWith('http') && !p.image.startsWith('images/')) ? 'images/' + p.image : (p.image || 'https://via.placeholder.com/150')}')">
                <div class="item-price-tag">₹ ${parseFloat(p.price).toFixed(0)}</div>
            </div>
            <div class="item-details">
                <div class="item-name">${p.name}</div>
                <div class="item-stock ${p.stock <= p.lowStock ? 'text-danger' : ''}">
                    <i class="fas fa-box"></i> Stock: ${p.stock}
                </div>
            </div>
        </div>
    `).join('');
}

function filterPOSProducts(cat) {
    selectedCategory = cat;
    loadBilling(); // Refresh UI to update class on buttons
}

let pendingProduct = null;

async function addToCart(id) {
    const product = await getItem('products', id);
    if (!product) {
        showToast('Product not found!', 'danger');
        return;
    }

    if (product.stock <= 0) {
        showToast('Out of stock!', 'danger');
        return;
    }

    // Check for weight-based categories
    if (product.category === 'Sweet' || product.category === 'Karam' || product.category === 'Sweets' || product.category === 'Karams') {
        pendingProduct = product;
        openModal('weightModal');
        return;
    }

    addItemToCart(product, 1);
}

function selectWeight(qty) {
    if (!pendingProduct) return;

    // Create a variation for the cart
    const weightLabel = qty < 1 ? (qty * 1000) + 'g' : qty + 'kg';

    // Special handling: Price is per KG, so we calculate proportional price
    // But since our system multiplies price * qty, we can either:
    // 1. Add with fractional qty (0.25) -> Price = 400, Qty = 0.25 -> Total = 100. Correct.
    // 2. Add with calculated price and Qty 1 -> Name = "Laddu (250g)", Price = 100, Qty = 1.

    // Option 1 is better for stock management if we tracked weight, but we track units? 
    // If stock is in KG Basic, then 0.25 is correct.
    // Assuming stock is in KG for Sweets/Karams.

    addItemToCart(pendingProduct, qty, weightLabel);
    closeModal('weightModal');
    pendingProduct = null;
}

function selectManualWeight() {
    if (!pendingProduct) return;

    const input = document.getElementById('manualWeightInput');
    const qty = parseFloat(input.value);

    if (!qty || qty <= 0) {
        showToast('Please enter a valid weight', 'warning');
        return;
    }

    const weightLabel = qty < 1 ? (qty * 1000) + 'g' : qty + 'kg';

    addItemToCart(pendingProduct, qty, weightLabel);
    closeModal('weightModal');

    // Reset input
    input.value = '';
    pendingProduct = null;
}

window.selectManualWeight = selectManualWeight;

function addItemToCart(product, qty, label = null) {
    const existing = cart.find(item => String(item.id) === String(product.id) && item.qty === qty); // Only merge if same weight variation? No, merge if same ID?

    // For weight-based, we probably want separate lines for "Laddu 250g" and "Laddu 500g" or just merge them?
    // If I buy 250g twice, I probably want 500g total or 2 packets of 250g?
    // Let's assume merging for now to keep it simple, OR treat as separate items effectively.
    // Actually, simply adding to cart array supports duplicates if we don't check ID strictly.

    // Let's stick to standard logic:
    // If exact same item (same ID AND same usage of weight), merge.

    // However, if I add 0.25kg, then 0.5kg, they are same product ID.
    // If we merge, we get 0.75kg. This is mathematically correct for price and stock.

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        if (existingItem.qty + qty > product.stock) {
            showToast('Stock limit reached!', 'warning');
            return;
        }
        existingItem.qty += qty;
    } else {
        if (qty > product.stock) {
            showToast(`Insufficient stock! Only ${product.stock} available.`, 'warning');
            return;
        }
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: qty,
            originalPrice: product.price
        });
    }
    renderCart();
}

window.selectWeight = selectWeight;

function removeFromCart(id) {
    cart = cart.filter(item => String(item.id) !== String(id));
    renderCart();
    updateTotals();
}

async function updateQty(id, newQty) {
    const item = cart.find(i => String(i.id) === String(id));
    if (item) {
        if (newQty <= 0) {
            removeFromCart(id);
        } else {
            // Fetch latest stock to verify
            const product = await getItem('products', id);
            if (product) {
                // Allow if newQty is barely above stock due to float precision? No, strict.
                if (newQty > product.stock) {
                    showToast(`Stock limit reached! Max: ${product.stock}`, 'warning');
                    return;
                }
            }

            item.qty = parseFloat(Number(newQty).toFixed(3)); // Handle float precision
            renderCart();
            updateTotals();
        }
    }
}

function clearCart() {
    if (confirm('Clear entire cart?')) {
        cart = [];
        renderCart();
    }
}

async function renderCart() {
    console.log('Rendering cart...', cart);
    const list = document.getElementById('cartItemsList');
    const count = document.getElementById('cartCount');
    if (!list) {
        console.error('cartItemsList element not found');
        return;
    }

    count.textContent = `${cart.length} Item${cart.length !== 1 ? 's' : ''}`;

    if (cart.length === 0) {
        list.innerHTML = `
            <div class="text-center p-40" style="color: var(--text-muted); width: 100%;">
                <i class="fas fa-shopping-basket fa-3x mb-20" style="opacity: 0.1;"></i>
                <p style="font-size: 0.9rem;">Your cart is empty</p>
            </div>
        `;
    } else {
        list.innerHTML = `
            <table class="cart-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-family: 'Segoe UI', sans-serif; background: #fff;">
                <thead>
                    <tr style="background: #f8f9fa; color: #495057;">
                        <th style="padding: 12px; font-size: 0.85rem; font-weight: 600; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                        <th style="padding: 12px; text-align: center; font-size: 0.85rem; font-weight: 600; border-bottom: 2px solid #dee2e6; width: 100px;">Quantity</th>
                        <th style="padding: 12px; text-align: right; font-size: 0.85rem; font-weight: 600; border-bottom: 2px solid #dee2e6;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => {
            let qtyDisplay = item.qty;
            if (item.qty < 1) {
                qtyDisplay = (item.qty * 1000) + 'g';
            } else if (item.qty % 1 !== 0) {
                qtyDisplay = item.qty + 'kg';
            }

            return `
                        <tr style="border-bottom: 1px solid #f1f3f5;">
                            <td style="padding: 12px; vertical-align: middle;">
                                <div style="font-weight: 500; color: #343a40;">${item.name}</div>
                                <div style="font-size: 0.75rem; color: #868e96;">₹${item.price}</div>
                            </td>
                            <td style="padding: 12px; text-align: center; vertical-align: middle;">
                                <div style="display: inline-flex; align-items: center; background: #e9ecef; border-radius: 20px; padding: 2px;">
                                    <button onclick="updateQty(${item.id}, ${item.qty - (item.qty < 1 ? 0.05 : 1)})" style="width: 24px; height: 24px; border-radius: 50%; border: none; background: #fff; color: #fa5252; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">-</button>
                                    <span style="padding: 0 8px; font-size: 0.85rem; font-weight: 600; min-width: 30px; text-align: center;">${qtyDisplay}</span>
                                    <button onclick="updateQty(${item.id}, ${item.qty + (item.qty < 1 ? 0.05 : 1)})" style="width: 24px; height: 24px; border-radius: 50%; border: none; background: #fff; color: #40c057; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">+</button>
                                </div>
                            </td>
                            <td style="padding: 12px; text-align: right; font-weight: 600; color: #343a40; vertical-align: middle;">
                                ₹${(item.price * item.qty).toFixed(2)}
                            </td>
                            <td style="padding: 12px; text-align: right; vertical-align: middle;">
                                <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #adb5bd; cursor: pointer; padding: 5px;"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    }

    updateTotals();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const discType = document.getElementById('discountType').value;

    let discount = discType === '₹' ? discValue : (subtotal * discValue / 100);
    const netTotal = Math.max(0, subtotal - discount);

    document.getElementById('cartSubtotal').textContent = `₹ ${subtotal.toFixed(2)} `;
    document.getElementById('cartNetTotal').textContent = `₹ ${netTotal.toFixed(2)} `;
}

async function checkout() {
    if (cart.length === 0) {
        showToast('Add items to cart first!', 'warning');
        return;
    }

    const session = getSession();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const discType = document.getElementById('discountType').value;
    const discount = discType === '₹' ? discValue : (subtotal * discValue / 100);
    const netTotal = subtotal - discount;

    const invoiceNumber = 'INV' + Date.now().toString().slice(-6);

    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : '';

    const invoice = {
        invoiceNumber,
        dateTime: new Date().toISOString(),
        staffId: session.id,
        staffName: session.name,
        customerName: getVal('custName') || 'Guest',
        customerPhone: getVal('custPhone'),
        items: [...cart],
        subtotal,
        discount,
        netTotal,
        paymentMode: getVal('paymentMode') || 'Cash'
    };

    try {
        await addItem('invoices', invoice);

        for (const item of cart) {
            const product = await getItem('products', item.id);
            product.stock -= item.qty;
            await updateItem('products', product);
        }

        showToast('Invoice generated successfully!', 'success');
        lastInvoice = invoice;
        await preparePrint(invoice);

        cart = [];
        if (document.getElementById('custName')) document.getElementById('custName').value = '';
        if (document.getElementById('custPhone')) document.getElementById('custPhone').value = '';
        if (document.getElementById('discountValue')) document.getElementById('discountValue').value = 0;
        renderCart();
        renderPOSProducts();

    } catch (err) {
        showToast('Checkout failed!', 'danger');
    }
}


async function sendToWhatsApp() {
    if (!lastInvoice) {
        showToast('No invoice to send', 'warning');
        return;
    }

    const phone = lastInvoice.customerPhone;
    if (!phone) {
        showToast('Customer phone number is required', 'warning');
        return;
    }

    // Fetch shop name from settings
    const shopNameSetting = await getItem('settings', 'shopName') || { value: 'V-BAKERY' };
    const shopName = shopNameSetting.value;

    // Format WhatsApp message
    let message = `* ${shopName}*\n`;
    message += `Invoice: ${lastInvoice.invoiceNumber} \n`;
    message += `Date: ${new Date(lastInvoice.dateTime).toLocaleDateString()} \n`;
    message += `Time: ${new Date(lastInvoice.dateTime).toLocaleTimeString()} \n\n`;
    message += `* Items:*\n`;

    lastInvoice.items.forEach(item => {
        message += `• ${item.name} \n`;
        message += `  ${item.qty} × ₹${parseFloat(item.price).toFixed(2)} = ₹${(item.qty * item.price).toFixed(2)} \n`;
    });

    message += `\n * Subtotal:* ₹${lastInvoice.subtotal.toFixed(2)} \n`;
    if (lastInvoice.discount > 0) {
        message += `* Discount:* -₹${lastInvoice.discount.toFixed(2)} \n`;
    }
    message += `* Total:* ₹${lastInvoice.netTotal.toFixed(2)} \n\n`;
    message += `Payment: ${lastInvoice.paymentMode} \n\n`;
    message += `Thank you for shopping with us! 🎂`;

    // Clean phone number (remove +91, spaces, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    showToast('Opening WhatsApp...', 'success');
}

window.loadBilling = loadBilling;
window.renderPOSProducts = renderPOSProducts;
window.filterPOSProducts = filterPOSProducts;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.checkout = checkout;
window.updateTotals = updateTotals;
window.clearCart = clearCart;
window.updateTotals = updateTotals;
window.clearCart = clearCart;
window.sendToWhatsApp = sendToWhatsApp;

function loadCartItems(items) {
    cart = items.map(i => ({ ...i })); // Deep copy to avoid reference issues
    renderCart();
    updateTotals();
    showToast('Order loaded into cart', 'info');
}
window.loadCartItems = loadCartItems;
