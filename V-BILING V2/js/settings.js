async function loadSettings() {
    const settingsModule = document.getElementById('settingsModule');

    // Default settings if not found
    const shopName = await getItem('settings', 'shopName') || { value: 'V-BAKERY' };
    const shopAddress = await getItem('settings', 'shopAddress') || { value: '123 Bakery Street, India' };
    const shopPhone = await getItem('settings', 'shopPhone') || { value: '+91 9876543210' };
    const shopLogo = await getItem('settings', 'shopLogo') || { value: '' };
    const paymentQR = await getItem('settings', 'paymentQR') || { value: '' };

    const printLogo = await getItem('settings', 'printLogo') || { value: true };
    const printGST = await getItem('settings', 'printGST') || { value: false };
    const printQR = await getItem('settings', 'printQR') || { value: true };
    const gstNumber = await getItem('settings', 'gstNumber') || { value: '' };

    settingsModule.innerHTML = `
        <div class="card p-30">
            <div class="flex-column gap-30">
                <!-- Shop Profile Section -->
                <div>
                    <h2 class="mb-20"><i class="fas fa-store-alt" style="color: var(--primary);"></i> Shop Profile</h2>
                    <div class="grid-2 gap-20">
                        <div class="form-group">
                            <label>Shop Name</label>
                            <input type="text" id="setShopName" class="form-control" value="${shopName.value}">
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" id="setShopPhone" class="form-control" value="${shopPhone.value}">
                        </div>
                    </div>
                    <div class="form-group mt-10">
                        <label>Full Address</label>
                        <textarea id="setShopAddress" class="form-control" rows="2">${shopAddress.value}</textarea>
                    </div>
                    
                    <div class="form-group mt-20">
                        <label>Shop Logo</label>
                        <div class="flex align-center gap-20">
                            <div id="logoPreview" style="width: 80px; height: 80px; border: 2px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; background-size: contain; background-repeat: no-repeat; background-position: center; background-image: url('${shopLogo.value}')">
                                ${!shopLogo.value ? '<i class="fas fa-image fa-2x" style="opacity: 0.2;"></i>' : ''}
                            </div>
                            <input type="file" id="logoUpload" accept="image/*" style="display: none;" onchange="handleLogoUpload(event)">
                            <button class="btn btn-outline" onclick="document.getElementById('logoUpload').click()">
                                <i class="fas fa-upload"></i> Upload Logo
                            </button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary mt-20" onclick="saveShopProfile()">Save Shop Profile</button>
                </div>

                <hr style="border: none; border-top: 1px solid var(--border-color);">

                <!-- Payment Settings Section -->
                <div>
                    <h2 class="mb-20"><i class="fas fa-qrcode" style="color: var(--primary);"></i> Payment QR Code</h2>
                    <div class="flex align-center gap-20">
                        <div id="qrPreview" style="width: 120px; height: 120px; border: 2px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; background-size: contain; background-repeat: no-repeat; background-position: center; background-image: url('${paymentQR.value}')">
                            ${!paymentQR.value ? '<i class="fas fa-qrcode fa-3x" style="opacity: 0.2;"></i>' : ''}
                        </div>
                        <div class="flex-column gap-10">
                            <input type="file" id="qrUpload" accept="image/*" style="display: none;" onchange="handleQRUpload(event)">
                            <button class="btn btn-outline" onclick="document.getElementById('qrUpload').click()">
                                <i class="fas fa-upload"></i> Upload QR Code
                            </button>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">Upload your UPI QR code image (GPay, PhonePe, etc.)</p>
                            <button class="btn btn-primary" onclick="savePaymentSettings()" style="margin-top: 10px;">Save QR Code</button>
                        </div>
                    </div>
                </div>

                <hr style="border: none; border-top: 1px solid var(--border-color);">

                <!-- Printing Preferences Section -->
                <div>
                    <h2 class="mb-20"><i class="fas fa-print" style="color: var(--primary);"></i> Print Preferences</h2>
                    
                    <div class="flex-column gap-20">
                        <div class="flex align-center justify-between card p-15" style="background: var(--bg-color);">
                            <div>
                                <div style="font-weight: 600;">Show Logo on Receipt</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Print your shop logo at the top of receipts</div>
                            </div>
                            <div class="theme-switch" id="toggleLogo" onclick="toggleSetting('printLogo')" style="cursor: pointer; ${printLogo.value ? 'background: var(--primary);' : ''}">
                                <div class="switch-ball" style="${printLogo.value ? 'transform: translateX(24px);' : ''}"></div>
                            </div>
                        </div>

                        <div class="flex align-center justify-between card p-15" style="background: var(--bg-color);">
                            <div>
                                <div style="font-weight: 600;">Show QR Code on Receipt</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Print UPI QR code for digital payments</div>
                            </div>
                            <div class="theme-switch" id="toggleQR" onclick="toggleSetting('printQR')" style="cursor: pointer; ${printQR.value ? 'background: var(--primary);' : ''}">
                                <div class="switch-ball" style="${printQR.value ? 'transform: translateX(24px);' : ''}"></div>
                            </div>
                        </div>

                        <div class="flex align-center justify-between card p-15" style="background: var(--bg-color);">
                            <div>
                                <div style="font-weight: 600;">Print GST Details</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Include GST number and tax breakdown on receipts</div>
                            </div>
                            <div class="theme-switch" id="toggleGST" onclick="toggleSetting('printGST')" style="cursor: pointer; ${printGST.value ? 'background: var(--primary);' : ''}">
                                <div class="switch-ball" style="${printGST.value ? 'transform: translateX(24px);' : ''}"></div>
                            </div>
                        </div>
                        
                        <div class="form-group" id="gstInputGroup" style="display: ${printGST.value ? 'block' : 'none'};">
                            <label>GST Number</label>
                            <input type="text" id="setGSTNumber" class="form-control" value="${gstNumber.value}" placeholder="e.g. 22AAAAA0000A1Z5">
                        </div>
                    </div>
                    
                    <button class="btn btn-primary mt-20" onclick="savePrintSettings()">Save Print Settings</button>
                </div>
            </div>
        </div>
    `;
}

async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        document.getElementById('logoPreview').style.backgroundImage = `url('${base64}')`;
        document.getElementById('logoPreview').innerHTML = '';
        window.tempLogo = base64;
    };
    reader.readAsDataURL(file);
}

async function handleQRUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        document.getElementById('qrPreview').style.backgroundImage = `url('${base64}')`;
        document.getElementById('qrPreview').innerHTML = '';
        window.tempQR = base64;
    };
    reader.readAsDataURL(file);
}

async function savePaymentSettings() {
    const qr = window.tempQR || (await getItem('settings', 'paymentQR') || { value: '' }).value;
    try {
        await updateItem('settings', { key: 'paymentQR', value: qr });
        showToast('Payment QR updated!', 'success');
    } catch (err) {
        showToast('Failed to save settings', 'danger');
    }
}

async function saveShopProfile() {
    const name = document.getElementById('setShopName').value;
    const phone = document.getElementById('setShopPhone').value;
    const address = document.getElementById('setShopAddress').value;
    const logo = window.tempLogo || (await getItem('settings', 'shopLogo') || { value: '' }).value;

    try {
        await updateItem('settings', { key: 'shopName', value: name });
        await updateItem('settings', { key: 'shopPhone', value: phone });
        await updateItem('settings', { key: 'shopAddress', value: address });
        await updateItem('settings', { key: 'shopLogo', value: logo });

        showToast('Shop profile updated!', 'success');
        // Update logo in sidebar header if needed
        document.querySelector('.logo-text').textContent = name;
    } catch (err) {
        showToast('Failed to save settings', 'danger');
    }
}

async function toggleSetting(key) {
    const setting = await getItem('settings', key) || { value: false };
    const newValue = !setting.value;
    await updateItem('settings', { key: key, value: newValue });

    if (key === 'printGST') {
        document.getElementById('gstInputGroup').style.display = newValue ? 'block' : 'none';
    }

    // Refresh the UI to reflect toggle state
    loadSettings();
}

async function savePrintSettings() {
    const gstNumber = document.getElementById('setGSTNumber').value;
    try {
        await updateItem('settings', { key: 'gstNumber', value: gstNumber });
        showToast('Print settings updated!', 'success');
    } catch (err) {
        showToast('Failed to save settings', 'danger');
    }
}

window.loadSettings = loadSettings;
window.handleLogoUpload = handleLogoUpload;
window.handleQRUpload = handleQRUpload;
window.saveShopProfile = saveShopProfile;
window.savePrintSettings = savePrintSettings;
window.savePaymentSettings = savePaymentSettings;
window.toggleSetting = toggleSetting;
