import { z } from "zod";

export const imageSchema = z.object({
  url: z.string(),
  height: z.number().nullish(),
  width: z.number().nullish(),
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

export const privateProfileSchema = profileSchema.extend({
  product: z.enum(["free", "premium", "open"]),
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

const deviceTypes = ["Computer", "Smartphone", "Speaker"] as const;
export const devicesSchema = z.object({
  devices: z.array(
    z.object({
      id: z.string(),
      is_active: z.boolean(),
      is_private_session: z.boolean(),
      is_restricted: z.boolean(),
      name: z.string(),
      type: z.enum(deviceTypes),
      volume_percent: z.number(),
    })
  ),
});

export type SpotifyUser = z.infer<typeof profileSchema>;
export type SpotifyPrivateUser = z.infer<typeof privateProfileSchema>;
export type SpotifyPlaylist = z.infer<typeof playlistSchema>;