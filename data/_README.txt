═══════════════════════════════════════════════════
  data/ — 성경 데이터 및 참조 자료
  Tyrannus 표준킹제임스성경 웹앱
═══════════════════════════════════════════════════

[파일 목록]

bible-kr.json       — 한국어 성경 (표준킹제임스성경)
                      구조: { "창세기": { "1": ["1절텍스트","2절텍스트",...] } }
                      HTML 서식 포함: <span class="dg">, <b class="dg">, <b>, <i>

bible-en.json       — 영어 성경 (KJV)
                      구조: 동일. 키는 한국어 책 이름 사용
                      이탤릭체: <i> 태그 (원어에 없는 보완 단어)

books.js            — 성경 66권 책 목록 배열 (창세기~요한계시록)
                      각 책의 장 수 정보 포함

commentary.json     — 주석/해설 데이터

strongs.json        — Strong's Concordance 사전 데이터
                      히브리어/그리스어 원어 번호별 정의

verse-strongs.json  — 구절별 Strong's 번호 매핑

[한국어 성경 서식 태그 규칙]

  <span class="dg">하나님</span>   — 돋움체 Light: 정관사 없는 대문자 (God)
  <b class="dg">주</b>             — 돋움체 Bold: SUPER CAPS (LORD)
  <b>마귀</b>                      — 바탕체 Bold: 정관사+소문자 (the devil)
  <i>그것이</i>                    — 이탤릭: 원어에 없는 보완 단어

  ※ <b class="dg semi">는 더이상 사용하지 않음 (모두 <b class="dg">로 통합)
