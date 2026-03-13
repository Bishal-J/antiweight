export type WorkoutSectionId =
  | 'warmup'
  | 'upper'
  | 'lower'
  | 'core'
  | 'finisher'
  | 'final_cardio'
  | 'cool_down';

export type BaseExerciseOverride = {
  id: string;
  name?: string;
  details?: string;
  timerSeconds?: number;
  deleted?: boolean;
};

export type WorkoutExercise = {
  id: string;
  sectionId: WorkoutSectionId;
  name: string;
  details: string;
  // When set, this exercise supports the long-press timer popup
  timerSeconds?: number;
};

export type WorkoutSection = {
  id: WorkoutSectionId;
  title: string;
  emoji: string;
  subtitle?: string;
};

export const WORKOUT_SECTIONS: WorkoutSection[] = [
  {
    id: 'warmup',
    title: 'Warm-Up',
    emoji: '🔥',
    subtitle: '35s each · 5 min total · Get warm and loose',
  },
  {
    id: 'upper',
    title: 'Upper Body',
    emoji: '💪',
    subtitle: 'Main workout · 3 rounds · 35s rest · 60s between rounds',
  },
  {
    id: 'lower',
    title: 'Lower Body',
    emoji: '🦵',
    subtitle: 'Leg strength and control',
  },
  {
    id: 'core',
    title: 'Core',
    emoji: '🧠',
    subtitle: 'Core stability and control',
  },
  {
    id: 'finisher',
    title: 'Fat Burning Finisher',
    emoji: '⚡',
    subtitle: 'Highest fat-burning section · 3 rounds',
  },
  {
    id: 'final_cardio',
    title: 'Final Cardio',
    emoji: '🏃',
    subtitle: '5–10 min easy cardio of your choice',
  },
  {
    id: 'cool_down',
    title: 'Cool Down',
    emoji: '🧊',
    subtitle: '3–5 min stretching and breathing',
  },
];

export const BASE_EXERCISES: WorkoutExercise[] = [
  // Warm-Up (35s per move)
  {
    id: 'warmup_jumping_jacks',
    sectionId: 'warmup',
    name: 'Jumping Jacks',
    details: '35s timer',
    timerSeconds: 35,
  },
  {
    id: 'warmup_high_knees',
    sectionId: 'warmup',
    name: 'High Knees',
    details: '35s timer',
    timerSeconds: 35,
  },
  {
    id: 'warmup_arm_circles',
    sectionId: 'warmup',
    name: 'Arm Circles',
    details: '35s timer',
    timerSeconds: 35,
  },
  {
    id: 'warmup_torso_twists',
    sectionId: 'warmup',
    name: 'Torso Twists',
    details: '35s timer',
    timerSeconds: 35,
  },
  {
    id: 'warmup_light_jog',
    sectionId: 'warmup',
    name: 'Light Jog in Place',
    details: '35s timer',
    timerSeconds: 35,
  },

  // Main Workout – Upper Body (3 rounds)
  {
    id: 'upper_pushups',
    sectionId: 'upper',
    name: 'Push-ups',
    details: '12 reps · 3 rounds',
  },
  {
    id: 'upper_pike_pushups',
    sectionId: 'upper',
    name: 'Pike Push-ups',
    details: '8–10 reps · 3 rounds',
  },
  {
    id: 'upper_triceps_dips',
    sectionId: 'upper',
    name: 'Triceps Dips',
    details: '12 reps · chair or bed · 3 rounds',
  },

  // Main Workout – Lower Body (3 rounds)
  {
    id: 'lower_bodyweight_squats',
    sectionId: 'lower',
    name: 'Bodyweight Squats',
    details: '15 reps · 3 rounds',
  },
  {
    id: 'lower_lunges',
    sectionId: 'lower',
    name: 'Lunges',
    details: '10 each leg · 3 rounds',
  },
  {
    id: 'lower_glute_bridges',
    sectionId: 'lower',
    name: 'Glute Bridges',
    details: '15 reps · 3 rounds',
  },
  {
    id: 'lower_calf_raises',
    sectionId: 'lower',
    name: 'Calf Raises',
    details: '20 reps · 3 rounds',
  },

  // Main Workout – Core (3 rounds)
  {
    id: 'core_plank',
    sectionId: 'core',
    name: 'Plank',
    details: '30s timer · 3 rounds',
    timerSeconds: 30,
  },
  {
    id: 'core_bicycle_crunch',
    sectionId: 'core',
    name: 'Bicycle Crunch',
    details: '20 reps · 3 rounds',
  },
  {
    id: 'core_leg_raises',
    sectionId: 'core',
    name: 'Leg Raises',
    details: '12 reps · 3 rounds',
  },
  {
    id: 'core_dead_bug',
    sectionId: 'core',
    name: 'Dead Bug',
    details: '10 each side · 3 rounds',
  },

  // Fat Burning Finisher (3 rounds)
  {
    id: 'finisher_burpees',
    sectionId: 'finisher',
    name: 'Burpees',
    details: '10 reps · 3 rounds',
  },
  {
    id: 'finisher_mountain_climbers',
    sectionId: 'finisher',
    name: 'Mountain Climbers',
    details: '30s timer · 3 rounds',
    timerSeconds: 30,
  },
  {
    id: 'finisher_jump_squats',
    sectionId: 'finisher',
    name: 'Jump Squats',
    details: '10 reps · 3 rounds',
  },

  // Final Cardio – options (pick 1–2)
  {
    id: 'final_cardio_jump_rope',
    sectionId: 'final_cardio',
    name: 'Jump Rope / Invisible Rope',
    details: '5–10 min',
  },
  {
    id: 'final_cardio_high_knees',
    sectionId: 'final_cardio',
    name: 'High Knees',
    details: '5–10 min (intervals)',
  },
  {
    id: 'final_cardio_fast_jog',
    sectionId: 'final_cardio',
    name: 'Fast Jogging in Place',
    details: '5–10 min',
  },

  // Cool Down – stretches
  {
    id: 'cool_down_hamstring',
    sectionId: 'cool_down',
    name: 'Hamstring Stretch',
    details: '20–30s each side',
  },
  {
    id: 'cool_down_quad',
    sectionId: 'cool_down',
    name: 'Quad Stretch',
    details: '20–30s each side',
  },
  {
    id: 'cool_down_shoulder',
    sectionId: 'cool_down',
    name: 'Shoulder Stretch',
    details: '20–30s each side',
  },
  {
    id: 'cool_down_lower_back',
    sectionId: 'cool_down',
    name: 'Lower Back Stretch',
    details: '20–30s',
  },
];

export const BASE_TOTAL_EXERCISES = BASE_EXERCISES.length;

