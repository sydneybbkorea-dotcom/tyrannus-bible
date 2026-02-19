// reading-plan-data.js — 읽기 계획 데이터 정의
var READING_PLANS = {
  'year1': {
    name: '1년 통독',
    desc: '구약 + 신약 전체를 365일에 읽기',
    days: 365,
    gen: function(){ return _genFullBible(365); }
  },
  'nt90': {
    name: '신약 90일',
    desc: '신약 27권을 90일에 읽기',
    days: 90,
    gen: function(){ return _genNT(90); }
  },
  'psalm30': {
    name: '시편 30일',
    desc: '시편 150편을 30일에 읽기',
    days: 30,
    gen: function(){ return _genPsalm(30); }
  }
};
