import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const scriptContent = `
<script>
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Referer': window.location.href
    };
    return originalFetch(url, options);
  };

  // Override XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    xhr.open = function() {
      const args = arguments;
      originalOpen.apply(xhr, args);
      xhr.setRequestHeader('Referer', window.location.href);
    };
    return xhr;
  };
</script>
`;

export function injectHeaderScript(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  res.send = function(body) {
    if (typeof body === 'string' && body.includes('</head>')) {
      body = body.replace('</head>', `${scriptContent}</head>`);
    }
    return originalSend.call(this, body);
  };

  next();
}