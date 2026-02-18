
// ═══════════════════════════════════════════════════
window.S = window.S || {};
const S = window.S;
Object.assign(S, {
  book:'창세기', ch:1, selV:null,
  hlColor:'Y',
  showStrong:false,
  showParallel:false,
  hl:{}, hlMemo:{}, hlRanges:{}, verseMemo:{}, bk:new Set(),
  notes:[], folders:[
    {id:'default',name:'기본 폴더'},
    {id:'sermon',name:'설교 노트'},
    {id:'devotion',name:'매일 묵상'},
    {id:'study',name:'성경 연구'},
  ],
  curFolder:'default', curNoteId:null, curTags:[],
  schFilter:'all',
  panelOpen:'notes',
  _noteSubTab:'notes', _dictSubTab:'dict-strongs',
  bookNavOpen:true, explorerOpen:false,   // drawer starts closed
  openFolders:new Set(['default']),
  navHistory:[],  // for backlink navigation
});
