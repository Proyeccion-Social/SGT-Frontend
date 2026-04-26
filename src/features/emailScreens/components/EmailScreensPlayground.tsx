import { useState } from 'react';
import { ConfirmSessionDialog } from './ConfirmSessionDialog';
import { ReviewModificationDialog } from './ReviewModificationDialog';
import { RescheduleDialog } from './RescheduleDialog';
import { EvaluationDialog } from './EvaluationDialog';
import '../styles/EmailScreensShared.css';

export const EmailScreensPlayground = () => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // IDs generados en el script SQL
  const REAL_SESSION_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
  const REAL_MOD_REQUEST_ID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <h1 style={{ color: '#7c3aed' }}>Email Screens Playground (MODO REAL)</h1>
      <p>Estás conectado a la base de datos real. Asegúrate de haber ejecutado el script SQL.</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          className="es-btn es-btn--secondary" 
          onClick={() => setActiveDialog('confirm')}
          style={{ width: 'auto' }}
        >
          Probar Confirmar Sesión Real
        </button>
        <button 
          className="es-btn es-btn--secondary" 
          onClick={() => setActiveDialog('modification')}
          style={{ width: 'auto' }}
        >
          Probar Revisar Modificación Real
        </button>
        <button 
          className="es-btn es-btn--secondary" 
          onClick={() => setActiveDialog('evaluate')}
          style={{ width: 'auto' }}
        >
          Probar Evaluar Sesión Real
        </button>
        <button 
          className="es-btn es-btn--secondary" 
          onClick={() => setActiveDialog('reschedule')}
          style={{ width: 'auto' }}
        >
          Probar Reagendar Real
        </button>
      </div>

      {activeDialog === 'confirm' && (
        <ConfirmSessionDialog sessionId={REAL_SESSION_ID} onClose={() => setActiveDialog(null)} />
      )}
      {activeDialog === 'modification' && (
        <ReviewModificationDialog requestId={REAL_MOD_REQUEST_ID} onClose={() => setActiveDialog(null)} />
      )}
      {activeDialog === 'reschedule' && (
        <RescheduleDialog sessionId={REAL_SESSION_ID} onClose={() => setActiveDialog(null)} />
      )}
      {activeDialog === 'evaluate' && (
        <EvaluationDialog sessionId={REAL_SESSION_ID} onClose={() => setActiveDialog(null)} />
      )}
      
      <div style={{ marginTop: '40px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
        <h3 style={{ marginTop: 0 }}>Pasos finales:</h3>
        <ul style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
          <li>1. Ejecuta el script SQL que te pasé en tu DB.</li>
          <li>2. Inicia sesión en la app con <b>tutor@udistrital.edu.co</b> en esta misma pestaña.</li>
          <li>3. Vuelve aquí y haz clic en los botones.</li>
          <li>4. Las peticiones irán a tus APIs reales: <code>/api/emailScreens/...</code></li>
        </ul>
      </div>
    </div>
  );
};
