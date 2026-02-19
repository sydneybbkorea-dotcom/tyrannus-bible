═══════════════════════════════════════════════════
  css/ — 스타일시트 (CSS 모듈)
  Tyrannus 표준킹제임스성경 웹앱
═══════════════════════════════════════════════════

[파일 목록 및 역할]

variables.css   — CSS 변수 (색상, 그림자, 테마 등 전역 디자인 토큰)
fonts.css       — @font-face 선언 (KoPubWorld 바탕/돋움 6종 OTF)
layout.css      — 전체 레이아웃 (그리드, 패널 배치, 반응형)
topbar.css      — 상단바 (네비게이션, 검색, 하이라이트 바)
bible.css       — 성경 본문 표시 (구절, 폰트 서식, 하이라이트 색상)
notes.css       — 노트 에디터 및 탐색기 스타일
commentary.css  — 주석/해설 패널 스타일
search.css      — 검색 결과 표시 스타일
ui.css          — 공통 UI (컨텍스트 메뉴, 모달, 토스트, 툴팁)
nav-picker.css  — 성경 책/장 선택 팝업 스타일

[폰트 서식 체계 — 번역 원칙 반영]

  .vtxt           = 바탕체 Medium(500) — 기본 본문
  span.dg         = 돋움체 Light(300)  — 정관사 없는 대문자 명사 (God, Devil)
  b.dg            = 돋움체 Bold(700)   — SUPER CAPS (LORD, GOD)
  b:not(.dg)      = 바탕체 Bold(700)   — 정관사+소문자 명사 (the devil)
  i               = 바탕체 Italic(400) — 원어에 없는 보완 단어

[하이라이트 색상 팔레트 — Tailwind 계열 세련된 톤]

  Yellow  #FACC15  rgba(250,204,21,...)
  Orange  #FB923C  rgba(251,146,60,...)
  Green   #34D399  rgba(52,211,153,...)
  Blue    #60A5FA  rgba(96,165,250,...)
  Purple  #C084FC  rgba(192,132,252,...)

[캐시 버스팅]
  index.html의 CSS link에 ?v=N 쿼리 추가.
  CSS 수정 시 반드시 버전 번호를 올려야 GitHub Pages에 반영됨.
