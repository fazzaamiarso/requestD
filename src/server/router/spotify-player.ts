import { getAvailableDevices } from "@/lib/spotify";
import { createProtectedRouter } from "./context";

export const spotifyPlayerRouter = createProtectedRouter().query(
  "available-device",
  {
    async resolve({ ctx }) {
      const devices = await getAvailableDevices(ctx.session.access_token);
      if (devices.length === 0) throw Error("No active devices");
      return devices;
    },
  }
);
