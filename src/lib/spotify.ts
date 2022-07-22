import { env } from "../server/env.mjs";

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const BASE_ENDPOINT = "https://api.spotify.com/v1";
const PLAYLISTS_ENDPOINT = `${BASE_ENDPOINT}/me/playlists`;
const MY_PROFILE_ENDPOINT = `${BASE_ENDPOINT}/me`;

const getAccessToken = async (refresh_token: string) => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  return response.json();
};

const getUsersPlaylists = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  return fetch(PLAYLISTS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

const getMyProfile = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(MY_PROFILE_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.json();
};

const createPlaylist = async (refresh_token: string, title: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const user = await getMyProfile(refresh_token);
  return fetch(`${BASE_ENDPOINT}/users/${user.id}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: title,
    }),
  });
};

const getPlaylistDetail = async (refresh_token: string, playlistId: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  return fetch(`${BASE_ENDPOINT}/playlists/${playlistId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
};

export {
  getAccessToken,
  getUsersPlaylists,
  getMyProfile,
  createPlaylist,
  getPlaylistDetail,
};
