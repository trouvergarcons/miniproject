import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { performWebSearch } from '@/lib/tools';

export const maxDuration = 60;


// Helper: Parse RSS feed
function parseSimpleRSS(xml = '', limit = 5) {
  const items = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/;
  const linkRegex = /<link>([\s\S]*?)<\/link>/;
  const descRegex = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/;

  let match;
  let count = 0;

  while ((match = itemRegex.exec(xml)) !== null && count < limit) {
    const itemXml = match[1];

    const titleMatch = titleRegex.exec(itemXml);
    const linkMatch = linkRegex.exec(itemXml);
    const descMatch = descRegex.exec(itemXml);

    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || 'No Title') : 'No Title';
    const link = linkMatch ? linkMatch[1] : '';
    const description = descMatch ? (descMatch[1] || descMatch[2] || '') : '';

    if (title && link) {
      items.push({
        title,
        link,
        description
      });

      count++;
    }
  }

  return items;
}



export async function POST(req) {
  try {

    const body = await req.json();
    console.log("Incoming body:", body);

    const { channels = [], rssUrls = [] } = body;

    const useWeb = channels.includes('web');
    const useRSS = channels.includes('rss');



    // Default RSS feeds
    const defaultRss = [
      'http://feeds.bbci.co.uk/news/world/rss.xml',
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      'http://rss.cnn.com/rss/edition_world.rss'
    ];



    const feedsToFetch =
      rssUrls && rssUrls.length > 0
        ? rssUrls
        : defaultRss;

    console.log("Feeds to fetch:", feedsToFetch);



    const itemsToVerify = [];



    // ======================
    // WEB SEARCH
    // ======================
    if (useWeb) {

      try {

        const trendingSearches =
          await performWebSearch("latest viral claims fact check today");

        itemsToVerify.push(
          ...trendingSearches.slice(0, 3).map((s) => ({
            title: s.title,
            description: s.description || '',
            url: s.url
          }))
        );

      } catch (e) {

        console.log("Web search failed, continuing with RSS");
        console.error(e.message);

      }

    }



    // ======================
    // RSS FETCH
    // ======================
    if (useRSS) {

      for (const feedUrl of feedsToFetch.slice(0, 3)) {

        try {

          const rssRes = await fetch(feedUrl);

          const xmlText = await rssRes.text();

          const parsedItems = parseSimpleRSS(xmlText, 5);

          itemsToVerify.push(
            ...parsedItems.map((p) => ({
              title: p.title,
              description: p.description,
              url: p.link
            }))
          );

        } catch (e) {

          console.error("RSS fetch error:", feedUrl, e.message);

        }

      }

    }



    console.log("Items collected:", itemsToVerify.length);



    // ======================
    // FALLBACK DATA
    // ======================
    if (itemsToVerify.length === 0) {

      console.log("No items found, adding fallback rumour");

      itemsToVerify.push({
        title: "Sample Rumour: AI will replace most jobs by 2035",
        description: "Experts debate whether artificial intelligence will replace large portions of the workforce.",
        url: "https://example.com/ai-rumour"
      });

    }



    let ingestedCount = 0;



    // ======================
    // SAVE TO DATABASE
    // ======================
    for (const item of itemsToVerify) {

      console.log("Processing:", item.title);

      // Dummy verification result (for now)
      const result = {
        summary: item.description || "No summary available",
        verdict: "INCONCLUSIVE",
        confidence: 0.6,
        sources: [{ title: item.title, url: item.url }]
      };



      await prisma.rumour.create({
        data: {
          id: crypto.randomUUID(),
          headline: item.title,
          summary: result.summary,
          verdict: result.verdict,
          confidence: result.confidence,
          sourcesJson: JSON.stringify(result.sources)
        }
      });

      ingestedCount++;

    }



    return NextResponse.json({
      success: true,
      ingested: ingestedCount,
      message: `Ingested ${ingestedCount} rumours`
    });



  } catch (error) {

    console.error("Cron ingest error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );

  }
}