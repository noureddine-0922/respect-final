import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- التحقق من وضع الصيانة (أول خطوة) ---
async function checkMaintenance() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "config"));
        if (docSnap.exists() && docSnap.data().maintenance === true) {
            // إذا الصيانة مفعلة، اخفِ كل شيء واظهر شاشة الصيانة
            document.body.innerHTML = `
                <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#0b0e11; color:white; text-align:center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:5rem; color:#ffcc00; margin-bottom:20px;"></i>
                    <h1 style="font-family:'Cairo';">الموقع تحت الصيانة</h1>
                    <p style="font-family:'Cairo'; color:#ccc;">نعمل على تحسينات في السيرفر، سنعود قريباً! 🛠️</p>
                </div>
            `;
            return true; // توقف عن تنفيذ باقي الكود
        }
    } catch(e) { console.log("Maintenance check skipped"); }
    return false;
}

// باقي الكود القديم (لن يعمل إذا كان الموقع في صيانة)
let allStreamers = [];
// ... (نفس المتغيرات السابقة)

const categoryNames = {
    'police': '<i class="fa-solid fa-handcuffs"></i> الشرطة',
    'ems': '<i class="fa-solid fa-truck-medical"></i> الإسعاف',
    'justice': '<i class="fa-solid fa-scale-balanced"></i> العدل',
    's.ops': '<i class="fa-solid fa-mask"></i> قوات خاصة',
    'citizen': '<i class="fa-solid fa-user"></i> مواطن',
    'obeid': 'عائلة عبيد', 'plus': 'عصابة البلس', 'brazil': 'البرازيليين',
    'east': 'عصابة الشرق', 'west': 'عصابة الغرب', 'middle': 'Middle Gang',
    'nwa': 'N.W.A', 'crypto': 'Crypto', 'yakuza': 'الياكوزا', 'oldschool': 'Old School'
};

// ... (نفس كود المودال الترحيبي القديم) ...

async function fetchStreamers() {
    // 🛑 فحص الصيانة قبل جلب البيانات
    const isMaintenance = await checkMaintenance();
    if(isMaintenance) return; 

    const container = document.getElementById('Streamer-grid');
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        allStreamers = []; 
        querySnapshot.forEach((doc) => {
            allStreamers.push({ id: doc.id, ...doc.data(), isLive: false, viewers: 0 });
        });
        document.getElementById('totalStreamers').innerText = allStreamers.length;
        if (allStreamers.length === 0) {
            container.innerHTML = '<div class="no-results">لا يوجد ستريمرز حالياً</div>';
            return;
        }
        applyFilters();
    } catch (error) { console.error(error); }
}

// ... (انسخ باقي الدوال القديمة: renderStreamers, checkLiveStatus, updateGlobalStats, filters, etc.) ...
// تأكد من نسخ الدوال كاملة من الكود السابق، فقط أضفت دالة checkMaintenance في البداية
// سأكتب لك بقية الدوال الأساسية هنا لتنسخها كاملة وتريح رأسك:

function renderStreamers(list) {
    const container = document.getElementById('Streamer-grid');
    container.innerHTML = ''; 
    if(list.length === 0) { container.innerHTML = '<div class="no-results">لا توجد نتائج</div>'; return; }

    list.forEach(streamer => {
        const catDisplay = categoryNames[streamer.category] || streamer.category;
        const card = document.createElement('div');
        card.className = 'card'; 
        card.id = `card-${streamer.username}`;
        card.innerHTML = `
            <div class="flip-wrapper">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="status-badge offline"><i class="fa-solid fa-power-off"></i> غير متصل</div>
                        <img src="${streamer.image}" alt="${streamer.name}" class="pfp">
                        <div class="info"><h3>${streamer.name}</h3><p>${streamer.icName}</p></div>
                    </div>
                    <div class="card-back">
                        <div class="back-category">${catDisplay}</div>
                        <div class="back-viewers"><span class="viewer-count">0</span> <i class="fa-solid fa-eye"></i></div>
                    </div>
                </div>
            </div>
            <a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn"><i class="fa-brands fa-kickstarter"></i> صفحة القناة</a>
        `;
        container.appendChild(card);
        checkLiveStatus(streamer.username, card);
    });
}

async function checkLiveStatus(username, cardElement) {
    try {
        const response = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await response.json();
        const index = allStreamers.findIndex(s => s.username === username);

        if (data && data.livestream) {
            if(index > -1) { allStreamers[index].isLive = true; allStreamers[index].viewers = data.livestream.viewer_count; }
            const cardFront = cardElement.querySelector('.card-front');
            const cardBack = cardElement.querySelector('.card-back');
            const btn = cardElement.querySelector('.watch-btn');

            cardFront.classList.add('is-live');
            cardFront.querySelector('.status-badge').className = 'status-badge online';
            cardFront.querySelector('.status-badge').innerHTML = '<i class="fa-solid fa-fire fire-anim"></i> بث مباشر';
            cardBack.querySelector('.viewer-count').innerText = data.livestream.viewer_count;
            btn.innerHTML = 'تابع البث الآن 🔴';
            btn.classList.add('is-live-btn');
            document.getElementById('Streamer-grid').prepend(cardElement);
        } else {
             if(index > -1) { allStreamers[index].isLive = false; allStreamers[index].viewers = 0; }
        }
        updateGlobalStats(); 
    } catch (e) { console.log(e); }
}

function updateGlobalStats() {
    const liveCount = allStreamers.filter(s => s.isLive).length;
    document.getElementById('liveNow').innerText = liveCount;
    const totalViewers = allStreamers.reduce((sum, s) => sum + (s.viewers || 0), 0);
    document.getElementById('totalViewersCount').innerText = totalViewers > 0 ? totalViewers : '0';
}

window.filterData = (cat) => {
    document.querySelectorAll('.sidebar .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentCategoryFilter = cat;
    applyFilters();
}
window.filterStatus = (status) => {
    document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentStatusFilter = status;
    applyFilters();
}

function applyFilters() {
    let filteredList = allStreamers;
    if (currentCategoryFilter !== 'all') filteredList = filteredList.filter(s => s.category === currentCategoryFilter);
    if (currentStatusFilter === 'live') filteredList = filteredList.filter(s => s.isLive);
    else if (currentStatusFilter === 'offline') filteredList = filteredList.filter(s => !s.isLive);
    
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    if(searchVal) {
        filteredList = filteredList.filter(s => 
            s.name.toLowerCase().includes(searchVal) || 
            s.icName.toLowerCase().includes(searchVal) ||
            (categoryNames[s.category] && categoryNames[s.category].toLowerCase().includes(searchVal))
        );
    }
    renderStreamers(filteredList);
}

document.getElementById('searchInput').addEventListener('keyup', applyFilters);
fetchStreamers();
setInterval(fetchStreamers, 60000);

