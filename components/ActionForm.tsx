"use client";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/utils";

export function SubmitButton({ children, className = "", danger = false }: { children: React.ReactNode; className?: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${danger ? "btn-danger" : "btn-primary"} ${className}`}>
      {pending && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export function ActionForm({
  action,
  children,
  className = "grid gap-3",
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  // Notification globale: reste visible même si la liste est rechargée après la mutation.
  useEffect(() => {
    if (state?.ok || state?.error) {
      window.dispatchEvent(new CustomEvent("uc-toast", { detail: { ok: !!state.ok, text: state.ok ? "Enregistré ✔" : state.error } }));
    }
  }, [state]);
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-medium text-brand-700">Enregistré ✔</p>}
    </form>
  );
}

export function DeleteForm({ action, id, label = "Supprimer" }: { action: (prev: ActionState, fd: FormData) => Promise<ActionState>; id: string; label?: string }) {
  return (
    <ActionForm action={action} className="inline-grid gap-1">
      <input type="hidden" name="id" value={id} />
      <SubmitButton danger>{label}</SubmitButton>
    </ActionForm>
  );
}

export const inputCls = "field";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
