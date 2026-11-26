// Small JSON config loader with graceful failure (file:// safe)
export async function loadJSON(path, fallback = null) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return await res.json();
  } catch (err) {
    console.warn(`[config] ${path} unavailable, using fallback`, err.message);
    return fallback;
  }
}

// Project id = config file name: aaa.json -> "aaa"
// Discovery: GitHub API lists config/download/ dir; falls back to index.json "fallback" list.
export async function discoverProjects(sourceDir) {
  const index = await loadJSON(`${sourceDir}/index.json`, { fallback: [] });

  if (index.repo) {
    try {
      const api = `https://api.github.com/repos/${index.repo}/contents/${sourceDir}`;

      // Add timeout to prevent infinite waiting on network issues
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      const res = await Promise.race([fetch(api, { cache: 'no-cache' }), timeoutPromise]);
      if (res.ok) {
        const files = await res.json();
        const ids = files
          .filter(f => f.name.endsWith('.json') && f.name !== 'index.json')
          .map(f => f.name.replace(/\.json$/, ''));
        if (ids.length) return ids;
      }
    } catch (err) {
      console.warn('[config] GitHub API listing failed, using fallback list:', err.message);
    }
  }

  return index.fallback || [];
}
