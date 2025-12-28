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
let allStreamers = [];
let refreshSeconds = 15; // تقليل الوقت لـ 15 ثانية لسرعة أكبر

// دالة جلب الحالة الفردية (طلقة سريعة عبر Cloudflare)
async function fetchStatus(streamer) {
    try {
        const response = await fetch(`/api?user=${streamer.username}&t=${Date.now()}`);
        const data = await response.json();
        
        const status = {
            isLive: data.livestream?.is_live === true,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null
        };

        const idx = allStreamers.findIndex(s => s.username === streamer.username);
        if (idx !== -1) {
            allStreamers[idx] = { ...allStreamers[idx], ...status };
            updateUI(); // تحديث الواجهة فوراً عند وصول كل نتيجة
        }
    } catch (e) {
        console.error("خطأ في جلب بيانات:", streamer.username);
    }
}

// الدالة الرئيسية لجلب البيانات
async function loadData() {
    try {
        // إذا كانت القائمة فارغة، نجلبها من Firebase أولاً
        if (allStreamers.length === 0) {
            const snap = await getDocs(collection(db, "streamers"));
            allStreamers = snap.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                isLive: false, 
                viewers: 0 
            }));
            updateUI(); 
        }

        // إطلاق جميع الطلبات "بالتوازي" في نفس اللحظة (بدون انتظار متسلسل)
        allStreamers.forEach(s => fetchStatus(s));
        
    } catch (err) {
        console.error("فشل التحميل:", err);
    }
}

function updateUI() {
    // الترتيب: المباشر أولاً ثم الأعلى مشاهدة
    allStreamers.sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));
    renderCards(allStreamers);
    
    // تحديث الأرقام في الهيدر
    const live = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = live.length;
    document.getElementById('total-viewers').innerText = live.reduce((a, b) => a + b.viewers, 0);
}

function renderCards(list) {
    const container = document.getElementById('streamers-container');
    if (!container) return;
    container.innerHTML = list.map(s => `
        <div class="card ${s.isLive ? 'border-live' : ''}">
            <div class="status-tag ${s.isLive ? 'bg-live' : 'bg-off'}">
                ${s.isLive ? `<span class="pulse-dot"></span> مباشر | ${s.viewers}` : 'غير متصل'}
            </div>
            <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="pfp">
            <h3>${s.name}</h3>
            <p><i class="fa-solid fa-id-card"></i> ${s.icName || 'بدون اسم'}</p>
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">مشاهدة</a>
        </div>
    `).join('');
}

// نظام العداد التنازلي الجديد (15 ثانية)
function startTimer() {
    const clock = document.getElementById('refresh-clock');
    setInterval(() => {
        refreshSeconds--;
        if (clock) clock.innerText = refreshSeconds;
        
        if (refreshSeconds <= 0) {
            refreshSeconds = 15;
            loadData();
        }
    }, 1000);
}

// التشغيل الفوري
loadData(); 
startTimer();

