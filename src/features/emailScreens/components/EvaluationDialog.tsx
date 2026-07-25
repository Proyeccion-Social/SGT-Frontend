// EvaluationDialog.tsx
// Email action: Vista inicial y trigger de evaluación (MultiStepDialog)
import { useState, useEffect, useCallback } from 'react';
import '../styles/EvaluationDialog.css'; 
import MultiStepDialog from './MultiStepDialog';
import { Monitor, Clock, Calendar, CheckCircle } from 'lucide-react';
import { CloudinaryImage } from '@/components/CloudinaryImage';

interface Props {
  sessionId: string;
  userId?: string;
  isReminder?: boolean;
  onClose: () => void;
}

export const EvaluationDialog = ({ sessionId, userId, isReminder = false, onClose }: Props) => {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error' | 'forbidden' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    fetch(`/api/emailScreens/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403) {
            setStatus('forbidden');
            return;
          }
          if (res.status === 404 || res.status === 410) {
             setStatus('expired');
             return;
          }
          throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json);
        setStatus('ok');
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStatus('error');
      });
  }, [sessionId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [handleKeyDown]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  const renderContent = () => {
    if (status === 'loading') {
      return <div className="es-card__loading"><p>Cargando información de la sesión…</p></div>;
    }
    if (status === 'error') {
      return (
        <div className="es-card__error" role="alert">
          <p>{errorMessage}</p>
          <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button>
        </div>
      );
    }
    if (status === 'forbidden') {
      return (
        <div className="es-card__error" role="alert">
          <p>No tienes permisos para evaluar esta sesión.</p>
          <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button>
        </div>
      );
    }
    if (status === 'expired') {
      return (
        <div className="es-card__error" role="alert">
          <p>La sesión ya no está disponible para evaluar.</p>
          <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button>
        </div>
      );
    }
    
    if (status === 'ok' && data) {
      if (data.alreadyEvaluated || data.evaluation) {
        return (
          <div className="es-card__success">
            <p>Ya calificaste esta sesión</p>
            <button className="es-btn es-btn--confirm es-btn--mt" onClick={onClose}>Cerrar</button>
          </div>
        );
      }

      return (
        <>
          {isReminder && (
            <div className="es-reminder-banner">
              📩 Este es un recordatorio para calificar tu sesión
            </div>
          )}

          {/* Header section */}
          <div className="es-header">
            {data.tutor?.photo ? (
              <CloudinaryImage
                src={data.tutor.photo}
                size="avatarLg"
                alt={data.tutor.name}
                className="es-avatar"
                lazy={false}
              />
            ) : (
              <div className="es-avatar es-avatar--placeholder">
                {data.tutor?.name?.charAt(0) ?? 'T'}
              </div>
            )}
            <div className="es-header-text">
              <h2 className="es-title">{data.title || 'Sesión'}</h2>
              <p className="es-description">{data.description || 'Sin descripción disponible.'}</p>
            </div>
          </div>

          {/* Tags row */}
          <div className="es-tags">
            <span className="es-tag es-tag--subject">
              {String(data.subject?.name ?? data.subject ?? 'Materia')}
            </span>
            <span className="es-tag es-tag--tutor">
              <span className="es-tag__dot" />
              {data.tutor?.name ?? 'Tutor'}
            </span>
            <span className="es-tag es-tag--status">
              Cerrada
            </span>
            {data.virtualLink && (
              <a href={data.virtualLink} target="_blank" rel="noreferrer" className="es-tag es-tag--link">
                🔗 Enlace de la sesión
              </a>
            )}
          </div>

          {/* 4-Grid info cards */}
          <div className="es-grid">
            <div className="es-info-card">
              <div className="es-info-card__icon"><Monitor size={20} /></div>
              <span className="es-info-card__label">{data.modality === 'VIRT' ? 'Virtual' : 'Presencial'}</span>
            </div>
            
            <div className="es-info-card">
              <div className="es-info-card__icon"><Clock size={20} /></div>
              <span className="es-info-card__label">{data.duration || 1} horas</span>
            </div>

            <div className="es-info-card">
              <div className="es-info-card__icon"><Calendar size={20} /></div>
              <div className="es-info-card__date">
                <span className="es-info-card__label">{data.scheduledDate ? data.scheduledDate.split('-').reverse().join('/') : 'Fecha'}</span>
                <span className="es-info-card__sublabel">{data.startTime ? data.startTime.substring(0, 5) : 'Hora'}</span>
              </div>
            </div>

            <div className="es-info-card">
              <div className="es-info-card__icon"><CheckCircle size={20} /></div>
              <span className="es-info-card__label">Terminada</span>
            </div>
          </div>

          <div className="es-footer">
            <button className="es-btn es-btn--confirm es-btn--cta" onClick={() => setShowRating(true)}>
              Calificar
            </button>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="es-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      {showRating && status === 'ok' && data ? (
        <MultiStepDialog 
          session={data} 
          userId={userId} 
          onClose={onClose} 
        />
      ) : (
        <div className="es-card">
          <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default EvaluationDialog;
