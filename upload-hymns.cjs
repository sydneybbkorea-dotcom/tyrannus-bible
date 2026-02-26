#!/usr/bin/env node
// upload-hymns.js — 찬양 파일을 Firebase Storage에 업로드
// 사용법: node upload-hymns.js
//
// 사전 준비:
//   1. npm install firebase-admin
//   2. Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성
//   3. 다운로드한 JSON 파일을 프로젝트 루트에 'service-account.json'으로 저장
//   4. node upload-hymns.js 실행

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

// ── 설정 ──
const SERVICE_ACCOUNT = './service-account.json';
const BUCKET = 'tyrannus-kjb1611.firebasestorage.app';
const DIRS = [
  { local: 'hymns/GR8Hymns/mp3',   remote: 'hymns/mp3',   type: 'audio/mpeg' },
  { local: 'hymns/GR8Hymns/sheet',  remote: 'hymns/sheet', type: 'image/png'  },
];

// ── 초기화 ──
if (!existsSync(SERVICE_ACCOUNT)) {
  console.error('❌ service-account.json 파일이 없습니다.');
  console.error('   Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성');
  console.error('   다운로드한 파일을 프로젝트 루트에 service-account.json으로 저장하세요.');
  process.exit(1);
}

const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT, 'utf8'));
initializeApp({ credential: cert(sa), storageBucket: BUCKET });
const bucket = getStorage().bucket();

// ── 업로드 ──
async function uploadDir(localDir, remotePrefix, contentType) {
  if (!existsSync(localDir)) {
    console.warn(`⚠ 디렉토리 없음: ${localDir}`);
    return 0;
  }
  const files = readdirSync(localDir);
  let count = 0;
  for (const file of files) {
    const localPath = join(localDir, file);
    const remotePath = `${remotePrefix}/${file}`;
    try {
      await bucket.upload(localPath, {
        destination: remotePath,
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });
      count++;
      if (count % 20 === 0) console.log(`  ... ${count}/${files.length} 업로드 완료`);
    } catch (e) {
      console.error(`  ✗ ${file}: ${e.message}`);
    }
  }
  return count;
}

async function main() {
  console.log('🎵 찬양 파일 Firebase Storage 업로드 시작\n');
  let total = 0;
  for (const dir of DIRS) {
    console.log(`📁 ${dir.local} → ${dir.remote}`);
    const n = await uploadDir(dir.local, dir.remote, dir.type);
    console.log(`  ✔ ${n}개 파일 업로드 완료\n`);
    total += n;
  }
  console.log(`🎉 총 ${total}개 파일 업로드 완료!`);
  console.log('\n다음 단계:');
  console.log('  1. firebase deploy --only storage  (Storage 규칙 배포)');
  console.log('  2. firebase deploy --only hosting   (웹앱 재배포)');
}

main().catch(e => { console.error('업로드 실패:', e); process.exit(1); });
