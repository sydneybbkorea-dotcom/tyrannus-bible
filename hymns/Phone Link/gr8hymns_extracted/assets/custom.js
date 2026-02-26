// Despia SDK Helper

Object.defineProperty(window, 'despia', {
    set: function(value) {
        if (value) {
            if (value.includes('esim://')) {
                // NO ESIM SUPPORT ON ANDROID YET!
                // const cardData = value.replace('esim://?carddata=', '');
                // window.location.href = "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=" + cardData;
            } else if (value.includes('getclipboard://')) {
                // Use Web Default for iOS Clipboard API
                navigator.clipboard.readText().then(text => {
                window.clipboardData = text;
                showClipboard();
                });
            } else if (value.includes('bioauth://')) {
                // PROGRAMTIC BIO AUTH IS NOT SUPPORTED YET ON ANDROID - USE BIO APP-LOCK
                onBioAuthUnavailable();
            } else if (value.includes('printitem://')) {
                // Extract printItem parameter and navigate to it
                const url = new URL(value.replace('printitem://', 'http://'));
                const printItem = url.searchParams.get('printItem');
                if (printItem) {
                    window.location.href = printItem;
                }
            } else {
                window.location.href = value;
            }
        }
    },
    get: function() {
        return window._despia;
    }
});

// Native-feel Rendering Engine

try {

    const existingStyle = document.getElementById('selection-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'selection-style';

    const css = `
        body * {
            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            tap-highlight-color: transparent;
        }
        
        [selectable="true"] {
            -webkit-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
            -webkit-touch-callout: default !important;
        }
    `;

    style.textContent = css;
    document.head.appendChild(style);
} catch (error) {
    console.error('Failed to apply selection styles:', error);
}

