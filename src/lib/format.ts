const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function formatMonthYear(dateLike?: string) {
  if (!dateLike) {
    return "Present";
  }

  const parsed = Date.parse(dateLike);

  if (Number.isNaN(parsed)) {
    return dateLike;
  }

  return monthYearFormatter.format(parsed);
}

export function formatRange(startDate: string, endDate?: string, isCurrent?: boolean) {
  const start = formatMonthYear(startDate);
  const end = isCurrent ? "Present" : formatMonthYear(endDate);

  return `${start} - ${end}`;
}
