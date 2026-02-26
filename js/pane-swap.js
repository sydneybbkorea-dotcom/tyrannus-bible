// pane-swap.js — 패널 헤더를 드래그하여 순서 교환
(function () {
    'use strict';
    var _drag = null; // { pane, startX, startY, ghost, dropTarget }

    function init() {
        var container = document.getElementById('paneContainer');
        if (!container) return;
        container.addEventListener('mousedown', onDown);
        container.addEventListener('touchstart', onDown, { passive: false });
    }

    function onDown(e) {
        // .pane-header 또는 .pane-header-title 클릭인지 확인
        var header = e.target.closest('.pane-header');
        if (!header) return;
        // 버튼/입력 클릭은 무시
        if (e.target.closest('button,input,select,a,.pane-ctrl-btn,.tb-pin,#bibleTabList')) return;
        var pane = header.closest('.pane');
        if (!pane || pane.getAttribute('data-visible') !== 'true') return;

        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;

        _drag = {
            pane: pane,
            startX: clientX,
            startY: clientY,
            started: false,
            ghost: null,
            dropTarget: null
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    }

    function onMove(e) {
        if (!_drag) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // 최소 이동 거리 체크 (5px)
        if (!_drag.started) {
            var dx = Math.abs(clientX - _drag.startX);
            var dy = Math.abs(clientY - _drag.startY);
            if (dx < 5 && dy < 5) return;
            _drag.started = true;
            startDrag(_drag.pane, clientX, clientY);
        }

        if (e.preventDefault) e.preventDefault();

        // 고스트 이동
        if (_drag.ghost) {
            _drag.ghost.style.left = (clientX - _drag.ghostOffX) + 'px';
            _drag.ghost.style.top = (clientY - _drag.ghostOffY) + 'px';
        }

        // 드롭 대상 탐색
        var container = document.getElementById('paneContainer');
        var panes = container.querySelectorAll('.pane[data-visible="true"]');
        var found = null;
        for (var i = 0; i < panes.length; i++) {
            if (panes[i] === _drag.pane) continue;
            var rect = panes[i].getBoundingClientRect();
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                found = panes[i];
                break;
            }
        }

        // 이전 드롭 대상 해제
        if (_drag.dropTarget && _drag.dropTarget !== found) {
            _drag.dropTarget.classList.remove('pane-swap-target');
        }
        // 새 드롭 대상 표시
        if (found) {
            found.classList.add('pane-swap-target');
            _drag.dropTarget = found;
        } else {
            _drag.dropTarget = null;
        }
    }

    function onUp(e) {
        if (!_drag) return;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);

        if (_drag.started && _drag.dropTarget) {
            swapPanes(_drag.pane, _drag.dropTarget);
        }

        // 정리
        if (_drag.ghost) _drag.ghost.remove();
        if (_drag.dropTarget) _drag.dropTarget.classList.remove('pane-swap-target');
        _drag.pane.classList.remove('pane-dragging');
        _drag.pane.style.opacity = '';
        _drag = null;
    }

    function startDrag(pane, x, y) {
        var rect = pane.getBoundingClientRect();

        // 원본 반투명
        pane.classList.add('pane-dragging');
        pane.style.opacity = '0.4';

        // 고스트 생성
        var ghost = document.createElement('div');
        ghost.className = 'pane-swap-ghost';
        var header = pane.querySelector('.pane-header');
        var titleEl = header ? header.querySelector('.pane-header-title') : null;
        ghost.innerHTML = '<i class="fa fa-arrows-alt" style="margin-right:6px"></i>' +
            (titleEl ? titleEl.textContent : pane.id);
        ghost.style.left = (x - 60) + 'px';
        ghost.style.top = (y - 18) + 'px';
        document.body.appendChild(ghost);

        _drag.ghost = ghost;
        _drag.ghostOffX = 60;
        _drag.ghostOffY = 18;
    }

    function swapPanes(a, b) {
        var container = a.parentNode;
        // DOM 순서에서 a, b의 위치를 교환
        var aNext = a.nextSibling;
        var bNext = b.nextSibling;
        if (aNext === b) {
            // a 바로 뒤에 b가 있는 경우
            container.insertBefore(b, a);
        } else if (bNext === a) {
            // b 바로 뒤에 a가 있는 경우
            container.insertBefore(a, b);
        } else {
            // 떨어져 있는 경우
            container.insertBefore(b, aNext);
            container.insertBefore(a, bNext);
        }

        // 리사이즈 핸들 재생성 + 상태 반영
        if (typeof PaneManager !== 'undefined') {
            // 너비 교환
            var aId = a.id.replace('pane-', '');
            var bId = b.id.replace('pane-', '');
            var aW = PaneManager.getWidth(aId);
            var bW = PaneManager.getWidth(bId);
            if (aW || bW) {
                PaneManager.setWidth(aId, bW || null);
                PaneManager.setWidth(bId, aW || null);
            }
        }

        // 스왑 애니메이션
        a.classList.add('pane-swap-anim');
        b.classList.add('pane-swap-anim');
        setTimeout(function () {
            a.classList.remove('pane-swap-anim');
            b.classList.remove('pane-swap-anim');
        }, 300);

        // 패널 순서 저장
        savePaneOrder();
    }

    // 패널 순서 저장/복원
    function savePaneOrder() {
        var container = document.getElementById('paneContainer');
        if (!container) return;
        var panes = container.querySelectorAll('.pane');
        var order = [];
        for (var i = 0; i < panes.length; i++) {
            order.push(panes[i].id.replace('pane-', ''));
        }
        try { localStorage.setItem('kjb2-pane-order', JSON.stringify(order)); } catch (e) { }
    }

    function restorePaneOrder() {
        var container = document.getElementById('paneContainer');
        if (!container) return;
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem('kjb2-pane-order')); } catch (e) { }
        if (!saved || !Array.isArray(saved)) return;
        // 현재 패널들
        var paneMap = {};
        var panes = container.querySelectorAll('.pane');
        for (var i = 0; i < panes.length; i++) {
            paneMap[panes[i].id.replace('pane-', '')] = panes[i];
        }
        // 리사이즈 핸들 제외하고 패널만 재정렬
        saved.forEach(function (id) {
            if (paneMap[id]) {
                container.appendChild(paneMap[id]);
            }
        });
    }

    // DOMContentLoaded 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); restorePaneOrder(); });
    } else {
        init();
        restorePaneOrder();
    }
})();
