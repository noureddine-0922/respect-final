import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase
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
let streamers = [];

// وظيفة جلب البيانات الأساسية من Firebase
async function fetchData() {
    try {
        const snap = await getDocs(collection(db, "streamers"));
        streamers = snap.docs.map(d => ({
            ...d.data(), 
            live: false, 
            views: 0, 
            pfp: d.data().image || 'https://via.placeholder.com/150'
        }));
        render(); // الرسم الأولي
        updateStatus(); // بدء جلب الحالات من كيك
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// تحديث حالة البث والمشاهدات من Kick API
async function updateStatus() {
    // جلب الحالات لكل ستريمر بشكل متتابع لتجنب الحظر
    for (const s of streamers) {
        try {
            const r = await fetch(`/api?user=${s.username}&t=${Date.now()}`);
            const d = await r.json();
            
            s.live = d.livestream?.is_live || false;
            s.views = d.livestream?.viewer_count || 0;
            if (d.user?.profile_pic) s.pfp = d.user.profile_pic;
            
            render(); // تحديث الواجهة فوراً عند كل جلب ناجح
        } catch(e) {
            console.warn(`فشل جلب حالة: ${s.username}`);
        }
    }
}

// وظيفة رسم البطاقات بنظام Grid (3-4 في السطر)
function render(filter = 'all') {
    const container = document.getElementById('streamers-container');
    if (!container) return;

    const list = filter === 'all' ? streamers : streamers.filter(x => x.category === filter);
    
    // الترتيب: المباشر أولاً ثم حسب عدد المشاهدين
    list.sort((a, b) => (b.live - a.live) || (b.views - a.views));

    container.innerHTML = list.map(s => `
        <div class="card ${s.live ? 'live-on' : ''}">
            ${s.live ? `<div class="viewers-tag"><i class="fa-solid fa-eye"></i> ${s.views.toLocaleString()}</div>` : ''}
            <img src="${s.pfp}" alt="${s.name}" loading="lazy">
            <h3>${s.name}</h3>
            <p style="font-size:0.8rem; color:#78716c; height: 20px; overflow: hidden;">
                ${s.live ? 'بث مباشر الآن' : (s.icName || 'أوفلاين')}
            </p>
            <a href="https://kick.com/${s.username}" target="_blank" class="watch-btn">مشاهدة القناة</a>
        </div>
    `).join('');

    // تحديث الإحصائيات العلوية
    const liveCount = streamers.filter(x => x.live).length;
    const totalViews = streamers.reduce((a, b) => a + b.views, 0);

    const totalEl = document.getElementById('total-streamers');
    const liveEl = document.getElementById('live-count');
    const viewersEl = document.getElementById('total-viewers');

    if (totalEl) totalEl.innerText = streamers.length;
    if (liveEl) liveEl.innerText = liveCount;
    if (viewersEl) viewersEl.innerText = totalViews.toLocaleString();
}

// نظام الفلترة العالمي
window.runFilter = (cat) => {
    render(cat);
};

// بدء التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchData);

// إعادة تحديث الحالات تلقائياً كل 15 ثانية لضمان الدقة اللحظية
setInterval(updateStatus, 15000);

