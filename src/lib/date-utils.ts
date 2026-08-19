export function formatDateKey(d: Date | string | number): string {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): { year: number; month: number; day: number; date: Date } {
  const match = key.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return {
      year,
      month,
      day,
      date: new Date(year, month - 1, day, 12, 0, 0)
    };
  }
  const parsed = new Date(key);
  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
    date: parsed
  };
}
