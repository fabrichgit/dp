import { Response } from 'express';

const SCRIPT_CONTENT = `
<script>
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Referer': window.location.href,
      'X-Request-URL': window.location.href
    };
    return originalFetch(url, options);
  };

  // Intercept XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    xhr.open = function() {
      const args = arguments;
      originalOpen.apply(xhr, args);
      xhr.setRequestHeader('Referer', window.location.href);
      xhr.setRequestHeader('X-Request-URL', window.location.href);
    };
    return xhr;
  };
</script>`;

export function injectScript(html: string): string {
  if (html.includes('</head>')) {
    return html.replace('</head>', `${SCRIPT_CONTENT}</head>`);
  }
  if (html.includes('<body')) {
    return html.replace('<body', `${SCRIPT_CONTENT}<body`);
  }
  return `${SCRIPT_CONTENT}${html}`;
}