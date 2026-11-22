"use client";
import { useState } from "react";
import { CalendarPlus, ClipboardList, Hourglass, CheckCheck, UserPlus, Stethoscope, UserX } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { PageHeader, StatCard } from "@/components/ui/Misc.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { AppointmentTable } from "@/components/portal/AppointmentTable.jsx";
import { BookForPatientModal } from "@/components/portal/BookForPatientModal.jsx";
import { nowToday } from "@/components/public/today.js";
export default function Page() {
  const [open, setOpen] = useState(false); const [k, setK] = useState(0);
  const { data: s, reload } = useFetch(`/api/reception/stats?_=${k}`);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Today’s queue" subtitle="Check patients in as they arrive. Doctors see them in queue order." action={<Button variant="gold" onClick={() => setOpen(true)}><CalendarPlus className="h-4 w-4" />Walk-in / new appointment</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard icon={ClipboardList} label="Today’s visits" value={s?.today} /><StatCard icon={Hourglass} label="Expected" value={s?.expected} /><StatCard icon={Hourglass} label="Waiting (checked in)" value={s?.waiting} />
        <StatCard icon={CheckCheck} label="Completed" value={s?.completed} /><StatCard icon={UserX} label="No-show / cancelled" value={s ? `${s.noShow} / ${s.cancelled}` : "–"} /><StatCard icon={Stethoscope} label="Doctors on duty" value={s?.doctorsOnDuty} /><StatCard icon={UserPlus} label="New patients (24h)" value={s?.newPatients} />
      </div>
      <AppointmentTable role="receptionist" showPatient query={`date=${nowToday()}&status=booked,checked_in,completed,no_show`} reloadKey={k} />
      <BookForPatientModal open={open} onClose={() => setOpen(false)} onBooked={() => { setK((x) => x + 1); reload(); }} />
    </div>
  );
}
