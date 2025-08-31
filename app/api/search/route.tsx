import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/app/util/Api';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const type = searchParams.get('type');

  if(!query || !type) { return NextResponse.json({ error: 'Query and type are required.' }, { status: 400 }); }

  const queryStr = query.toLowerCase();
  const typeStr = type.toLowerCase();
  
  try {
    const token = await getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: queryStr,
        type: typeStr,
        limit: 10,
      },
    });

    let data;

    if (type === 'artist') {
      data = response.data.artists.items.map((artist: any) => {
        const imageObj = artist.images[0];
        return {
          name: artist.name,
          image: imageObj ? imageObj.url : null,
          id: artist.id
        };
      });
    } else if (type === 'album') {
      data = response.data.albums.items.map((album: any) => {
        const imageObj = album.images[0];
        return {
          name: album.name,
          image: imageObj ? imageObj.url : null,
          id: album.id
        };
      });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}