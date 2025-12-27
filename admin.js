import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات فايربيس (نفس الموجودة في main.js)
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
const streamersCol = collection(db, "streamers");

let isEditing = false;
let currentEditId = null;
let deleteTargetId = null;

// ==========================================
// 1. نظام التنبيهات (Toasts) 🍞
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = type === 'success' ? `<i class="fa-solid fa-check-circle"></i> ${message}` : `<i class="fa-solid fa-triangle-exclamation"></i> ${message}`;
    
    container.appendChild(toast);
    
    // تفعيل الأنيميشن
    setTimeout(() => toast.classList.add('show'), 100);
    // الإخفاء والحذف
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 2. السحب التلقائي (Auto Fetch) 🤖
// ==========================================
window.autoFetchData = async () => {
    const username = document.getElementById('inpUsername').value.trim();
    if (!username) { showToast("يرجى كتابة اليوزر نيم أولاً", "error"); return; }

    const btn = document.querySelector('.btn-fetch');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الجلب...';

    try {
        // نستخدم API كيك العام
        const response = await fetch(`https://kick.com/api/v1/channels/${username}`);
        if (!response.ok) throw new Error("لم يتم العثور على القناة");
        
        const data = await response.json();
        
        // تعبئة البيانات تلقائياً
        document.getElementById('inpName').value = data.user.username; // الاسم
        
        // محاولة جلب الصورة (أحياناً تكون في user.profile_pic)
        let imgUrl = data.user.profile_pic;
        if(!imgUrl || imgUrl.includes('default')) imgUrl = "https://via.placeholder.com/150"; 
        document.getElementById('inpImage').value = imgUrl;

        showToast("تم سحب البيانات بنجاح!", "success");
        updatePreview(); // تحديث المعاينة

    } catch (error) {
        console.error(error);
        showToast("فشل السحب التلقائي (تأكد من اليوزر أو عبئ يدوياً)", "error");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> جلب';
    }
};

// ==========================================
// 3. المعاينة الحية (Live Preview) 👁️
// ==========================================
window.updatePreview = () => {
    const name = document.getElementById('inpName').value || "الاسم";
    const icName = document.getElementById('inpICName').value || "الشخصية";
    const img = document.getElementById('inpImage').value || "https://via.placeholder.com/150";
    
    document.getElementById('prevName').innerText = name;
    document.getElementById('prevIC').innerText = icName;
    document.getElementById('prevImg').src = img;
};

// ==========================================
// 4. إدارة البيانات (CRUD) 💾
// ==========================================

// تحميل القائمة
async function loadStreamers() {
    const listContainer = document.getElementById('streamerList');
    listContainer.innerHTML = '<div style="text-align:center; margin-top:20px;"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</div>';
    
    try {
        const snapshot = await getDocs(streamersCol);
        listContainer.innerHTML = '';
        
        if(snapshot.empty) {
            listContainer.innerHTML = '<div style="text-align:center; color:#777;">لا يوجد ستريمرز مضافين.</div>';
            return;
        }

        snapshot.forEach(docSnap => {
            const s = docSnap.data();
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <div class="list-info">
                    <img src="${s.image}" class="list-img" onerror="this.src='https://via.placeholder.com/150'">
                    <div>
                        <div style="font-weight:bold; color:white;">${s.name}</div>
                        <div style="font-size:0.8rem; color:#888;">${s.username} | ${s.category}</div>
                    </div>
                </div>
                <div class="list-actions">
                    <button class="btn-edit" onclick="editStreamer('${docSnap.id}', '${s.username}', '${s.name}', '${s.icName}', '${s.image}', '${s.category}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="openDeleteModal('${docSnap.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(div);
        });
    } catch (err) {
        showToast("خطأ في تحميل القائمة: " + err.message, "error");
    }
}

// حفظ (إضافة أو تعديل)
window.saveStreamer = async () => {
    const username = document.getElementById('inpUsername').value.trim();
    const name = document.getElementById('inpName').value.trim();
    const icName = document.getElementById('inpICName').value.trim();
    const image = document.getElementById('inpImage').value.trim();
    const category = document.getElementById('inpCategory').value;

    if (!username || !name) {
        showToast("يرجى تعبئة الحقول الأساسية (اليوزر والاسم)", "error");
        return;
    }

    const btn = document.querySelector('.btn-save');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
    btn.disabled = true;

    try {
        const data = { username, name, icName, image, category };
        
        if (isEditing && currentEditId) {
            // تعديل
            await updateDoc(doc(db, "streamers", currentEditId), data);
            showToast("تم التعديل بنجاح ✅");
        } else {
            // إضافة جديد
            await addDoc(streamersCol, data);
            showToast("تمت الإضافة بنجاح ✅");
        }
        
        clearForm();
        loadStreamers();
    } catch (err) {
        console.error(err);
        showToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
};

// تجهيز الفورم للتعديل
window.editStreamer = (id, username, name, icName, image, category) => {
    isEditing = true;
    currentEditId = id;
    
    document.getElementById('inpUsername').value = username;
    document.getElementById('inpName').value = name;
    document.getElementById('inpICName').value = icName;
    document.getElementById('inpImage').value = image;
    document.getElementById('inpCategory').value = category;
    
    document.querySelector('.btn-save').innerHTML = '<i class="fa-solid fa-rotate"></i> تحديث البيانات';
    updatePreview();
    
    // سكرول للأعلى (للجوال)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("أنت الآن في وضع التعديل", "success");
};

// تنظيف الفورم
window.clearForm = () => {
    isEditing = false;
    currentEditId = null;
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.getElementById('inpCategory').selectedIndex = 0;
    document.querySelector('.btn-save').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ البيانات';
    updatePreview();
};

// ==========================================
// 5. نافذة الحذف (Confirmations) 🗑️
// ==========================================
window.openDeleteModal = (id) => {
    deleteTargetId = id;
    document.getElementById('confirmModal').style.display = 'flex';
};

window.closeConfirmModal = () => {
    deleteTargetId = null;
    document.getElementById('confirmModal').style.display = 'none';
};

window.confirmDeleteAction = async () => {
    if (!deleteTargetId) return;
    
    try {
        await deleteDoc(doc(db, "streamers", deleteTargetId));
        showToast("تم الحذف بنجاح 🗑️");
        loadStreamers();
    } catch (err) {
        showToast("خطأ في الحذف", "error");
    } finally {
        closeConfirmModal();
    }
};

// تشغيل القائمة عند الفتح
loadStreamers();

