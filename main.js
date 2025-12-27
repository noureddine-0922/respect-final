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
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';
let totalViewersGlobal = 0; // متغير لحساب إجمالي المشاهدين

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

// --- المودال الترحيبي ---
window.checkModal = () => {
    const lastSeen = localStorage.getItem('lastSeenModal');
    const now = new Date().getTime();
    if (!lastSeen || now - lastSeen > 24 * 60 * 60 * 1000) {
        document.getElementById('welcomeModal').classList.add('show');
    }
}
window.closeModal = () => {
    document.getElementById('welcomeModal').classList.remove('show');
    localStorage.setItem('lastSeenModal', new Date().getTime());
}
window.checkModal();

async function fetchStreamers() {
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

function renderStreamers(list) {
    const container = document.getElementById('Streamer-grid');
    container.innerHTML = ''; 
    if(list.length === 0) { container.innerHTML = '<div class="no-results">لا توجد نتائج</div>'; return; }

    list.forEach(streamer => {
        const catDisplay = categoryNames[streamer.category] || streamer.category;
        
        const card = document.createElement('div');
        card.className = 'card'; 
        card.id = `card-${streamer.username}`;
        
        // بناء هيكل البطاقة المنقلبة (Front & Back)
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="status-badge offline"><i class="fa-solid fa-power-off"></i> غير متصل</div>
                    <img src="${streamer.image}" alt="${streamer.name}" class="pfp">
                    <div class="info">
                        <h3>${streamer.name}</h3>
                        <p>${streamer.icName}</p>
                    </div>
                </div>

                <div class="card-back">
                    <div class="back-category">${catDisplay}</div>
                    <div class="back-viewers">
                        <span class="viewer-count">0</span> <i class="fa-solid fa-eye"></i>
                    </div>
                    <a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn">
                        <i class="fa-brands fa-kickstarter"></i> صفحة القناة
                    </a>
                </div>
            </div>
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
            // تحديث بيانات الستريمر
            if(index > -1) {
                allStreamers[index].isLive = true;
                allStreamers[index].viewers = data.livestream.viewer_count;
            }

            const cardFront = cardElement.querySelector('.card-front');
            const cardBack = cardElement.querySelector('.card-back');
            
            // تحديث الوجه الأمامي
            cardFront.classList.add('is-live');
            const badge = cardFront.querySelector('.status-badge');
            badge.className = 'status-badge online';
            badge.innerHTML = '<i class="fa-solid fa-fire fire-anim"></i> بث مباشر';

            // تحديث الوجه الخلفي
            cardBack.querySelector('.viewer-count').innerText = data.livestream.viewer_count;
            const btn = cardBack.querySelector('.watch-btn');
            btn.innerHTML = 'تابع البث الآن 🔴';
            btn.classList.add('is-live-btn');

            document.getElementById('Streamer-grid').prepend(cardElement);

        } else {
             if(index > -1) {
                 allStreamers[index].isLive = false;
                 allStreamers[index].viewers = 0;
             }
        }
        updateGlobalStats(); // تحديث العدادات العامة
    } catch (e) { console.log(e); }
}

// دالة لحساب وتحديث الإحصائيات العامة (عداد المشاهدين والبثوث)
function updateGlobalStats() {
    const liveCount = allStreamers.filter(s => s.isLive).length;
    document.getElementById('liveNow').innerText = liveCount;

    // جمع كل المشاهدين
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
    if (currentCategoryFilter !== 'all') {
        filteredList = filteredList.filter(s => s.category === currentCategoryFilter);
    }
    if (currentStatusFilter === 'live') {
        filteredList = filteredList.filter(s => s.isLive);
    } else if (currentStatusFilter === 'offline') {
        filteredList = filteredList.filter(s => !s.isLive);
    }
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

