import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  FileText,
  Settings,
  Download,
  Upload,
  Clock,
  Star,
  Users,
  CheckSquare,
  Bookmark
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { AppModal } from './AppModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onModalOpen: () => void;
  onModalClose: () => void;
}

export function Sidebar({ isOpen, onToggle, onModalOpen, onModalClose }: SidebarProps) {
  const { visibleData, acceptedData, rejectedData } = useSelector(
    (state: RootState) => state.restaurants
  );

  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const handleOpenTaskManager = () => {
    setShowTaskManager(true);
    onModalOpen();
  };

  const handleCloseTaskManager = () => {
    setShowTaskManager(false);
    onModalClose();
  };

  const handleOpenBookmarks = () => {
    setShowBookmarks(true);
    onModalOpen();
  };

  const handleCloseBookmarks = () => {
    setShowBookmarks(false);
    onModalClose();
  };

  const recentActivities = [
    {
      icon: <Plus size={14} />,
      title: "Nouvelle fiche ajoutée",
      time: "Il y a 5 min"
    },
    {
      icon: <Star size={14} />,
      title: "Fiche mise à jour",
      time: "Il y a 15 min"
    },
    {
      icon: <Users size={14} />,
      title: "3 fiches acceptées",
      time: "Il y a 30 min"
    }
  ];

  return (
    <>
      <button 
        className={`sidebar-toggle ${!isOpen ? 'closed' : ''}`}
        onClick={onToggle}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>
        <div className="sidebar-section">
          <h3>Statistiques</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{visibleData.length}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{acceptedData.length}</div>
              <div className="stat-label">Acceptées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{rejectedData.length}</div>
              <div className="stat-label">Rejetées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {visibleData.length + acceptedData.length + rejectedData.length}
              </div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Activité récente</h3>
          <div className="recent-activity">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Applications</h3>
          <div className="quick-actions">
            <button 
              className="quick-action-button"
              onClick={handleOpenTaskManager}
            >
              <CheckSquare size={16} />
              <span>Gestionnaire de tâches</span>
            </button>
            <button 
              className="quick-action-button"
              onClick={handleOpenBookmarks}
            >
              <Bookmark size={16} />
              <span>Signets</span>
            </button>
          </div>
        </div>
      </div>

      <AppModal
        isOpen={showTaskManager}
        onClose={handleCloseTaskManager}
        url="https://gestionnairedetaches.netlify.app/"
      />

      <AppModal
        isOpen={showBookmarks}
        onClose={handleCloseBookmarks}
        url="https://signets.netlify.app/"
      />
    </>
  );
}