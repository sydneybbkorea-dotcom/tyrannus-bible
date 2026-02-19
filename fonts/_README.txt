═══════════════════════════════════════════════════
  fonts/ — 자체 호스팅 웹폰트 (KoPubWorld)
  Tyrannus 표준킹제임스성경 웹앱
═══════════════════════════════════════════════════

[파일 목록]

KoPubWorld-Batang-Pro-Light.otf    — 바탕(명조) Light  300
KoPubWorld-Batang-Pro-Medium.otf   — 바탕(명조) Medium 500
KoPubWorld-Batang-Pro-Bold.otf     — 바탕(명조) Bold   700

KoPubWorld-Dotum-Pro-Light.otf     — 돋움(고딕) Light  300
KoPubWorld-Dotum-Pro-Medium.otf    — 돋움(고딕) Medium 500
KoPubWorld-Dotum-Pro-Bold.otf      — 돋움(고딕) Bold   700

[사용처]

  바탕(Batang) = 기본 본문체 (.vtxt)
    - Light(300): 본문 기본 → 현재 Medium(500) 사용 중
    - Bold(700):  정관사+소문자 명사 b:not(.dg)

  돋움(Dotum) = 특수 표기체 (.dg 클래스)
    - Light(300): span.dg (하나님=God, 정관사 없는 대문자)
    - Bold(700):  b.dg (주=LORD, SUPER CAPS)
    - Medium(500): 과거 b.dg.semi에 사용 → 현재 미사용

[참고]
  KoPubWorld는 Light/Medium/Bold 3가지 두께만 제공.
  Regular(400), Extra Bold(900) 없음.
  -webkit-text-stroke로 시각적 두께 미세 조절 가능.

  @font-face 선언: css/fonts.css
