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
  var root = doc.querySelector('.mw-parser-output') || doc.body.firstChild;

  var result = { word: word, pron: '', entries: [] };
  var inKorean = false;
  var curEntry = null;
  var lastHeadingLevel = 0;
  var skipSection = false;

  var children = root.children;
  for(var i = 0; i < children.length; i++){
    var el = children[i];
    var tag = el.tagName;

    // Wiktionary는 heading을 <div class="mw-heading mw-headingN"> 안에 감쌈
    if(tag === 'DIV' && el.classList.contains('mw-heading')){
      var innerH = el.querySelector('h2, h3, h4, h5');
      if(innerH){
        tag = innerH.tagName;
        var hText = innerH.textContent.trim();

        // H2 = 언어 섹션 (한국어, 영어, 일본어 등)
        if(tag === 'H2'){
          inKorean = /한국어/.test(hText);
          lastHeadingLevel = 2;
          skipSection = false;
          continue;
        }

        if(!inKorean) continue;

        // H3 = 품사 (명사, 동사, 형용사 등) 또는 발음/어원
        if(tag === 'H3'){
          lastHeadingLevel = 3;
          var posClean = hText.replace(/\[편집\]/g, '').trim();
          if(/발음|어원|참고|번역|파생어/.test(posClean)){
            skipSection = true;
            continue;
          }
          skipSection = false;
          curEntry = { pos: posClean, defs: [], related: [] };
          result.entries.push(curEntry);
          continue;
        }

        // H4 = 하위 항목 (명사 1, 명사 2, 관련 어휘 등)
        if(tag === 'H4'){
          lastHeadingLevel = 4;
          var h4Text = hText.replace(/\[편집\]/g, '').trim();
          if(/관련\s*어휘|참고/.test(h4Text)){
            skipSection = false; // 관련 어휘는 수집
            continue;
          }
          if(/발음|어원|번역/.test(h4Text)){
            skipSection = true;
            continue;
          }
          skipSection = false;
          // 하위 품사 항목 (명사 1, 명사 2 등) → 새 엔트리로 분리하지 않음
          continue;
        }

        // H5 = 관련 어휘 등
        if(tag === 'H5'){
          lastHeadingLevel = 5;
          skipSection = false;
          continue;
        }
      }
      continue;
    }

    if(!inKorean) continue;
    if(skipSection) continue;

    // 발음 정보 (IPA) 추출
    if(tag === 'UL' && !curEntry){
      var ipaEl = el.querySelector('.IPA');
      if(ipaEl && !result.pron){
        result.pron = ipaEl.textContent.trim();
      }
      continue;
    }

    // OL = 정의 목록
    if(tag === 'OL'){
      if(!curEntry){
        curEntry = { pos: '', defs: [], related: [] };
        result.entries.push(curEntry);
      }
      var items = el.querySelectorAll(':scope > li');
      for(var j = 0; j < items.length; j++){
        var li = items[j];
        var subList = li.querySelector('ol, ul');
        var defText = '';
        var exTexts = [];

        if(subList){
          var subItems = subList.querySelectorAll('li');
          for(var k = 0; k < subItems.length; k++){
            var ex = subItems[k].textContent.trim();
            if(ex) exTexts.push(ex);
          }
          var clone = li.cloneNode(true);
          var sc = clone.querySelector('ol, ul');
          if(sc) sc.remove();
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

    // DL = 예문 (definition → example 패턴)
    if(tag === 'DL' && curEntry){
      var exLis = el.querySelectorAll('dd ul li, dd li');
      for(var d = 0; d < exLis.length; d++){
        var exText = exLis[d].textContent.trim();
        if(exText && curEntry.defs.length > 0){
          var lastDef = curEntry.defs[curEntry.defs.length - 1];
          lastDef.examples.push(exText);
        }
      }
      continue;
    }

    // UL = 관련어/유의어/반의어/동사/형용사
    if(tag === 'UL' && curEntry){
      var relItems = el.querySelectorAll(':scope > li');
      for(var r = 0; r < relItems.length; r++){
        var relText = relItems[r].textContent.trim();
        if(relText && !/^어원/.test(relText) && curEntry.related.length < 12){
          curEntry.related.push(relText);
        }
      }
      continue;
    }
  }

  return result.entries.length > 0 ? result : null;
}
