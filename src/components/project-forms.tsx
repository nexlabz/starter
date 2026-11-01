"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, deleteProject } from "@/app/(app)/projects/actions";
import { attempt, reportResult } from "@/lib/feedback";

export function AddProjectForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const res = await attempt(() => createProject(new FormData(form)));
        if (!res) return;
        reportResult(res);
        if (res.ok) form.reset();
      }}
    >
      <Input name="name" required maxLength={80} placeholder="New project name" aria-label="Project name" />
      <Button>Add</Button>
    </form>
  );
}

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const res = await attempt(() => deleteProject(id));
        if (!res) return;
        reportResult(res);
        if (!res.ok) router.refresh();
      }}
    >
      Delete
    </Button>
  );
}
