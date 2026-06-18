/** Parse LibreOffice HTML export for in-browser format-preserved editing */

export type ParsedEditorHtml = {
  styles: string;
  body: string;
  bodyAttrs: string;
  title: string;
};

export type EditorBundleMeta = {
  sourceFileId: string;
  editableFileId: string;
  htmlFileName: string;
  sourcePlainText?: string;
  editorPlainText?: string;
};

export function parseLibreOfficeHtml(html: string): ParsedEditorHtml {
  const source = html || '';
  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const bodyOpenMatch = source.match(/<body([^>]*)>/i);
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const titleMatch = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  return {
    styles: styleMatch?.[1]?.trim() || '',
    body: bodyMatch?.[1]?.trim() || source,
    bodyAttrs: bodyOpenMatch?.[1]?.trim() || ' lang="en-US" dir="ltr"',
    title: titleMatch?.[1]?.trim() || 'Document',
  };
}

export function buildLibreOfficeHtml(
  styles: string,
  body: string,
  title = 'Document',
  bodyAttrs = ' lang="en-US" dir="ltr"',
): string {
  const attrs = bodyAttrs.trim().startsWith(' ') ? bodyAttrs : ` ${bodyAttrs}`;
  return `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
<title>${escapeHtml(title)}</title>
<style type="text/css">
${styles}
</style>
</head>
<body${attrs}>
${body}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Fix LibreOffice HTML export bugs (corrupt hspace from PDF import) before browser display */
export function sanitizeLibreOfficeHtmlForBrowser(html: string, bundleBaseUrl?: string): string {
  let result = html || '';

  // PDF→DOCX→HTML often emits absurd hspace (e.g. 286331153) that shoves all floats to the right
  result = result.replace(/\bhspace="(\d+)"/gi, (_m, raw) => {
    const n = parseInt(raw, 10);
    return n > 100 ? 'hspace="0"' : `hspace="${raw}"`;
  });
  result = result.replace(/\bvspace="(\d+)"/gi, (_m, raw) => {
    const n = parseInt(raw, 10);
    return n > 100 ? 'vspace="0"' : `vspace="${raw}"`;
  });

  if (bundleBaseUrl) {
    const baseTag = `<base href="${bundleBaseUrl}">`;
    if (/<base\s/i.test(result)) {
      result = result.replace(/<base[^>]*>/i, baseTag);
    } else if (/<head[^>]*>/i.test(result)) {
      result = result.replace(/<head[^>]*>/i, (m) => `${m}\n${baseTag}`);
    }
  }

  const pageMatch = result.match(/@page\s*\{[^}]*size:\s*([\d.]+)\s*(in|cm|mm|pt)/i);
  const pageWidth = pageMatch ? `${pageMatch[1]}${pageMatch[2]}` : '8.5in';

  const layoutCss = `
<style id="lm-page-layout">
  html { background: #e2e8f0; }
  body {
    width: ${pageWidth};
    min-width: ${pageWidth};
    max-width: ${pageWidth};
    margin-left: auto !important;
    margin-right: auto !important;
    background: #fff;
    box-sizing: border-box;
  }
</style>`;

  if (/<\/head>/i.test(result)) {
    result = result.replace(/<\/head>/i, `${layoutCss}</head>`);
  } else {
    result = layoutCss + result;
  }

  return result;
}

/** Inject minimal editor chrome without changing LibreOffice page layout */
export function injectEditorChrome(html: string): string {
  const chrome = `
<style id="lm-editor-chrome">
  body:focus { outline: 2px solid #a5b4fc; outline-offset: 2px; }
</style>
<script id="lm-editor-chrome-js">
  document.addEventListener('DOMContentLoaded', function () {
    if (document.body) document.body.setAttribute('contenteditable', 'true');
  });
</script>`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${chrome}</body>`);
  }
  return html + chrome;
}

/** Remove browser/editor artifacts before LibreOffice HTML → DOCX import */
export function stripEditorArtifacts(html: string): string {
  return (html || '')
    .replace(/<style id="lm-page-layout">[\s\S]*?<\/style>/gi, '')
    .replace(/<style id="lm-editor-chrome">[\s\S]*?<\/style>/gi, '')
    .replace(/<script id="lm-editor-chrome-js">[\s\S]*?<\/script>/gi, '')
    .replace(/<base[^>]*>/gi, '')
    .replace(/\s*contenteditable="true"/gi, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/** Strip browser/contentEditable noise from body HTML */
export function sanitizeEditorHtml(body: string): string {
  let html = (body || '').trim();
  html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (/^<div[^>]*>[\s\S]*<\/div>$/i.test(html) && !/<div[^>]*>[\s\S]*<div/i.test(html)) {
    html = html.replace(/^<div[^>]*>/i, '').replace(/<\/div>$/i, '');
  }
  return html.trim();
}

/** Rewrite img/src/href and css url() between relative paths and bundle prefix */
export function rewriteEditorAssetUrls(
  html: string,
  bundleId: string,
  mode: 'absolute' | 'relative',
): string {
  const prefix = `/uploads/editor/${bundleId}/`;

  if (mode === 'absolute') {
    let result = html.replace(
      /((?:src|href)=["'])(?!https?:|\/|data:|#|mailto:)([^"']+)(["'])/gi,
      `$1${prefix}$2$3`,
    );
    result = result.replace(
      /url\(\s*(['"]?)(?!https?:|\/|data:)([^'")]+)\1\s*\)/gi,
      `url($1${prefix}$2$1)`,
    );
    return result;
  }

  let result = html;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  result = result.replace(
    new RegExp(`((?:src|href)=["'])(?:https?:\\/\\/[^"']+)?${escapedPrefix}`, 'gi'),
    '$1',
  );
  result = result.replace(
    new RegExp(`url\\(\\s*(['"]?)(?:https?:\\/\\/[^'")]+)?${escapedPrefix}`, 'gi'),
    'url($1',
  );
  result = result.replace(new RegExp(escapedPrefix, 'g'), '');

  return result;
}
