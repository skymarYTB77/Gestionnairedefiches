import React from 'react';
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
  Users
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { visibleData, acceptedData, rejectedData } = useSelector(
    (state: RootState) => state.restaurants
  );

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
          <h3>Actions rapides</h3>
          <div className="quick-actions">
            <button className="quick-action-button">
              <FileText size={16} />
              <span>Nouvelle fiche</span>
            </button>
            <button className="quick-action-button">
              <Download size={16} />
              <span>Exporter les données</span>
            </button>
            <button className="quick-action-button">
              <Upload size={16} />
              <span>Importer des fiches</span>
            </button>
            <button className="quick-action-button">
              <Settings size={16} />
              <span>Paramètres</span>
            </button>
            <button className="quick-action-button">
              <Clock size={16} />
              <span>Historique</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}