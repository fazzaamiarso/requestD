import { FooterSpotify } from "./spotify";

const FooterAttributions = () => {
  return (
    <>
      <p className="">
        Made with ❤️ & 🔥 for{" "}
        <span className="font-semibold text-textHeading">
          Hashnode x Planetscale
        </span>{" "}
        hackathon.
      </p>
      <FooterSpotify />
    </>
  );
};

export { FooterAttributions };
