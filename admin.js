import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBjEc-wdY6s6v0AiVg4texFrohLwDcdaiU",
    authDomain: "respect-db-d1320.firebaseapp.com",
    projectId: "respect-db-d1320",
    storageBucket: "respect-db-d1320.firebasestorage.app",
    messagingSenderId: "823436634480",
    appId: "1:823436634480:web:3380974cce87d8e82b07b5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// متغيرات عامة
let currentUserData = null; // لتخزين بيانات الأدمن الحالي
let isEditing = false;
let currentEditId = null;

// ==========================================
// 1. نظام تسجيل الدخول والصلاحيات 🔐
// ==========================================
window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        checkAdminAccess(result.user);
    } catch (error) {
        document.getElementById('loginError').innerText = "خطأ في التسجيل: " + error.message;
        document.getElementById('loginError').style.display = 'block';
    }
};

async function checkAdminAccess(user) {
    // البحث عن الإيميل في كوليكشن admins
    const q = query(collection(db, "admins"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // المستخدم موجود كأدمن
        const docData = querySnapshot.docs[0].data();
        currentUserData = { ...docData, uid: user.uid, photoURL: user.photoURL };
        
        // إعداد الواجهة حسب الرتبة
        setupUI(currentUserData);
        
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        
        // تسجيل دخول في اللوغ
        logAction("تسجيل دخول", "قام بتسجيل الدخول للوحة");

        // تحميل البيانات
        loadStreamers();
        if(currentUserData.role === 'owner') {
            loadMaintenanceState();
            loadLogs();
        }
    } else {
        // ليس أدمن
        await signOut(auth);
        document.getElementById('loginError').innerText = "⛔ عذراً، ليس لديك صلاحية الوصول.";
        document.getElementById('loginError').style.display = 'block';
    }
}

function setupUI(userData) {
    document.getElementById('userName').innerText = userData.name || "أدمن";
    document.getElementById('userAvatar').src = userData.photoURL || "https://via.placeholder.com/60";
    
    const roleBadge = document.getElementById('userRole');
    if (userData.role === 'owner') {
        roleBadge.innerText = "👑 المالك (Owner)";
        roleBadge.className = "role-badge role-owner";
        // إظهار كل الأزرار
        document.getElementById('btnMaintenance').style.display = 'flex';
        document.getElementById('btnLogs').style.display = 'flex';
    } else {
        roleBadge.innerText = "🛠️ مشرف (Admin)";
        roleBadge.className = "role-badge role-admin";
        // إخفاء أزرار المالك
        document.getElementById('btnMaintenance').style.display = 'none';
        document.getElementById('btnLogs').style.display = 'none';
    }
}

window.logout = () => {
    signOut(auth).then(() => window.location.reload());
};

// ==========================================
// 2. نظام التبويبات (Tabs) 📑
// ==========================================
window.switchTab = (tabName) => {
    // إخفاء كل المحتويات
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    // إظهار المحدد
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // تفعيل الزر في القائمة
    // (بحث بسيط لتفعيل الزر المناسب)
    if(tabName === 'streamers') document.querySelector('button[onclick*="streamers"]').classList.add('active');
    if(tabName === 'maintenance') document.querySelector('button[onclick*="maintenance"]').classList.add('active');
    if(tabName === 'logs') document.querySelector('button[onclick*="logs"]').classList.add('active');
};

// ==========================================
// 3. نظام السجلات (Logging System) 📝
// ==========================================
async function logAction(action, details) {
    if(!currentUserData) return;
    try {
        await addDoc(collection(db, "logs"), {
            adminName: currentUserData.name,
            adminEmail: currentUserData.email,
            role: currentUserData.role,
            action: action,
            details: details,
            timestamp: new Date()
        });
        if(currentUserData.role === 'owner') loadLogs(); // تحديث فوري للمالك
    } catch(e) { console.error("Log error", e); }
}

async function loadLogs() {
    const tbody = document.getElementById('logsBody');
    try {
        const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const log = doc.data();
            const date = log.timestamp.toDate().toLocaleString('ar-SA');
            const row = `
                <tr>
                    <td style="direction:ltr">${date}</td>
                    <td>${log.adminName}</td>
                    <td><span class="role-badge ${log.role === 'owner' ? 'role-owner' : 'role-admin'}">${log.role}</span></td>
                    <td style="color:var(--neon-green)">${log.action}</td>
                    <td style="color:#ccc">${log.details}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch(e) { tbody.innerHTML = '<tr><td colspan="5">فشل تحميل السجلات</td></tr>'; }
}

// ==========================================
// 4. نظام الصيانة (Maintenance) 🚧
// ==========================================
async function loadMaintenanceState() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "config"));
        if (docSnap.exists()) {
            const isMaint = docSnap.data().maintenance;
            document.getElementById('maintenanceSwitch').checked = isMaint;
            updateMaintText(isMaint);
        }
    } catch(e) {}
}

window.toggleMaintenance = async () => {
    if(currentUserData.role !== 'owner') {
        alert("غير مسموح لك بهذا الإجراء!");
        return;
    }
    const isChecked = document.getElementById('maintenanceSwitch').checked;
    updateMaintText(isChecked);
    
    try {
        await setDoc(doc(db, "settings", "config"), { maintenance: isChecked }, { merge: true });
        showToast(isChecked ? "تم تفعيل وضع الصيانة" : "تم إيقاف وضع الصيانة");
        logAction("تغيير حالة الصيانة", isChecked ? "تفعيل" : "إيقاف");
    } catch(e) {
        showToast("فشل التغيير", "error");
    }
};

function updateMaintText(status) {
    const txt = document.getElementById('maintStatus');
    txt.innerText = status ? "الوضع: 🔴 مفعل (الموقع مغلق)" : "الوضع: 🟢 معطل (الموقع يعمل)";
    txt.style.color = status ? "#da3633" : "#28a745";
}

// ==========================================
// 5. إدارة الستريمرز (نفس المنطق القديم)
// ==========================================
window.autoFetchData = async () => {
    const username = document.getElementById('inpUsername').value.trim();
    if(!username) return;
    try {
        const res = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await res.json();
        document.getElementById('inpName').value = data.user.username;
        let img = data.user.profile_pic;
        if(!img || img.includes('default')) img = "https://via.placeholder.com/150";
        document.getElementById('inpImage').value = img;
        window.updatePreview();
        showToast("تم الجلب!");
    } catch(e) { showToast("فشل الجلب", "error"); }
};

window.updatePreview = () => {
    document.getElementById('prevName').innerText = document.getElementById('inpName').value || "الاسم";
    document.getElementById('prevIC').innerText = document.getElementById('inpICName').value || "الشخصية";
    document.getElementById('prevImg').src = document.getElementById('inpImage').value || "https://via.placeholder.com/150";
};

window.saveStreamer = async () => {
    const username = document.getElementById('inpUsername').value;
    const name = document.getElementById('inpName').value;
    const icName = document.getElementById('inpICName').value;
    const image = document.getElementById('inpImage').value;
    const category = document.getElementById('inpCategory').value;

    if(!username || !name) { showToast("ناقص بيانات!", "error"); return; }

    try {
        const data = { username, name, icName, image, category };
        if(isEditing && currentEditId) {
            await updateDoc(doc(db, "streamers", currentEditId), data);
            showToast("تم التعديل");
            logAction("تعديل ستريمر", `تعديل بيانات: ${name}`);
        } else {
            await addDoc(collection(db, "streamers"), data);
            showToast("تمت الإضافة");
            logAction("إضافة ستريمر", `إضافة: ${name} (${category})`);
        }
        loadStreamers();
        clearForm();
    } catch(e) { showToast("خطأ", "error"); }
};

async function loadStreamers() {
    const list = document.getElementById('streamerList');
    list.innerHTML = 'جاري التحميل...';
    const snap = await getDocs(collection(db, "streamers"));
    list.innerHTML = '';
    snap.forEach(d => {
        const s = d.data();
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; margin-bottom:5px; border-radius:5px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${s.image}" width="40" style="border-radius:50%">
                    <div><b>${s.name}</b><br><small style="color:#888">${s.category}</small></div>
                </div>
                <div>
                    <button onclick="editStreamer('${d.id}', '${s.username}', '${s.name}', '${s.icName}', '${s.image}', '${s.category}')" style="background:#1f6feb; border:none; color:white; padding:5px; border-radius:3px;">✏️</button>
                    <button onclick="deleteStreamer('${d.id}', '${s.name}')" style="background:#da3633; border:none; color:white; padding:5px; border-radius:3px;">🗑️</button>
                </div>
            </div>
        `;
    });
}

window.editStreamer = (id, user, name, ic, img, cat) => {
    isEditing = true; currentEditId = id;
    document.getElementById('inpUsername').value = user;
    document.getElementById('inpName').value = name;
    document.getElementById('inpICName').value = ic;
    document.getElementById('inpImage').value = img;
    document.getElementById('inpCategory').value = cat;
    window.updatePreview();
    window.scrollTo({top:0, behavior:'smooth'});
};

window.deleteStreamer = async (id, name) => {
    if(!confirm("حذف نهائي؟")) return;
    await deleteDoc(doc(db, "streamers", id));
    logAction("حذف ستريمر", `حذف: ${name}`);
    loadStreamers();
};

window.clearForm = () => {
    isEditing = false; currentEditId = null;
    document.querySelectorAll('input').forEach(i=>i.value='');
    window.updatePreview();
};

function showToast(msg, type='success') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.background = type === 'success' ? 'var(--neon-green)' : '#da3633';
    t.style.color = type === 'success' ? 'black' : 'white';
    t.style.padding = '10px 20px'; t.style.borderRadius = '20px';
    t.innerText = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(()=>t.remove(), 3000);
}

// التحقق من حالة الدخول عند الفتح
onAuthStateChanged(auth, (user) => {
    if (user) {
        checkAdminAccess(user);
    } else {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }
});

