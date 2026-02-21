
// ═══════════════════════════════════════════════════
window.S = window.S || {};
const S = window.S;
Object.assign(S, {
  book:'창세기', ch:1, selV:null, selVSet:new Set(),
  hlColor:'Y',
  showStrong:false,
  showParallel:false,
  showKorean:true,
  showEnglish:false,
  showRedLetter:false,
  readPlan:null,
  hl:{}, hlMemo:{}, hlRanges:{}, verseMemo:{}, bk:new Set(),
  notes:[], folders:[
    {id:'default',name:'기본 폴더'},
    {id:'sermon',name:'설교 노트'},
    {id:'devotion',name:'매일 묵상'},
    {id:'study',name:'성경 연구'},
  ],
  curFolder:'default', curNoteId:null, curTags:[],
  schFilter:'all',
  panelOpen:null,
  _noteSubTab:'notes', _dictSubTab:'dict-strongs',
  bookNavOpen:false, explorerOpen:false,   // 슬라이드 패널: 기본 닫힘
  openFolders:new Set(['default']),
  navHistory:[],  // for backlink navigation
  // PDF library state
  pdfFolders: [{id:'pdf-default', name:'기본 폴더'}],
  pdfFiles: [],
  curPdfFolder: 'pdf-default',
  openPdfFolders: new Set(['pdf-default']),
});
