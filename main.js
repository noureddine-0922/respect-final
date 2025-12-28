import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بمشروع ريسبكت
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

let allStreamers = [];
let refreshSeconds = 30;

/**
 * جلب حالة الستريمر من Cloudflare مباشرة (Native Sync)
 * نستخدم t=Date.now لضمان جلب الحالة الحقيقية من كيك
 */
async function getKickStatus(username) {
    try {
        const response = await fetch(`/api?user=${username}&t=${Date.now()}`);
        if (!response.ok) throw new Error('Cloudflare Error');
        const data = await response.json();
        
        return {
            isLive: data.livestream !== null && data.livestream.is_live === true,
            viewers: data.livestream ? data.livestream.viewer_count : 0,
            pfp: data.user ? data.user.profile_pic : null
        };
    } catch (e) {
        console.error(`خطأ في جلب حالة ${username}:`, e);
        return { isLive: false, viewers: 0, pfp: null };
    }
}

/**
 * تحميل البيانات: تعرض البطاقات فوراً ثم تحدث الحالات تدريجياً
 */
async function loadData() {
    try {
        // 1. جلب القائمة من Firebase وعرضها فوراً (بدون انتظار) لضمان السرعة
        const querySnapshot = await getDocs(collection(db, "streamers"));
        allStreamers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isLive: false, // قيمة مبدئية
            viewers: 0
        }));

        // عرض البطاقات الـ 11 فوراً
        renderStreamers(allStreamers);
        updateStats();

        // 2. تحديث حالات البث في الخلفية عبر Cloudflare لكل ستريمر بشكل منفصل
        // هذا يمنع التذبذب لأن كل بطاقة تتحدث فقط عندما تصل بياناتها الحقيقية
        allStreamers.forEach(async (streamer, index) => {
            const status = await getKickStatus(streamer.username);
            
            // تحديث بيانات الستريمر في المصفوفة الأساسية
            allStreamers[index] = { ...streamer, ...status };

            // ترتيب المصفوفة (المباشر أولاً) وتحديث الواجهة تدريجياً
            allStreamers.sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));
            
            renderStreamers(allStreamers);
            updateStats();
        });

    } catch (error) {
        console.error("Firebase Connection Error:", error);
    }
}

/**
 * دالة عرض البطاقات في الحاوية (Grid-3)
 */
function renderStreamers(list) {
    const container = document.getElementById('streamers-container');
    if (!container) return;
    
    container.innerHTML = list.map(s => `
        <div class="card ${s.isLive ? 'border-live' : ''}">
            <div class="status-tag ${s.isLive ? 'bg-live' : 'bg-off'}">
                ${s.isLive ? `<span class="pulse-dot"></span> مباشر | ${s.viewers}` : 'غير متصل'}
            </div>
            <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="pfp" alt="${s.name}">
            <div class="info">
                <h3>${s.name}</h3>
                <p><i class="fa-solid fa-id-card"></i> ${s.icName || 'بدون اسم'}</p>
            </div>
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">
                ${s.isLive ? 'مشاهدة البث' : 'قناة الستريمر'}
            </a>
        </div>
    `).join('');
}

/**
 * تحديث شريط الإحصائيات العلوي
 */
function updateStats() {
    const liveItems = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = liveItems.length;
    document.getElementById('total-viewers').innerText = liveItems.reduce((acc, s) => acc + s.viewers, 0);
}

/**
 * نظام العد التنازلي للتحديث التلقائي
 */
function startCountdown() {
    const timerElement = document.getElementById('refresh-clock');
    setInterval(() => {
        refreshSeconds--;
        if (timerElement) timerElement.innerText = refreshSeconds;
        
        if (refreshSeconds <= 0) {
            refreshSeconds = 30;
            loadData(); // إعادة تشغيل دورة التحديث
        }
    }, 1000);
}

// نظام البحث اللحظي
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => 
        s.name.toLowerCase().includes(term) || (s.icName && s.icName.toLowerCase().includes(term))
    );
    renderStreamers(filtered);
});

// نظام فلترة الفئات (Sidebar)
window.appFilter = (category) => {
    const filtered = category === 'all' ? allStreamers : allStreamers.filter(s => s.category === category);
    renderStreamers(filtered);
};

// تشغيل التطبيق
loadData();
startCountdown();

