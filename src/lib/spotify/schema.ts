import { z } from "zod";

export const imageSchema = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
});

export const playlistSchema = z.object({
  id: z.string(),
  images: z.array(imageSchema),
  name: z.string(),
});

export const playlistsSchema = z.object({
  items: z.array(playlistSchema),
  href: z.string(),
  limit: z.number(),
  next: z.string().nullable(),
  offset: z.number(),
  previous: z.string().nullable(),
  total: z.number(),
});

export const profileSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  images: z.array(imageSchema),
});

export const trackSchema = z.object({
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
export const searchTracksSchema = z.object({
  tracks: z.object({
    items: z.array(trackSchema),
  }),
});

export const albumSchema = z.object({
  id: z.string(),
  images: z.array(imageSchema),
  tracks: z.object({
    items: z.array(trackSchema.omit({ album: true })),
  }),
});
export const newReleasesSchema = z.object({
  albums: z.object({
    items: z.array(z.object({ id: z.string() })),
  }),
});

export type SpotifyUser = z.infer<typeof profileSchema>;
export type SpotifyPlaylist = z.infer<typeof playlistSchema>;