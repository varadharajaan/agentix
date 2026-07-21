import type { ReactNode } from "react";

export function ChatLayout({
  header,
  children,
  prompt,
  sidebar,
}: {
  header?: ReactNode;
  children: ReactNode;
  prompt: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur">
            {prompt}
          </div>
        </main>
      </div>
    </div>
  );
}
