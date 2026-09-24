// Horário de funcionamento do D'Gust (Matupá - MT, fuso de Cuiabá).
// Terça a domingo: 13:30-22:00 · Segunda: 13:30-18:30.
export const STORE_HOURS_LABEL = "Terça a domingo: 13:30–22:00 · Segunda: 13:30–18:30";

const STORE_TIME_ZONE = "America/Cuiaba";
const OPEN_MINUTES = 13 * 60 + 30;
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function localParts(date: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: WEEKDAY_INDEX[get("weekday")] ?? 0, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function closeMinutes(day: number): number {
  return day === 1 ? 18 * 60 + 30 : 22 * 60;
}

export function isWithinStoreHours(date: Date = new Date()): boolean {
  const { day, minutes } = localParts(date);
  return minutes >= OPEN_MINUTES && minutes < closeMinutes(day);
}

// Usado só pelo ajuste antigo da abertura manual (sem horário de término): o site
// nunca passava do horário oficial de fechar.
export function isBeforeClosingTime(date: Date = new Date()): boolean {
  const { day, minutes } = localParts(date);
  return minutes < closeMinutes(day);
}

/** Dia da semana na loja (0 = domingo ... 6 = sábado), no fuso de Cuiabá — igual em qualquer aparelho. */
export function storeWeekday(date: Date = new Date()): number {
  return localParts(date).day;
}

// "Abrir agora" do painel: abre o site pra pedidos por algumas horas, a qualquer momento
// (inclusive depois do horário de fechar), e fecha sozinho quando o tempo acaba — ninguém
// precisa lembrar de desligar.
export const MANUAL_OPEN_HOURS = 3;

export type ManualOpen = { open: boolean; until: number | null };

export function isManualOpenActive(state: ManualOpen, date: Date = new Date()): boolean {
  if (!state.open) return false;
  // Sem "until" = ajuste antigo (antes desta mudança): mantém a regra de nunca passar do fechamento.
  return state.until !== null ? date.getTime() < state.until : isBeforeClosingTime(date);
}

/** Hora (HH:MM, fuso de Cuiabá) em que a abertura manual termina. */
export function formatManualOpenUntil(until: number): string {
  return new Date(until).toLocaleTimeString("pt-BR", { timeZone: STORE_TIME_ZONE, hour: "2-digit", minute: "2-digit" });
}
