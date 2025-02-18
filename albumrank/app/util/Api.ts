import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PRIVATE_SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PRIVATE_SPOTIFY_CLIENT_SECRET!;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAccessToken() {
  if(accessToken && Date.now() < tokenExpiry){ return accessToken; }

  const authResponse = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  accessToken = authResponse.data.access_token;
  tokenExpiry = Date.now() + authResponse.data.expires_in * 1000;
  return accessToken;
}