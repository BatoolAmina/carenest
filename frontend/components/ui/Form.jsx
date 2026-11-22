"use client";
import { forwardRef, useId } from "react";
import clsx from "clsx";

export function Field({ label, error, hint, children, className }) {
  const id = useId();
  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && <label htmlFor={id} className="block text-sm font-medium">{label}</label>}
      {typeof children === "function" ? children({ id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : undefined }) : children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
export const Input = forwardRef(function Input({ className, ...p }, ref) { return <input ref={ref} className={clsx("input", className)} {...p} />; });
export const Textarea = forwardRef(function Textarea({ className, ...p }, ref) { return <textarea ref={ref} rows={4} className={clsx("input resize-y", className)} {...p} />; });
export const Select = forwardRef(function Select({ className, children, ...p }, ref) { return <select ref={ref} className={clsx("input pr-8", className)} {...p}>{children}</select>; });

/** Label + control in one: <TextField label="Email" error={errors.email} {...register} /> */
export function TextField({ label, error, hint, className, as = "input", children, ...p }) {
  const C = as === "select" ? Select : as === "textarea" ? Textarea : Input;
  return <Field label={label} error={error} hint={hint} className={className}>{(a) => <C {...a} {...p}>{children}</C>}</Field>;
}
