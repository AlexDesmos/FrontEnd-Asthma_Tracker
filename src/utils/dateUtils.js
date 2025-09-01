export function ymdLocal(input) {
  const d = (input instanceof Date) ? input : new Date(input);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function fmtShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }).replace(/\./g, '-');
}

export function fmtFullDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\./g, '-');
  const time = d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} ${time}`;
}

export function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
