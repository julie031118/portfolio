export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DB_ID   = process.env.NOTION_DB_ID;

  // ── How to control order from Notion ────────────────────────────────────────
  // Project order : Add a number property called "Order" to your Notion DB.
  //                 Set values 1, 2, 3 … on each row.
  //                 Changing those numbers immediately updates the site order.
  // Image order   : Open a project page in Notion and drag-reorder the files
  //                 inside the "Detail Images" property. The API returns them
  //                 in exactly that order.
  // ────────────────────────────────────────────────────────────────────────────

  try {
    // Paginate through all results (Notion returns max 100 per request)
    let allResults = [];
    let cursor = undefined;

    do {
      const body = {
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };

      const response = await fetch(
        `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return res.status(response.status).json({ error: err });
      }

      const data = await response.json();
      allResults = allResults.concat(data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    const text  = (prop) => prop?.rich_text?.[0]?.plain_text ?? '';
    const title = (prop) => prop?.title?.[0]?.plain_text ?? '';
    const num   = (prop) => prop?.number ?? null;
    const sel   = (prop) => prop?.select?.name ?? '';

    const fileUrl = (prop) => {
      const files = prop?.files ?? [];
      if (!files.length) return '';
      const f = files[0];
      return f.type === 'external' ? f.external.url : f.file.url;
    };

    // Returns images in the exact order they appear in the Notion property.
    // Drag-reorder files inside the Notion page to change display order.
    const fileUrls = (prop) => {
      const files = prop?.files ?? [];
      return files.map((f) =>
        f.type === 'external' ? f.external.url : f.file.url
      );
    };

    const projects = allResults
      .map((page) => {
        const p = page.properties;
        return {
          id:            page.id,
          titleEN:       title(p['Project Name (EN)']),
          titleKR:       text(p['Project Name (KR)']),
          category:      sel(p['Category']),
          thumbnail:     fileUrl(p['Thumbnail']),
          detailImages:  fileUrls(p['Detail Images']),
          descriptionEN: text(p['Description (EN)']),
          descriptionKR: text(p['Description (KR)']),
          year:          num(p['Year']),
          order:         num(p['Order']),
        };
      })
      // Sort by "Order" field (ascending). Rows without an Order value go last.
      .sort((a, b) => {
        const ao = a.order ?? Infinity;
        const bo = b.order ?? Infinity;
        if (ao !== bo) return ao - bo;
        // Tie-break by Year descending
        return (b.year ?? 0) - (a.year ?? 0);
      });

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
