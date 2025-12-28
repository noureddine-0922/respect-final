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
let refreshSeconds = 30;
let cycleCount = 0; // لعد الدورات وتطبيق التحديث الذكي

async function getKickStatus(username) {
    try {
        const response = await fetch(`/api?user=${username}&t=${Date.now()}`);
        if (!response.ok) return { isLive: false, viewers: 0, pfp: null };
        const data = await response.json();
        return {
            isLive: data.livestream !== null && data.livestream.is_live === true,
            viewers: data.livestream ? data.livestream.viewer_count : 0,
            pfp: data.user?.profile_pic || null
        };
    } catch (e) {
        return { isLive: false, viewers: 0, pfp: null };
    }
}

// دالة المعالجة على دفعات (Chunking)
async function processInChunks(array, chunkSize) {
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (streamer) => {
            // تحديث ذكي: إذا كان offline، نفحصه فقط كل دورتين
            if (!streamer.isLive && cycleCount % 2 !== 0) {
                return; // تخطي الفحص في هذه الدورة
            }
            
            const status = await getKickStatus(streamer.username);
            const index = allStreamers.findIndex(s => s.username === streamer.username);
            if (index !== -1) {
                allStreamers[index] = { ...allStreamers[index], ...status };
                // تحديث الواجهة فوراً عند كل نتيجة
                updateUI();
            }
        }));
    }
}

async function loadData() {
    try {
        // جلب البيانات لأول مرة فقط أو إذا كانت القائمة فارغة
        if (allStreamers.length === 0) {
            const querySnapshot = await getDocs(collection(db, "streamers"));
            allStreamers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isLive: false,
                viewers: 0
            }));
            updateUI();
        }

        cycleCount++;

        // إعطاء الأولوية للستريمرز الـ Live حالياً
        const liveOnes = allStreamers.filter(s => s.isLive);
        const offlineOnes = allStreamers.filter(s => !s.isLive);
        const sortedQueue = [...liveOnes, ...offlineOnes];

        // بدء الجلب المتسلسل (5 طلبات في كل دفعة)
        await processInChunks(sortedQueue, 5);

    } catch (error) {
        console.error("Error:", error);
    }
}

function updateUI() {
    // ترتيب: مباشر أولاً ثم حسب عدد المشاهدين
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
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">قناة الستريمر</a>
        </div>
    `).join('');
}

function updateStats() {
    const liveItems = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = liveItems.length;
    document.getElementById('total-viewers').innerText = liveItems.reduce((acc, s) => acc + s.viewers, 0);
}

function startCountdown() {
    const timerElement = document.getElementById('refresh-clock');
    setInterval(() => {
        refreshSeconds--;
        if (timerElement) timerElement.innerText = refreshSeconds;
        if (refreshSeconds <= 0) {
            refreshSeconds = 30;
            loadData();
        }
    }, 1000);
}

loadData();
startCountdown();

