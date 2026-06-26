"use client";

type Props = {
  action: () => void;
  label?: string;
  confirmMessage: string;
  className?: string;
};

export function ConfirmDeleteButton({
  action,
  label = "Delete",
  confirmMessage,
  className = "text-sm text-[var(--color-danger)] underline font-medium",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
