import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { id } = req.query;

  // 1) Récupérer les clés depuis l'environnement Vercel
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  let article = null;

  if (id && supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('content')
        .select('title, description, thumbnail_url')
        .eq('id', id)
        .single();
      
      if (data) {
        article = data;
      }
    } catch (e) {
      console.error("Supabase Error:", e);
    }
  }

  // 2) Récupérer le HTML natif de notre propre site
  // Sur Vercel, on utilise req.headers['x-forwarded-host']
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/index.html`);
    let html = await response.text();

    if (article) {
      // 3) Construire nos tags dynamiques Open Graph
      const safeTitle = article.title ? article.title.replace(/"/g, '&quot;') : 'AXIS24 MediaHub';
      const safeDesc = article.description ? article.description.replace(/"/g, '&quot;') : '';
      const safeImg = article.thumbnail_url || 'https://storage.googleapis.com/gpt-engineer-file-uploads/oNdAJZqYiJcVhjH95kyEh2cKWM42/social-images/social-1773937182886-1000092988.webp';

      const customTags = `
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${safeTitle}" />
        <meta name="twitter:title" content="${safeTitle}" />
        <meta property="og:description" content="${safeDesc}" />
        <meta name="twitter:description" content="${safeDesc}" />
        <meta property="og:image" content="${safeImg}" />
        <meta name="twitter:image" content="${safeImg}" />
        <meta name="twitter:card" content="summary_large_image" />
      `;

      // 4) Remplacer les anciens tags
      html = html.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);
      html = html.replace(
        /<!-- DEFAULT_OG_TAGS -->[\s\S]*<!-- END_DEFAULT_OG_TAGS -->/m,
        customTags
      );
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=3600');
    return res.status(200).send(html);
  } catch (error) {
    console.error("Fetch Error:", error);
    // Redirection générique de secours
    res.redirect('/');
  }
}
