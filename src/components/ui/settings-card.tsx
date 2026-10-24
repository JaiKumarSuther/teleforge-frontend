import { cn } from "@/lib/utils";

/** Settings block: heading and description, the control, then a footer bar with a note and the action. */
export function SettingsCard({
  title,
  description,
  children,
  note,
  action,
  danger,
  as: Tag = "section",
  className,
  ...props
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  note?: React.ReactNode;
  action?: React.ReactNode;
  danger?: boolean;
  as?: "section" | "form";
  className?: string;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "title" | "action">) {
  return (
    <Tag
      className={cn("overflow-hidden rounded-lg bg-surface shadow-1", danger && "shadow-none ring-1 ring-danger-line", className)}
      {...(Tag === "form" ? props : {})}
    >
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="type-title text-text">{title}</h2>
        {description && <div className="mt-1 max-w-[64ch] text-sm text-text-2">{description}</div>}
        {children && <div className="mt-5 max-w-md">{children}</div>}
      </div>
      {(note || action) && (
        <div
          className={cn(
            "flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6",
            danger ? "border-danger-line bg-danger-tint" : "border-line bg-bg-2",
          )}
        >
          <div className="text-label text-text-2">{note}</div>
          {action && <div className="flex shrink-0 gap-2 self-start sm:self-auto">{action}</div>}
        </div>
      )}
    </Tag>
  );
}
