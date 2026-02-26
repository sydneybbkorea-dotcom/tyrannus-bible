// pane-swap.js — 패널 헤더 드래그로 순서 교환 (슬라이드 애니메이션)
(function () {
    'use strict';
    var _drag = null;

    function init() {
        var container = document.getElementById('paneContainer');
        if (!container) return;
        container.addEventListener('mousedown', onDown);
        container.addEventListener('touchstart', onDown, { passive: false });
    }

    function getClientXY(e) {
        return {
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY
        };
    }

    function onDown(e) {
        var header = e.target.closest('.pane-header');
        if (!header) return;
        if (e.target.closest('button,input,select,a,.pane-ctrl-btn,.tb-pin,#bibleTabList')) return;
        var pane = header.closest('.pane');
        if (!pane || pane.getAttribute('data-visible') !== 'true') return;

        var pt = getClientXY(e);
        var rect = pane.getBoundingClientRect();

        _drag = {
            pane: pane,
            startX: pt.x,
            offsetX: pt.x - rect.left,
            started: false,
            dropTarget: null,
            paneRect: rect,
            origTransform: pane.style.transform || ''
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    }

    function onMove(e) {
        if (!_drag) return;
        var pt = getClientXY(e);

        if (!_drag.started) {
            if (Math.abs(pt.x - _drag.startX) < 8) return;
            _drag.started = true;
            beginDrag();
        }
        if (e.preventDefault) e.preventDefault();

        // 드래그 중인 패널 이동
        var dx = pt.x - _drag.startX;
        _drag.pane.style.transform = 'translateX(' + dx + 'px)';

        // 드롭 대상 탐색
        var container = document.getElementById('paneContainer');
        var panes = container.querySelectorAll('.pane[data-visible="true"]');
        var found = null;
        for (var i = 0; i < panes.length; i++) {
            if (panes[i] === _drag.pane) continue;
            var r = panes[i].getBoundingClientRect();
            var cx = r.left + r.width / 2;
            // 드래그 중인 패널의 현재 중심이 다른 패널 영역에 있으면
            var dragCX = _drag.paneRect.left + _drag.paneRect.width / 2 + dx;
            if (dragCX > r.left && dragCX < r.right) {
                found = panes[i];
                break;
            }
        }

        // 이전 대상 해제
        if (_drag.dropTarget && _drag.dropTarget !== found) {
            _drag.dropTarget.style.transform = '';
            _drag.dropTarget.classList.remove('pane-swap-target');
        }

        // 새 대상: 반대 방향으로 밀어내기 표시
        if (found) {
            found.classList.add('pane-swap-target');
            var dir = _drag.paneRect.left < found.getBoundingClientRect().left ? -1 : 1;
            found.style.transform = 'translateX(' + (dir * _drag.paneRect.width * 0.15) + 'px)';
            _drag.dropTarget = found;
        } else {
            _drag.dropTarget = null;
        }
    }

    function onUp() {
        if (!_drag) return;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);

        if (_drag.started && _drag.dropTarget) {
            animateSwap(_drag.pane, _drag.dropTarget);
        } else {
            // 취소: 원위치로 되돌리기
            endDrag();
        }
    }

    function beginDrag() {
        _drag.pane.style.zIndex = '500';
        _drag.pane.style.transition = 'none';
        _drag.pane.classList.add('pane-dragging');
    }

    function endDrag() {
        if (!_drag) return;
        var pane = _drag.pane;
        pane.style.transition = 'transform .25s ease';
        pane.style.transform = '';
        pane.style.zIndex = '';
        pane.classList.remove('pane-dragging');
        if (_drag.dropTarget) {
            _drag.dropTarget.style.transform = '';
            _drag.dropTarget.style.transition = '';
            _drag.dropTarget.classList.remove('pane-swap-target');
        }
        setTimeout(function () {
            pane.style.transition = '';
        }, 260);
        _drag = null;
    }

    function animateSwap(a, b) {
        var rectA = a.getBoundingClientRect();
        var rectB = b.getBoundingClientRect();
        var dxA = rectB.left - rectA.left;
        var dxB = rectA.left - rectB.left;

        // 즉시 transform 제거하고 최종 위치로 애니메이션
        a.style.transition = 'none';
        b.style.transition = 'none';
        a.style.transform = 'translateX(' + dxA + 'px)';
        b.style.transform = 'translateX(' + dxB + 'px)';
        a.style.zIndex = '500';
        b.style.zIndex = '499';

        // DOM 순서 교환 (transform 상태에서)
        var container = a.parentNode;
        var aNext = a.nextSibling;
        var bNext = b.nextSibling;
        if (aNext === b) {
            container.insertBefore(b, a);
        } else if (bNext === a) {
            container.insertBefore(a, b);
        } else {
            container.insertBefore(b, aNext);
            container.insertBefore(a, bNext);
        }

        // DOM 교환 후 새 위치에서 transform을 0으로 애니메이션
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                a.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1)';
                b.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1)';
                a.style.transform = '';
                b.style.transform = '';
                a.classList.remove('pane-dragging');
                b.classList.remove('pane-swap-target');

                setTimeout(function () {
                    a.style.transition = '';
                    b.style.transition = '';
                    a.style.zIndex = '';
                    b.style.zIndex = '';

                    // 너비 교환 (각 패널이 새 위치 크기 채택)
                    if (typeof PaneManager !== 'undefined') {
                        var aId = a.id.replace('pane-', '');
                        var bId = b.id.replace('pane-', '');
                        var aW = PaneManager.getWidth(aId);
                        var bW = PaneManager.getWidth(bId);
                        PaneManager.setWidth(aId, bW || null);
                        PaneManager.setWidth(bId, aW || null);
                        PaneManager.refreshHandles();
                    }
                    savePaneOrder();
                }, 360);
            });
        });

        _drag = null;
    }

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
        var paneMap = {};
        var panes = container.querySelectorAll('.pane');
        for (var i = 0; i < panes.length; i++) {
            paneMap[panes[i].id.replace('pane-', '')] = panes[i];
        }
        saved.forEach(function (id) {
            if (paneMap[id]) container.appendChild(paneMap[id]);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); restorePaneOrder(); });
    } else {
        init();
        restorePaneOrder();
    }
})();
