import { z } from "zod";
import { env } from "../../server/env.mjs";
import {
  playlistsSchema,
  profileSchema,
  playlistSchema,
  searchTracksSchema,
  trackSchema,
  newReleasesSchema,
  albumSchema,
  privateProfileSchema,
  devicesSchema,
} from "./schema";

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const BASE_ENDPOINT = "https://api.spotify.com/v1";
const PLAYLISTS_ENDPOINT = `${BASE_ENDPOINT}/me/playlists`;
const MY_PROFILE_ENDPOINT = `${BASE_ENDPOINT}/me`;

const defaultHeaders = (access_token: string): HeadersInit => {
  return {
    Authorization: `Bearer ${access_token}`,
    "Content-Type": "application/json",
  };
};

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

const getPublicAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  return response.json();
};

const getUsersPlaylists = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(PLAYLISTS_ENDPOINT, {
    headers: defaultHeaders(access_token),
  });
  const playlists = playlistsSchema.parse(await res.json());
  return playlists;
};

const getMyProfile = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(MY_PROFILE_ENDPOINT, {
    headers: defaultHeaders(access_token),
  });
  const profile = privateProfileSchema.parse(await res.json());
  return profile;
};

const getPublicUserProfile = async (userSpotifyId: string) => {
  const { access_token } = await getPublicAccessToken();
  const res = await fetch(`${BASE_ENDPOINT}/users/${userSpotifyId}`, {
    headers: defaultHeaders(access_token),
  });
  const profile = profileSchema.parse(await res.json());
  return profile;
};

const createPlaylist = async (refresh_token: string, title: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const user = await getMyProfile(refresh_token);
  const res = await fetch(`${BASE_ENDPOINT}/users/${user.id}/playlists`, {
    method: "POST",
    headers: defaultHeaders(access_token),
    body: JSON.stringify({
      name: title,
    }),
  });
  const createdPlaylist = playlistSchema.parse(await res.json());
  return { createdPlaylist, userSpotifyId: user.id };
};

const getPlaylistDetail = async (playlistId: string) => {
  const { access_token } = await getPublicAccessToken();
  const res = await fetch(`${BASE_ENDPOINT}/playlists/${playlistId}`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });
  const playlistDetail = playlistSchema.safeParse(await res.json());
  if (!playlistDetail.success) throw Error(playlistDetail.error.message);
  return playlistDetail.data;
};

const searchTracks = async (q: string) => {
  const { access_token } = await getPublicAccessToken();
  const searchQuery = new URLSearchParams({
    q,
    type: "track",
  });
  const res = await fetch(`${BASE_ENDPOINT}/search?${searchQuery}`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });
  const results = searchTracksSchema.parse(await res.json());
  return results;
};

const formatArrToCSV = (arr: (string | number)[]) => {
  return arr.join(",");
};
const getSeveralTracks = async (spotifyIds: string[]) => {
  const { access_token } = await getPublicAccessToken();
  const trackIds = formatArrToCSV(spotifyIds);
  const searchQuery = new URLSearchParams({ ids: trackIds });

  const res = await fetch(`${BASE_ENDPOINT}/tracks?${searchQuery}`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });
  const tracks = z
    .object({ tracks: z.array(trackSchema) })
    .parse(await res.json());
  return tracks.tracks;
};

const getTrack = async (spotifyId: string) => {
  const { access_token } = await getPublicAccessToken();

  const res = await fetch(`${BASE_ENDPOINT}/tracks/${spotifyId}`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });
  const track = trackSchema.parse(await res.json());
  return track;
};

const getTrackRecommendations = async () => {
  const { access_token } = await getPublicAccessToken();
  const searchQuery = new URLSearchParams({ limit: "10" });

  const res = await fetch(`${BASE_ENDPOINT}/recommendations?${searchQuery}`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });

  const tracks = z
    .object({ tracks: z.array(trackSchema) })
    .parse(await res.json());
  return tracks.tracks;
};

const addTracksToPlaylist = async (
  refresh_token: string,
  data: { playlistId: string; tracksURI: string[] }
) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(
    `${BASE_ENDPOINT}/playlists/${data.playlistId}/tracks`,
    {
      method: "POST",
      headers: defaultHeaders(access_token),
      body: JSON.stringify({
        uris: data.tracksURI,
      }),
    }
  );
  const result = z
    .object({
      snapshot_id: z.string(),
    })
    .parse(await res.json());
  return result;
};

const getNewReleases = async () => {
  const { access_token } = await getPublicAccessToken();
  const res = await fetch(`${BASE_ENDPOINT}/browse/new-releases`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });
  const results = newReleasesSchema.parse(await res.json());

  return results.albums.items;
};

const getSeveralAlbums = async (spotifyIds: string[]) => {
  const { access_token } = await getPublicAccessToken();
  const albumIds = formatArrToCSV(spotifyIds.slice(0, 10));
  const searchQuery = new URLSearchParams({ ids: albumIds });

  const res = await fetch(`${BASE_ENDPOINT}/albums?${searchQuery}`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });

  const albums = z
    .object({ albums: z.array(albumSchema) })
    .parse(await res.json());

  return albums.albums;
};

const addToQueue = async (refresh_token: string, data: { uri: string }) => {
  const { access_token } = await getAccessToken(refresh_token);
  const searchQuery = new URLSearchParams({
    uri: data.uri,
  });
  await fetch(`${BASE_ENDPOINT}/me/player/queue?${searchQuery}`, {
    method: "POST",
    headers: defaultHeaders(access_token),
  });
};

const getAvailableDevices = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const res = await fetch(`${BASE_ENDPOINT}/me/player/devices`, {
    method: "GET",
    headers: defaultHeaders(access_token),
  });

  const devices = devicesSchema.parse(await res.json());
  return devices.devices;
};

export {
  getUsersPlaylists,
  getMyProfile,
  createPlaylist,
  getPlaylistDetail,
  searchTracks,
  getSeveralTracks,
  getTrack,
  addTracksToPlaylist,
  getTrackRecommendations,
  getNewReleases,
  getSeveralAlbums,
  getPublicUserProfile,
  addToQueue,
  getAvailableDevices,
};
