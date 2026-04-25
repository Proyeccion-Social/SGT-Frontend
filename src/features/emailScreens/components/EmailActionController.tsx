// EmailActionController.tsx
// Reads action + id from URL query params and opens the corresponding dialog
// Mounted once in DashboardLayout for all roles

import { useState, useEffect, useCallback } from 'react';
import { ConfirmSessionDialog } from './ConfirmSessionDialog';
import { ReviewModificationDialog } from './ReviewModificationDialog';
import { RescheduleDialog } from './RescheduleDialog';
import { EvaluationDialog } from './EvaluationDialog';

type EmailAction =
  | 'confirm-session'
  | 'review-modification'
  | 'reschedule'
  | 'evaluate'
  | null;

function getActionFromUrl(): { action: EmailAction; id: string | null; isReminder: boolean } {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action') as EmailAction;
  const id = params.get('id') ?? params.get('sessionId') ?? params.get('requestId');
  const isReminder = params.get('isReminder') === 'true';
  return { action, id, isReminder };
}

function cleanQueryParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete('action');
  url.searchParams.delete('id');
  url.searchParams.delete('sessionId');
  url.searchParams.delete('requestId');
  url.searchParams.delete('isReminder');
  window.history.replaceState({}, '', url.pathname + (url.search || ''));
}

export const EmailActionController = () => {
  const [action, setAction] = useState<EmailAction>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isReminder, setIsReminder] = useState(false);

  useEffect(() => {
    const { action: urlAction, id, isReminder: reminder } = getActionFromUrl();
    if (urlAction && id) {
      const validActions: EmailAction[] = [
        'confirm-session', 'review-modification', 'reschedule', 'evaluate',
      ];
      if (validActions.includes(urlAction)) {
        setAction(urlAction);
        setResourceId(id);
        setIsReminder(reminder);
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    setAction(null);
    setResourceId(null);
    setIsReminder(false);
    cleanQueryParams();
  }, []);

  if (!action || !resourceId) return null;

  switch (action) {
    case 'confirm-session':
      return <ConfirmSessionDialog sessionId={resourceId} onClose={handleClose} />;
    case 'review-modification':
      return <ReviewModificationDialog requestId={resourceId} onClose={handleClose} />;
    case 'reschedule':
      return <RescheduleDialog sessionId={resourceId} onClose={handleClose} />;
    case 'evaluate':
      return <EvaluationDialog sessionId={resourceId} isReminder={isReminder} onClose={handleClose} />;
    default:
      return null;
  }
};

export default EmailActionController;
