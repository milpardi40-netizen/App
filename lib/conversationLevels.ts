import type { CefrBand } from '@/lib/content/courseSpec';

export type ConversationLevelId = 0 | 1 | 2 | 3 | 4 | 5;

export interface ConversationLevelOption {
  id: ConversationLevelId;
  band: CefrBand;
  label: string;
  description: string;
}

export const CONVERSATION_LEVELS: readonly ConversationLevelOption[] = [
  { id: 0, band: 'pre', label: 'Pre-A1', description: 'واژه‌ها و جمله‌های خیلی ساده' },
  { id: 1, band: 'A1', label: 'A1', description: 'مکالمه‌های پایه و روزمره' },
  { id: 2, band: 'A2', label: 'A2', description: 'توصیف و گفت‌وگوی کوتاه' },
  { id: 3, band: 'B1', label: 'B1', description: 'بیان تجربه و نظر' },
  { id: 4, band: 'B2', label: 'B2', description: 'گفت‌وگوی روان و دقیق' },
  { id: 5, band: 'C1', label: 'C1', description: 'بحث حرفه‌ای و پیشرفته' },
];

export function conversationLevel(id: number | null | undefined): ConversationLevelOption {
  return CONVERSATION_LEVELS.find(level => level.id === id) || CONVERSATION_LEVELS[0];
}
