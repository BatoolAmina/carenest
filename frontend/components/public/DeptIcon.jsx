import * as Icons from "lucide-react";
export function DeptIcon({ name, className }) {
  const I = Icons[name] || Icons.Stethoscope;
  return <I className={className} />;
}
