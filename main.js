import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴🔴 ألصق كود الـ Firebase Config حقك هنا 🔴🔴
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

// 📝 قاموس الأسماء (هنا يترجم الكود للاسم اللي يظهر في البطاقة)
const categoryNames = {
    'police': 'الشرطة ',
    'ems': 'الإسعاف ',
    'justice': 'العدل ',
    's.ops': 'قوات خاصة ',
    'citizen': 'مواطن ',
    'obeid': 'عائلة عبيد ',
    'plus': 'عصابة البلس ',
    'brazil': 'البرازيليين ',
    'east': 'عصابة الشرق ',
    'west': 'عصابة الغرب ',
    'middle': 'Middle Gang ',
    'nwa': 'N.W.A ',
    'crypto': 'Crypto ',
    'yakuza': 'عائلة الياكوزا ',
    'oldschool': 'Old School '
};

async function fetchStreamers() {
    const container = document.getElementById('Streamer-grid');
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        allStreamers = []; 
        querySnapshot.forEach((doc) => {
            allStreamers.push(doc.data());
        });

        if (allStreamers.length === 0) {
            container.innerHTML = '<div class="loading">لا يوجد ستريمرز حالياً 🤷‍♂️</div>';
            return;
        }
        renderStreamers(allStreamers);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="loading" style="color:red">تأكد من إعدادات Firebase</div>';
    }
}

function renderStreamers(list) {
    const container = document.getElementById('Streamer-grid');
    container.innerHTML = ''; 

    if(list.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد نتائج 🔍</div>';
        return;
    }

    list.forEach(streamer => {
        // نأخذ الاسم من القاموس، وإذا ما لقيناه نعرض الكود نفسه
        const catDisplay = categoryNames[streamer.category] || streamer.category;

        const card = document.createElement('div');
        card.className = 'card'; 
        card.innerHTML = `
            <div class="status-badge">OFFLINE</div>
            <img src="${streamer.image}" alt="${streamer.name}" class="pfp">
            <div class="info">
                <h3>${streamer.name}</h3>
                <p>${streamer.icName}</p>
                <span class="category">${catDisplay}</span>
            </div>
            <a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn">صفحة القناة</a>
        `;
        container.appendChild(card);
        checkLiveStatus(streamer.username, card);
    });
}

// فلترة البيانات
window.filterData = (cat) => {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (cat === 'all') {
        renderStreamers(allStreamers);
    } else {
        const filtered = allStreamers.filter(s => s.category === cat);
        renderStreamers(filtered);
    }
}

// البحث
document.getElementById('searchInput').addEventListener('keyup', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => 
        s.name.toLowerCase().includes(val) || 
        s.icName.toLowerCase().includes(val) ||
        (categoryNames[s.category] && categoryNames[s.category].toLowerCase().includes(val))
    );
    renderStreamers(filtered);
});

async function checkLiveStatus(username, cardElement) {
    try {
        const response = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await response.json();
        if (data && data.livestream) {
            cardElement.classList.add('is-live');
            cardElement.querySelector('.status-badge').innerText = 'LIVE 🔥';
            cardElement.querySelector('.watch-btn').innerText = "تابع البث 🔴";
        }
    } catch (e) { console.log(e); }
}

fetchStreamers();

