/** Title, one line of context and the page's main action at the top of an app page. */
export function PageHeader({ title, action, children }: { title: string; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-4xl font-medium">{title}</h1>
        {children && <p className="mt-2 max-w-prose text-muted-foreground">{children}</p>}
      </div>
      {action}
    </div>
  );
}
