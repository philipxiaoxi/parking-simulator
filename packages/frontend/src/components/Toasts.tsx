import { useUiStore } from "../stores/uiStore";

export function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div className="overlay-toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
