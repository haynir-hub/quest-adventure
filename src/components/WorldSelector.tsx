import { assetUrl } from "../utils/assets";
import { worldsData } from "../worlds/worldsData";

interface WorldSelectorProps {
    onSelect?: (worldId: string) => void;
}

const fallbackCovers: Record<string, string> = {
  mario: "/images/mario_01_Mario.png",
};

const WorldSelector: React.FC<WorldSelectorProps> = ({ onSelect }) => (
  <main className="world-selector" dir="rtl">
    <header className="world-selector__header">
      <span className="world-selector__eyebrow">QUEST ADVENTURE</span>
      <h1>איזה עולם מחכה לכם היום?</h1>
      <p>בחרו עולם, צאו לדרך והשלימו את כל המשימות</p>
    </header>

    <div className="world-selector__grid">
      {worldsData.map((world, index) => {
        const cover = world.missions.find((mission) => mission.imageUrl)?.imageUrl || fallbackCovers[world.id];
        return (
          <button
            type="button"
            key={world.id}
            onClick={() => onSelect?.(world.id)}
            className={`world-card world-card--${world.id}`}
            style={{ "--world-color": world.primaryColor, "--world-secondary": world.secondaryColor, "--card-delay": `${index * 55}ms` } as React.CSSProperties}
            aria-label={`כניסה לעולם ${world.name}`}
          >
            <div className="world-card__art" aria-hidden="true">
              <div className="world-card__glow" />
              {cover ? <img src={assetUrl(cover)} alt="" /> : <span>{world.emoji}</span>}
              <div className="world-card__number">0{index + 1}</div>
            </div>
            <div className="world-card__content">
              <div><span className="world-card__missions">{world.missions.length} משימות</span><h2>{world.name}</h2></div>
              <span className="world-card__enter" aria-hidden="true">←</span>
            </div>
          </button>
        );
      })}
    </div>
  </main>
);

export default WorldSelector;
