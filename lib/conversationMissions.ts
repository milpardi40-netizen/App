/**
 * «مأموریت گفت‌وگو» — every conversation room session gets a concrete goal and a
 * checklist of the learner's own turns, so the room reports what you actually did,
 * not just that it ended. Scoring is real: the room evaluates each learner turn and
 * the pass mark gates the «مأموریت انجام شد» ending.
 */
export const MISSION_PASS_PERCENT = 70;
/** A mission step counts as achieved when the turn scored at least this much. */
export const MISSION_STEP_MIN_SCORE = 60;

export interface MissionStep { turn: number; label: string }
export interface Mission {
  goal: string;
  steps: readonly MissionStep[];
  passPercent: number;
  /** True when this lesson has a hand-written goal (curated missions). */
  curated: boolean;
}

/** Curated mission goals, Russian first; every other lesson falls back to its situation text. */
const CURATED_GOALS: Record<string, string> = {
  'ru-a1-introducing-yourself': 'خودت را معرفی کن و بگو اهل کجا هستی',
  'ru-a1-asking-for-help': 'کمک بخواه و مسئله‌ات را توضیح بده',
  'ru-a1-buying-something': 'قیمت را بپرس، خرید کن و پرداخت کن',
  'ru-a1-cafe-and-food': 'سفارش بده و در پایان صورت‌حساب بخواه',
  'ru-a1-directions-and-neighborhood': 'راه را بپرس و مسیر را بفهم',
  'ru-a1-invitations-and-plans': 'دعوت را جواب بده و قرار بگذار',
  'ru-a1-health-and-pharmacy': 'حالتت را بگو و داروخانه را در جریان بگذار',
  'ru-a1-hotel-and-stay': 'اتاق بگیر و امکانات را بپرس',
  'ru-a1-public-transport': 'بلیت بخر و خط را بپرس',
  'ru-a1-phone-and-messages': 'تماس را شروع کن و پیامت را برسان',
  'ru-a1-job-interview': 'از کار و مهارتت بگو',
  'ru-a1-renting-a-home': 'خانه را بپرس و جزئیاتش را بفهم',
  'ru-a1-travel-and-tickets': 'بلیت بگیر و ساعت حرکت را بفهم',
  'ru-a1-appointments-and-time': 'وقت بگیر و ساعت را جا بگذار',
  'ru-a1-everyday-routine': 'از برنامهٔ روزت بگو',
  'ru-a1-shopping-and-clothing': 'سایز و رنگ را بپرس و پرو کن',
};

function truncate(text: string, max = 44): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

export function missionForLesson(
  lessonId: string,
  situation: string | undefined,
  learnerTurns: readonly { turn: number; label: string }[],
): Mission {
  const curatedGoal = CURATED_GOALS[lessonId];
  const goal = curatedGoal ?? (situation ? truncate(situation, 90) : 'این گفت‌وگو را کامل و سرِجایش پیش ببر');
  return {
    goal,
    steps: learnerTurns.map(step => ({ turn: step.turn, label: truncate(step.label) })),
    passPercent: MISSION_PASS_PERCENT,
    curated: Boolean(curatedGoal),
  };
}

/** Overall session score: mean over the learner's own turns (unanswered turns count as 0). */
export function missionOverall(scores: Record<number, number>, learnerTurns: readonly number[]): number {
  if (!learnerTurns.length) return 0;
  const sum = learnerTurns.reduce((acc, turn) => acc + (scores[turn] ?? 0), 0);
  return Math.round(sum / learnerTurns.length);
}

export function missionGrade(overall: number): 'A' | 'B' | 'C' | 'needs-work' {
  if (overall >= 90) return 'A';
  if (overall >= 80) return 'B';
  if (overall >= MISSION_PASS_PERCENT) return 'C';
  return 'needs-work';
}
