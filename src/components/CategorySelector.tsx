import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory, addCategory, removeCategory } from '../store/categorySlice';
import { RootState } from '../store/store';
import { collection, addDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  X,
  Trash2
} from 'lucide-react';

export function CategorySelector() {
  const dispatch = useDispatch();
  const currentCategory = useSelector((state: RootState) => state.category.currentCategory);
  const categories = useSelector((state: RootState) => state.category.categories);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
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

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        // Ajouter à Firestore
        await addDoc(collection(db, 'categories'), {
          name: newCategory.trim(),
          createdAt: new Date()
        });

        // Mettre à jour Redux
        dispatch(addCategory(newCategory.trim()));
        dispatch(setCategory(newCategory.trim()));
        setNewCategory('');
        setShowAddModal(false);
        setIsOpen(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la catégorie:', error);
      }
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      // Supprimer de Firestore
      const categoryQuery = query(
        collection(db, 'categories'),
        where('name', '==', categoryName)
      );
      const querySnapshot = await getDocs(categoryQuery);
      
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Mettre à jour Redux
      dispatch(removeCategory(categoryName));
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
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
    <div className="relative" ref={dropdownRef} style={{ zIndex: 'var(--z-category-selector)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[rgba(15,23,42,0.9)] rounded-lg hover:bg-[rgba(30,41,59,0.9)] transition-colors border border-[rgba(107,213,237,0.3)] hover:border-[rgba(107,213,237,0.6)]"
      >
        <CategoryIcon size={16} />
        <span>{currentCategory}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[rgba(15,23,42,0.95)] rounded-lg shadow-lg overflow-hidden z-[9999] max-h-[70vh] overflow-y-auto border border-[rgba(107,213,237,0.3)] backdrop-blur-md">
          {categories.map((category) => {
            const Icon = getIcon(category);
            return (
              <div
                key={category}
                className={`group relative flex items-center ${
                  currentCategory === category ? 'bg-[rgba(30,41,59,0.9)] text-[#6dd5ed]' : 'text-gray-300'
                }`}
              >
                <button
                  onClick={() => handleSelect(category)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[rgba(30,41,59,0.9)] transition-colors"
                >
                  <Icon size={16} />
                  <span>{category}</span>
                </button>
                {categories.length > 1 && category !== currentCategory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryToDelete(category);
                      setShowDeleteConfirm(true);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[rgba(30,41,59,0.9)] transition-colors text-gray-300 border-t border-[rgba(107,213,237,0.2)]"
          >
            <Plus size={16} />
            <span>Nouvelle base de données</span>
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] backdrop-blur-sm">
          <div className="bg-[rgba(15,23,42,0.95)] rounded-lg p-6 w-96 border border-[rgba(107,213,237,0.3)] shadow-[0_0_20px_rgba(107,213,237,0.2)]">
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
              className="w-full bg-[rgba(30,41,59,0.9)] text-white rounded-md px-4 py-2 mb-4 border border-[rgba(107,213,237,0.3)] focus:border-[rgba(107,213,237,0.6)] focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-[rgba(30,41,59,0.9)] text-white hover:bg-[rgba(30,41,59,0.7)] border border-[rgba(107,213,237,0.3)]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-[#2193b0] to-[#6dd5ed] text-white hover:brightness-110"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] backdrop-blur-sm">
          <div className="bg-[rgba(15,23,42,0.95)] rounded-lg p-6 w-96 border border-[rgba(107,213,237,0.3)] shadow-[0_0_20px_rgba(107,213,237,0.2)]">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer la base de données "{categoryToDelete}" ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 rounded-md bg-[rgba(30,41,59,0.9)] text-white hover:bg-[rgba(30,41,59,0.7)] border border-[rgba(107,213,237,0.3)]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryToDelete)}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-red-400 text-white hover:brightness-110"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}