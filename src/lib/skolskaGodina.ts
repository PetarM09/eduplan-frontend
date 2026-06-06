export const SKOLSKA_GODINA_OD = 2025;

export function generisiSkolskeGodine(today: Date = new Date()): string[] {
  const krajnja = today.getFullYear();
  const godine: string[] = [];
  for (let g = SKOLSKA_GODINA_OD; g <= krajnja; g++) {
    godine.push(`${g}/${g + 1}`);
  }
  return godine;
}

export function tekucaSkolskaGodina(today: Date = new Date()): string {
  const godine = generisiSkolskeGodine(today);
  const godina = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
  const ciljna = `${godina}/${godina + 1}`;
  return godine.includes(ciljna) ? ciljna : godine[godine.length - 1];
}
