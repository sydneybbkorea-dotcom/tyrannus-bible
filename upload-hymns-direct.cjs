// upload-hymns-direct.js — Firebase CLI 인증으로 직접 업로드 (추가 패키지 불필요)
const fs = require('fs');
const path = require('path');
const https = require('https');

const BUCKET = 'tyrannus-kjb1611.firebasestorage.app';
const FIREBASE_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

const DIRS = [
  { local: 'hymns/GR8Hymns/mp3',  remote: 'hymns/mp3',  contentType: 'audio/mpeg' },
  { local: 'hymns/GR8Hymns/sheet', remote: 'hymns/sheet', contentType: 'image/png'  },
];

// ── Firebase CLI 토큰 읽기
function getRefreshToken() {
  const home = process.env.USERPROFILE || process.env.HOME;
  const cfgPath = path.join(home, '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(cfgPath)) throw new Error('Firebase CLI 설정 파일 없음: ' + cfgPath);
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const rt = cfg.tokens?.refresh_token || cfg.user?.tokens?.refresh_token;
  if (!rt) throw new Error('refresh_token을 찾을 수 없습니다. firebase login을 실행하세요.');
  return rt;
}

// ── Access Token 발급
function getAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id: FIREBASE_CLIENT_ID,
      client_secret: FIREBASE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString();
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error('Token error: ' + d));
        resolve(JSON.parse(d).access_token);
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

// ── 단일 파일 업로드
function uploadFile(accessToken, localPath, remotePath, contentType) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(localPath);
    const encodedPath = encodeURIComponent(remotePath);
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET}/o?uploadType=media&name=${encodedPath}`;
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(true);
        else reject(new Error(`Upload ${remotePath}: HTTP ${res.statusCode} - ${d.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.end(data);
  });
}

// ── 디렉토리 업로드
async function uploadDir(accessToken, localDir, remotePrefix, contentType) {
  if (!fs.existsSync(localDir)) { console.warn('  디렉토리 없음:', localDir); return 0; }
  const files = fs.readdirSync(localDir).filter(f => !f.startsWith('.'));
  let ok = 0, fail = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const localPath = path.join(localDir, file);
    const remotePath = remotePrefix + '/' + file;
    try {
      await uploadFile(accessToken, localPath, remotePath, contentType);
      ok++;
      if (ok % 25 === 0 || i === files.length - 1) {
        process.stdout.write(`\r  ${ok}/${files.length} 완료`);
      }
    } catch (e) {
      fail++;
      console.error(`\n  x ${file}: ${e.message}`);
    }
  }
  console.log();
  return ok;
}

// ── 메인
async function main() {
  console.log('=== 찬양 파일 Firebase Storage 업로드 ===\n');
  const rt = getRefreshToken();
  console.log('1. 인증 토큰 발급 중...');
  const token = await getAccessToken(rt);
  console.log('   OK\n');

  let total = 0;
  for (const dir of DIRS) {
    const files = fs.existsSync(dir.local) ? fs.readdirSync(dir.local).filter(f => !f.startsWith('.')) : [];
    console.log(`2. ${dir.local} (${files.length}개)`);
    const n = await uploadDir(token, dir.local, dir.remote, dir.contentType);
    total += n;
  }
  console.log(`\n=== 총 ${total}개 파일 업로드 완료! ===`);
}

main().catch(e => { console.error('오류:', e.message); process.exit(1); });
