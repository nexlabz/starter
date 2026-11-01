"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      pending={pending}
      onClick={() =>
        start(async () => {
          const res = await attempt(() => deleteProject(id));
          if (!res) return;
          reportResult(res);
          if (!res.ok) router.refresh();
        })
      }
    >
      Delete
    </Button>
  );
}
