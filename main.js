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

// جلب الحالة بأسرع طريقة ممكنة عبر Cloudflare
async function fetchStatus(streamer) {
    try {
        const response = await fetch(`/api?user=${streamer.username}&t=${Date.now()}`);
        const data = await response.json();
        const status = {
            isLive: data.livestream?.is_live === true,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null
        };
        
        // تحديث المصفوفة والواجهة فوراً لهذا الستريمر فقط
        const index = allStreamers.findIndex(s => s.username === streamer.username);
        if (index !== -1) {
            allStreamers[index] = { ...allStreamers[index], ...status };
            updateUI(); 
        }
    } catch (e) {
        console.error("Error fetching:", streamer.username);
    }
}

async function loadData() {
    try {
        // 1. جلب البيانات من Firebase (مرة واحدة فقط عند فتح الصفحة)
        if (allStreamers.length === 0) {
            const querySnapshot = await getDocs(collection(db, "streamers"));
            allStreamers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isLive: false,
                viewers: 0
            }));
            renderStreamers(allStreamers); // عرض البطاقات فوراً (حتى لو offline)
        }

        // 2. تحديث الحالات "بالتوازي" (Parallel Fetching)
        // سنطلق جميع الطلبات في نفس اللحظة!
        const fetchPromises = allStreamers.map(streamer => fetchStatus(streamer));
        
        // لا ننتظر هنا، الطلبات تعمل في الخلفية وكل واحد يصل يحدث نفسه
    } catch (error) {
        console.error("Initial load error:", error);
    }
}

function updateUI() {
    // الترتيب: المباشر أولاً ثم الأكثر مشاهدة
    allStreamers.sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));
    renderStreamers(allStreamers);
    updateStats();
}

function renderStreamers(list) {
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

function updateStats() {
    const liveItems = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = liveItems.length;
    document.getElementById('total-viewers').innerText = liveItems.reduce((acc, s) => acc + s.viewers, 0);
}

// تحديث ذكي كل 15 ثانية بدلاً من 30
function startSmartUpdate() {
    loadData(); // أول جلب عند فتح الصفحة
    setInterval(loadData, 15000); // تحديث كل 15 ثانية
}

startSmartUpdate();

