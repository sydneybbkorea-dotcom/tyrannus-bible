═══════════════════════════════════════════════════
  js/ — 자바스크립트 모듈 (기능별 분리)
  Tyrannus 표준킹제임스성경 웹앱
═══════════════════════════════════════════════════

[규칙] 파일당 30줄 이하 권장. 새 파일은 첫 줄에 한줄 설명 주석 필수.

── 앱 초기화 ────────────────────────────────────
app.js              — 메인 진입점. 데이터 로딩 후 renderAll() 호출
state.js            — 전역 상태 객체 (S.book, S.ch, S.selV 등)
storage.js          — localStorage 저장/복원 (하이라이트, 메모, 설정)
theme.js            — 다크/라이트 테마 전환
ui-utils.js         — 공통 유틸리티 (toast, debounce 등)

── 성경 렌더링 ──────────────────────────────────
bible-renderer.js       — 성경 구절 렌더링 (HTML 생성, chTitle 업데이트)
bible-renderer-hl.js    — 저장된 하이라이트를 구절에 복원 적용
bible-tabs.js           — 성경 탭 생성/관리
bible-tabs-render.js    — renderAll() — 전체 화면 갱신 총괄

── 데이터 로딩 ──────────────────────────────────
data-loader.js      — bible-kr.json, bible-en.json, commentary.json 비동기 로딩

── 네비게이션 ───────────────────────────────────
book-nav.js         — 책 목록, 이전장/다음장 이동
nav-picker.js       — 책/장 선택 팝업 (메인 컨트롤러)
nav-picker-render.js — 팝업 내 책/장 목록 렌더링
nav-picker-actions.js — 책/장 선택 시 동작 처리
nav-picker-ui.js    — 팝업 열기/닫기 UI 로직

── 구절 선택 & 컨텍스트 메뉴 ────────────────────
verse-select.js         — 구절 클릭 선택/해제
context-menu.js         — 우클릭 컨텍스트 메뉴 표시/숨김
context-menu-actions.js — 메뉴 항목별 실행 함수
context-menu-notelink.js — 메뉴에서 노트 연결
context-menu-versememo.js — 구절 메모 모달

── 하이라이트 (형광펜) ──────────────────────────
highlight.js            — 하이라이트 코어 (mark 클릭, 복사 이벤트)
highlight-picker.js     — 드래그 선택 시 색상 피커 UI (모바일 터치 지원)
highlight-apply.js      — mark 태그 감싸기, 범위 적용
highlight-memo.js       — 하이라이트 메모 팝업 생성
highlight-memo-data.js  — 메모 데이터 로딩/위치 계산
highlight-memo-save.js  — 메모 저장/삭제/닫기
highlight-memo-tags.js  — 메모 태그 관리
highlight-memo-filter.js — 메모 필터링
highlight-memo-search.js — 메모 검색
highlight-memo-parse.js  — 메모 파싱
highlight-memo-notelink.js — 메모↔노트 연결
highlight-memo-verse.js  — 구절별 메모 표시

── 주석/해설 ────────────────────────────────────
commentary.js           — 주석 패널 메인 컨트롤러
commentary-chapter.js   — 장 단위 주석 렌더링
commentary-verse.js     — 구절 단위 주석 표시

── 노트 에디터 ──────────────────────────────────
notes-editor.js         — 노트 에디터 메인
notes-editor-inline.js  — 인라인 편집 기능
notes-editor-insert.js  — 노트에 구절/링크 삽입
notes-manager.js        — 노트 목록 관리
notes-manager-save.js   — 노트 자동/수동 저장
notes-manager-ui.js     — 노트 매니저 UI
notes-folders.js        — 노트 폴더 구조
notes-folders-crud.js   — 폴더 생성/수정/삭제
notes-folders-ctx.js    — 폴더 우클릭 메뉴

── 노트 링크 시스템 ─────────────────────────────
notes-links.js          — 링크 감지 메인
notes-links-embed.js    — 임베드 처리
notes-links-file.js     — 파일 링크
notes-links-notelink.js — 노트간 상호 링크
notes-links-url.js      — URL 링크
notes-links-verse.js    — 성경 구절 참조 링크
notes-links-vtip.js     — 구절 툴팁 표시
notes-links-youtube.js  — YouTube 임베드

── 아웃라인 ─────────────────────────────────────
outline.js          — 아웃라인 메인
outline-note.js     — 아웃라인-노트 연동
outline-note-ui.js  — 아웃라인 노트 UI

── 검색 ─────────────────────────────────────────
search.js           — 검색 UI 및 입력 처리
search-exec.js      — 검색 실행 로직
search-quick.js     — 빠른 검색 (상단바)

── Strong's 번호 ────────────────────────────────
strongs-ui.js       — Strong's 번호 UI 표시
strongs-ui-def.js   — Strong's 정의 팝업
strongs-ui-search.js — Strong's 번호 검색

── 패널 관리 ────────────────────────────────────
panels.js           — 좌/우 패널 표시/숨김
panel-nav.js        — 패널 내 네비게이션
panel-tabs.js       — 패널 탭 관리
panel-tabs-sub.js   — 서브 탭

── 기타 ─────────────────────────────────────────
read-mode.js        — 읽기 모드 (UI 숨김, 집중 모드)
app-paste.js        — 붙여넣기 처리
firebase.js         — Firebase 초기화 (클라우드 동기화)
firebase-ui.js      — Firebase 로그인 UI
