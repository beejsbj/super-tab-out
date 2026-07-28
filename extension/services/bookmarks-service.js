/* Super Tab Out bookmarks service.
   Reads Chrome bookmarks into a compact, non-mutating triage list. */
(function (global) {
  'use strict';

  function normalizeUrl(url) {
    if (global.SuperTabOutUrls?.normalizeRestorableUrl) {
      return global.SuperTabOutUrls.normalizeRestorableUrl(url);
    }
    return '';
  }

  function flattenBookmarkNodes(nodes, folders = []) {
    const links = [];
    for (const node of nodes || []) {
      if (!node || typeof node !== 'object') continue;
      if (typeof node.url === 'string') {
        const url = normalizeUrl(node.url);
        if (!url) continue;
        links.push({
          id: typeof node.id === 'string' ? node.id : '',
          title: typeof node.title === 'string' && node.title.trim() ? node.title.trim() : url,
          url,
          folder: folders.join(' / '),
        });
        continue;
      }
      if (Array.isArray(node.children)) {
        const title = typeof node.title === 'string' && node.title.trim() ? node.title.trim() : '';
        links.push(...flattenBookmarkNodes(node.children, title ? [...folders, title] : folders));
      }
    }
    return links;
  }

  async function fetchBookmarkLinks({ limit = 12 } = {}) {
    const bookmarks = global.chrome?.bookmarks;
    if (!bookmarks?.getTree) return [];
    const tree = await bookmarks.getTree();
    return flattenBookmarkNodes(tree).slice(0, Math.max(0, limit));
  }

  const api = { flattenBookmarkNodes, fetchBookmarkLinks };
  global.SuperTabOutBookmarks = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
