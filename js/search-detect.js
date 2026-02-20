// search-detect.js — 검색어 언어 자동 감지 (한글/영어/원어코드)
function _schDetectMode(q){
  const t=q.replace(/[\s"*?|\-]/g,'');
  if(!t) return 'korean';
  if(/^[HG]\d/i.test(t)) return 'original';
  if(/^[a-zA-Z0-9]+$/.test(t)) return 'english';
  return 'korean';
}
