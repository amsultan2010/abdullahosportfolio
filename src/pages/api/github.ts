import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo'); // e.g. "ronnielgandhe/quantzoo"
  const file = url.searchParams.get('file'); // e.g. "README.md" or "requirements.txt"

  if (!repo) {
    return new Response(JSON.stringify({ error: 'Missing repo param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (file) {
      // Fetch a specific file's content
      const res = await fetch(
        `https://api.github.com/repos/${repo}/contents/${file}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'ronnielgandhe-portfolio',
          },
        }
      );
      if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
      const content = await res.text();
      return new Response(JSON.stringify({ content, file }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, max-age=1800',
        },
      });
    }

    // Fetch repo info + file tree
    const [repoRes, treeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`, {
        headers: { 'User-Agent': 'ronnielgandhe-portfolio' },
      }),
      fetch(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`, {
        headers: { 'User-Agent': 'ronnielgandhe-portfolio' },
      }).catch(() =>
        // Fallback to master branch
        fetch(`https://api.github.com/repos/${repo}/git/trees/master?recursive=1`, {
          headers: { 'User-Agent': 'ronnielgandhe-portfolio' },
        })
      ),
    ]);

    if (!repoRes.ok) throw new Error(`Repo fetch failed: ${repoRes.status}`);

    const repoData = await repoRes.json();
    const treeData = treeRes.ok ? await treeRes.json() : { tree: [] };

    // Get README
    let readme = '';
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${repo}/readme`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'ronnielgandhe-portfolio',
          },
        }
      );
      if (readmeRes.ok) readme = await readmeRes.text();
    } catch {}

    const files = (treeData.tree || [])
      .filter((f: any) => f.type === 'blob' || f.type === 'tree')
      .map((f: any) => ({
        path: f.path,
        type: f.type, // blob or tree
        size: f.size || 0,
      }))
      .slice(0, 100); // Limit to 100 items

    return new Response(JSON.stringify({
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language,
      topics: repoData.topics || [],
      updatedAt: repoData.updated_at,
      readme,
      files,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, max-age=1800',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
