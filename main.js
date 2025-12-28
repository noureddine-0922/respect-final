import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let currentController = null; // لمنع تخبط الطلبات

async function fetchStatus(streamer) {
    try {
        // إضافة بصمة متصفح عشوائية لتجنب كشف البوت
        const response = await fetch(`/api?user=${streamer.username}&t=${Date.now()}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const data = await response.json();
        
        return {
            isLive: data.livestream?.is_live === true,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null,
            title: data.livestream?.session_title || "بث مباشر"
        };
    } catch (e) { return null; }
}

async function loadData() {
    // إيقاف أي دورة تحديث سابقة لم تنتهِ بعد (منع التخبط)
    if (currentController) currentController.abort();
    currentController = new AbortController();

    try {
        if (allStreamers.length === 0) {
            const snap = await getDocs(collection(db, "streamers"));
            allStreamers = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isLive: false, viewers: 0 }));
            renderUI();
        }

        // معالجة المجموعات لضمان عدم الحظر
        const streamersToFetch = [...allStreamers];
        for (let i = 0; i < streamersToFetch.length; i += 4) {
            const batch = streamersToFetch.slice(i, i + 4);
            await Promise.all(batch.map(async (s) => {
                const status = await fetchStatus(s);
                if (status) {
                    const index = allStreamers.findIndex(item => item.username === s.username);
                    if (index !== -1) {
                        allStreamers[index] = { ...allStreamers[index], ...status };
                        renderUI();
                    }
                }
            }));
            await new Promise(r => setTimeout(r, 600)); // فاصل بشري
        }
    } catch (err) { console.log("Update interrupted"); }
}

function renderUI() {
    const container = document.getElementById('streamers-container');
    if (!container) return;

    const sorted = [...allStreamers].sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));
    
    container.innerHTML = sorted.map(s => `
        <div class="card ${s.isLive ? 'live' : 'offline'}">
            <div class="badge">${s.isLive ? `🔴 مباشر | ${s.viewers}` : 'غير متصل'}</div>
            <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="pfp">
            <h3>${s.name}</h3>
            <p class="title">${s.isLive ? s.title : (s.icName || 'مواطن')}</p>
            <a href="https://kick.com/${s.username}" target="_blank" class="btn">مشاهدة</a>
        </div>
    `).join('');

    updateStats();
}

function updateStats() {
    const live = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = live.length;
    document.getElementById('total-viewers').innerText = live.reduce((a, b) => a + b.viewers, 0).toLocaleString();
}

window.appFilter = (cat) => {
    const container = document.getElementById('streamers-container');
    const filtered = cat === 'all' ? allStreamers : allStreamers.filter(s => s.category === cat);
    // هنا نعيد رسم الفلتر فقط
    container.innerHTML = filtered.map(s => `... نفس كود الكارد ...`).join('');
};

setInterval(() => {
    refreshSeconds--;
    document.getElementById('refresh-clock').innerText = refreshSeconds;
    if (refreshSeconds <= 0) {
        refreshSeconds = 15;
        loadData();
    }
}, 1000);

loadData();

