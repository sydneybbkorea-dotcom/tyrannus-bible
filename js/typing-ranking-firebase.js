// typing-ranking-firebase.js — 타자연습 랭킹 Firestore CRUD (ES Module)
// 메인 firebase.js가 먼저 로드되므로 기본 앱(인증 포함)을 재사용
import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const COL = 'typing-rankings';

/**
 * Submit score — 1인 1기록, 기존보다 score 높을 때만 업데이트
 * @returns {string} 'new'|'updated'|'not_best'|'no_auth'|'error'
 */
async function submitScore(nickname, score, cpm, accuracy, verseRef, lang) {
  try {
    // 로그인 확인
    if (!auth.currentUser) {
      console.warn('Ranking: 로그인 필요');
      return 'no_auth';
    }

    if (!nickname || nickname.length < 2 || nickname.length > 12) return 'error';
    if (score < 0 || score > 3000) return 'error';
    if (cpm < 1 || cpm > 3000) return 'error';
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
      uid: auth.currentUser.uid,
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
    return 'error:' + (e.code || e.message || 'unknown');
  }
}

/**
 * Fetch TOP 100 rankings sorted by score desc
 * @param {string} langFilter - 'all'|'kr'|'en'
 * @returns {Array}
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
