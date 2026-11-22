"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
const C = { primary: "#12936a", gold: "#c9a24b", forest: "#0a5a43", sage: "#8fbf9f", red: "#d9534f" };
const STATUS = { booked: C.primary, checked_in: "#3a8fb7", completed: C.forest, cancelled: C.red, no_show: C.gold };
const axis = { tick: { fill: "currentColor", fontSize: 12 }, stroke: "currentColor", tickLine: false };
const tip = { contentStyle: { background: "rgb(var(--surface))", border: "1px solid rgb(var(--line))", borderRadius: 12, fontSize: 12 } };
export const Panel = ({ title, children, className = "" }) => <section className={`card p-5 ${className}`}><h2 className="mb-4 font-sans text-sm font-semibold">{title}</h2><div className="h-64 text-muted">{children}</div></section>;
const Empty = () => <p className="flex h-full items-center justify-center text-sm text-muted">No data yet</p>;

export function TrendChart({ data }) {
  if (!data.length) return <Empty />;
  return (<ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.primary} stopOpacity={.5} /><stop offset="100%" stopColor={C.primary} stopOpacity={0} /></linearGradient></defs>
    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={.15} /><XAxis dataKey="date" {...axis} /><YAxis allowDecimals={false} {...axis} width={28} /><Tooltip {...tip} /><Legend />
    <Area type="monotone" dataKey="total" name="Appointments" stroke={C.primary} fill="url(#g1)" strokeWidth={2} /><Area type="monotone" dataKey="completed" name="Completed" stroke={C.gold} fill="none" strokeWidth={2} /></AreaChart></ResponsiveContainer>);
}
export function RegistrationsChart({ data }) {
  if (!data.length) return <Empty />;
  return (<ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={.15} /><XAxis dataKey="date" {...axis} /><YAxis allowDecimals={false} {...axis} width={28} /><Tooltip {...tip} /><Bar dataKey="count" name="New patients" fill={C.gold} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>);
}
export function DepartmentChart({ data }) {
  if (!data.length) return <Empty />;
  return (<ResponsiveContainer><BarChart data={data} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={.15} /><XAxis type="number" allowDecimals={false} {...axis} /><YAxis type="category" dataKey="name" width={110} {...axis} /><Tooltip {...tip} /><Legend />
    <Bar dataKey="total" name="Appointments" fill={C.primary} radius={[0, 6, 6, 0]} /><Bar dataKey="completed" name="Completed" fill={C.gold} radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>);
}
export function StatusChart({ data }) {
  if (!data.length) return <Empty />;
  return (<ResponsiveContainer><PieChart><Tooltip {...tip} /><Legend /><Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>{data.map((d) => <Cell key={d.status} fill={STATUS[d.status] || C.sage} />)}</Pie></PieChart></ResponsiveContainer>);
}
