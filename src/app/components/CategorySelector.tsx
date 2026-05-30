import { Category } from '../types';

interface Props {
  categories: Record<string, Category>;
  selectedCategory: string;
  onCategoryChange: (key: string) => void;
}

export default function CategorySelector({ categories, selectedCategory, onCategoryChange }: Props) {
  return (
    <div className="p-4 rounded-2xl bg-black/30 mt-4">
      <h3 className="text-white font-bold text-center mb-3">📚 اختر القسم</h3>
      <div className="space-y-2">
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`w-full p-3 rounded-2xl text-white font-bold transition-all ${
              selectedCategory === key
                ? 'bg-[#7c3aed] outline outline-3 outline-white scale-105'
                : 'bg-[#334155] hover:bg-[#475569]'
            }`}
          >
            {cat.name} — {cat.time} ثانية
          </button>
        ))}
      </div>
    </div>
  );
}
