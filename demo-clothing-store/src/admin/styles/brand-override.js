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

// ─── FILE SIZE LIMIT: Warn & BLOCK uploads > 500 KB ───────────────────────
(function () {
  var MAX_FILE_SIZE = 500 * 1024; // 500 KB in bytes
  var MAX_FILE_SIZE_LABEL = "500 KB";

  // ── Toast UI ──────────────────────────────────────────────────────────────
  function getOrCreateToastContainer() {
    var container = document.getElementById("__file-size-toast");
    if (!container) {
      container = document.createElement("div");
      container.id = "__file-size-toast";
      container.style.cssText =
        "position:fixed;top:20px;right:20px;z-index:99999;" +
        "display:flex;flex-direction:column;gap:8px;pointer-events:none;";
      document.body.appendChild(container);
    }
    return container;
  }

  function showWarning(fileName, fileSize) {
    var container = getOrCreateToastContainer();
    var toast = document.createElement("div");
    var sizeKB = (fileSize / 1024).toFixed(1);

    toast.style.cssText =
      "pointer-events:auto;" +
      "background:#FEF2F2;" +
      "border:1px solid #FCA5A5;" +
      "border-left:4px solid #EF4444;" +
      "color:#991B1B;" +
      "padding:12px 16px;" +
      "border-radius:8px;" +
      "font-size:13px;" +
      "font-family:Inter,system-ui,sans-serif;" +
      "max-width:380px;" +
      "box-shadow:0 10px 25px rgba(0,0,0,0.15);" +
      "animation:fileSizeSlideIn 0.3s ease-out;" +
      "line-height:1.5;";

    toast.innerHTML =
      '<div style="font-weight:600;margin-bottom:4px;">⚠️ File Too Large</div>' +
      "<div><strong>" + fileName + "</strong> is " + sizeKB + " KB.</div>" +
      "<div>Maximum allowed size is <strong>" + MAX_FILE_SIZE_LABEL + "</strong>.</div>" +
      '<div style="margin-top:6px;font-size:12px;color:#B91C1C;">' +
      "Please compress or resize the image before uploading.</div>";

    container.appendChild(toast);

    setTimeout(function () {
      toast.style.animation = "fileSizeFadeOut 0.3s ease-in forwards";
      setTimeout(function () { toast.remove(); }, 300);
    }, 6000);
  }

  // Inject animation keyframes
  var style = document.createElement("style");
  style.textContent =
    "@keyframes fileSizeSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }" +
    "@keyframes fileSizeFadeOut { from { opacity: 1; } to { opacity: 0; } }";
  document.head.appendChild(style);

  // Helper: check if a File is oversized
  function isOversized(file) {
    return file && file.size && file.size > MAX_FILE_SIZE;
  }

  // Helper: check a FileList / array for oversized files, show warnings
  function checkAndWarnFiles(files) {
    if (!files || files.length === 0) return false;
    var blocked = false;
    for (var i = 0; i < files.length; i++) {
      if (isOversized(files[i])) {
        showWarning(files[i].name, files[i].size);
        blocked = true;
      }
    }
    return blocked;
  }

  // ── LAYER 1: Intercept file input change events ───────────────────────────
  // Stop the event completely in capture phase so React never sees it.
  document.addEventListener(
    "change",
    function (e) {
      var input = e.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;

      var files = input.files;
      if (!files || files.length === 0) return;

      if (checkAndWarnFiles(files)) {
        // BLOCK: prevent React from seeing this event
        e.stopImmediatePropagation();
        e.preventDefault();

        // Clear the input value
        try { input.value = ""; } catch (err) { /* ignore */ }
      }
    },
    true // capture phase
  );

  // ── LAYER 2: Intercept drag-and-drop events ──────────────────────────────
  // Medusa admin uses drag-and-drop for media uploads
  document.addEventListener(
    "drop",
    function (e) {
      var dt = e.dataTransfer;
      if (!dt || !dt.files || dt.files.length === 0) return;

      if (checkAndWarnFiles(dt.files)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true // capture phase
  );

  // ── LAYER 3: Monkey-patch fetch() to block oversized uploads ──────────────
  // This is the ultimate safety net — even if the file gets past the input
  // handler, we block the network request itself.
  var originalFetch = window.fetch;
  window.fetch = function (url, options) {
    // Only intercept upload requests
    var urlStr = typeof url === "string" ? url : (url && url.url ? url.url : "");
    if (urlStr.indexOf("/uploads") !== -1 && options && options.body) {
      var body = options.body;

      // Check if body is FormData (used for file uploads)
      if (body instanceof FormData) {
        var blocked = false;
        // FormData.entries() lets us inspect the files
        if (typeof body.entries === "function") {
          var entries = body.entries();
          var entry = entries.next();
          while (!entry.done) {
            var val = entry.value[1];
            if (val instanceof File && isOversized(val)) {
              showWarning(val.name, val.size);
              blocked = true;
            }
            entry = entries.next();
          }
        }

        if (blocked) {
          // Return a rejected promise that mimics a server error
          return Promise.reject(
            new Error("Upload blocked: file exceeds " + MAX_FILE_SIZE_LABEL + " limit.")
          );
        }
      }
    }

    return originalFetch.apply(this, arguments);
  };

  // ── LAYER 4: Monkey-patch XMLHttpRequest as fallback ──────────────────────
  var originalXHROpen = XMLHttpRequest.prototype.open;
  var originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.__uploadUrl = url;
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this.__uploadUrl && this.__uploadUrl.indexOf("/uploads") !== -1 && body instanceof FormData) {
      var blocked = false;
      if (typeof body.entries === "function") {
        var entries = body.entries();
        var entry = entries.next();
        while (!entry.done) {
          var val = entry.value[1];
          if (val instanceof File && isOversized(val)) {
            showWarning(val.name, val.size);
            blocked = true;
          }
          entry = entries.next();
        }
      }

      if (blocked) {
        // Abort the request
        this.abort();
        return;
      }
    }

    return originalXHRSend.apply(this, arguments);
  };

  console.log("[Zahan] File size limit enforcement active: max " + MAX_FILE_SIZE_LABEL);
})();

// ─── PERSISTENT SORT MEMORY for Admin Products Page ──────────────────────────
// Medusa stores sort in URL query params: ?order=title (asc), ?order=-title (desc).
// Problem: replaceState only changes the URL bar — React doesn't re-read it.
// Solution: use window.location.replace() for a real redirect so Medusa reads
//           the sort params on its initial render.
(function () {
  var STORAGE_KEY = "__alariya_products_sort";
  var REDIRECT_FLAG = "__alariya_sort_redirected";

  function isProductsPage() {
    return /^\/app\/products\/?$/.test(window.location.pathname);
  }

  function getOrderParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get("order") || null;
  }

  // ── SAVE: Whenever sort changes on products page, persist it ───────────────
  function saveSort() {
    if (!isProductsPage()) return;
    var order = getOrderParam();
    if (order) {
      localStorage.setItem(STORAGE_KEY, order);
      console.log("[Zahan] Products sort saved:", order);
    }
  }

  // ── RESTORE: On products page with no sort, redirect with saved sort ───────
  function restoreSort() {
    if (!isProductsPage()) return;

    // Already have sort params — just save them
    if (getOrderParam()) {
      saveSort();
      // Clear redirect flag since we landed successfully
      sessionStorage.removeItem(REDIRECT_FLAG);
      return;
    }

    // Prevent infinite redirect loop
    if (sessionStorage.getItem(REDIRECT_FLAG)) {
      sessionStorage.removeItem(REDIRECT_FLAG);
      return;
    }

    var savedOrder = localStorage.getItem(STORAGE_KEY);
    if (!savedOrder) return;

    // Build the new URL with saved sort
    var params = new URLSearchParams(window.location.search);
    params.set("order", savedOrder);
    var newUrl = window.location.pathname + "?" + params.toString();

    console.log("[Zahan] Restoring products sort:", savedOrder, "→", newUrl);

    // Set flag BEFORE redirect to prevent loops
    sessionStorage.setItem(REDIRECT_FLAG, "1");

    // Real redirect — Medusa will read ?order= on mount
    window.location.replace(newUrl);
  }

  // ── Hook into History API to detect sort changes and page navigation ────────
  var originalPushState = window.history.pushState.bind(window.history);
  var originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function (state, title, url) {
    originalPushState(state, title, url);
    setTimeout(function () {
      saveSort();
      // If navigating TO products page without sort, restore
      if (isProductsPage() && !getOrderParam()) {
        restoreSort();
      }
    }, 150);
  };

  window.history.replaceState = function (state, title, url) {
    originalReplaceState(state, title, url);
    setTimeout(saveSort, 150);
  };

  window.addEventListener("popstate", function () {
    setTimeout(function () {
      saveSort();
      if (isProductsPage() && !getOrderParam()) {
        restoreSort();
      }
    }, 150);
  });

  // ── URL polling to catch Medusa's internal param updates ──────────────────
  var lastUrl = window.location.href;
  setInterval(function () {
    var currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      saveSort();
    }
  }, 500);

  // ── Run immediately on page load ──────────────────────────────────────────
  // This runs before React mounts, so the redirect happens early
  restoreSort();

  console.log("[Zahan] Products sort memory active");
})();
