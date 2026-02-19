// bible-renderer.js — renderBible() main rendering function
function renderBible(){
  const vs=BIBLE[S.book]?.[S.ch]||[];
  const chTitle = document.getElementById('chTitle');
  const chSub = document.getElementById('chSub');
  const chNavLbl = document.getElementById('chNavLbl');
  const cont=document.getElementById('vCont');

  if(chTitle) chTitle.textContent=`${S.book} ${S.ch}장`;
  if(chSub) chSub.textContent=BOOK_EN[S.book]||S.book;
  if(chNavLbl) chNavLbl.textContent=`${S.ch} / ${CHCNT[S.book]||'?'}장`;

  if(!cont) return;

  if(!vs.length){
    cont.innerHTML=`<div style="text-align:center;color:var(--text3);padding:60px 0;font-size:14px;line-height:2.2"><i class="fa fa-book-open" style="font-size:36px;display:block;margin-bottom:16px"></i>이 장의 성경 데이터가 준비 중이에요.<br><span style="font-size:12px">표준킹제임스성경 66권 전권 수록</span></div>`;
    return;
  }
  cont.innerHTML='';
  vs.forEach((txt,i)=>{
    const vn=i+1; const key=`${S.book}_${S.ch}_${vn}`;
    const hlC=S.hl[key];
    const hasNote=S.notes.some(n=>n.vRefs&&n.vRefs.includes(key));
    const hasBk=S.bk.has(key);
    const hasComm=!!(COMMENTARY[S.book]?.[S.ch]?.[vn]);

    const row=document.createElement('div');
    // hlC가 있어도 mark 방식(드래그)이면 hl-row 클래스 안 붙임
    // S.hl[key]가 'MARK:색상' 형태면 mark 방식, 단순 색상이면 row 방식
    const isMarkHL = hlC && String(hlC).startsWith('MARK:');
    const hlCls = (hlC && !isMarkHL && !S.showStrong) ? ` hl-row-${hlC.toLowerCase()}` : '';
    const isSel = S.selVSet?.has(vn);
    row.className='vrow'+(isSel?' vsel':'')+hlCls;
    row.dataset.v=vn;

    // 스트롱 코드 인라인 추가
    let displayTxt = txt;
    if(S.showStrong){
      const vs = VERSE_STRONGS[key];
      if(vs){
        vs.forEach(({word, codes})=>{
          const codeSpans = codes.map(c=>`<span class="str-code" onclick="event.stopPropagation();showStrongDef('${c}')" title="${c}">${c}</span>`).join('');
          // 첫 번째 매치만 교체 (중복 방지)
          const idx = displayTxt.indexOf(word);
          if(idx >= 0){
            displayTxt = displayTxt.substring(0, idx) + word + codeSpans + displayTxt.substring(idx + word.length);
          }
        });
      }
    }

    const rl = (typeof isRedLetter==='function') && isRedLetter(key) ? ' red-letter' : '';
    const wantEN = !!S.showEnglish;
    const wantKR = !!S.showKorean;
    const kjvTxt = wantEN ? (KJV?.[S.book]?.[S.ch]?.[i] || '') : '';
    const kjvDisplay = (S.showStrong && kjvTxt && typeof renderEnStrongsInline==='function') ? renderEnStrongsInline(kjvTxt,S.book,S.ch,vn) : kjvTxt;
    const indic = `<span class="vindic">${hasNote?'<span class="vd vd-n" title="노트 있음"></span>':''}${hasBk?'<span class="vd vd-b" title="북마크"></span>':''}${hasComm?'<span class="vd vd-c" title="주석 있음"></span>':''}</span>`;
    if(wantKR && wantEN && kjvTxt){
      // 한영 대조
      row.className='vrow vrow-parallel'+(isSel?' vsel':'')+hlCls;
      row.innerHTML=`<span class="vnum">${vn}</span><span class="vtxt vtxt-kr${rl}" data-key="${key}">${displayTxt}</span><span class="vtxt-en-side"><span class="en-vnum">${vn}</span>${kjvDisplay}</span>${indic}`;
    } else if(wantEN && !wantKR && kjvTxt){
      // 영어만
      row.innerHTML=`<span class="vnum">${vn}</span><span class="vtxt vtxt-en-only" data-key="${key}">${kjvDisplay}</span>${indic}`;
    } else {
      // 한글만 (기본) 또는 영어 데이터 없을 때 한글 폴백
      row.innerHTML=`<span class="vnum">${vn}</span><span class="vtxt${rl}" data-key="${key}">${displayTxt}</span>${indic}`;
    }
    row.onclick=e=>selVerse(vn,e);
    row.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      selVerse(vn,e);
      setTimeout(()=>showCtx(e), 10);
    });
    cont.appendChild(row);
  });
  // 저장된 하이라이트 범위 복원 (원어 코드 표시 중에는 건너뜀)
  if(!S.showStrong) requestAnimationFrame(()=>restoreHL());
}
