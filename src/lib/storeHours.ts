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

// Usado pela "abertura antecipada" do painel: mesmo com o botão ligado, o site
// nunca passa do horário oficial de fechar (ninguém precisa lembrar de desligar).
export function isBeforeClosingTime(date: Date = new Date()): boolean {
  const { day, minutes } = localParts(date);
  return minutes < closeMinutes(day);
}
