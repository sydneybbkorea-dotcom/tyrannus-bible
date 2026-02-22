// typing-ranking-firebase.js — 타자연습 랭킹 Firestore CRUD (ES Module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = initializeApp({
  apiKey:"AIzaSyDMeWQk6o39IcctkLERX7b6uWWXXTJST30", authDomain:"tyrannus-kjb1611.firebaseapp.com",
  projectId:"tyrannus-kjb1611", storageBucket:"tyrannus-kjb1611.firebasestorage.app",
  messagingSenderId:"86251720686", appId:"1:86251720686:web:bac7cde382e99dcfe588ff"
}, 'typing-ranking');

const db = getFirestore(app);
const COL = 'typing-rankings';

/**
 * Submit score — 1인 1기록, 기존보다 score 높을 때만 업데이트
 * score = CPM × (accuracy / 100)
 * @returns {string} 'new'|'updated'|'not_best'|'error'
 */
async function submitScore(nickname, score, cpm, accuracy, verseRef, lang) {
  try {
    if (!nickname || nickname.length < 2 || nickname.length > 12) return 'error';
    if (score < 0 || score > 1500) return 'error';
    if (cpm < 1 || cpm > 1500) return 'error';
    if (accuracy < 0 || accuracy > 100) return 'error';

    var docId = nickname.toLowerCase().replace(/\s+/g, '_');
    var ref = doc(db, COL, docId);
    var snap = await getDoc(ref);

    var data = {
      nickname: nickname,
      score: score,
      cpm: cpm,
      accuracy: accuracy,
      verseRef: verseRef || '',
      lang: lang || 'kr',
      timestamp: Date.now()
    };

    if (snap.exists()) {
      var existing = snap.data();
      if (score <= (existing.score || 0)) return 'not_best';
      await setDoc(ref, data);
      return 'updated';
    } else {
      await setDoc(ref, data);
      return 'new';
    }
  } catch (e) {
    console.error('Ranking submit error:', e);
    return 'error';
  }
}

/**
 * Fetch TOP 100 rankings sorted by score desc
 * @param {string} langFilter - 'all'|'kr'|'en'
 * @returns {Array} [{nickname, score, cpm, accuracy, verseRef, lang, timestamp}, ...]
 */
async function fetchRankings(langFilter) {
  try {
    var q = query(collection(db, COL), orderBy('score', 'desc'), limit(100));
    var snap = await getDocs(q);
    var results = [];
    snap.forEach(function(d) {
      results.push(d.data());
    });
    if (langFilter && langFilter !== 'all') {
      results = results.filter(function(r) { return r.lang === langFilter; });
    }
    return results;
  } catch (e) {
    console.error('Ranking fetch error:', e);
    return [];
  }
}

/**
 * Get user's rank position
 * @returns {object|null} { rank, data } or null
 */
async function getUserRank(nickname) {
  try {
    if (!nickname) return null;
    var docId = nickname.toLowerCase().replace(/\s+/g, '_');
    var ref = doc(db, COL, docId);
    var snap = await getDoc(ref);
    if (!snap.exists()) return null;
    var userData = snap.data();

    var all = await fetchRankings('all');
    var rank = 1;
    for (var i = 0; i < all.length; i++) {
      if ((all[i].score || 0) > (userData.score || 0)) rank++;
    }
    return { rank: rank, data: userData };
  } catch (e) {
    console.error('Ranking getUserRank error:', e);
    return null;
  }
}

// Expose to window for non-module scripts
window._tpRanking = {
  submitScore: submitScore,
  fetchRankings: fetchRankings,
  getUserRank: getUserRank
};
