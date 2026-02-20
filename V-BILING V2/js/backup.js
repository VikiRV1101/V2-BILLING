async function loadBackup() {
    const backupModule = document.getElementById('backupModule');
    backupModule.innerHTML = `
        <div class="card">
            <div class="flex justify-between align-center mb-30">
                <div>
                    <h2 style="font-size: 1.5rem;">Data Safety Center</h2>
                    <p class="text-muted" style="font-size: 0.9rem;">Backup and restore your local data to prevent loss</p>
                </div>
                <div class="stat-icon-wrapper" style="background: rgba(0, 209, 178, 0.1); color: var(--success); width: 45px; height: 45px; font-size: 1rem; border-radius: 12px;">
                    <i class="fas fa-shield-alt"></i>
                </div>
            </div>
            
            <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                <div class="card p-30 border" style="background: var(--bg-color); border: 2px dashed var(--border-color); border-radius: 24px;">
                    <div class="flex flex-column align-center text-center">
                        <i class="fas fa-file-export fa-3x mb-20" style="color: var(--primary);"></i>
                        <h3>Export Full Backup</h3>
                        <p class="text-muted mb-25 mt-10">Download a JSON file containing all your Products, Invoices, Staff records, and Settings.</p>
                        <button class="btn btn-primary btn-block" onclick="exportFullBackup()">
                            <i class="fas fa-download"></i> Download Backup
                        </button>
                    </div>
                </div>
                
                <div class="card p-30 border" style="background: var(--bg-color); border: 2px dashed var(--border-color); border-radius: 24px;">
                    <div class="flex flex-column align-center text-center">
                        <i class="fas fa-file-import fa-3x mb-20" style="color: var(--info);"></i>
                        <h3>Restore from File</h3>
                        <p class="text-muted mb-25 mt-10">Select a previous backup file to restore. <b class="text-danger">Warning: This will overwrite data!</b></p>
                        <input type="file" id="restoreFile" accept=".json" class="form-control mb-10" style="background: var(--surface-color);">
                        <button class="btn btn-outline btn-block" style="border-color: var(--danger); color: var(--danger);" onclick="importFullBackup()">
                            <i class="fas fa-upload"></i> Restore Data Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function exportFullBackup() {
    const stores = ['users', 'products', 'categories', 'invoices', 'orders', 'attendance', 'expenses', 'settings', 'staff_advances'];
    const backupData = {};

    for (const store of stores) {
        backupData[store] = await getAllItems(store);
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `V-BAKERY_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup file generated', 'success');
}

async function importFullBackup() {
    const fileInput = document.getElementById('restoreFile');
    if (!fileInput.files.length) return showToast('Please select a file', 'warning');
    if (!confirm('OVERWRITE WARNING: This will delete all current records and restore from this file. Proceed?')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const stores = Object.keys(data);
            for (const store of stores) {
                const transaction = db.transaction([store], 'readwrite');
                const os = transaction.objectStore(store);
                os.clear();
                for (const item of data[store]) {
                    os.add(item);
                }
            }
            showToast('Restore successful! Restarting...', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            showToast('Invalid backup file format', 'danger');
        }
    };
    reader.readAsText(fileInput.files[0]);
}

window.loadBackup = loadBackup;
window.exportFullBackup = exportFullBackup;
window.importFullBackup = importFullBackup;
