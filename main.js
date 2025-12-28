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
const BATCH_SIZE = 5; [span_1](start_span)// جلب 5 ستريمرز في كل دفعة لمنع الحظر[span_1](end_span)

/**
 * جلب البيانات من Kick عبر نظام الوكيل المتوازي
 * [span_2](start_span)نستخدم تكتيك "كسر الكاش" لضمان بيانات لحظية[span_2](end_span)
 */
async function fetchKickStatus(streamer) {
    try {
        const response = await fetch(`/api?user=${streamer.username}&t=${Date.now()}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        return {
            isLive: data.livestream?.is_live === true,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null,
            title: data.livestream?.session_title || [span_3](start_span)""[span_3](end_span)
        };
    } catch (e) {
        return { isLive: false, viewers: 0, pfp: null, title: "" };
    }
}

/**
 * معالجة الستريمرز بنظام الدفعات (Batch Processing)
 * [span_4](start_span)لضمان عدم الضغط على الـ API وتجنب الـ 403[span_4](end_span)
 */
async function processStreamersInBatches(list) {
    for (let i = 0; i < list.length; i += BATCH_SIZE) {
        const batch = list.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (streamer) => {
            const status = await fetchKickStatus(streamer);
            const idx = allStreamers.findIndex(s => s.username === streamer.username);
            if (idx !== -1) {
                allStreamers[idx] = { ...allStreamers[idx], ...status };
                [span_5](start_span)renderUI(); // تحديث تدريجي للواجهة[span_5](end_span)
            }
        }));
        [span_6](start_span)// فاصل زمني بسيط بين الدفعات لتقليد السلوك البشري[span_6](end_span)
        if (i + BATCH_SIZE < list.length) await new Promise(r => setTimeout(r, 1000));
    }
}

async function loadData() {
    try {
        if (allStreamers.length === 0) {
            const snap = await getDocs(collection(db, "streamers"));
            allStreamers = snap.docs.map(doc => ({ 
                id: doc.id, ...doc.data(), isLive: false, viewers: 0 
            }));
            renderUI();
        }

        [span_7](start_span)// ترتيب الأولية: نفحص من كانوا "Live" أولاً لسرعة التحديث[span_7](end_span)
        const queue = [...allStreamers].sort((a, b) => b.isLive - a.isLive);
        await processStreamersInBatches(queue);

    } catch (err) {
        console.error("Critical Load Error", err);
    }
}

function renderUI() {
    const container = document.getElementById('streamers-container');
    if (!container) return;

    [span_8](start_span)// ترتيب العرض: المباشر أولاً ثم حسب عدد المشاهدين[span_8](end_span)
    allStreamers.sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));

    [span_9](start_span)// استخدام الـ Fragment لتحسين الأداء ومنع الوميض[span_9](end_span)
    container.innerHTML = allStreamers.map(s => `
        <div class="card ${s.isLive ? 'live-border' : ''}">
            <div class="status-badge ${s.isLive ? 'bg-live' : 'bg-off'}">
                ${s.isLive ? `🔴 مباشر | ${s.viewers.toLocaleString('en-US')}` : 'غير متصل'}
            </div>
            <div class="pfp-wrapper">
                <img src="${s.pfp || s.image || 'placeholder.png'}" class="pfp" loading="lazy">
            </div>
            <h3>${s.name}</h3>
            ${s.isLive ? `<p class="stream-title">📺 ${s.title}</p>` : `<p class="ic-name">🆔 ${s.icName || 'غير متوفر'}</p>`}
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-btn">
                ${s.isLive ? 'شاهد البث الآن' : 'انتقل للقناة'}
            </a>
        </div>
    `).join('');

    updateStats();
}

function updateStats() {
    const live = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = live.length;
    [span_10](start_span)document.getElementById('total-viewers').innerText = live.reduce((a, b) => a + b.viewers, 0).toLocaleString('en-US');[span_10](end_span)
}

function startTimer() {
    setInterval(() => {
        refreshSeconds--;
        const clock = document.getElementById('refresh-clock');
        if (clock) clock.innerText = refreshSeconds;
        
        if (refreshSeconds <= 0) {
            refreshSeconds = 15;
            loadData(); 
        }
    }, 1000);
}

[span_11](start_span)// التشغيل عند الجاهزية[span_11](end_span)
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    startTimer();
});

