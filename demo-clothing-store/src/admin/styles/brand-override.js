// Replace "Medusa" with "Zahan" on admin login page and change logo
(function () {
    // Configuration - Change these values
    const BRAND_NAME = 'Zahan';
    // Use relative path from admin folder  
    const LOGO_URL = 'assets/zahan-logo.png'; // Logo in admin assets folder

    function replaceMedusaText() {
        // Find all text nodes and headings
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue && node.nodeValue.includes('Medusa')) {
                textNodes.push(node);
            }
        }

        // Replace text in all found nodes
        textNodes.forEach(textNode => {
            textNode.nodeValue = textNode.nodeValue.replace(/Medusa/g, BRAND_NAME);
        });

        // Also update page title if it contains Medusa
        if (document.title.includes('Medusa')) {
            document.title = document.title.replace(/Medusa/g, BRAND_NAME);
        }
    }

    function replaceLogo() {
        // Find the Medusa logo (SVG icon on login page)
        const svgIcons = document.querySelectorAll('svg');

        svgIcons.forEach(svg => {
            // Check if this looks like the Medusa logo (usually at the top of login)
            const parent = svg.parentElement;
            if (!parent) return;

            // Look for SVG that's centered and near the top (likely the logo)
            const isLikelyLogo =
                svg.width?.baseVal?.value >= 40 ||
                svg.height?.baseVal?.value >= 40 ||
                parent.tagName === 'FIGURE' ||
                (parent.className && typeof parent.className === 'string' &&
                    (parent.className.includes('logo') || parent.className.includes('icon')));

            if (isLikelyLogo) {
                if (LOGO_URL) {
                    // Replace with custom logo
                    const img = document.createElement('img');
                    img.src = LOGO_URL;
                    img.alt = BRAND_NAME;
                    img.style.width = '64px';
                    img.style.height = '64px';
                    img.style.objectFit = 'contain';

                    // Add error handler to show fallback if image fails to load
                    img.onerror = function () {
                        console.error('Logo failed to load from:', LOGO_URL);
                        // Fallback to letter badge
                        const brandText = document.createElement('div');
                        brandText.textContent = BRAND_NAME.charAt(0);
                        brandText.style.cssText = `
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: bold;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
                        parent.replaceChild(brandText, img);
                    };

                    parent.replaceChild(img, svg);
                } else {
                    // Just hide the Medusa icon or replace with text
                    svg.style.display = 'none';

                    // Optionally add brand name text
                    const brandText = document.createElement('div');
                    brandText.textContent = BRAND_NAME.charAt(0); // Just first letter
                    brandText.style.cssText = `
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          `;
                    parent.insertBefore(brandText, svg);
                }
            }
        });
    }

    function applyBranding() {
        replaceMedusaText();
        replaceLogo();
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBranding);
    } else {
        applyBranding();
    }

    // Also observe for dynamic content changes
    const observer = new MutationObserver(applyBranding);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();
