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

let allStreamers = [];
let refreshSeconds = 15;
const BATCH_SIZE = 5; // معالجة 5 ستريمرز في كل دفعة (نفس تكنيك الموقع الاحترافي)

/**
 * جلب البيانات من Cloudflare
 * تم إضافة نظام Cache-Busting لضمان أحدث البيانات
 */
async function fetchKickStatus(username) {
    try {
        const response = await fetch(`/api?user=${username}&t=${Date.now()}`);
        if (!response.ok) return null;
        const data = await response.json();
        
        return {
            isLive: data.livestream?.is_live === true,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null,
            title: data.livestream?.session_title || "بث مباشر"
        };
    } catch (e) {
        console.error(`Error fetching ${username}`);
        return null;
    }
}

/**
 * نظام المعالجة على دفعات (Batch Processing)
 * يضمن سرعة البرق دون التعرض لحظر IP المتصفح
 */
async function processInBatches(list) {
    for (let i = 0; i < list.length; i += BATCH_SIZE) {
        const batch = list.slice(i, i + BATCH_SIZE);
        
        // إطلاق دفعة من 5 طلبات متوازية
        await Promise.all(batch.map(async (s) => {
            const status = await fetchKickStatus(s.username);
            if (status) {
                const idx = allStreamers.findIndex(item => item.username === s.username);
                if (idx !== -1) {
                    allStreamers[idx] = { ...allStreamers[idx], ...status };
                    renderUI(); // تحديث الواجهة لحظياً لكل بطاقة تصل
                }
            }
        }));

        // انتظار بسيط (800ms) بين كل دفعة لضمان استقرار الشبكة
        if (i + BATCH_SIZE < list.length) {
            await new Promise(r => setTimeout(r, 800));
        }
    }
}

/**
 * تحميل البيانات الأساسية من Firebase
 */
async function loadData() {
    try {
        // جلب قائمة الستريمرز من Firebase (مرة واحدة فقط عند البداية)
        if (allStreamers.length === 0) {
            const snap = await getDocs(collection(db, "streamers"));
            allStreamers = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isLive: false,
                viewers: 0
            }));
            renderUI(); // عرض الهيكل فوراً
        }

        // بدء عملية تحديث الحالات من Kick
        processInBatches(allStreamers);

    } catch (err) {
        console.error("Firebase Error:", err);
    }
}

/**
 * بناء واجهة المستخدم (Rendering)
 * تم تحسينها لتكون سريعة جداً وتدعم الترتيب اللحظي
 */
function renderUI() {
    const container = document.getElementById('streamers-container');
    if (!container) return;

    // ترتيب القائمة: المباشر أولاً ثم الأعلى مشاهدة
    const sortedList = [...allStreamers].sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));

    // بناء البطاقات
    container.innerHTML = sortedList.map(s => `
        <div class="card ${s.isLive ? 'status-live' : 'status-off'}">
            <div class="card-badge">
                ${s.isLive ? `<span class="pulse">🔴</span> مباشر | ${s.viewers.toLocaleString()}` : 'غير متصل'}
            </div>
            <div class="pfp-container">
                <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="streamer-pfp" loading="lazy">
            </div>
            <div class="streamer-info">
                <h3>${s.name}</h3>
                <p class="sub-text">${s.isLive ? s.title : (s.icName || 'مواطن')}</p>
            </div>
            <a href="https://kick.com/${s.username}" target="_blank" class="watch-btn">
                ${s.isLive ? 'مشاهدة الآن' : 'القناة'}
            </a>
        </div>
    `).join('');

    updateTopStats();
}

/**
 * تحديث الإحصائيات في الهيدر
 */
function updateTopStats() {
    const liveItems = allStreamers.filter(s => s.isLive);
    const totalViewers = liveItems.reduce((acc, s) => acc + s.viewers, 0);

    const elTotal = document.getElementById('total-streamers');
    const elLive = document.getElementById('live-count');
    const elViewers = document.getElementById('total-viewers');

    if (elTotal) elTotal.innerText = allStreamers.length;
    if (elLive) elLive.innerText = liveItems.length;
    if (elViewers) elViewers.innerText = totalViewers.toLocaleString();
}

/**
 * نظام الفلترة (Categories)
 */
window.appFilter = (category) => {
    const container = document.getElementById('streamers-container');
    let filtered;
    
    if (category === 'all') {
        filtered = allStreamers;
    } else {
        filtered = allStreamers.filter(s => s.category === category);
    }
    
    // إعادة بناء الواجهة بناءً على الفلتر
    renderUIFiltered(filtered);
};

function renderUIFiltered(list) {
    // وظيفة مساعدة لعرض القائمة المفلترة فقط دون التأثير على المصفوفة الأصلية
    const container = document.getElementById('streamers-container');
    const sorted = [...list].sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));
    // (نفس كود الـ mapping الموجود في renderUI)
    container.innerHTML = sorted.map(s => `
        <div class="card ${s.isLive ? 'status-live' : 'status-off'}">
            <div class="card-badge">${s.isLive ? `🔴 مباشر | ${s.viewers}` : 'غير متصل'}</div>
            <img src="${s.pfp || s.image}" class="streamer-pfp">
            <h3>${s.name}</h3>
            <a href="https://kick.com/${s.username}" target="_blank" class="watch-btn">دخول</a>
        </div>
    `).join('');
}

/**
 * العداد التنازلي للتحديث (15 ثانية)
 */
function startTimer() {
    const clock = document.getElementById('refresh-clock');
    setInterval(() => {
        refreshSeconds--;
        if (clock) clock.innerText = refreshSeconds;
        
        if (refreshSeconds <= 0) {
            refreshSeconds = 15;
            loadData(); // إعادة دورة الفحص
        }
    }, 1000);
}

// التشغيل الفوري عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    startTimer();
});

