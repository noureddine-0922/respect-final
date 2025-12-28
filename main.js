import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// إعدادات Firebase الخاصة بك
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

let allStreamers = [];
let timeLeft = 15;
const ADMIN_EMAIL = "nounouachour2003@gmail.com"; // تأكد من وضع ايميلك هنا

// --- 1. وظيفة جلب البيانات من Kick (محاكاة متصفح) ---
async function fetchKickData(username) {
    try {
        const response = await fetch(`/api?user=${username}&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        console.error("خطأ في جلب بيانات كيك:", error);
        return null;
    }
}

// --- 2. جلب القائمة من Firebase وتحديث الحالات ---
async function refreshStreamersData() {
    try {
        // إذا كانت القائمة فارغة، نجلبها من Firebase أولاً
        if (allStreamers.length === 0) {
            const q = query(collection(db, "streamers"));
            const querySnapshot = await getDocs(q);
            allStreamers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                live: false,
                viewers: 0,
                title: ""
            }));
        }

        // تحديث الحالات من Kick (نظام الدفعات Batching)
        for (let i = 0; i < allStreamers.length; i += 4) {
            const batch = allStreamers.slice(i, i + 4);
            await Promise.all(batch.map(async (s) => {
                const data = await fetchKickData(s.username);
                if (data) {
                    const idx = allStreamers.findIndex(x => x.username === s.username);
                    allStreamers[idx].live = data.livestream?.is_live || false;
                    allStreamers[idx].viewers = data.livestream?.viewer_count || 0;
                    allStreamers[idx].title = data.livestream?.session_title || "بث مباشر";
                    allStreamers[idx].pfp = data.user?.profile_pic || s.image;
                }
            }));
        }
        renderGrid();
    } catch (err) {
        console.error("فشل التحديث:", err);
    }
}

// --- 3. رسم البطاقات في الصفحة ---
function renderGrid(filteredList = null) {
    const container = document.getElementById('streamers-container');
    if (!container) return;

    const listToDisplay = filteredList || allStreamers;
    
    // ترتيب: المباشر أولاً ثم حسب عدد المشاهدين
    listToDisplay.sort((a, b) => (b.live - a.live) || (b.viewers - a.viewers));

    container.innerHTML = listToDisplay.map(s => `
        <div class="card ${s.live ? 'live-on' : 'live-off'}">
            <div class="badge">${s.live ? '🔴 مباشر' : 'أوفلاين'}</div>
            <div class="pfp-wrap">
                <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" loading="lazy">
                ${s.live ? `<div class="v-count"><i class="fa-solid fa-eye"></i> ${s.viewers.toLocaleString()}</div>` : ''}
            </div>
            <h3>${s.name}</h3>
            <p class="s-title">${s.live ? s.title : (s.icName || 'مواطن')}</p>
            <a href="https://kick.com/${s.username}" target="_blank" class="go-btn">دخول القناة</a>
        </div>
    `).join('');

    updateStats();
}

// --- 4. تحديث شريط الإحصائيات العلوي ---
function updateStats() {
    const liveStreamers = allStreamers.filter(s => s.live);
    const totalViewers = liveStreamers.reduce((acc, curr) => acc + curr.viewers, 0);

    const totalEl = document.getElementById('total-streamers');
    const liveEl = document.getElementById('live-count');
    const viewersEl = document.getElementById('total-viewers');

    if (totalEl) totalEl.innerText = allStreamers.length;
    if (liveEl) liveEl.innerText = liveStreamers.length;
    if (viewersEl) viewersEl.innerText = totalViewers.toLocaleString();
}

// --- 5. نظام الفلترة ---
window.runFilter = (category) => {
    if (category === 'all') {
        renderGrid();
    } else {
        const filtered = allStreamers.filter(s => s.category === category);
        renderGrid(filtered);
    }
};

// --- 6. مؤقت التحديث التلقائي ---
function startTimer() {
    setInterval(() => {
        timeLeft--;
        const clockEl = document.getElementById('refresh-clock');
        const progressEl = document.getElementById('progress-fill');
        
        if (clockEl) clockEl.innerText = timeLeft;
        if (progressEl) progressEl.style.width = `${(timeLeft / 15) * 100}%`;

        if (timeLeft <= 0) {
            timeLeft = 15;
            refreshStreamersData();
        }
    }, 1000);
}

// --- 7. التحقق من دخول الأدمن (لوحة التحكم) ---
onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        console.log("مرحباً أيها الأونر!");
        // هنا يمكنك إظهار أزرار الحذف أو التعديل إذا كانت موجودة في الـ HTML
    }
});

// تشغيل النظام عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    refreshStreamersData();
    startTimer();
});

