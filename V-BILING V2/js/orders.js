async function loadOrders() {
    // Expose delete function
    window.deleteOrder = async (id) => {
        if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            await deleteItem('orders', id);
            showToast('Order deleted successfully', 'success');
            renderOrders();
        }
    };
    const ordersModule = document.getElementById('ordersModule');
    ordersModule.innerHTML = `
        <div class="card">
            <div class="flex justify-between align-center mb-30">
                <div>
                    <h2 style="font-size: 1.5rem;">Customer Orders</h2>
                    <p class="text-muted" style="font-size: 0.9rem;">Track custom cake and bulk orders</p>
                </div>
                <button class="btn btn-primary" onclick="openOrderModal()">
                    <i class="fas fa-cart-plus"></i> New Order
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Delivery Date</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total Amount</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="orderList"></tbody>
                </table>
            </div>
        </div>

        <div id="orderModal" class="modal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="flex justify-between align-center mb-30">
                    <h2 style="font-size: 1.5rem; color: var(--primary);">New Custom Order</h2>
                    <button class="btn btn-sm" onclick="closeModal('orderModal')" style="background: var(--bg-color);"><i class="fas fa-times"></i></button>
                </div>
                <form id="orderForm">
                    <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div class="form-group">
                            <label>Delivery Date</label>
                            <input type="date" id="orderDate" required>
                        </div>
                        <div class="form-group">
                            <label>Delivery Time</label>
                            <input type="time" id="orderTime" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Customer Name</label>
                        <input type="text" id="orderCustName" required placeholder="Name">
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="text" id="orderCustPhone" required placeholder="+91 ...">
                    </div>
                    <div class="form-group">
                        <label>Order Details</label>
                        <textarea id="orderDetails" rows="3" required placeholder="e.g. 2kg Chocolate Truffle with name Viki"></textarea>
                    </div>
                    <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div class="form-group">
                            <label>Total (₹)</label>
                            <input type="number" id="orderTotal" required oninput="calcBalance()">
                        </div>
                        <div class="form-group">
                            <label>Advance Paid (₹)</label>
                            <input type="number" id="orderAdvance" required oninput="calcBalance()">
                        </div>
                    </div>
                    <div class="card p-15 flex justify-between mb-30" style="background: var(--bg-color);">
                        <span style="font-weight:600;">Balance to Collect:</span>
                        <span id="orderBalance" style="font-weight:700; color: var(--danger);">₹ 0</span>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Confirm Order</button>
                </form>
            </div>
        </div>
    `;
    renderOrders();
}

async function renderOrders() {
    const list = await getAllItems('orders');
    const tbody = document.getElementById('orderList');
    tbody.innerHTML = list.map(o => `
        <tr class="fade-in">
            <td>
                <div style="font-weight:600;">${o.deliveryDate}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${o.deliveryTime}</div>
            </td>
            <td>
                <div style="font-weight:600;">${o.customerName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${o.customerPhone}</div>
            </td>
            <td><div style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${o.details}</div></td>
            <td><div style="font-weight:600;">₹ ${o.total}</div></td>
            <td><div style="font-weight:700; color: var(--danger);">₹ ${o.balance}</div></td>
            <td><span class="badge ${getStatusBadge(o.status)}">${o.status.toUpperCase()}</span></td>
            <td style="text-align: right;">
                ${o.status === 'delivered' ?
            `<span style="font-weight:bold; color:var(--success); margin-right:10px;"><i class="fas fa-check-circle"></i> Completed</span>`
            :
            `<select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)" style="border-color: var(--primary); color: var(--primary);">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>`
        }
                <button class="btn btn-sm btn-primary" onclick="window.printOrder(${o.id}); event.stopPropagation();" title="Print Receipt">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.deleteOrder(${o.id}); event.stopPropagation();" title="Delete Order" style="margin-left: 5px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    if (status === 'pending') return 'badge-warning';
    if (status === 'ready') return 'badge-info';
    if (status === 'delivered') return 'badge-success';
    return 'badge-danger';
}

// Stores the ID of the order currently being delivered
let currentDeliveryOrderId = null;

async function updateOrderStatus(id, newStatus) {
    if (newStatus === 'delivered') {
        currentDeliveryOrderId = id;
        const order = await getItem('orders', id);

        // Populate Modal
        document.getElementById('deliveryOrderDetails').innerHTML = `
            <div class="flex justify-between mb-5"><span>Customer:</span> <strong>${order.customerName}</strong></div>
            <div class="flex justify-between mb-5"><span>Total:</span> <strong>₹${order.total}</strong></div>
            <div class="flex justify-between"><span>Balance:</span> <strong style="color: ${order.balance > 0 ? 'var(--danger)' : 'var(--success)'}">₹${order.balance}</strong></div>
        `;

        document.getElementById('deliveryPendingAmount').value = `₹ ${order.balance}`;
        document.getElementById('deliveryCollectionAmount').value = order.balance; // Default to full amount

        // Show/Hide Payment Section based on balance
        const paySec = document.getElementById('paymentSection');
        if (order.balance > 0) {
            paySec.style.display = 'block';
            // Reset collection amount to balance logic handled above
        } else {
            paySec.style.display = 'none';
        }

        openModal('deliveryModal');
        // Reset select to previous status until confirmed? 
        // Actually, the select change event already fired. We might need to revert if they cancel.
        // But for UI simplicity, let's just leave it or handle cancellation.
        // Ideally we should have opened modal *before* changing, but onchange fires after.
        // We can just re-render orders to reset if they close modal without confirming.
        return;
    }

    // specific status update for non-delivered statuses
    const order = await getItem('orders', id);
    order.status = newStatus;
    await updateItem('orders', order);
    showToast(`Order status updated to ${newStatus}`, 'success');
    renderOrders();
}

async function processDelivery() {
    if (!currentDeliveryOrderId) return;

    const order = await getItem('orders', currentDeliveryOrderId);
    const collected = parseFloat(document.getElementById('deliveryCollectionAmount').value) || 0;
    const mode = document.getElementById('deliveryPaymentMode').value;
    const shouldPrint = document.getElementById('deliveryPrintReceipt').checked;

    // Process Payment if applicable
    if (order.balance > 0 && document.getElementById('paymentSection').style.display !== 'none') {
        if (collected > 0) {
            order.advance = (parseFloat(order.advance) || 0) + collected;
            order.balance = order.total - order.advance;
            // Here we could record a specific transaction/invoice for this payment?
            // For now just updating order.
        }
    }

    order.status = 'delivered';
    order.balance = Math.max(0, order.balance); // Ensure non-negative

    await updateItem('orders', order);

    // Check if fully paid or warn?
    if (order.balance > 0) {
        showToast(`Order delivered with ₹${order.balance} still pending`, 'warning');
    } else {
        showToast('Order delivered and fully paid', 'success');
    }

    closeModal('deliveryModal');
    renderOrders();

    if (shouldPrint) {
        printOrder(currentDeliveryOrderId);
    }

    currentDeliveryOrderId = null;
}

async function printOrder(id) {
    try {
        console.log('Printing order:', id);
        const order = await getItem('orders', id);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }

        // Get current user for staff name
        const session = JSON.parse(localStorage.getItem('userSession')) || { name: 'Admin' };

        // Convert order object to invoice-like object for printer
        const mockInvoice = {
            invoiceNumber: 'ORD-' + id,
            dateTime: order.createdAt || new Date().toISOString(),
            customerName: order.customerName || 'Guest',
            customerPhone: order.customerPhone || '',
            staffName: session.name, // Added staffName to prevent error
            items: [
                {
                    name: "Custom Order: " + order.details,
                    qty: 1,
                    price: parseFloat(order.total) || 0
                }
            ],
            subtotal: parseFloat(order.total) || 0,
            discount: 0,
            netTotal: parseFloat(order.total) || 0,
            paymentMode: order.advance >= order.total ? 'Paid' : (order.advance > 0 ? `Adv: ₹${order.advance}` : 'Pending')
        };

        await preparePrint(mockInvoice);
    } catch (error) {
        console.error('Print failed:', error);
        showToast('Printing failed', 'danger');
    }
}

function openOrderModal() {
    document.getElementById('orderForm').reset();
    document.getElementById('orderBalance').textContent = '₹ 0';
    openModal('orderModal');
}

function calcBalance() {
    const total = parseFloat(document.getElementById('orderTotal').value) || 0;
    const advance = parseFloat(document.getElementById('orderAdvance').value) || 0;
    document.getElementById('orderBalance').textContent = `₹ ${total - advance}`;
}

window.loadOrders = loadOrders;
window.openOrderModal = openOrderModal;
window.calcBalance = calcBalance;
window.updateOrderStatus = updateOrderStatus;
window.printOrder = printOrder;

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'orderForm') {
        e.preventDefault();
        const total = parseFloat(document.getElementById('orderTotal').value);
        const advance = parseFloat(document.getElementById('orderAdvance').value);
        const order = {
            deliveryDate: document.getElementById('orderDate').value,
            deliveryTime: document.getElementById('orderTime').value,
            customerName: document.getElementById('orderCustName').value,
            customerPhone: document.getElementById('orderCustPhone').value,
            details: document.getElementById('orderDetails').value,
            total,
            advance,
            balance: total - advance,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        await addItem('orders', order);
        showToast('Order confirmed!', 'success');
        closeModal('orderModal');
        renderOrders();
    }
});

// Notification System
let notifiedOrders = new Set();
const NOTIFICATION_SOUND = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple beep/bell

async function checkDeliveryNotifications() {
    const orders = await getAllItems('orders');
    const now = new Date();

    orders.forEach(o => {
        if (o.status !== 'pending' && o.status !== 'ready') return;

        const deliveryDate = new Date(o.deliveryDate + 'T' + o.deliveryTime);
        const diffMs = deliveryDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        // Notify if within 10 minutes (and not already notified)
        if (diffMins <= 10 && diffMins >= 0 && !notifiedOrders.has(o.id)) {
            // Popup Notification
            document.getElementById('notificationMessage').innerHTML = `
                <strong>${o.customerName}</strong><br>
                ${o.details}<br><br>
                Due in <span style="color:var(--danger); font-weight:bold;">${diffMins} mins</span>
            `;
            openModal('notificationModal');

            try {
                NOTIFICATION_SOUND.currentTime = 0;
                NOTIFICATION_SOUND.loop = true; // Loop until acknowledged
                NOTIFICATION_SOUND.play().catch(e => console.log('Audio play failed', e));
            } catch (err) { }

            // Send browser notification if allowed
            if (Notification.permission === "granted") {
                new Notification("Order Due Soon!", {
                    body: `Order for ${o.customerName} is due in ${diffMins} mins!`,
                    icon: 'icon.png'
                });
            }

            notifiedOrders.add(o.id);
        }
    });
}

// Check every minute
setInterval(checkDeliveryNotifications, 60000);

// Request notification permission on load
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}
