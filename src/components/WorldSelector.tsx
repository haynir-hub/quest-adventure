import { worldsData } from '../worlds/worldsData';

interface WorldSelectorProps {
    onSelect?: (worldId: string) => void;
}

const WorldSelector: React.FC<WorldSelectorProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto" dir="rtl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-neutral-800 text-center drop-shadow-sm">
                בחר את ההרפתקה שלך
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {worldsData.map((world) => (
                    <div
                        key={world.id}
                        className="rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden bg-white border-4 border-transparent"
                    >
                        {/* צבע רקע לפי העולם */}
                        <div
                            style={{ backgroundColor: world.primaryColor }}
                            className="py-12 flex justify-center items-center relative"
                        >
                            {/* אלמנט אווירה כהה קצת מעל הכל כדי לשבור אחידות במקרה של צבעים בהירים */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                            <span className="text-8xl drop-shadow-xl relative z-10">{world.emoji}</span>
                        </div>

                        <div className="p-6 flex flex-col flex-grow text-center">
                            <h3 className="text-3xl font-bold mb-3 text-neutral-800">{world.name}</h3>
                            <p className="text-lg text-neutral-600 mb-8 flex-grow leading-relaxed">
                                {world.description}
                            </p>

                            <button
                                onClick={() => onSelect && onSelect(world.id)}
                                style={{
                                    backgroundColor: world.primaryColor,
                                    // כדי לוודא שניתן לקרוא את הכפתור גם על צהוב
                                    color: world.id === 'pokemon' ? '#1f2937' : '#ffffff'
                                }}
                                className="w-full min-h-[56px] px-6 py-4 font-bold text-2xl rounded-2xl shadow-md hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-blue-300/50 flex items-center justify-center gap-2"
                            >
                                בחר
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorldSelector;
