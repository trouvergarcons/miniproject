import { SafeSearchType, search } from 'duck-duck-scrape';

// Very lightweight web search using duckduckgo HTML scraping
export async function performWebSearch(query) {
    try {
        const results = await search(query, {
            safeSearch: SafeSearchType.MODERATE
        });

        // For MVP, just return top 5 results to keep context window small
        return results.results.slice(0, 5).map(r => ({
            title: r.title,
            url: r.url,
            description: r.description
        }));
    } catch (error) {
        console.error(`Search tool error for query "${query}":`, error);
        return [];
    }
}
