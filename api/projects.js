export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DB_ID   = process.env.NOTION_DB_ID;

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [{ property: 'Year', direction: 'descending' }],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    const projects = data.results.map((page) => {
      const p = page.properties;

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
      const fileUrls = (prop) => {
        const files = prop?.files ?? [];
        return files.map((f) =>
          f.type === 'external' ? f.external.url : f.file.url
        );
      };

      return {
        id:             page.id,
        titleEN:        title(p['Project Name (EN)']),
        titleKR:        text(p['Project Name (KR)']),
        category:       sel(p['Category']),
        thumbnail:      fileUrl(p['Thumbnail']),
        detailImages:   fileUrls(p['Detail Images']),
        descriptionEN:  text(p['Description (EN)']),
        descriptionKR:  text(p['Description (KR)']),
        year:           num(p['Year']),
      };
    });

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
