import type { CSSProperties, ReactNode } from 'react';

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={`card ${className}`} style={style}>
      {children}
    </section>
  );
}

export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="stat">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {icon && <div className="statIcon">{icon}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = 'purple',
  style,
}: {
  children: ReactNode;
  tone?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`badge ${tone}`} style={style}>
      {children}
    </span>
  );
}

export function Empty({ text = 'No records found.' }: { text?: string }) {
  return <div className="empty">{text}</div>;
}

export function Loading() {
  return <div className="loading">Loading…</div>;
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="errorBox">{message}</div>;
}

export function Button({
  children,
  variant = 'primary',
  ...props
}: { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn ${variant}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input label={label} {...props} />;
}

export function Select({ label, children, ...props }: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}

export function SelectField({ label, children, ...props }: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <Select label={label} {...props}>{children}</Select>;
}

export function Table({ columns, rows }: { columns: string[]; rows: Array<Record<string, ReactNode>> }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={`${index}-${column}`}>{row[column]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <Empty />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modalHeader">
          <h3>{title}</h3>
          <button type="button" className="iconBtn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
