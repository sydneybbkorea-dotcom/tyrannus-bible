// Notes editor inline HTML insertion using Range API (prevents unwanted newlines)
function insertInlineHTML(htmlStr) {
  const nc = document.getElementById('noteContent');
  nc.focus();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    // 커서 없으면 끝에 추가
    nc.innerHTML += htmlStr;
    return;
  }

  const range = sel.getRangeAt(0);
  range.deleteContents();

  // HTML 문자열 → DocumentFragment
  const tpl = document.createElement('template');
  tpl.innerHTML = htmlStr;
  const frag = tpl.content.cloneNode(true);

  // fragment의 마지막 노드 기억 (커서 위치용)
  const lastNode = frag.lastChild;

  range.insertNode(frag);

  // 커서를 삽입된 노드 바로 뒤로 이동
  if (lastNode) {
    const newRange = document.createRange();
    newRange.setStartAfter(lastNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}
