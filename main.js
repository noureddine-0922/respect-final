import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let streamers = [];
let currentFilter = 'all';

// وظيفة جلب البيانات من Firebase
async function fetchData() {
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        streamers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            live: false,
            views: 0,
            title: "",
            pfp: doc.data().image || 'https://via.placeholder.com/150'
        }));
        render(); // عرض البيانات الأولية
        updateStatus(); // بدء تحديث الحالات فوراً
    } catch (error) {
        console.error("خطأ في جلب بيانات الفايربيس:", error);
    }
}

// وظيفة الجلب الذكي (محاكاة إنسان)
async function fetchSmart(username) {
    const headers = new Headers({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    try {
        // إضافة timestamp عشوائي لكسر الكاش تماماً
        const response = await fetch(`/api?user=${username}&_t=${Date.now()}`, { headers });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

// تحديث الحالات بتردد ذكي
async function updateStatus() {
    for (let s of streamers) {
        const data = await fetchSmart(s.username);
        
        if (data) {
            s.live = data.livestream?.is_live || false;
            s.views = data.livestream?.viewer_count || 0;
            s.title = data.livestream?.session_title || "";
            if (data.user?.profile_pic) s.pfp = data.user.profile_pic;
            
            // تحديث الواجهة عند كل تغيير لضمان السرعة
            render(currentFilter);
        }
        // تأخير بسيط (150ms) بين كل طلب وآخر لمحاكاة التصفح الطبيعي
        await new Promise(r => setTimeout(r, 150));
    }
}

// وظيفة الرسم (الريندر) - تدعم الفلترة والترتيب
function render(filter = 'all') {
    currentFilter = filter;
    const container = document.getElementById('streamers-container');
    if (!container) return;

    // تصفية العناصر بناءً على الفئة
    let filtered = filter === 'all' ? streamers : streamers.filter(s => s.category === filter);

    // الترتيب: اللايف أولاً، ثم حسب عدد المشاهدات
    filtered.sort((a, b) => (b.live - a.live) || (b.views - a.views));

    container.innerHTML = filtered.map(s => `
        <div class="card ${s.live ? 'live-on' : ''}">
            ${s.live ? `
                <div class="viewers-tag">
                    <i class="fa-solid fa-eye"></i> ${s.views.toLocaleString()}
                </div>
            ` : ''}
            <img src="${s.pfp}" alt="${s.name}" loading="lazy">
            <h3>${s.name}</h3>
            <p class="stream-status-text">
                ${s.live ? (s.title || 'بث مباشر الآن') : (s.icName || 'غير متصل')}
            </p>
            <a href="https://kick.com/${s.username}" target="_blank" class="watch-btn">
                ${s.live ? 'مشاهدة البث' : 'زيارة القناة'}
            </a>
        </div>
    `).join('');

    updateStatsDisplay();
}

// تحديث عدادات الإحصائيات في الهيدر
function updateStatsDisplay() {
    const liveCount = streamers.filter(s => s.live).length;
    const totalViews = streamers.reduce((acc, s) => acc + s.views, 0);

    const totalEl = document.getElementById('total-streamers');
    const liveEl = document.getElementById('live-count');
    const viewersEl = document.getElementById('total-viewers');

    if (totalEl) totalEl.innerText = streamers.length;
    if (liveEl) liveEl.innerText = liveCount;
    if (viewersEl) viewersEl.innerText = totalViews.toLocaleString();
}

// نظام الفلترة عند الضغط على الأزرار
window.runFilter = (category) => {
    // تحديث شكل الأزرار
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.includes(category) || (category === 'all' && btn.innerText.includes('الكل'))) {
            btn.classList.add('active');
        }
    });
    render(category);
};

// التشغيل عند التحميل
document.addEventListener('DOMContentLoaded', fetchData);

// تحديث دوري شامل كل 30 ثانية لضمان الدقة
setInterval(updateStatus, 30000);

