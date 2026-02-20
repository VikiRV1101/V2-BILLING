async function loadExpenses() {
    const expensesModule = document.getElementById('expensesModule');
    expensesModule.innerHTML = `
        <div class="card">
            <div class="flex justify-between align-center mb-30">
                <div>
                    <h2 style="font-size: 1.5rem;">Expense Tracking</h2>
                    <p class="text-muted" style="font-size: 0.9rem;">Monitor daily bakery operational costs</p>
                </div>
                <button class="btn btn-primary" onclick="openExpenseModal()">
                    <i class="fas fa-plus"></i> Add Expense
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Expense Title</th>
                            <th>Amount</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody id="expenseList"></tbody>
                </table>
            </div>
        </div>

        <div id="expenseModal" class="modal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="flex justify-between align-center mb-30">
                    <h2 style="font-size: 1.5rem; color: var(--primary);">Add New Expense</h2>
                    <button class="btn btn-sm" onclick="closeModal('expenseModal')" style="background: var(--bg-color);"><i class="fas fa-times"></i></button>
                </div>
                <form id="expenseForm">
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="expDate" required>
                    </div>
                    <div class="form-group">
                        <label>Expense Title</label>
                        <input type="text" id="expTitle" required placeholder="e.g. Milk & Cream Purchase">
                    </div>
                    <div class="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" id="expAmount" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Additional Notes</label>
                        <textarea id="expNotes" rows="3" placeholder="Vendor details etc."></textarea>
                    </div>
                    <div class="flex gap-10 mt-30">
                        <button type="submit" class="btn btn-primary btn-block">Log Expense</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    renderExpenses();
}

async function renderExpenses() {
    const expenses = await getAllItems('expenses');
    const tbody = document.getElementById('expenseList');
    tbody.innerHTML = expenses.reverse().map(e => `
        <tr class="fade-in">
            <td><div style="font-weight:600;">${e.date}</div></td>
            <td><div style="font-weight:600;">${e.title}</div></td>
            <td><div style="font-weight:700; color: var(--danger);">₹ ${parseFloat(e.amount).toFixed(2)}</div></td>
            <td><span class="text-muted">${e.notes || '-'}</span></td>
        </tr>
    `).join('');

    if (expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-40">No expenses recorded yet.</td></tr>`;
    }
}

function openExpenseModal() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    openModal('expenseModal');
}

window.loadExpenses = loadExpenses;
window.openExpenseModal = openExpenseModal;

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'expenseForm') {
        e.preventDefault();
        const expense = {
            title: document.getElementById('expTitle').value,
            amount: parseFloat(document.getElementById('expAmount').value),
            date: document.getElementById('expDate').value,
            notes: document.getElementById('expNotes').value,
            createdAt: new Date().toISOString()
        };
        await addItem('expenses', expense);
        showToast('Expense recorded', 'success');
        closeModal('expenseModal');
        renderExpenses();
    }
});
