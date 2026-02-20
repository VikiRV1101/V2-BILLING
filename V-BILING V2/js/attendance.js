async function loadAttendance() {
    const attendanceModule = document.getElementById('attendanceModule');
    const session = getSession();

    attendanceModule.innerHTML = `
        <div class="grid grid-1" style="display:grid; grid-template-columns: 1fr; gap:30px;">
            <div class="card">
                <div class="flex justify-between align-center mb-30">
                    <div>
                        <h2 style="font-size: 1.5rem;">Daily Attendance</h2>
                        <p class="text-muted" style="font-size: 0.9rem;">Mark your presence and track work hours</p>
                    </div>
                    <div id="attendanceActions" class="flex gap-15">
                        <!-- Buttons will load here -->
                    </div>
                </div>
                <div class="table-container">
                    <h3 class="mb-20" style="font-size: 1.1rem; border-left: 4px solid var(--primary); padding-left:15px;">Your Recent Logs</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="myAttendanceList"></tbody>
                    </table>
                </div>
            </div>

            ${session.role === 'admin' ? `
                <div class="card mt-30">
                    <div class="flex justify-between align-center mb-30">
                        <div>
                            <h2 style="font-size: 1.5rem;">Staff Overviews</h2>
                            <p class="text-muted" style="font-size: 0.9rem;">View and export attendance records for all staff</p>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-primary" onclick="openManualAttendanceModal()">
                                <i class="fas fa-calendar-plus"></i> Manual Entry
                            </button>
                            <button class="btn btn-success" onclick="exportAttendance()">
                                <i class="fas fa-file-csv"></i> Export CSV
                            </button>
                        </div>
                    </div>
                    <div class="table-container" id="adminAttendanceView">
                        <!-- Admin sees all staff logs -->
                    </div>
                </div>

                <!-- Manual Attendance Modal -->
                <div id="manualAttendanceModal" class="modal">
                    <div class="modal-content" style="max-width: 500px;">
                        <div class="flex justify-between align-center mb-20">
                            <h2 style="margin:0;">Add Attendance Record</h2>
                            <button class="btn btn-sm" onclick="closeModal('manualAttendanceModal')"><i class="fas fa-times"></i></button>
                        </div>
                        <form id="manualAttendanceForm" onsubmit="saveManualAttendance(event)">
                            <div class="form-group mb-15">
                                <label>Staff Member</label>
                                <select id="manualStaffId" class="form-control" required></select>
                            </div>
                            <div class="form-group mb-15">
                                <label>Date</label>
                                <input type="date" id="manualDate" class="form-control" required>
                            </div>
                            <div class="grid grid-2 gap-15 mb-15">
                                <div class="form-group">
                                    <label>Check In</label>
                                    <input type="time" id="manualCheckIn" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>Check Out</label>
                                    <input type="time" id="manualCheckOut" class="form-control">
                                </div>
                            </div>
                            <div class="form-group mb-20">
                                <label>Status</label>
                                <select id="manualStatus" class="form-control">
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Half Day">Half Day</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Save Record</button>
                        </form>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    updateAttendanceUI();
    renderMyAttendance();
    if (session.role === 'admin') renderAdminAttendance();
}

async function updateAttendanceUI() {
    const session = getSession();
    const today = new Date().toISOString().split('T')[0];
    const logs = await getAllItems('attendance');
    const myTodayLog = logs.find(l => l.userId === session.id && l.date === today);

    const container = document.getElementById('attendanceActions');
    if (!myTodayLog) {
        container.innerHTML = `<button class="btn btn-primary btn-block" onclick="checkIn()" style="padding: 15px 30px;">Check In Now</button>`;
    } else if (!myTodayLog.checkOut) {
        container.innerHTML = `
            <div class="flex flex-column align-end">
                <span class="badge badge-success mb-10">Checked In at ${myTodayLog.checkIn}</span>
                <button class="btn btn-block" onclick="checkOut()" style="background: var(--danger); color: #fff; padding: 15px 30px;">Check Out Now</button>
            </div>
        `;
    } else {
        container.innerHTML = `<span class="badge badge-primary" style="padding: 15px 30px; font-size: 1rem;">Work Completed for Today</span>`;
    }
}

async function checkIn() {
    const session = getSession();
    const today = new Date().toISOString().split('T')[0];
    const log = {
        userId: session.id,
        userName: session.name,
        date: today,
        checkIn: new Date().toLocaleTimeString(),
        checkOut: null,
        status: 'present'
    };
    await addItem('attendance', log);
    showToast('Checked in successfully', 'success');
    updateAttendanceUI();
    renderMyAttendance();
}

async function checkOut() {
    const session = getSession();
    const today = new Date().toISOString().split('T')[0];
    const logs = await getAllItems('attendance');
    const log = logs.find(l => l.userId === session.id && l.date === today && !l.checkOut);
    if (log) {
        log.checkOut = new Date().toLocaleTimeString();
        await updateItem('attendance', log);
        showToast('Checked out successfully', 'success');
        updateAttendanceUI();
        renderMyAttendance();
    }
}

async function renderMyAttendance() {
    const session = getSession();
    const logs = await getAllItems('attendance');
    const myLogs = logs.filter(l => l.userId === session.id).reverse();
    const tbody = document.getElementById('myAttendanceList');
    tbody.innerHTML = myLogs.map(l => `
        <tr class="fade-in">
            <td><div style="font-weight:600;">${l.date}</div></td>
            <td><span class="badge badge-primary">${l.checkIn}</span></td>
            <td>${l.checkOut ? `<span class="badge badge-info">${l.checkOut}</span>` : '<span class="text-muted">Active...</span>'}</td>
            <td><span class="badge badge-success">PRESENT</span></td>
        </tr>
    `).join('');
}

async function renderAdminAttendance() {
    const logs = await getAllItems('attendance');
    const container = document.getElementById('adminAttendanceView');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Staff Name</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(l => `
                    <tr class="fade-in">
                        <td><div style="font-weight:600;">${l.userName}</div></td>
                        <td>${l.date}</td>
                        <td><span class="badge badge-primary">${l.checkIn}</span></td>
                        <td>${l.checkOut ? `<span class="badge badge-info">${l.checkOut}</span>` : '<span class="badge badge-warning">On Duty</span>'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function exportAttendance() {
    const logs = await getAllItems('attendance');
    if (logs.length === 0) return showToast('No data to export', 'warning');

    let csv = 'Staff Name,Date,Check In,Check Out\n';
    logs.forEach(l => {
        csv += `${l.userName},${l.date},${l.checkIn},${l.checkOut || 'N/A'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

async function openManualAttendanceModal() {
    const list = await getAllItems('users');
    // Filter out 'admin' if you only want to add for staff, or keep all
    // const staff = list.filter(u => u.username !== 'viki'); 

    const select = document.getElementById('manualStaffId');
    select.innerHTML = list.map(u => `<option value="${u.id}">${u.name} (@${u.username})</option>`).join('');

    // Set default date to today
    document.getElementById('manualDate').valueAsDate = new Date();
    document.getElementById('manualCheckIn').value = '09:00';
    document.getElementById('manualStatus').value = 'Present';

    openModal('manualAttendanceModal');
}

async function saveManualAttendance(event) {
    event.preventDefault();

    const staffId = parseInt(document.getElementById('manualStaffId').value);
    const date = document.getElementById('manualDate').value;
    const checkInTime = document.getElementById('manualCheckIn').value;
    const checkOutTime = document.getElementById('manualCheckOut').value;
    const status = document.getElementById('manualStatus').value;

    if (!staffId || !date || !checkInTime) {
        showToast('Please fill all required fields', 'warning');
        return;
    }

    const users = await getAllItems('users');
    const staff = users.find(u => u.id === staffId);

    // Check if record already exists for this date
    const logs = await getAllItems('attendance');
    const existing = logs.find(l => l.userId === staffId && l.date === date);

    if (existing) {
        if (!confirm(`Attendance record for ${staff.name} on ${date} already exists. Overwrite?`)) {
            return;
        }
        // Update existing
        existing.checkIn = new Date(`${date}T${checkInTime}`).toLocaleTimeString();
        existing.checkOut = checkOutTime ? new Date(`${date}T${checkOutTime}`).toLocaleTimeString() : null;
        existing.status = status;
        await updateItem('attendance', existing);
        showToast('Attendance updated successfully', 'success');
    } else {
        // Create new
        const log = {
            userId: staffId,
            userName: staff.name,
            date: date,
            checkIn: new Date(`${date}T${checkInTime}`).toLocaleTimeString(),
            checkOut: checkOutTime ? new Date(`${date}T${checkOutTime}`).toLocaleTimeString() : null,
            status: status
        };
        await addItem('attendance', log);
        showToast('Attendance added successfully', 'success');
    }

    closeModal('manualAttendanceModal');
    if (document.getElementById('adminAttendanceView')) {
        renderAdminAttendance();
    }
    renderMyAttendance(); // Refresh own view if applicable
}

window.loadAttendance = loadAttendance;
window.checkIn = checkIn;
window.checkOut = checkOut;
window.exportAttendance = exportAttendance;
window.openManualAttendanceModal = openManualAttendanceModal;
window.saveManualAttendance = saveManualAttendance;
