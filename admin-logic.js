import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- نظام الدخول ---
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authSection = document.getElementById('admin-auth');
const dashSection = document.getElementById('admin-dashboard');

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    // استبدل الايميل بالخاص بك لتكون أنت الأونر الوحيد
    if (user && user.email === "nounouachour2003@gmail.com") {
        authSection.style.display = 'none';
        dashSection.style.display = 'block';
    } else {
        authSection.style.display = 'flex';
        dashSection.style.display = 'none';
    }
});

// --- إدارة الستريمرز ---
let previewData = null;

document.getElementById('btnFetch').onclick = async () => {
    const user = document.getElementById('kickUser').value.trim();
    if(!user) return alert("أدخل اليوزر أولاً");

    const res = await fetch(`/api?user=${user}`);
    const data = await res.json();

    if(data.user) {
        previewData = {
            username: user,
            name: data.user.username,
            image: data.user.profile_pic
        };
        document.getElementById('previewBox').innerHTML = `
            <div class="card" style="margin:auto; width:200px">
                <img src="${previewData.image}" style="width:100%; border-radius:50%">
                <p>${previewData.name}</p>
            </div>
        `;
        document.getElementById('btnSave').style.display = 'block';
    } else {
        alert("لم يتم العثور على اليوزر");
    }
};

document.getElementById('btnSave').onclick = async () => {
    const cat = document.getElementById('catSelect').value;
    try {
        await addDoc(collection(db, "streamers"), {
            ...previewData,
            category: cat,
            createdAt: new Date()
        });
        alert("تم الحفظ بنجاح!");
        location.reload();
    } catch(e) { alert("خطأ في الحفظ"); }
};

