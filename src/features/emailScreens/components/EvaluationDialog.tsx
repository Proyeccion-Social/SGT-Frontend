// EvaluationDialog.tsx
// Email action: Vista inicial y trigger de evaluación (MultiStepDialog)
import { useState, useEffect, useCallback } from 'react';
import '../styles/EmailScreensShared.css'; 
import MultiStepDialog from './MultiStepDialog';
import { Monitor, Clock, Calendar, CheckCircle } from 'lucide-react';

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
          <div className="es-card__success" style={{ color: '#64748b', textAlign: 'center', padding: '40px 20px' }}>
            <p>Ya calificaste esta sesión</p>
            <button className="es-btn es-btn--confirm" onClick={onClose} style={{ marginTop: 16 }}>Cerrar</button>
          </div>
        );
      }

      return (
        <>
          {isReminder && (
            <div className="es-reminder-banner" style={{
              background: 'var(--es-violet-light)',
              color: 'var(--es-violet-text)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              📩 Este es un recordatorio para calificar tu sesión
            </div>
          )}

          {/* Header section */}
          <div className="es-header">
            {data.tutor?.photo ? (
              <img src={data.tutor.photo} alt={data.tutor.name} className="es-avatar" />
            ) : (
              <div className="es-avatar" style={{ background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
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
          <div className="es-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '24px'
          }}>
            <div className="es-info-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 8px', borderRadius: 'var(--es-radius-card)', border: '2px dashed var(--es-border)', background: 'var(--es-surface)', aspectRatio: '1/1' }}>
              <div className="es-info-card__icon" style={{ color: 'var(--es-violet)' }}><Monitor size={20} /></div>
              <span className="es-info-card__label" style={{ fontSize: '13px', fontWeight: 500 }}>{data.modality === 'VIRT' ? 'Virtual' : 'Presencial'}</span>
            </div>
            
            <div className="es-info-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 8px', borderRadius: 'var(--es-radius-card)', border: '2px dashed var(--es-border)', background: 'var(--es-surface)', aspectRatio: '1/1' }}>
              <div className="es-info-card__icon" style={{ color: 'var(--es-violet)' }}><Clock size={20} /></div>
              <span className="es-info-card__label" style={{ fontSize: '13px', fontWeight: 500 }}>{data.duration || 1} horas</span>
            </div>

            <div className="es-info-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 8px', borderRadius: 'var(--es-radius-card)', border: '2px dashed var(--es-border)', background: 'var(--es-surface)', aspectRatio: '1/1' }}>
              <div className="es-info-card__icon" style={{ color: 'var(--es-violet)' }}><Calendar size={20} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="es-info-card__label" style={{ fontSize: '13px', fontWeight: 500 }}>{data.scheduledDate ? data.scheduledDate.split('-').reverse().join('/') : 'Fecha'}</span>
                <span className="es-info-card__sublabel" style={{ fontSize: '10px', color: 'var(--es-gray-text)' }}>{data.startTime ? data.startTime.substring(0, 5) : 'Hora'}</span>
              </div>
            </div>

            <div className="es-info-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 8px', borderRadius: 'var(--es-radius-card)', border: '2px dashed var(--es-border)', background: 'var(--es-surface)', aspectRatio: '1/1' }}>
              <div className="es-info-card__icon" style={{ color: 'var(--es-violet)' }}><CheckCircle size={20} /></div>
              <span className="es-info-card__label" style={{ fontSize: '13px', fontWeight: 500 }}>Terminada</span>
            </div>
          </div>

          <div className="es-footer">
            <button className="es-btn es-btn--confirm" onClick={() => setShowRating(true)} style={{ padding: '12px 64px' }}>
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
        /* Solo el contenido inicial usa el es-card estándar */
        <div className="es-card">
          <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default EvaluationDialog;
