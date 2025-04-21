import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory, addCategory } from '../store/categorySlice';
import { RootState } from '../store/store';
import { Building2, UtensilsCrossed, Plus, X, Database } from 'lucide-react';

export function CategorySelector() {
  const dispatch = useDispatch();
  const currentCategory = useSelector((state: RootState) => state.category.currentCategory);
  const categories = useSelector((state: RootState) => state.category.categories);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleSelect = (category: string) => {
    dispatch(setCategory(category));
    setShowModal(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      dispatch(addCategory(newCategory.trim()));
      dispatch(setCategory(newCategory.trim()));
      setNewCategory('');
      setShowAddModal(false);
      setShowModal(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Restaurants':
        return UtensilsCrossed;
      case 'Hôtels':
        return Building2;
      default:
        return Building2;
    }
  };

  const CategoryIcon = getIcon(currentCategory);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 shadow-sm"
      >
        <CategoryIcon size={16} />
        <span>{currentCategory}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[480px] border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Database size={20} />
                Sélectionner une base de données
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {categories.map((category) => {
                const Icon = getIcon(category);
                return (
                  <button
                    key={category}
                    onClick={() => handleSelect(category)}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      currentCategory === category 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      currentCategory === category 
                        ? 'bg-blue-500/20' 
                        : 'bg-gray-700'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className="font-medium">{category}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
            >
              <Plus size={16} />
              <span>Nouvelle base de données</span>
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nouvelle base de données</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la base de données"
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 mb-4 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 border border-gray-600"
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
    </>
  );
}