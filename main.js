// استيراد مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ إعدادات Firebase الخاصة بك (مصححة)
const firebaseConfig = {
    apiKey: "AIzaSyBjEc-wdY6s6v0AiVg4texFrohLwDcdaiU",
    authDomain: "respect-db-d1320.firebaseapp.com",
    projectId: "respect-db-d1320", 
    storageBucket: "respect-db-d1320.firebasestorage.app",
    messagingSenderId: "823436634480",
    appId: "1:823436634480:web:3380974cce87d8e82b07b5"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// دالة لجلب الستريمرز
async function fetchStreamers() {
    // 🔴 هنا كان سبب المشكلة: عدلنا الاسم ليطابق ملفك HTML
    const container = document.getElementById('Streamer-grid'); 
    
    if (!container) {
        console.error("لم يتم العثور على العنصر Streamer-grid في ملف HTML");
        return;
    }

    container.innerHTML = '<div style="color:white; text-align:center; width:100%;">جاري تحميل الستريمرز... 📡</div>';

    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        const streamers = [];

        querySnapshot.forEach((doc) => {
            streamers.push(doc.data());
        });

        if (streamers.length === 0) {
            container.innerHTML = '<div style="color:white; text-align:center; width:100%;">لا يوجد ستريمرز حالياً 🤷‍♂️</div>';
            return;
        }

        // بدء الرسم
        renderStreamers(streamers);

    } catch (error) {
        console.error("Error getting documents: ", error);
        container.innerHTML = '<div style="color:red; text-align:center;">تأكد من إعدادات قواعد البيانات (Rules) في Firebase</div>';
    }
}

// دالة رسم البطاقات
function renderStreamers(streamersList) {
    const container = document.getElementById('Streamer-grid');
    container.innerHTML = ''; 

    streamersList.forEach(streamer => {
        const card = document.createElement('div');
        card.className = 'card'; 
        // تصميم البطاقة
        card.innerHTML = `
            <div class="status offline">OFFLINE</div>
            <img src="${streamer.image}" alt="${streamer.name}" class="pfp">
            <div class="info">
                <h3>${streamer.name}</h3>
                <p>${streamer.icName}</p>
                <span class="category-badge">${streamer.category}</span>
            </div>
            <a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn">صفحة القناة</a>
        `;
        
        container.appendChild(card);
        checkLiveStatus(streamer.username, card);
    });
}

// فحص حالة البث (API)
async function checkLiveStatus(username, cardElement) {
    try {
        const response = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await response.json();

        if (data && data.livestream) {
            const statusDiv = cardElement.querySelector('.status');
            statusDiv.className = 'status online';
            statusDiv.innerText = 'LIVE 🔥';
            statusDiv.style.background = "#53fc18";
            statusDiv.style.color = "black";
            
            cardElement.style.borderColor = "#53fc18";
            cardElement.style.boxShadow = "0 0 15px rgba(83, 252, 24, 0.3)";

            const btn = cardElement.querySelector('.watch-btn');
            btn.innerText = "تابع البث 🔴";
            btn.style.background = "#53fc18";
            btn.style.color = "black";
        }
    } catch (e) {
        console.log(`Error checking ${username}`);
    }
}

// تشغيل عند البدء
fetchStreamers();

