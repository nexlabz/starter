"use client";

import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * A button that asks before running a destructive action. `onConfirm` resolves
 * true to close the dialog, or false to stay open after a failure.
 */
export function ConfirmButton({ label, title, description, confirmLabel, onConfirm, children }: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<boolean>;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild><Button variant="outline">{label}</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <AlertDialogCancel asChild><Button variant="outline" disabled={pending}>Cancel</Button></AlertDialogCancel>
          <Button
            variant="destructive"
            pending={pending}
            onClick={() =>
              start(async () => {
                if (await onConfirm()) setOpen(false);
              })
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
