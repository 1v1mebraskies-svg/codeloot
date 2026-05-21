/**
 * CodeLoot CMS API — connects admin to Vercel API routes or local server.
 */
(function (global) {
    const STORAGE_KEY = 'codeloot_cms_url';
    const DEFAULT_CMS = 'http://127.0.0.1:3000';

    let apiBase = null;

    function normalizeBase(base) {
        return String(base || '').replace(/\/$/, '');
    }

    async function probeBase(base) {
        const root = normalizeBase(base);
        if (!root) return false;
        try {
            const res = await fetch(root + '/api/cms-health', { cache: 'no-store' });
            if (!res.ok) return false;
            const data = await res.json();
            return !!(data && data.cms);
        } catch (e) {
            return false;
        }
    }

    function candidateBases() {
        const list = [];
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) list.push(saved);
        if (global.location && global.location.origin && global.location.protocol.startsWith('http')) {
            list.push(global.location.origin);
        }
        list.push(DEFAULT_CMS, 'http://localhost:3000');
        const seen = new Set();
        return list.filter(function (base) {
            const n = normalizeBase(base);
            if (!n || seen.has(n)) return false;
            seen.add(n);
            return true;
        });
    }

    async function connectCms() {
        for (let i = 0; i < candidateBases().length; i++) {
            const base = candidateBases()[i];
            if (await probeBase(base)) {
                apiBase = normalizeBase(base);
                localStorage.setItem(STORAGE_KEY, apiBase);
                return apiBase;
            }
        }
        apiBase = null;
        return null;
    }

    function getApiBase() {
        return apiBase;
    }

    function cmsUrl(path) {
        if (!apiBase) throw new Error('CMS not connected');
        return apiBase + path;
    }

    async function cmsFetch(path, options) {
        if (!apiBase) {
            throw new Error(
                'CMS server not connected. Ensure you are on Vercel or start local server with: python3 server.py\n' +
                'Then open: http://127.0.0.1:3000/admin/index.html'
            );
        }
        return fetch(cmsUrl(path), options || {});
    }

    function isFileProtocol() {
        return global.location && global.location.protocol === 'file:';
    }

    global.CodeLootCMS = {
        connectCms: connectCms,
        getApiBase: getApiBase,
        cmsUrl: cmsUrl,
        cmsFetch: cmsFetch,
        isFileProtocol: isFileProtocol,
        defaultCmsUrl: DEFAULT_CMS,
    };
})(typeof window !== 'undefined' ? window : global);
