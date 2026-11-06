"use client";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/utils";

export function SubmitButton({ children, className = "", danger = false }: { children: React.ReactNode; className?: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-11 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-teal-700 hover:bg-teal-800"} ${className}`}
    >
      {pending ? "…" : children}
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
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-teal-700">Enregistré ✔</p>}
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

export const inputCls = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-2 focus:outline-teal-600";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
