import axios from 'axios';

export async function fetchAllSpotifyItems(url: string, token: string | null) {
  const limit = 20;
  const include_groups = 'album,single'
  let offset = 0;
  let allItems: any[] = [];
  let hasMore = true;

  while(hasMore){
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit, offset, include_groups },
      });

      const items = response.data.items;
      allItems.push(...items);

      hasMore = items.length === limit;
      offset += limit;
    } catch (error) {
      console.error('Error fetching items:', error);
      hasMore = false;
    }
  }

  return allItems;
}