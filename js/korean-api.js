// korean-api.js -- 한국어 위키낱말사전 API fetch + 파싱
async function fetchKoreanDef(word){
  var url = 'https://ko.wiktionary.org/w/api.php?action=parse&page=' +
    encodeURIComponent(word) + '&prop=text&format=json&origin=*';
  var res = await fetch(url);
  if(!res.ok) return null;
  var data = await res.json();
  if(data.error) return null;
  return _parseKoreanWiki(data.parse, word);
}

/* HTML 파싱 → 구조화된 결과 */
function _parseKoreanWiki(parsed, word){
  if(!parsed || !parsed.text || !parsed.text['*']) return null;
  var html = parsed.text['*'];
  var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
  var root = doc.body.firstChild;

  var result = { word: word, entries: [] };
  var inKorean = false;
  var curEntry = null;

  var children = root.children;
  for(var i = 0; i < children.length; i++){
    var el = children[i];
    var tag = el.tagName;
    var text = (el.textContent || '').trim();

    // h2 = 언어 섹션 (한국어, 영어, 일본어 등)
    if(tag === 'H2'){
      inKorean = /한국어/.test(text);
      continue;
    }

    if(!inKorean) continue;

    // h3 = 품사 (명사, 동사, 형용사, 부사, 감탄사 등) 또는 발음/어원
    if(tag === 'H3'){
      var posText = text.replace(/\[편집\]/g, '').trim();
      if(/발음|어원|참고|번역/.test(posText)) continue;
      curEntry = { pos: posText, defs: [], examples: [], related: [] };
      result.entries.push(curEntry);
      continue;
    }

    // h4 = 하위 섹션 (관련 어휘, 파생어, 참고 등)
    if(tag === 'H4'){
      continue;
    }

    // ol = 정의 목록
    if(tag === 'OL' && curEntry){
      var items = el.querySelectorAll(':scope > li');
      for(var j = 0; j < items.length; j++){
        var li = items[j];
        // 하위 ol (예문) 분리
        var subOl = li.querySelector('ol, ul');
        var defText = '';
        var exTexts = [];

        if(subOl){
          // 예문 추출
          var subItems = subOl.querySelectorAll('li');
          for(var k = 0; k < subItems.length; k++){
            var ex = subItems[k].textContent.trim();
            if(ex) exTexts.push(ex);
          }
          // 정의 = li 텍스트 - 하위 목록 텍스트
          var clone = li.cloneNode(true);
          var subClone = clone.querySelector('ol, ul');
          if(subClone) subClone.remove();
          defText = clone.textContent.trim();
        } else {
          defText = li.textContent.trim();
        }

        if(defText){
          curEntry.defs.push({ text: defText, examples: exTexts });
        }
      }
      continue;
    }

    // ul = 관련어, 파생어 등
    if(tag === 'UL' && curEntry){
      var relItems = el.querySelectorAll('li');
      for(var r = 0; r < relItems.length; r++){
        var rel = relItems[r].textContent.trim();
        if(rel && curEntry.related.length < 10) curEntry.related.push(rel);
      }
      continue;
    }

    // dl = 발음 정보 등
    if(tag === 'DL' && curEntry){
      var dds = el.querySelectorAll('dd');
      for(var d = 0; d < dds.length; d++){
        var dd = dds[d].textContent.trim();
        if(dd && /예[:\s]|:/.test(dd)){
          curEntry.examples.push(dd);
        }
      }
      continue;
    }

    // 품사 없이 바로 정의가 나오는 경우
    if(tag === 'OL' && !curEntry){
      curEntry = { pos: '', defs: [], examples: [], related: [] };
      result.entries.push(curEntry);
      var items2 = el.querySelectorAll(':scope > li');
      for(var j2 = 0; j2 < items2.length; j2++){
        var t2 = items2[j2].textContent.trim();
        if(t2) curEntry.defs.push({ text: t2, examples: [] });
      }
    }
  }

  return result.entries.length > 0 ? result : null;
}
