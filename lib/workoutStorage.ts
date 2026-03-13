export const STORAGE_KEY_PREFIX = 'daily_workout_progress_';
export const CUSTOM_EXERCISES_KEY = 'custom_exercises_v1';

export const getDateKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${STORAGE_KEY_PREFIX}${yyyy}-${mm}-${dd}`;
};

export const getTodayKey = () => getDateKey(new Date());

