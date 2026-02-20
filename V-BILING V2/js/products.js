async function loadProducts() {
    const productsModule = document.getElementById('productsModule');
    const categories = await getAllItems('categories');

    productsModule.innerHTML = `
        <div class="card">
            <div class="flex justify-between align-center mb-30">
                <div>
                    <h2 style="font-size: 1.5rem;">Product Catalog</h2>
                    <p class="text-muted" style="font-size: 0.9rem;">Manage your bakery items and stock levels</p>
                </div>
                <div class="flex gap-15">
                    <div class="product-search-bar" style="margin-bottom: 0;">
                        <i class="fas fa-search"></i>
                        <input type="text" id="productSearch" class="search-input" oninput="renderProducts()" placeholder="Search products..." style="width: 300px; padding-top: 12px; padding-bottom: 12px;">
                    </div>
                    <button class="btn btn-outline" onclick="exportProducts()">
                        <i class="fas fa-file-export"></i> Export CSV
                    </button>
                    <button class="btn btn-outline" onclick="document.getElementById('importProductFile').click()">
                        <i class="fas fa-file-import"></i> Import CSV
                    </button>
                    <input type="file" id="importProductFile" accept=".csv" style="display:none;" onchange="importProducts(event)">
                    <button class="btn btn-primary" onclick="openProductModal()">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Unit/Size</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="productList"></tbody>
                </table>
            </div>
        </div>

        <div id="productModal" class="modal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="flex justify-between align-center mb-30">
                    <h2 id="prodModalTitle" style="font-size: 1.8rem; color: var(--primary);">Add Product</h2>
                    <button class="btn btn-sm" onclick="closeModal('productModal')" style="background: var(--bg-color);"><i class="fas fa-times"></i></button>
                </div>
                <form id="productForm">
                    <input type="hidden" id="productId">
                    <div class="pos-layout" style="grid-template-columns: 1fr 300px; gap: 40px; display: grid;">
                        <div class="form-main">
                            <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Product Name <span class="text-danger">*</span></label>
                                    <input type="text" id="prodName" required placeholder="e.g. Chocolate Cake">
                                </div>
                                <div class="form-group">
                                    <label>Category <span class="text-danger">*</span></label>
                                    <select id="prodCategory" required>
                                        <option value="">Select Category</option>
                                        ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-3" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Purchase Price (₹)</label>
                                    <input type="number" id="prodPurchasePrice" step="0.01" required placeholder="Cost per unit">
                                </div>
                                <div class="form-group">
                                    <label>Selling Price (₹)</label>
                                    <input type="number" id="prodPrice" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label>Initial Stock</label>
                                    <input type="number" id="prodStock" required>
                                </div>
                                <div class="form-group">
                                    <label>Low Stock Alert</label>
                                    <input type="number" id="prodLowStock" value="5">
                                </div>
                            </div>
                            <div class="grid grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Unit Type</label>
                                    <select id="prodUnit" required>
                                        <option value="pcs">pcs</option>
                                        <option value="pack">pack</option>
                                        <option value="box">box</option>
                                        <option value="tray">tray</option>
                                        <option value="plt">plt</option>
                                        <option value="g">g</option>
                                        <option value="kg">kg</option>
                                        <option value="ml">ml</option>
                                        <option value="litre">litre</option>
                                        <option value="inch">inch</option>
                                        <option value="dozen">dozen</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Pack Size (Optional)</label>
                                    <select id="prodPackSize">
                                        <option value="">None</option>
                                        <option value="100 g">100 g</option>
                                        <option value="250 g">250 g</option>
                                        <option value="500 g">500 g</option>
                                        <option value="750 g">750 g</option>
                                        <option value="1 kg">1 kg</option>
                                        <option value="half dozen">half dozen</option>
                                        <option value="1 dozen">1 dozen</option>
                                        <option value="500 ml">500 ml</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea id="prodNotes" rows="3" placeholder="Additional details..."></textarea>
                            </div>
                        </div>
                        <div class="form-sidebar">
                            <div class="form-group">
                                <div class="form-group">
                                    <label>Image Filename</label>
                                    <input type="text" id="prodImage" placeholder="e.g. images/cake.jpg" oninput="previewImage(this.value)">
                                    <p class="text-muted" style="font-size: 0.8rem; margin-top: 5px;">Put files in 'images' folder on Desktop</p>
                                    
                                    <div class="mt-15" style="border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; height: 200px; display: flex; align-items: center; justify-content: center; background: var(--bg-color);">
                                        <img id="imagePreview" src="" style="max-width: 100%; max-height: 100%; display: none;">
                                        <div id="imagePlaceholder" class="text-center text-muted">
                                            <i class="fas fa-image fa-2x mb-10"></i>
                                            <p>Preview</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-10 mt-30">
                                <button type="submit" class="btn btn-primary btn-block">Save Product</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    renderProducts();
}

async function renderProducts() {
    const list = await getAllItems('products');
    const search = document.getElementById('productSearch').value.toLowerCase();
    const tbody = document.getElementById('productList');

    const filtered = list.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));

    tbody.innerHTML = filtered.map(p => `
        <tr class="fade-in">
            <td>
                <div style="width: 45px; height: 45px; border-radius: 12px; overflow: hidden; background: var(--bg-color); display: flex; align-items: center; justify-content: center;">
                    ${p.image ? `<img src="${(!p.image.startsWith('http') && !p.image.startsWith('images/')) ? 'images/' + p.image : p.image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-bread-slice text-muted"></i>`}
                </div>
            </td>
            <td><div style="font-weight:600;">${p.name}</div></td>
            <td><span class="badge badge-info">${p.category}</span></td>
            <td><div style="font-weight:700; color: var(--primary);">₹ ${parseFloat(p.price).toFixed(2)}</div></td>
            <td>
                <div class="flex align-center gap-10">
                    <span class="${p.stock <= p.lowStock ? 'text-danger font-bold' : ''}">${p.stock}</span>
                    ${p.stock <= p.lowStock ? `<i class="fas fa-exclamation-circle text-danger" title="Low Stock"></i>` : ''}
                </div>
            </td>
            <td><span class="text-muted">${p.unit} ${p.packSize ? `(${p.packSize})` : ''}</span></td>
            <td style="text-align: right;">
                <button class="btn btn-sm btn-outline" onclick="editProduct(${p.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="deleteProduct(${p.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() {
    document.getElementById('prodModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('prodImage').value = '';
    previewImage('');
    openModal('productModal');
}

async function editProduct(id) {
    const p = await getItem('products', id);
    document.getElementById('prodModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodPurchasePrice').value = p.purchasePrice || 0;
    document.getElementById('prodStock').value = p.stock;
    document.getElementById('prodLowStock').value = p.lowStock;
    document.getElementById('prodUnit').value = p.unit;
    document.getElementById('prodPackSize').value = p.packSize || '';
    document.getElementById('prodNotes').value = p.notes || '';

    if (p.image) {
        document.getElementById('prodImage').value = p.image;
        previewImage(p.image);
    } else {
        document.getElementById('prodImage').value = '';
        previewImage('');
    }
    openModal('productModal');
}

async function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        await deleteItem('products', id);
        showToast('Product deleted', 'success');
        renderProducts();
    }
}

function previewImage(path) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imagePlaceholder');

    if (path && path.trim() !== '') {
        // Auto-prepend 'images/' if user just types filename
        let fullPath = path.trim();
        if (!fullPath.includes('/') && !fullPath.includes('\\') && !fullPath.startsWith('http')) {
            fullPath = 'images/' + fullPath;
        }

        preview.src = fullPath;
        preview.style.display = 'block';
        placeholder.style.display = 'none';

        // Handle broken images
        preview.onerror = function () {
            preview.style.display = 'none';
            placeholder.style.display = 'block';
            placeholder.innerHTML = '<i class="fas fa-exclamation-triangle text-danger"></i><p>File not found</p>';
        };
    } else {
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        placeholder.innerHTML = '<i class="fas fa-image fa-2x mb-10"></i><p>Preview</p>';
    }
}

async function exportProducts() {
    const products = await getAllItems('products');
    if (!products.length) return showToast('No products to export', 'warning');

    const headers = ['Name', 'Category', 'Purchase Price', 'Selling Price', 'Stock', 'Low Stock Alert', 'Unit', 'Pack Size', 'Notes'];
    let csv = headers.join(',') + '\n';

    products.forEach(p => {
        const row = [
            `"${p.name}"`,
            `"${p.category}"`,
            p.purchasePrice || 0,
            p.price,
            p.stock,
            p.lowStock,
            p.unit,
            `"${p.packSize || ''}"`,
            `"${(p.notes || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Products exported successfully', 'success');
}

async function importProducts(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showToast('CSV file is empty', 'warning');
                return;
            }

            const headers = lines[0].split(',');
            let imported = 0;
            let skipped = 0;

            // Fetch existing products and categories
            const existingProducts = await getAllItems('products');
            const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase().trim()));

            const existingCategories = await getAllItems('categories');
            const existingCategoryNames = new Set(existingCategories.map(c => c.name.toLowerCase().trim()));
            let newCategoriesCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].match(/([^,"]+|"[^"]*")+/g).map(v => v.replace(/^"|"$/g, '').trim());

                if (values.length < 7) continue;

                const name = values[0];
                const category = values[1];

                // Auto-create category if missing
                if (!existingCategoryNames.has(category.toLowerCase())) {
                    await addItem('categories', { name: category, description: 'Imported from CSV' });
                    existingCategoryNames.add(category.toLowerCase());
                    newCategoriesCount++;
                }

                // Check if product already exists (case-insensitive)
                if (existingNames.has(name.toLowerCase())) {
                    console.log(`Skipping duplicate: ${name}`);
                    skipped++;
                    continue;
                }

                const product = {
                    name: name,
                    category: values[1],
                    purchasePrice: parseFloat(values[2]) || 0,
                    price: parseFloat(values[3]),
                    stock: parseInt(values[4]),
                    lowStock: parseInt(values[5]),
                    unit: values[6],
                    packSize: values[7] || '',
                    notes: values[8] || '',
                    image: ''
                };

                await addItem('products', product);
                imported++;
            }

            if (skipped > 0) {
                showToast(`Imported ${imported} products. Skipped ${skipped} duplicates.`, 'success');
            } else {
                showToast(`Imported ${imported} products successfully`, 'success');
            }
            renderProducts();
            event.target.value = '';
        } catch (err) {
            showToast('Error importing CSV. Check file format.', 'danger');
            console.error(err);
        }
    };
    reader.readAsText(file);
}

window.loadProducts = loadProducts;
window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.previewImage = previewImage;
window.exportProducts = exportProducts;
window.importProducts = importProducts;

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'productForm') {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const product = {
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            purchasePrice: parseFloat(document.getElementById('prodPurchasePrice').value) || 0,
            stock: parseInt(document.getElementById('prodStock').value),
            lowStock: parseInt(document.getElementById('prodLowStock').value),
            unit: document.getElementById('prodUnit').value,
            packSize: document.getElementById('prodPackSize').value,
            image: (() => {
                let img = document.getElementById('prodImage').value.trim();
                if (img && !img.startsWith('http') && !img.startsWith('images/')) {
                    return 'images/' + img;
                }
                return img;
            })(),
            notes: document.getElementById('prodNotes').value
        };

        try {
            if (id) {
                product.id = parseInt(id);
                await updateItem('products', product);
                showToast('Product updated', 'success');
            } else {
                await addItem('products', product);
                showToast('Product added', 'success');
            }
            closeModal('productModal');
            renderProducts();
        } catch (err) {
            showToast('Error saving product', 'danger');
        }
    }
});
