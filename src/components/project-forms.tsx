"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, deleteProject } from "@/app/(app)/projects/actions";
import { attempt, reportResult } from "@/lib/feedback";

export function AddProjectForm() {
  const [pending, start] = useTransition();
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        start(async () => {
          const res = await attempt(() => createProject(new FormData(form)));
          if (!res) return;
          reportResult(res);
          if (res.ok) form.reset();
        });
      }}
    >
      <Input name="name" required maxLength={80} placeholder="New project name" aria-label="Project name" />
      <Button pending={pending}>Add</Button>
    </form>
  );
}

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete"
      title={`Delete ${name}?`}
      description="This removes the project for everyone in this workspace and can't be undone."
      confirmLabel="Delete project"
      onConfirm={async () => {
        const res = await attempt(() => deleteProject(id));
        if (!res) return false;
        reportResult(res);
        if (!res.ok) router.refresh();
        return res.ok;
      }}
    />
  );
}
