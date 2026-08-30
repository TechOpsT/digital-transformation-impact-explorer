type Props = { title: string; message: string; tone?: "info" | "error"; onRetry?: () => void };

export function StatusPanel({ title, message, tone = "info", onRetry }: Props) {
  return <section className={`status-panel ${tone}`} role={tone === "error" ? "alert" : "status"}>
    <h2>{title}</h2><p>{message}</p>{onRetry && <button className="button secondary" onClick={onRetry}>Try again</button>}
  </section>;
}
