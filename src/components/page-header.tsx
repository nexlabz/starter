/** Title and one line of context at the top of an app page. */
export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-4xl font-medium">{title}</h1>
      {children && <p className="mt-2 max-w-prose text-muted-foreground">{children}</p>}
    </div>
  );
}
