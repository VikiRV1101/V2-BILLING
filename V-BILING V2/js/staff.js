async function loadStaff() {
    const staffModule = document.getElementById('staffModule');
    staffModule.innerHTML = `
        <div class="card">
            <div class="flex justify-between align-center mb-30">
                <div>
                    <h2 style="font-size: 1.5rem;">Staff & Payroll</h2>
                    <p class="text-muted" style="font-size: 0.9rem;">Manage records, advances, and detailed individual reports</p>
                </div>
                <button class="btn btn-primary" onclick="openStaffModal()">
                    <i class="fas fa-user-plus"></i> Add Staff
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Identity & Contact</th>
                            <th>Role / @User</th>
                            <th>Salary</th>
                            <th>Advance</th>
                            <th>Prorated</th>
                            <th style="text-align: right;">Reports & Actions</th>
                        </tr>
                    </thead>
                    <tbody id="staffList"></tbody>
                </table>
            </div>
        </div>

        <!-- Individual Report Modal -->
        <div id="individualReportModal" class="modal">
            <div class="modal-content" style="max-width: 950px; padding: 0; overflow: hidden; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <!-- Modal Header -->
                <div class="flex justify-between align-center" style="padding: 25px 35px; background: linear-gradient(135deg, var(--primary), var(--secondary));">
                    <div>
                        <h2 id="repStaffName" style="font-size: 1.6rem; margin: 0; color: #fff; font-weight: 700;">Staff Report</h2>
                        <p id="repStaffMeta" style="margin: 5px 0 0 0; opacity: 0.95; font-size: 0.88rem; color: rgba(255,255,255,0.9);">Staff ID: #001 | Role: Baker</p>
                    </div>
                    <div class="flex gap-10">
                        <button class="btn btn-sm" onclick="printStaffReport()" style="background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 8px 16px;">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button class="btn btn-sm" onclick="closeModal('individualReportModal')" style="background: rgba(0,0,0,0.15); color: #fff; border: none; padding: 8px 12px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Body -->
                <div style="padding: 30px 35px 35px 35px; max-height: 65vh; overflow-y: auto; background: var(--bg-color);">
                    <!-- Summary Cards -->
                    <div class="grid grid-3" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 35px;">
                        <div class="card" style="padding: 22px; text-align: center; border-radius: 14px; background: var(--surface-color);">
                            <i class="fas fa-calendar-check" style="font-size: 2rem; color: var(--primary); margin-bottom: 12px;"></i>
                            <div class="text-muted" style="font-size: 0.78rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Days Present</div>
                            <h3 id="repDays" style="font-size: 1.6rem; margin: 0; font-weight: 700; color: var(--text-color);">0/30</h3>
                        </div>
                        <div class="card" style="padding: 22px; text-align: center; border-radius: 14px; background: var(--surface-color);">
                            <i class="fas fa-hand-holding-usd" style="font-size: 2rem; color: var(--danger); margin-bottom: 12px;"></i>
                            <div class="text-muted" style="font-size: 0.78rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Pending Advance</div>
                            <h3 id="repAdvance" style="font-size: 1.6rem; margin: 0; font-weight: 700; color: var(--danger);">₹ 0</h3>
                        </div>
                        <div class="card" style="padding: 22px; text-align: center; border-radius: 14px; background: var(--surface-color);">
                            <i class="fas fa-money-bill-wave" style="font-size: 2rem; color: var(--success); margin-bottom: 12px;"></i>
                            <div class="text-muted" style="font-size: 0.78rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Current Payout</div>
                            <h3 id="repPayout" style="font-size: 1.6rem; margin: 0; font-weight: 700; color: var(--success);">₹ 0</h3>
                        </div>
                    </div>

                    <!-- History Tables -->
                    <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                        <!-- Attendance History -->
                        <div>
                            <h4 style="font-size: 1.05rem; margin: 0 0 16px 0; padding-left: 12px; border-left: 4px solid var(--primary); color: var(--text-color); font-weight: 600;">Attendance History</h4>
                            <div class="card" style="border-radius: 12px; overflow: hidden; background: var(--surface-color); border: 1px solid var(--border-color);">
                                <div class="table-container" style="max-height: 240px; overflow-y: auto;">
                                    <table style="font-size: 0.85rem; margin: 0;">
                                        <thead style="position: sticky; top: 0; background: var(--surface-color); z-index: 1;">
                                            <tr>
                                                <th style="padding: 12px 15px;">Date</th>
                                                <th style="padding: 12px 15px;">In</th>
                                                <th style="padding: 12px 15px;">Out</th>
                                            </tr>
                                        </thead>
                                        <tbody id="repAttendList"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Advance Ledger -->
                        <div>
                            <h4 style="font-size: 1.05rem; margin: 0 0 16px 0; padding-left: 12px; border-left: 4px solid var(--danger); color: var(--text-color); font-weight: 600;">Advance Ledger</h4>
                            <div class="card" style="border-radius: 12px; overflow: hidden; background: var(--surface-color); border: 1px solid var(--border-color);">
                                <div class="table-container" style="max-height: 240px; overflow-y: auto;">
                                    <table style="font-size: 0.85rem; margin: 0;">
                                        <thead style="position: sticky; top: 0; background: var(--surface-color); z-index: 1;">
                                            <tr>
                                                <th style="padding: 12px 15px;">Date</th>
                                                <th style="padding: 12px 15px;">Type</th>
                                                <th style="padding: 12px 15px;">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody id="repAdvList"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Advance Management Modal -->
        <div id="advanceModal" class="modal">
            <div class="modal-content" style="max-width: 400px;">
                <div class="flex justify-between align-center mb-20">
                    <h2 id="advModalTitle" style="font-size: 1.3rem;">Manage Advance</h2>
                    <button class="btn btn-sm" onclick="closeModal('advanceModal')" style="background: var(--bg-color);"><i class="fas fa-times"></i></button>
                </div>
                <div id="advStaffName" class="mb-20 font-bold" style="color: var(--primary);"></div>
                <form id="advanceForm">
                    <input type="hidden" id="advStaffId">
                    <div class="form-group">
                        <label>Transaction Type</label>
                        <select id="advType" class="form-control">
                            <option value="give">Give Advance (Loan)</option>
                            <option value="return">Return Advance (Pay Back)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" id="advAmount" required class="form-control" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <input type="text" id="advNotes" class="form-control" placeholder="e.g. For medical urgent">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block mt-20">Confirm Transaction</button>
                </form>
            </div>
        </div>

        <!-- Staff Registration Modal -->
        <div id="staffModal" class="modal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="flex justify-between align-center mb-30">
                    <h2 style="font-size: 1.5rem; color: var(--primary);">Register New Staff</h2>
                    <button class="btn btn-sm" onclick="closeModal('staffModal')" style="background: var(--bg-color);"><i class="fas fa-times"></i></button>
                </div>
                <form id="staffForm">
                    <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div class="form-group">
                            <label>Full Name <span class="text-danger">*</span></label>
                            <input type="text" id="staffName" required placeholder="Employee's full name">
                        </div>
                        <div class="form-group">
                            <label>WhatsApp Number <span class="text-danger">*</span></label>
                            <input type="text" id="staffWhatsApp" required placeholder="+91 ...">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Aadhar Card Number <span class="text-danger">*</span></label>
                        <input type="text" id="staffAadhar" required placeholder="12-digit Aadhar number">
                    </div>
                    <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div class="form-group">
                            <label>Username (for login) <span class="text-danger">*</span></label>
                            <input type="text" id="staffUser" required placeholder="Choose a username">
                        </div>
                        <div class="form-group">
                            <label>Password <span class="text-danger">*</span></label>
                            <input type="password" id="staffPass" required placeholder="Assign a password">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Base Monthly Salary (₹)</label>
                        <input type="number" id="staffSalary" required value="10000">
                    </div>
                    <div class="flex gap-10 mt-30">
                        <button type="submit" class="btn btn-primary btn-block">Complete Registration</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    renderStaff();
}

async function renderStaff() {
    try {
        const list = await getAllItems('users');
        const advances = await getAllItems('staff_advances');
        const attendance = await getAllItems('attendance');
        const tbody = document.getElementById('staffList');

        if (!tbody) {
            console.error('staffList tbody element not found!');
            return;
        }

        const filtered = list.filter(u => u.username !== 'viki');
        console.log('Total users:', list.length, 'Filtered staff:', filtered.length);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        tbody.innerHTML = (await Promise.all(filtered.map(async u => {
            const staffAdv = advances.filter(a => a.staffId === u.id);
            const pendingAdv = staffAdv.reduce((sum, a) => sum + (a.type === 'give' ? a.amount : -a.amount), 0);

            const presentDays = attendance.filter(a =>
                a.userId === u.id &&
                new Date(a.date).getMonth() === currentMonth &&
                new Date(a.date).getFullYear() === currentYear
            ).length;

            const baseSalary = u.salary || 0;
            const proratedSalary = (baseSalary / daysInMonth) * presentDays;
            const netPayout = Math.max(0, proratedSalary - pendingAdv);

            return `
            <tr class="fade-in">
                <td><div style="font-weight:600;">${u.name}</div><span class="badge ${u.status === 'disabled' ? 'badge-danger' : 'badge-success'}">${(u.status || 'active').toUpperCase()}</span></td>
                <td>
                    <div style="font-size: 0.85rem;"><i class="fab fa-whatsapp text-success"></i> ${u.whatsapp || '-'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-id-card"></i> ${u.aadhar || '-'}</div>
                </td>
                <td>
                    <span class="badge badge-info">${u.role.toUpperCase()}</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">@${u.username}</div>
                </td>
                <td><div style="font-weight:600;">₹ ${baseSalary}</div></td>
                <td><div style="font-weight:700; color: ${pendingAdv > 0 ? 'var(--danger)' : 'var(--success)'};">₹ ${pendingAdv}</div></td>
                <td><div style="font-weight:800; color: var(--primary);">₹ ${netPayout.toFixed(0)}</div></td>
                <td style="text-align: right;">
                    <div class="flex gap-5 justify-end">
                        <button class="btn btn-sm btn-primary" onclick="viewStaffReport(${u.id})" title="Details Report">
                            <i class="fas fa-file-invoice"></i> REPORT
                        </button>
                        <button class="btn btn-sm btn-success" onclick="sendWhatsAppReport(${u.id})" title="Send Report via WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="openAdvModal(${u.id}, '${u.name}')" title="Manage Advance">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="toggleStaffStatus(${u.id}, '${u.status}')">
                            <i class="fas ${u.status === 'disabled' ? 'fa-check-circle' : 'fa-ban'}"></i>
                        </button>
                        <button class="btn btn-sm btn-outline text-danger" onclick="deleteStaff(${u.id}, '${u.name}')" title="Delete Staff">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }))).join('');

        console.log('Staff table updated with', filtered.length, 'staff members');
    } catch (error) {
        console.error('Error rendering staff:', error);
        showToast('Error loading staff list', 'danger');
    }
}

async function deleteStaff(id, name) {
    if (confirm(`Are you sure you want to delete staff member "${name}"? This action cannot be undone.`)) {
        try {
            await deleteItem('users', id);
            showToast(`Staff member "${name}" deleted.`, 'success');
            renderStaff();
        } catch (error) {
            console.error('Error deleting staff:', error);
            showToast('Error deleting staff member', 'danger');
        }
    }
}

async function viewStaffReport(id) {
    const u = await getItem('users', id);
    const advances = await getAllItems('staff_advances');
    const attendance = await getAllItems('attendance');

    const staffAdv = advances.filter(a => a.staffId === id).reverse();
    const pendingAdv = staffAdv.reduce((sum, a) => sum + (a.type === 'give' ? a.amount : -a.amount), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const staffAttend = attendance.filter(a => a.userId === id && new Date(a.date).getMonth() === currentMonth).reverse();
    const presentDays = staffAttend.length;

    const baseSalary = u.salary || 0;
    const proratedSalary = (baseSalary / daysInMonth) * presentDays;
    const netPayout = Math.max(0, proratedSalary - pendingAdv);

    document.getElementById('repStaffName').textContent = u.name;
    document.getElementById('repStaffMeta').textContent = `Identity: ${u.aadhar || '-'} | WhatsApp: ${u.whatsapp || '-'} | Base Sal: ₹${baseSalary}`;
    document.getElementById('repDays').innerHTML = `<span style="font-size: 2rem; color: var(--primary); font-weight: 800;">${presentDays}</span><span style="color: var(--text-muted);">/${daysInMonth}</span>`;
    document.getElementById('repAdvance').textContent = `₹ ${pendingAdv}`;
    document.getElementById('repPayout').textContent = `₹ ${netPayout.toFixed(0)}`;
    document.getElementById('repPayout').style.color = netPayout > 0 ? 'var(--success)' : 'var(--text-muted)';

    document.getElementById('repAttendList').innerHTML = staffAttend.map(a => `
        <tr style="margin-bottom: 5px;">
            <td>${a.date}</td>
            <td><span class="badge badge-success" style="font-weight:700;">${a.checkIn}</span></td>
            <td><span class="badge badge-primary" style="font-weight:700;">${a.checkOut || '--:--'}</span></td>
        </tr>
    `).join('');

    document.getElementById('repAdvList').innerHTML = staffAdv.map(a => `
        <tr>
            <td>${new Date(a.date).toLocaleDateString()}</td>
            <td><span class="badge ${a.type === 'give' ? 'badge-danger' : 'badge-success'}" style="font-weight:700;">${a.type.toUpperCase()}</span></td>
            <td><div style="font-weight: 700; color: ${a.type === 'give' ? 'var(--danger)' : 'var(--success)'}">₹ ${a.amount}</div></td>
        </tr>
    `).join('');


    openModal('individualReportModal');
}

async function sendWhatsAppReport(id) {
    try {
        console.log('Generating WhatsApp report for staff:', id);
        const u = await getItem('users', id);
        if (!u.whatsapp) {
            showToast('No WhatsApp number found for this staff!', 'warning');
            return;
        }

        const advances = await getAllItems('staff_advances');
        const attendance = await getAllItems('attendance');

        const staffAdv = advances.filter(a => a.staffId === id);
        const pendingAdv = staffAdv.reduce((sum, a) => sum + (a.type === 'give' ? a.amount : -a.amount), 0);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const staffAttend = attendance.filter(a => a.userId === id && new Date(a.date).getMonth() === currentMonth);
        const presentDays = staffAttend.length;

        const baseSalary = u.salary || 0;
        const proratedSalary = (baseSalary / daysInMonth) * presentDays;
        const netPayout = Math.max(0, proratedSalary - pendingAdv);

        // Fetch Shop Name
        const shopSettings = await getItem('settings', 'shopName');
        const shopNameStr = (shopSettings && shopSettings.value) ? shopSettings.value : 'V-BAKERY';

        const monthName = new Date().toLocaleString('default', { month: 'long' });

        const message = `*Salary Report - ${monthName} ${currentYear}*
*Employee:* ${u.name}
--------------------------------
*Base Salary:* ₹${baseSalary}
*Days Present:* ${presentDays}/${daysInMonth}
*Calculated Pay:* ₹${proratedSalary.toFixed(0)}
--------------------------------
*Pending Advance:* -₹${pendingAdv}
--------------------------------
*NET PAYOUT:* ₹${netPayout.toFixed(0)}
--------------------------------
*${shopNameStr}*`;

        console.log('Opening WhatsApp with message:', message);
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${u.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
        window.open(url, '_blank');

    } catch (error) {
        console.error('Error sending WhatsApp report:', error);
        showToast('Failed to generate WhatsApp report', 'danger');
    }
}

function printStaffReport() {
    const content = document.querySelector('#individualReportModal .modal-content').innerHTML;
    const printWin = window.open('', '', 'height=800,width=1000');
    printWin.document.write('<html><head><title>Staff Statement</title>');
    printWin.document.write('<link rel="stylesheet" href="css/style.css">');
    printWin.document.write('<style>body{background:#fff; color:#000;} .modal{display:block; position:static;} .btn, #individualReportModal .p-30{overflow:visible;} .bg-primary{color:#000 !important; background:#eee !important;}</style>');
    printWin.document.write('</head><body>');
    printWin.document.write(content);
    printWin.document.write('</body></html>');
    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 1000);
}

function openAdvModal(id, name) {
    document.getElementById('advStaffId').value = id;
    document.getElementById('advStaffName').textContent = name;
    document.getElementById('advanceForm').reset();
    openModal('advanceModal');
}

async function toggleStaffStatus(id, currentStatus) {
    const user = await getItem('users', id);
    user.status = currentStatus === 'disabled' ? 'active' : 'disabled';
    await updateItem('users', user);
    showToast(`Staff account ${user.status}`, 'info');
    renderStaff();
}

function openStaffModal() {
    console.log('openStaffModal called');
    const form = document.getElementById('staffForm');
    const modal = document.getElementById('staffModal');
    console.log('Form element:', form);
    console.log('Modal element:', modal);
    if (form) {
        form.reset();
    }
    if (modal) {
        openModal('staffModal');
    } else {
        console.error('staffModal element not found!');
        showToast('Error: Staff modal not initialized. Try reloading the page.', 'danger');
    }
}

window.loadStaff = loadStaff;
window.openStaffModal = openStaffModal;
window.renderStaff = renderStaff;
window.deleteStaff = deleteStaff;
window.openAdvModal = openAdvModal;
window.viewStaffReport = viewStaffReport;
window.sendWhatsAppReport = sendWhatsAppReport;
window.toggleStaffStatus = toggleStaffStatus;
window.deleteStaff = deleteStaff;
window.openStaffModal = openStaffModal;

document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'staffForm') {
        e.preventDefault();

        const username = document.getElementById('staffUser').value.trim();
        const name = document.getElementById('staffName').value.trim();

        // Validate username
        if (username === 'viki') {
            showToast('Username "viki" is reserved. Please choose a different username.', 'danger');
            return;
        }

        if (username.length < 3) {
            showToast('Username must be at least 3 characters long.', 'danger');
            return;
        }

        const staff = {
            name: name,
            whatsapp: document.getElementById('staffWhatsApp').value.trim(),
            aadhar: document.getElementById('staffAadhar').value.trim(),
            username: username,
            password: document.getElementById('staffPass').value,
            salary: parseFloat(document.getElementById('staffSalary').value),
            role: 'staff',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        try {
            await addItem('users', staff);
            showToast(`Staff member "${name}" registered successfully!`, 'success');
            closeModal('staffModal');
            renderStaff();
        } catch (err) {
            console.error('Staff registration error:', err);
            if (err.message && err.message.includes('unique')) {
                showToast(`Username "${username}" already exists. Please choose a different username.`, 'danger');
            } else {
                showToast('Registration failed. Please check all fields and try again.', 'danger');
            }
        }
    }

    if (e.target.id === 'advanceForm') {
        e.preventDefault();
        const transaction = {
            staffId: parseInt(document.getElementById('advStaffId').value),
            type: document.getElementById('advType').value,
            amount: parseFloat(document.getElementById('advAmount').value),
            notes: document.getElementById('advNotes').value,
            date: new Date().toISOString()
        };

        await addItem('staff_advances', transaction);
        showToast('Advance record updated', 'success');
        closeModal('advanceModal');
        renderStaff();
    }
});
