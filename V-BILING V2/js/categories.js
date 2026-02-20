async function loadCategories() {
    const categoriesModule = document.getElementById('categoriesModule');
    categoriesModule.innerHTML = `
        <div class="card">
            <div class="flex justify-between align-center mb-30">
                <div>
                    <h2 style="font-size: 1.5rem;">Product Categories</h2>
                    <p class="text-muted" style="font-size: 0.9rem;">Organize your products into meaningful groups</p>
                </div>
                <button class="btn btn-primary" onclick="openCategoryModal()">
                    <i class="fas fa-plus"></i> Add Category
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Description / Notes</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="categoryList"></tbody>
                </table>
            </div>
        </div>

        <div id="categoryModal" class="modal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="flex justify-between align-center mb-30">
                    <h2 id="catModalTitle" style="font-size: 1.5rem; color: var(--primary);">Add Category</h2>
                    <button class="btn btn-sm" onclick="closeModal('categoryModal')" style="background: var(--bg-color);"><i class="fas fa-times"></i></button>
                </div>
                <form id="categoryForm">
                    <input type="hidden" id="categoryId">
                    <div class="form-group">
                        <label>Category Name <span class="text-danger">*</span></label>
                        <input type="text" id="catName" required placeholder="e.g. Cakes, Pastries">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="catDescription" rows="3" placeholder="Brief description..."></textarea>
                    </div>
                    <div class="flex gap-10 mt-30">
                        <button type="submit" class="btn btn-primary btn-block">Save Category</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    renderCategories();
}

async function renderCategories() {
    const list = await getAllItems('categories');
    const tbody = document.getElementById('categoryList');
    tbody.innerHTML = list.map(c => `
        <tr class="fade-in">
            <td><div style="font-weight:600;">${c.name}</div></td>
            <td><span class="text-muted">${c.description || '-'}</span></td>
            <td style="text-align: right;">
                <button class="btn btn-sm btn-outline" onclick="editCategory(${c.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="deleteCategory(${c.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openCategoryModal() {
    document.getElementById('catModalTitle').textContent = 'Add Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    openModal('categoryModal');
}

async function editCategory(id) {
    const c = await getItem('categories', id);
    document.getElementById('catModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryId').value = c.id;
    document.getElementById('catName').value = c.name;
    document.getElementById('catDescription').value = c.description || '';
    openModal('categoryModal');
}

async function deleteCategory(id) {
    if (confirm('Delete this category? This will not delete products in it.')) {
        await deleteItem('categories', id);
        showToast('Category deleted', 'success');
        renderCategories();
    }
}

window.loadCategories = loadCategories;
window.openCategoryModal = openCategoryModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'categoryForm') {
        e.preventDefault();
        const id = document.getElementById('categoryId').value;
        const category = {
            name: document.getElementById('catName').value,
            description: document.getElementById('catDescription').value
        };

        if (id) {
            category.id = parseInt(id);
            await updateItem('categories', category);
            showToast('Category updated', 'success');
        } else {
            await addItem('categories', category);
            showToast('Category added', 'success');
        }
        closeModal('categoryModal');
        renderCategories();
    }
});
