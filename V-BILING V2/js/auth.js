async function checkInitialUsers() {
    const users = await getAllItems('users');
    if (users.length === 0) {
        // Create Super Admin
        await addItem('users', {
            username: 'viki',
            password: '1101',
            role: 'admin',
            name: 'Super Admin',
            phone: '',
            status: 'active'
        });
        // Create Default Admin
        await addItem('users', {
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Admin',
            phone: '',
            status: 'active'
        });
        console.log('Initial users created');
    }
}

async function login(username, password) {
    const user = await getItemByIndex('users', 'username', username);
    if (user && user.password === password) {
        if (user.status === 'disabled') {
            throw new Error('Account disabled');
        }
        const session = {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('bakerySession', JSON.stringify(session));
        return session;
    } else {
        throw new Error('Invalid username or password');
    }
}

async function logout() {
    if (confirm('Logging out... Perform backup before exit?')) {
        try {
            if (window.exportFullBackup) {
                await window.exportFullBackup();
                // Give a small delay for the download to start
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                console.error('Backup function not found');
            }
        } catch (e) {
            console.error('Backup failed:', e);
        }
    }
    localStorage.removeItem('bakerySession');
    window.location.href = 'login.html';
}

function getSession() {
    const sessionStr = localStorage.getItem('bakerySession');
    return sessionStr ? JSON.parse(sessionStr) : null;
}

function checkAuth(requiredRole = null) {
    const session = getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    if (requiredRole && session.role !== requiredRole && session.role !== 'admin') {
        alert('Access Denied');
        window.location.href = session.role === 'admin' ? 'admin.html' : 'staff.html';
        return null;
    }
    return session;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await checkInitialUsers();
});
