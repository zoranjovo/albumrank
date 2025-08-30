import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/app/util/Api';
import { fetchAllSpotifyItems } from './fetching';
import { isRateLimited } from '../rateLimiter';
import { getFromCache, saveToCache } from '../cache';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'localhost';
  if(isRateLimited(ip)){ return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }); }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  const validTypes = ['artist', 'album']

  if(!id){ return NextResponse.json({ error: 'ID is required.' }, { status: 400 }); }
  if(!type || !validTypes.includes(type)){ return NextResponse.json({ error: 'Type is invalid.' }, { status: 400 }); }

  const queryKey = JSON.stringify([id, type]);
  const cachedData = getFromCache(queryKey);
  if(cachedData){ return NextResponse.json({ payload: cachedData, cached: true }); }

  let suffix = 'albums'
  if(type == 'album'){ suffix = 'tracks'; }

  try {
    const token = await getAccessToken();
    const response = await fetchAllSpotifyItems(`https://api.spotify.com/v1/${type}s/${id}/${suffix}`, token);

    if(type == 'album'){
      const response2 = await axios.get(`https://api.spotify.com/v1/albums/${id}`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      const img = response2.data.images[0].url;
      const releaseDate = response2.data.release_date;
      const name = response2.data.name;
      const items = response
        .map((item: any) => {
          const releaseDateObject = new Date(releaseDate);
          const month = releaseDateObject.toLocaleString('default', { month: 'long' });
          const year = releaseDateObject.getFullYear();
          const formattedDate = `${month} ${year}`;

          return {
            name: item.name,
            image: img,
            id: item.id,
            releaseDate: formattedDate,
          };
        });

        const payload = {
          info: {
            name: name,
            img: img,
          },
          items
        }
        saveToCache(queryKey, payload);
        return NextResponse.json({ payload });
    }

    if(type == 'artist'){
      const response2 = await axios.get(`https://api.spotify.com/v1/artists/${id}`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      const img = response2.data.images[0].url;
      const name = response2.data.name;
      const items = response
        .map((item: any) => {
          const img = item.images[0].url;
          const releaseDate = item.release_date;
          
          const releaseDateObject = new Date(releaseDate);
          const month = releaseDateObject.toLocaleString('default', { month: 'long' });
          const year = releaseDateObject.getFullYear();
          const formattedDate = `${month} ${year}`;

          return {
            name: item.name,
            image: img,
            id: item.id,
            releaseDate: formattedDate,
            type: item.album_type
          };
        });

        const payload = {
          info: {
            name: name,
            img: img
          },
          items
        }
        saveToCache(queryKey, payload);
        return NextResponse.json({ payload });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}