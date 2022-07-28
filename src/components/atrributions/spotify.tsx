import Image from "next/image";
import spotifyBlack from "@/assets/spotify/icon-black.png";
import spotifyLogoGreen from "@/assets/spotify/logo-green.png";
import { signIn } from "next-auth/react";

const SpotifyLoginButton = () => {
  return (
    <button
      onClick={() => signIn("spotify", { callbackUrl: "/me" })}
      className="flex items-center gap-2 rounded-full bg-spotify-green p-4 font-semibold text-black"
    >
      <Image src={spotifyBlack} alt="spotify logo" height={40} width={40} />
      <span className="">Login with Spotify</span>
    </button>
  );
};

const SearchBySpotify = () => {
  return (
    <div className="flex w-full items-center">
      <span className="mr-2 whitespace-nowrap text-sm text-textBody">
        search by{" "}
      </span>
      <div className="w-20">
        <Image src={spotifyLogoGreen} alt="spotify logo" />
      </div>
    </div>
  );
};

const FooterSpotify = () => {
  return (
    <div className="flex flex-wrap items-center">
      <p className="mr-2">All song data and song images come from</p>
      <div className="w-24 self-center">
        <Image src={spotifyLogoGreen} alt="spotify logo" />
      </div>
    </div>
  );
};

export { SpotifyLoginButton, SearchBySpotify, FooterSpotify };
