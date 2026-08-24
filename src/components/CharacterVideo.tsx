import React from "react";
import { assetUrl } from "../utils/assets";

interface CharacterVideoProps {
  src: string;
  characterName: string;
  onUnavailable: () => void;
}

export const CharacterVideo: React.FC<CharacterVideoProps> = ({
  src,
  characterName,
  onUnavailable,
}) => {
  return (
    <div className="w-full">
      <video
        key={src}
        className="w-full max-h-[46vh] rounded-3xl bg-black object-contain shadow-2xl"
        src={assetUrl(src)}
        aria-label={`מה ${characterName} עשה לחי`}
        autoPlay
        playsInline
        controls
        preload="auto"
        onError={onUnavailable}
      >
        הדפדפן הזה לא מצליח להציג את הסרטון.
      </video>
    </div>
  );
};
