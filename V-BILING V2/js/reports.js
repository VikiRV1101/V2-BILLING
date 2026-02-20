async function loadReports() {
    const reportsModule = document.getElementById('reportsModule');
    reportsModule.innerHTML = `
        <div class="mb-40">
            <h2 style="font-size: 1.8rem; margin-bottom: 10px;">Bakery Insights</h2>
            <p class="text-muted">Select a report below to analyze your business performance</p>
        </div>

        <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom: 40px;">
            <div class="card p-25">
                <div class="flex align-center gap-15 mb-25">
                    <div class="stat-icon-wrapper" style="background: rgba(32, 156, 238, 0.1); color: var(--info); width: 50px; height: 50px; border-radius: 12px; font-size: 1.2rem;">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 1.1rem; margin:0;">Sales & Revenue</h3>
                        <p class="text-muted" style="font-size: 0.8rem; margin:0;">Track transactions and growth</p>
                    </div>
                </div>
                <div class="report-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="report-btn" onclick="generateReport('daily')">
                        <i class="fas fa-calendar-day"></i>
                        <span>Daily Sales</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('weekly')">
                        <i class="fas fa-calendar-week"></i>
                        <span>Weekly Sales</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('monthly')">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Monthly Sales</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('product')">
                        <i class="fas fa-box-open"></i>
                        <span>Product-wise</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('orders')">
                        <i class="fas fa-birthday-cake"></i>
                        <span>Custom Orders</span>
                    </div>
                </div>
            </div>

            <div class="card p-25">
                <div class="flex align-center gap-15 mb-25">
                    <div class="stat-icon-wrapper" style="background: rgba(255, 140, 0, 0.1); color: var(--primary); width: 50px; height: 50px; border-radius: 12px; font-size: 1.2rem;">
                        <i class="fas fa-cog"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 1.1rem; margin:0;">Staff & Inventory</h3>
                        <p class="text-muted" style="font-size: 0.8rem; margin:0;">Operational health metrics</p>
                    </div>
                </div>
                <div class="report-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="report-btn" onclick="generateReport('stock')">
                        <i class="fas fa-warehouse"></i>
                        <span>Stock Report</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('profit')">
                        <i class="fas fa-coins"></i>
                        <span>P&L Estimates</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('staff')">
                        <i class="fas fa-user-clock"></i>
                        <span>Staff Performance</span>
                    </div>
                    <div class="report-btn" onclick="generateReport('payroll')">
                        <i class="fas fa-money-check-alt"></i>
                        <span>Monthly Payroll</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="reportResult" class="card fade-in" style="display:none; border-top: 4px solid var(--primary);">
            <div class="flex justify-between align-center p-25 border-bottom">
                <div>
                    <h2 id="reportHeader" style="font-size: 1.5rem; color: var(--text-color); margin:0;">Report View</h2>
                    <p id="reportSubheader" class="text-muted" style="font-size: 0.9rem; margin:5px 0 0 0;">Generated just now</p>
                </div>
                <div class="flex gap-15">
                    <button class="btn btn-outline" onclick="exportReportCSV()" style="border-radius: 12px;">
                        <i class="fas fa-file-csv"></i> Export CSV
                    </button>
                </div>
            </div>
            <div class="table-container p-15" id="reportTableContainer"></div>
        </div>

        <style>
            .report-grid .report-btn {
                background: var(--bg-color);
                border: 1px solid var(--border-color);
                padding: 20px 15px;
                border-radius: 15px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
                text-align: center;
            }
            .report-grid .report-btn:hover {
                border-color: var(--primary);
                background: var(--surface-color);
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            }
            .report-grid .report-btn i {
                font-size: 1.2rem;
                color: var(--primary);
            }
            .report-grid .report-btn span {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--text-color);
            }
            
            #reportTableContainer table {
                border-collapse: separate;
                border-spacing: 0 8px;
            }
            #reportTableContainer tr {
                box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                border-radius: 10px;
            }
            #reportTableContainer td, #reportTableContainer th {
                padding: 15px 20px;
                border: none;
            }
            #reportTableContainer th {
                color: var(--text-muted);
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            #reportTableContainer td {
                background: var(--surface-color);
            }
            #reportTableContainer td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
            #reportTableContainer td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        </style>
    `;
}

let lastGeneratedReport = [];
let lastReportTitle = '';

async function generateReport(type) {
    localStorage.setItem('lastReportType', type);
    const invoices = await getAllItems('invoices');
    const expenses = await getAllItems('expenses');
    const products = await getAllItems('products');
    const attendance = await getAllItems('attendance');
    const orders = await getAllItems('orders');
    const resultDiv = document.getElementById('reportResult');
    const container = document.getElementById('reportTableContainer');
    const header = document.getElementById('reportHeader');
    const subheader = document.getElementById('reportSubheader');

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });

    let data = [];
    let html = '';

    const todayObj = new Date();
    const today = todayObj.toISOString().split('T')[0];
    const currentMonth = todayObj.getMonth();
    const currentYear = todayObj.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    switch (type) {
        case 'daily':
            header.textContent = 'Daily Sales Report';
            subheader.textContent = `For Date: ${today}`;
            data = invoices.filter(i => i.dateTime.split('T')[0] === today);
            html = generateSalesTable(data);
            break;

        case 'weekly':
            header.textContent = 'Weekly Sales Report';
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            subheader.textContent = `From ${sevenDaysAgo.toLocaleDateString()} to ${todayObj.toLocaleDateString()}`;
            data = invoices.filter(i => new Date(i.dateTime) >= sevenDaysAgo);
            html = generateSalesTable(data);
            break;

        case 'monthly':
            header.textContent = 'Monthly Sales Report';
            subheader.textContent = `${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            data = invoices.filter(i => {
                const d = new Date(i.dateTime);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            html = generateSalesTable(data);
            break;

        case 'product':
            header.textContent = 'Product Performance';
            subheader.textContent = 'Total sales volume and revenue per product (All Time)';
            const stats = {};
            invoices.forEach(inv => {
                inv.items.forEach(item => {
                    if (!stats[item.name]) stats[item.name] = { qty: 0, revenue: 0 };
                    const q = parseFloat(item.qty) || 0;
                    const p = parseFloat(item.price) || 0;
                    stats[item.name].qty += q;
                    stats[item.name].revenue += (q * p);
                });
            });
            data = Object.keys(stats).map(name => ({
                'Product Name': name,
                'Quantity Sold': stats[name].qty,
                'Total Revenue': stats[name].revenue.toFixed(2)
            })).sort((a, b) => b['Total Revenue'] - a['Total Revenue']);

            html = `<table><thead><tr><th>Product Name</th><th>Qty Sold</th><th style="text-align: right;">Total Revenue</th></tr></thead><tbody>`;
            html += data.map(d => `<tr><td><div style="font-weight:600;">${d['Product Name']}</div></td><td><span class="badge badge-info">${d['Quantity Sold']}</span></td><td style="text-align: right;"><div style="font-weight:700; color: var(--primary);">₹ ${d['Total Revenue']}</div></td></tr>`).join('');
            html += `</tbody></table>`;
            break;

        case 'orders':
            header.textContent = 'Custom Orders Report';
            subheader.textContent = 'All custom cake and event orders';
            data = orders.map(o => ({
                'Delivery': o.deliveryDate,
                'Customer': o.customerName,
                'Details': o.details,
                'Status': o.status,
                'Total': o.total,
                'Balance': o.balance
            }));

            // Calculate totals
            const totalOrdersVal = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            const totalPendingVal = orders.reduce((sum, o) => sum + (parseFloat(o.balance) || 0), 0);

            html = `<div style="display:flex; gap:20px; margin-bottom:20px;">
                        <div class="card p-15" style="flex:1; background:var(--surface-color); text-align:center;">
                            <h4 style="margin:0 0 5px 0;">Total Orders Value</h4>
                            <span style="font-size:1.5rem; font-weight:700; color:var(--primary);">₹ ${totalOrdersVal}</span>
                        </div>
                        <div class="card p-15" style="flex:1; background:var(--surface-color); text-align:center;">
                            <h4 style="margin:0 0 5px 0;">Total Balance Pending</h4>
                            <span style="font-size:1.5rem; font-weight:700; color:var(--danger);">₹ ${totalPendingVal}</span>
                        </div>
                    </div>`;

            html += `<table><thead><tr><th>Delivery Date</th><th>Customer</th><th>Details</th><th>Status</th><th style="text-align: right;">Total</th><th style="text-align: right;">Balance</th></tr></thead><tbody>`;
            html += data.map(d => `<tr>
                <td>${d['Delivery']}</td>
                <td><div style="font-weight:600;">${d['Customer']}</div></td>
                <td><div style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${d['Details']}">${d['Details']}</div></td>
                <td><span class="badge ${d['Status'] === 'delivered' ? 'badge-success' : d['Status'] === 'cancelled' ? 'badge-danger' : 'badge-warning'}">${d['Status'].toUpperCase()}</span></td>
                <td style="text-align: right; font-weight:600;">₹ ${d['Total']}</td>
                <td style="text-align: right; color:var(--danger); font-weight:600;">₹ ${d['Balance']}</td>
            </tr>`).join('');
            html += `</tbody></table>`;
            break;

        case 'staff':
            header.textContent = 'Staff Performance Log';
            subheader.textContent = 'Current month attendance and activity summary';
            const usersList = await getAllItems('users');
            data = usersList.filter(u => u.username !== 'viki').map(u => {
                const count = attendance.filter(a => a.userId === u.id && new Date(a.date).getMonth() === currentMonth).length;
                return {
                    'Staff Member': u.name,
                    'Username': u.username,
                    'Days Present': count,
                    'Status': u.status || 'active'
                };
            });
            html = `<table><thead><tr><th>Staff Member</th><th>Username</th><th>Days Present</th><th style="text-align: right;">Status</th></tr></thead><tbody>`;
            html += data.map(d => `<tr><td><div style="font-weight:600;">${d['Staff Member']}</div></td><td>@${d['Username']}</td><td><span class="badge badge-primary">${d['Days Present']} Days</span></td><td style="text-align: right;"><span class="badge ${d.Status === 'disabled' ? 'badge-danger' : 'badge-success'}">${d.Status.toUpperCase()}</span></td></tr>`).join('');
            html += `</tbody></table>`;
            break;

        case 'payroll':
            header.textContent = 'Monthly Payroll Report';
            subheader.textContent = `Prorated for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            const users = await getAllItems('users');
            const advances = await getAllItems('staff_advances');

            data = users.filter(u => u.username !== 'viki').map(u => {
                const presentDays = attendance.filter(a =>
                    a.userId === u.id &&
                    new Date(a.date).getMonth() === currentMonth &&
                    new Date(a.date).getFullYear() === currentYear
                ).length;

                const staffAdv = advances.filter(a => a.staffId === u.id);
                const pendingAdv = staffAdv.reduce((sum, a) => sum + (a.type === 'give' ? a.amount : -a.amount), 0);

                const baseSalary = u.salary || 0;
                const prorated = (baseSalary / daysInMonth) * presentDays;
                const net = Math.max(0, prorated - pendingAdv);

                return {
                    'Staff Name': u.name,
                    'Base Salary': baseSalary,
                    'Attendance': `${presentDays}/${daysInMonth}`,
                    'Prorated': prorated.toFixed(2),
                    'Advance': pendingAdv,
                    'Net Payout': net.toFixed(0)
                };
            });

            html = `<table><thead><tr><th>Staff Name</th><th>Base Sal.</th><th>Attendance</th><th>Prorated</th><th>Advance</th><th style="text-align: right;">Net Payout</th></tr></thead><tbody>`;
            html += data.map(d => `<tr><td><div style="font-weight:600;">${d['Staff Name']}</div></td><td>₹ ${d['Base Salary']}</td><td><span class="badge badge-info">${d['Attendance']}</span></td><td>₹ ${d['Prorated']}</td><td><span class="text-danger">₹ ${d['Advance']}</span></td><td style="text-align: right;"><div style="font-weight:700; color: var(--primary);">₹ ${d['Net Payout']}</div></td></tr>`).join('');
            html += `</tbody></table>`;
            break;

        case 'profit':
            header.textContent = 'Profit & Loss Summary';
            subheader.textContent = 'Detailed breakdown of revenue, costs, and expenses';

            const totalRevenue = invoices.reduce((s, i) => s + i.netTotal, 0);
            const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

            // Calculate COGS (Cost of Goods Sold)
            let totalCOGS = 0;
            invoices.forEach(inv => {
                inv.items.forEach(item => {
                    const product = products.find(p => p.name === item.name);
                    const cost = product ? (product.purchasePrice || 0) : 0;
                    totalCOGS += (cost * (parseFloat(item.qty) || 0));
                });
            });

            const grossProfit = totalRevenue - totalCOGS;
            const netProfit = grossProfit - totalExpenses;

            data = [
                { Category: 'Total Revenue (Sales)', Amount: totalRevenue, Color: 'var(--info)' },
                { Category: 'Cost of Goods Sold (COGS)', Amount: -totalCOGS, Color: 'var(--danger)' },
                { Category: 'Gross Profit', Amount: grossProfit, Color: 'var(--success)' },
                { Category: 'Total Expenses', Amount: -totalExpenses, Color: 'var(--danger)' },
                { Category: 'Net Estimated Profit', Amount: netProfit, Color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }
            ];

            html = `<table><thead><tr><th>Category</th><th style="text-align: right;">Amount (INR)</th></tr></thead><tbody>`;
            html += data.map(d => {
                const isPositive = d.Amount >= 0;
                const sign = isPositive ? '' : '- ';
                const absAmount = Math.abs(d.Amount).toFixed(2);
                return `<tr>
                    <td><div style="font-weight:600;">${d.Category}</div></td>
                    <td style="text-align: right;">
                        <div style="font-weight:700; color: ${d.Color}">${isPositive ? '₹ ' : '- ₹ '}${absAmount}</div>
                    </td>
                </tr>`;
            }).join('');
            html += `</tbody></table>`;
            break;

        case 'stock':
            header.textContent = 'Inventory Stock Report';
            subheader.textContent = 'Current items in bakery status';
            data = products.map(p => ({ Name: p.name, Stock: p.stock, Status: p.stock <= p.lowStock ? 'Low' : 'Healthy' }));
            html = `<table><thead><tr><th>Bakery Item</th><th>Current Qty</th><th>Stock Status</th></tr></thead><tbody>`;
            html += data.map(d => `<tr><td><div style="font-weight:600;">${d.Name}</div></td><td><div style="font-weight:600;">${d.Stock}</div></td><td><span class="badge ${d.Status === 'Low' ? 'badge-danger' : 'badge-success'}">${d.Status.toUpperCase()}</span></td></tr>`).join('');
            html += `</tbody></table>`;
            break;
    }

    container.innerHTML = html || '<div class="p-40 text-center"><p class="text-muted">No data found for this period.</p></div>';
    lastGeneratedReport = data;
    lastReportTitle = header.textContent;
}

function generateSalesTable(data) {
    if (!data.length) return '';
    // Sort by latest first
    data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    let html = `<table><thead><tr><th>INV #</th><th>Date/Time</th><th>Customer</th><th>Total Bill</th><th>Payment</th><th style="text-align: right;">Actions</th></tr></thead><tbody>`;
    html += data.map(i => `
        <tr>
            <td><span class="badge badge-info">${i.invoiceNumber}</span></td>
            <td>${new Date(i.dateTime).toLocaleDateString()} ${new Date(i.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${i.customerName || 'Walk-in'}</td>
            <td><div style="font-weight:700;">₹ ${i.netTotal.toFixed(2)}</div></td>
            <td><span class="badge badge-primary">${i.paymentMode}</span></td>
            <td style="text-align: right;">
                <div class="flex gap-10 justify-end">
                    <button class="btn btn-sm btn-outline" onclick="reprintOrder(${i.id})" title="Reprint Receipt">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editOrder(${i.id})" title="Edit Bill (Reload to Cart)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="deleteOrder(${i.id})" title="Delete Bill">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    html += `</tbody></table>`;
    return html;
}

async function reprintOrder(id) {
    const invoice = await getItem('invoices', id);
    if (invoice) {
        preparePrint(invoice);
        showToast('Reprinting receipt...', 'info');
    }
}

async function deleteOrder(id) {
    if (confirm('Are you sure you want to PERMANENTLY DELETE this bill? This action cannot be undone.')) {
        try {
            console.log(`Attempting to delete order with ID: ${id}`);
            const numericId = Number(id);

            // 1. Fetch the invoice to get items
            const invoice = await getItem('invoices', numericId);
            if (!invoice) {
                throw new Error('Invoice not found');
            }

            // 2. Restore Stock
            if (invoice.items && invoice.items.length > 0) {
                for (const item of invoice.items) {
                    if (item.id) {
                        try {
                            const product = await getItem('products', item.id);
                            if (product) {
                                product.stock += parseFloat(item.qty);
                                await updateItem('products', product);
                                console.log(`Restored stock for ${product.name}: +${item.qty}`);
                            }
                        } catch (err) {
                            console.warn(`Could not restore stock for item ${item.name} (${item.id}):`, err);
                        }
                    }
                }
            }

            // 3. Delete the invoice
            await deleteItem('invoices', numericId);
            showToast('Bill deleted & stock restored', 'success');

            // Small delay to ensure DB transaction commits before reading
            setTimeout(() => {
                const type = localStorage.getItem('lastReportType') || 'daily';
                generateReport(type);
            }, 200);
        } catch (error) {
            console.error('Delete failed:', error);
            showToast('Failed to delete bill: ' + error.message, 'danger');
        }
    }
}

async function editOrder(id) {
    if (confirm('Edit this bill? \n\n1. Current cart will be cleared.\n2. This bill items will be loaded.\n3. This bill record will be DELETED to prevent duplicates.\n\nProceed?')) {
        const invoice = await getItem('invoices', id);
        if (invoice) {
            // Load to cart
            if (window.loadCartItems) {
                window.loadCartItems(invoice.items);

                // Switch to billing tab
                document.querySelectorAll('.module').forEach(m => m.style.display = 'none');
                document.getElementById('billingModule').style.display = 'block';
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelector(`[onclick="showModule('billingModule')"]`).classList.add('active');

                // Delete old invoice
                await deleteItem('invoices', id);
                showToast('Bill loaded for editing. Old record removed.', 'info');
            } else {
                showToast('Error: Billing module not ready', 'danger');
            }
        }
    }
}

window.reprintOrder = reprintOrder;
window.deleteOrder = deleteOrder;
window.editOrder = editOrder;

function exportReportCSV() {
    if (!lastGeneratedReport.length) return showToast('No data to export', 'warning');
    let csv = Object.keys(lastGeneratedReport[0]).join(',') + '\n';
    lastGeneratedReport.forEach(row => {
        csv += Object.values(row).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lastReportTitle.replace(/ /g, '_')}.csv`;
    a.click();
}

window.loadReports = loadReports;
window.generateReport = generateReport;
window.exportReportCSV = exportReportCSV;
