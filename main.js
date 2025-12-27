import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

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
const messaging = getMessaging(app);

// --- كود الاشتراك المحدث (الحل النهائي) ---
window.subscribeUser = async () => {
    try {
        console.log("1. جاري طلب الإذن...");
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log("2. الإذن مقبول، جاري تسجيل السيرفر...");
            
            // تسجيل السيرفر وركر وانتظار تفعيله
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;

            console.log("3. السيرفر جاهز، جاري طلب التوكن...");

            // المفتاح الصحيح مدمج هنا بدقة (بدون مسافات)
            const token = await getToken(messaging, { 
                vapidKey: "BDixhVEmvt_z5kUNrT6OYShBYOdsRo-EOrg976iSjmDFgAYzmOuOFNFQFmWlVAYBefR3gKyQa8kQ-YcLwzYeYRw",
                serviceWorkerRegistration: registration 
            });

            if (token) {
                console.log("✅ تم استلام التوكن:", token);
                await addDoc(collection(db, "subscribers"), { token: token, date: new Date() });
                alert("✅ تم تفعيل التنبيهات بنجاح! 🔔");
                document.getElementById('notifBtn').classList.add('subscribed');
            } else {
                alert("❌ لم يتم استلام التوكن.");
            }
        } else {
            alert("⚠️ يجب الضغط على 'سماح' للإشعارات.");
        }
    } catch (err) {
        console.error("خطأ:", err);
        // عرض رسالة واضحة في حال حدوث خطأ
        alert("❌ خطأ تقني:\n" + err.message);
    }
}

// --- باقي أكواد الموقع (لم يتم تغييرها) ---
let allStreamers = [];
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';

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

async function fetchStreamers() {
    const container = document.getElementById('Streamer-grid');
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        allStreamers = []; 
        querySnapshot.forEach((doc) => {
            allStreamers.push({ id: doc.id, ...doc.data(), isLive: false, viewers: 0 });
        });
        const totalEl = document.getElementById('totalStreamers');
        if(totalEl) totalEl.innerText = allStreamers.length;
        if (allStreamers.length === 0) { container.innerHTML = '<div class="no-results">لا يوجد ستريمرز حالياً</div>'; return; }
        applyFilters();
    } catch (error) { console.log(error); }
}

function renderStreamers(list) {
    const container = document.getElementById('Streamer-grid');
    container.innerHTML = ''; 
    if(list.length === 0) { container.innerHTML = '<div class="no-results">لا توجد نتائج</div>'; return; }

    list.forEach(streamer => {
        const catDisplay = categoryNames[streamer.category] || streamer.category;
        const card = document.createElement('div');
        card.className = 'card';
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
            const badge = cardFront.querySelector('.status-badge');
            if(badge) { badge.className = 'status-badge online'; badge.innerHTML = '<i class="fa-solid fa-fire fire-anim"></i> بث مباشر'; }
            if(cardBack) cardBack.querySelector('.viewer-count').innerText = data.livestream.viewer_count;
            if(btn) { btn.innerHTML = 'تابع البث الآن 🔴'; btn.classList.add('is-live-btn'); }
            
            const grid = document.getElementById('Streamer-grid');
            if(grid) grid.prepend(cardElement);
        }
        updateGlobalStats(); 
    } catch (e) {}
}

function updateGlobalStats() {
    const liveCount = allStreamers.filter(s => s.isLive).length;
    const totalViewers = allStreamers.reduce((sum, s) => sum + (s.viewers || 0), 0);
    const lEl = document.getElementById('liveNow'); const vEl = document.getElementById('totalViewersCount');
    if(lEl) lEl.innerText = liveCount; if(vEl) vEl.innerText = totalViewers;
}

window.filterData = (cat) => {
    currentCategoryFilter = cat; applyFilters();
}
window.filterStatus = (status) => {
    currentStatusFilter = status; applyFilters();
}

function applyFilters() {
    let filteredList = allStreamers;
    if (currentCategoryFilter !== 'all') filteredList = filteredList.filter(s => s.category === currentCategoryFilter);
    if (currentStatusFilter === 'live') filteredList = filteredList.filter(s => s.isLive);
    else if (currentStatusFilter === 'offline') filteredList = filteredList.filter(s => !s.isLive);
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    if(searchVal) {
        filteredList = filteredList.filter(s => s.name.toLowerCase().includes(searchVal) || s.icName.toLowerCase().includes(searchVal));
    }
    renderStreamers(filteredList);
}

const sInput = document.getElementById('searchInput');
if(sInput) sInput.addEventListener('keyup', applyFilters);
fetchStreamers();
setInterval(fetchStreamers, 60000);

