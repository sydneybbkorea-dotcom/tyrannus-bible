// highlight-memo-verse.js — [[창1:1]] 구절 링크 실시간 변환
function processVersLinks(el){
  const sel = window.getSelection();
  if(!sel.rangeCount) return;
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  const toReplace = [];
  while(node = tw.nextNode()){
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;
    while(match = regex.exec(node.textContent)){
      toReplace.push({node, match: match[0], ref: match[1], index: match.index});
    }
  }
  if(!toReplace.length) return;
  toReplace.reverse().forEach(({node, match, ref, index})=>{
    const parsed = parseMemoVerseRef(ref);
    if(!parsed) return;
    const before = node.textContent.substring(0, index);
    const after  = node.textContent.substring(index + match.length);
    const textBefore = document.createTextNode(before);
    const link = document.createElement('span');
    link.className = 'memo-vlink';
    link.dataset.ref = parsed.key;
    link.dataset.label = ref;
    link.contentEditable = 'false';
    link.setAttribute('onclick', `event.stopPropagation();navByKey('${parsed.key}')`);
    link.innerHTML = `<i class="fa fa-book-open" style="font-size:9px"></i> ${ref}`;
    const textAfter = document.createTextNode(after);
    const frag = document.createDocumentFragment();
    frag.appendChild(textBefore);
    frag.appendChild(link);
    frag.appendChild(document.createTextNode('\u200B'));
    frag.appendChild(textAfter);
    node.parentNode.replaceChild(frag, node);
  });
  const newRange = document.createRange();
  newRange.selectNodeContents(el);
  newRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(newRange);
}
