// PendingModificationView.tsx
// Read-only view of a pending modification proposal — same layout as ProposeModificationForm
import { CustomSelect } from './CustomSelect';
import type { Session, ModificationRequest, Modality } from '../types/session.types';

interface Props {
  session: Session;
  modification: ModificationRequest | null;
}

const modalityLabel = (m: Modality | undefined): string => {
  if (m === 'VIRT') return 'Virtual';
  if (m === 'PRES') return 'Presencial';
  return '—';
};

const durationLabel = (h: number | undefined): string => {
  if (h === 1) return '1 hora';
  if (h === 1.5) return '1 hora 30 min';
  if (h === 2) return '2 horas';
  if (h !== undefined) return `${h}h`;
  return '—';
};

const formatSlotLabel = (date?: string, start?: string, end?: string): string => {
  const parts: string[] = [];
  if (date) {
    const [y, m, d] = date.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    parts.push(`${d} ${months[Number(m) - 1]} ${y}`);
  }
  if (start && end) parts.push(`${start.substring(0, 5)} – ${end.substring(0, 5)}`);
  else if (start) parts.push(start.substring(0, 5));
  return parts.join(' · ') || '—';
};

export const PendingModificationView = ({ session, modification }: Props) => {
  const effectiveModality = modification?.newModality ?? session.modality;
  const effectiveDuration = modification?.newDurationHours ?? session.duration;
  const slotLabel = modification?.newScheduledDate
    ? formatSlotLabel(modification.newScheduledDate, modification.newStartTime, modification.newEndTime)
    : formatSlotLabel(session.scheduledDate, session.startTime, session.endTime);

  const modalityOptions = [{ value: effectiveModality, label: modalityLabel(effectiveModality as Modality) }];
  const durationOptions = [{ value: String(effectiveDuration), label: durationLabel(effectiveDuration) }];
  const slotOptions     = [{ value: 'slot', label: slotLabel }];

  return (
    <div className="pmf">
      <div className="pmf__row">
        <CustomSelect
          options={modalityOptions}
          value={effectiveModality}
          onChange={() => {}}
          disabled
        />
        <CustomSelect
          options={durationOptions}
          value={String(effectiveDuration)}
          onChange={() => {}}
          disabled
        />
      </div>
      <div className="pmf__row pmf__row--full">
        <CustomSelect
          options={slotOptions}
          value="slot"
          onChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
};

export default PendingModificationView;
