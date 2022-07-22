import { z } from "zod";
import { env } from "../server/env.mjs";

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const BASE_ENDPOINT = "https://api.spotify.com/v1";
const PLAYLISTS_ENDPOINT = `${BASE_ENDPOINT}/me/playlists`;
const MY_PROFILE_ENDPOINT = `${BASE_ENDPOINT}/me`;

const imageSchema = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
});

const playlistSchema = z.object({
  id: z.string(),
  images: z.array(imageSchema),
  name: z.string(),
});

const playlistsSchema = z.object({
  items: z.array(playlistSchema),
  href: z.string(),
  limit: z.number(),
  next: z.string().nullable(),
  offset: z.number(),
  previous: z.string().nullable(),
  total: z.number(),
});

const profileSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  images: z.array(imageSchema),
});

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
  const res = await fetch(PLAYLISTS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const playlists = playlistsSchema.parse(await res.json());
  return playlists;
};

const getMyProfile = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(MY_PROFILE_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const profile = profileSchema.parse(await res.json());
  return profile;
};

const createPlaylist = async (refresh_token: string, title: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const user = await getMyProfile(refresh_token);
  const res = await fetch(`${BASE_ENDPOINT}/users/${user.id}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: title,
    }),
  });
  const createdPlaylist = playlistSchema.parse(await res.json());
  return createdPlaylist;
};

const getPlaylistDetail = async (refresh_token: string, playlistId: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(`${BASE_ENDPOINT}/playlists/${playlistId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
  const playlistDetail = playlistSchema.parse(await res.json());
  return playlistDetail;
};

export {
  getAccessToken,
  getUsersPlaylists,
  getMyProfile,
  createPlaylist,
  getPlaylistDetail,
};
