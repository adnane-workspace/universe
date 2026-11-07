import { useState } from 'react';

import { JustificationForm } from '@/components/JustificationForm';
import { AppButton } from '@/components/ui/AppButton';
import { AppPopup } from '@/components/ui/AppPopup';
import { useAttendance } from '@/context/attendance';
import { absenceById, formatWhen, sessionById } from '@/lib/domain';

export function DossierButton({ absenceId, again = false }: { absenceId: string; again?: boolean }) {
  const { data } = useAttendance();
  const [open, setOpen] = useState(false);
  const title = again ? 'Renvoyer le dossier' : 'Poser un dossier';
  const absence = absenceById(data, absenceId);
  const session = absence ? sessionById(data, absence.sessionId) : null;
  const subtitle = session ? `${session.course} · ${formatWhen(session.date, session.start, session.end)}` : undefined;

  return (
    <>
      <AppButton onPress={() => setOpen(true)} title={title} variant="secondary" />
      <AppPopup onClose={() => setOpen(false)} subtitle={subtitle} title={title} visible={open}>
        <JustificationForm absenceId={absenceId} again={again} onSent={() => setOpen(false)} />
      </AppPopup>
    </>
  );
}
