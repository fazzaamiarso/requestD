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

const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  uri: z.string(),
  album: z.object({ images: z.array(imageSchema) }),
  artists: z.array(
    z.object({
      name: z.string(),
      id: z.string(),
    })
  ),
});
const searchTracksSchema = z.object({
  tracks: z.object({
    items: z.array(trackSchema),
  }),
});

const albumSchema = z.object({
  id: z.string(),
  images: z.array(imageSchema),
  tracks: z.object({
    items: z.array(trackSchema.omit({ album: true })),
  }),
});
const newReleasesSchema = z.object({
  albums: z.object({
    items: z.array(z.object({ id: z.string() })),
  }),
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

const searchTracks = async (q: string) => {
  const { access_token } = await getPublicAccessToken();
  const searchQuery = new URLSearchParams({
    q,
    type: "track",
  });
  const res = await fetch(`${BASE_ENDPOINT}/search?${searchQuery}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
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
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
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
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
  const track = trackSchema.parse(await res.json());
  return track;
};

const getTrackRecommendations = async () => {
  const { access_token } = await getPublicAccessToken();
  const searchQuery = new URLSearchParams({ limit: "10" });

  const res = await fetch(`${BASE_ENDPOINT}/recommendations?${searchQuery}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
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
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
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
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
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
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  const albums = z
    .object({ albums: z.array(albumSchema) })
    .parse(await res.json());

  return albums.albums;
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
};
