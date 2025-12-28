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
let refreshSeconds = 30; // توقيت التحديث التلقائي

/**
 * جلب حالة الستريمر من Kick عبر السيرفر الوسيط (Cloudflare Function)
 * لتجنب الحظر ولضمان سرعة التحميل
 */
async function getKickStatus(username) {
    try {
        const response = await fetch(`/api?user=${username}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        return {
            isLive: data.livestream !== null,
            viewers: data.livestream ? data.livestream.viewer_count : 0,
            pfp: data.user ? data.user.profile_pic : null
        };
    } catch (e) {
        console.error("Error fetching Kick status:", e);
        return { isLive: false, viewers: 0, pfp: null };
    }
}

/**
 * جلب جميع الستريمرز من Firebase وتحديث حالاتهم
 */
async function loadData() {
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        const rawData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // جلب البيانات لكل ستريمر بالتوازي لسرعة الأداء
        allStreamers = await Promise.all(rawData.map(async (s) => {
            const status = await getKickStatus(s.username);
            return { ...s, ...status };
        }));

        // الترتيب: المباشر أولاً، ثم حسب عدد المشاهدين
        allStreamers.sort((a, b) => {
            if (a.isLive === b.isLive) return b.viewers - a.viewers;
            return b.isLive - a.isLive;
        });

        updateStats();
        renderStreamers(allStreamers);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

/**
 * تحديث عدادات الإحصائيات في الهيدر
 */
function updateStats() {
    const total = allStreamers.length;
    const liveCount = allStreamers.filter(s => s.isLive).length;
    const totalViewers = allStreamers.reduce((acc, s) => acc + s.viewers, 0);

    document.getElementById('total-streamers').innerText = total;
    document.getElementById('live-count').innerText = liveCount;
    document.getElementById('total-viewers').innerText = totalViewers;
}

/**
 * عرض بطاقات الستريمرز في الحاوية الرئيسية (Grid)
 */
function renderStreamers(list) {
    const container = document.getElementById('streamers-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">لا توجد نتائج مطابقة لبحثك.</p>';
        return;
    }

    list.forEach(s => {
        const card = document.createElement('div');
        card.className = `card ${s.isLive ? 'border-live' : ''}`;
        card.innerHTML = `
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
        `;
        container.appendChild(card);
    });
}

/**
 * نظام التوقيت والعد التنازلي للتحديث التلقائي
 */
function startCountdown() {
    const timerElement = document.getElementById('refresh-clock');
    setInterval(() => {
        refreshSeconds--;
        if (timerElement) timerElement.innerText = refreshSeconds;
        
        if (refreshSeconds <= 0) {
            refreshSeconds = 30; // إعادة التوقيت
            loadData(); // تحديث البيانات من السيرفر
        }
    }, 1000);
}

// نظام البحث عن الستريمرز
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => 
        s.name.toLowerCase().includes(term) || 
        (s.icName && s.icName.toLowerCase().includes(term))
    );
    renderStreamers(filtered);
});

// نظام الفلترة عبر الفئات
window.appFilter = (category) => {
    if (category === 'all') {
        renderStreamers(allStreamers);
    } else {
        const filtered = allStreamers.filter(s => s.category === category);
        renderStreamers(filtered);
    }
};

// تشغيل التطبيق عند التحميل
loadData();
startCountdown();

