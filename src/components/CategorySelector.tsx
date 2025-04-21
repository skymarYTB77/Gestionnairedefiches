import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory, addCategory } from '../store/categorySlice';
import { RootState } from '../store/store';
import { 
  ChevronDown, 
  Building2, 
  UtensilsCrossed,
  Beer,
  Coffee,
  ShoppingBag as Shopping,
  Landmark,
  PaintBucket,
  Clapperboard,
  Theater,
  Music,
  Trees,
  Store,
  Sparkles,
  Scissors,
  Dumbbell,
  Plus,
  X
} from 'lucide-react';

export function CategorySelector() {
  const dispatch = useDispatch();
  const currentCategory = useSelector((state: RootState) => state.category.currentCategory);
  const categories = useSelector((state: RootState) => state.category.categories);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: string) => {
    dispatch(setCategory(category));
    setIsOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      dispatch(addCategory(newCategory.trim()));
      dispatch(setCategory(newCategory.trim()));
      setNewCategory('');
      setShowAddModal(false);
      setIsOpen(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Restaurants':
        return UtensilsCrossed;
      case 'Hôtels':
        return Building2;
      case 'Bars':
        return Beer;
      case 'Cafés':
        return Coffee;
      case 'Boutiques':
        return Shopping;
      case 'Musées':
        return Landmark;
      case 'Galeries':
        return PaintBucket;
      case 'Cinémas':
        return Clapperboard;
      case 'Théâtres':
        return Theater;
      case 'Salles de Concert':
        return Music;
      case 'Parcs':
        return Trees;
      case 'Centres Commerciaux':
        return Store;
      case 'Spas':
        return Sparkles;
      case 'Salons de Beauté':
        return Scissors;
      case 'Clubs de Sport':
        return Dumbbell;
      default:
        return Building2;
    }
  };

  const CategoryIcon = getIcon(currentCategory);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <CategoryIcon size={16} />
        <span>{currentCategory}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-[9999] max-h-[70vh] overflow-y-auto">
          {categories.map((category) => {
            const Icon = getIcon(category);
            return (
              <button
                key={category}
                onClick={() => handleSelect(category)}
                className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors ${
                  currentCategory === category ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{category}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors text-gray-300 border-t border-gray-700"
          >
            <Plus size={16} />
            <span>Nouvelle base de données</span>
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nouvelle base de données</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la base de données"
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}