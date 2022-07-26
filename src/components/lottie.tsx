import { Player } from "@lottiefiles/react-lottie-player";

const withLottie = (lottieComponent: string) => {
  const lottie = ({ className }: { className: string }) => (
    <Player
      autoplay
      loop
      src={lottieComponent}
      className={`h-40 w-40 ${className}`}
    />
  );
  return lottie;
};

const LoadingSpinner = () => {
  return (
    <Player
      autoplay
      loop
      src="https://assets5.lottiefiles.com/packages/lf20_zdhlhm1w.json"
      className="h-40 w-40"
    />
  );
};

const SubmissionEnded = () => {
  return (
    <Player
      autoplay
      loop
      src="https://assets6.lottiefiles.com/packages/lf20_unlZRC.json"
      className="h-80 w-80"
    />
  );
};

const Animation404 = () => {
  return (
    <Player
      autoplay
      loop
      src="https://assets7.lottiefiles.com/packages/lf20_mkcnkz8c.json"
      className="h-80 w-80"
    />
  );
};

export { LoadingSpinner, SubmissionEnded, Animation404 };
