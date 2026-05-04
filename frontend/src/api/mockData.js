// Mock data for demo/development

export const mockUsers = {
  admin: {
    id: 'usr_admin_1',
    name: 'Rahul Sharma',
    email: 'admin@fitdeck.app',
    role: 'gym_admin',
    gym: { id: 'gym_1', name: 'FitZone Pro', city: 'Mumbai' },
    subscription: 'premium',
    avatar: null,
  },
  trainer: {
    id: 'usr_trainer_1',
    name: 'Anmol Gupta',
    email: 'trainer@fitdeck.app',
    role: 'trainer',
    gym: { id: 'gym_1', name: 'FitZone Pro', city: 'Mumbai' },
    specialisation: 'Strength & Conditioning',
    clientCount: 12,
    subscription: 'premium',
    avatar: null,
  },
  client: {
    id: 'usr_client_1',
    name: 'Ankit Mehta',
    email: 'ankit@example.com',
    role: 'end_user',
    gym: { id: 'gym_1', name: 'FitZone Pro', city: 'Mumbai' },
    trainer: { id: 'usr_trainer_1', name: 'Anmol Gupta' },
    subscription: 'premium',
    goal: 'fat_loss',
    avatar: null,
  },
}

export const mockClientProfile = {
  id: 'usr_client_1',
  name: 'Ankit Mehta',
  age: 28,
  gender: 'male',
  height: 175,
  weight: 82,
  goal: 'fat_loss',
  medicalConditions: [],
  macroTargets: { calories: 2100, protein: 160, carbs: 220, fat: 65 },
  attendanceStreak: 8,
  lastVisit: '2026-05-03',
  subscription: 'premium',
}

export const mockTrainers = [
  { id: 'usr_trainer_1', name: 'Anmol Gupta', email: 'anmol@fitzone.com', specialisation: 'Strength & Conditioning', clientCount: 12, status: 'active', joinedAt: '2025-01-15' },
  { id: 'usr_trainer_2', name: 'Priya Patel', email: 'priya@fitzone.com', specialisation: 'Yoga & Flexibility', clientCount: 8, status: 'active', joinedAt: '2025-03-01' },
  { id: 'usr_trainer_3', name: 'Rohit Verma', email: 'rohit@fitzone.com', specialisation: 'Cardio & HIIT', clientCount: 15, status: 'active', joinedAt: '2024-11-20' },
]

export const mockClients = [
  { id: 'c1', name: 'Ankit Mehta', trainer: 'Anmol Gupta', trainerId: 'usr_trainer_1', lastVisit: '2026-05-03', attendanceStreak: 8, subscription: 'premium', goal: 'fat_loss', email: 'ankit@example.com' },
  { id: 'c2', name: 'Sneha Kapoor', trainer: 'Anmol Gupta', trainerId: 'usr_trainer_1', lastVisit: '2026-05-04', attendanceStreak: 14, subscription: 'core', goal: 'muscle_gain', email: 'sneha@example.com' },
  { id: 'c3', name: 'Vikram Singh', trainer: 'Priya Patel', trainerId: 'usr_trainer_2', lastVisit: '2026-04-28', attendanceStreak: 2, subscription: 'core', goal: 'maintenance', email: 'vikram@example.com' },
  { id: 'c4', name: 'Meera Nair', trainer: 'Anmol Gupta', trainerId: 'usr_trainer_1', lastVisit: '2026-05-02', attendanceStreak: 21, subscription: 'premium', goal: 'fat_loss', email: 'meera@example.com' },
  { id: 'c5', name: 'Arjun Reddy', trainer: 'Rohit Verma', trainerId: 'usr_trainer_3', lastVisit: '2026-05-04', attendanceStreak: 5, subscription: 'premium', goal: 'muscle_gain', email: 'arjun@example.com' },
  { id: 'c6', name: 'Pooja Sharma', trainer: 'Priya Patel', trainerId: 'usr_trainer_2', lastVisit: '2026-04-25', attendanceStreak: 0, subscription: 'core', goal: 'fat_loss', email: 'pooja@example.com' },
  { id: 'c7', name: 'Raj Malhotra', trainer: 'Rohit Verma', trainerId: 'usr_trainer_3', lastVisit: '2026-05-01', attendanceStreak: 3, subscription: 'premium', goal: 'muscle_gain', email: 'raj@example.com' },
  { id: 'c8', name: 'Kavya Iyer', trainer: 'Anmol Gupta', trainerId: 'usr_trainer_1', lastVisit: '2026-05-04', attendanceStreak: 30, subscription: 'premium', goal: 'maintenance', email: 'kavya@example.com' },
]

export const mockFoodLog = [
  { id: 'f1', name: 'Oatmeal with Banana', calories: 320, protein: 12, carbs: 58, fat: 5, isJunk: false, time: '08:15' },
  { id: 'f2', name: 'Grilled Chicken Breast', calories: 280, protein: 52, carbs: 0, fat: 6, isJunk: false, time: '13:00' },
  { id: 'f3', name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fat: 2, isJunk: false, time: '13:05' },
  { id: 'f4', name: 'Protein Shake', calories: 180, protein: 30, carbs: 10, fat: 3, isJunk: false, time: '16:30' },
  { id: 'f5', name: 'Chips (Lay\'s)', calories: 160, protein: 2, carbs: 20, fat: 9, isJunk: true, time: '17:45' },
]

export const mockBodyLogs = [
  { date: '2026-01-01', weight: 88, waist: 92, chest: 102, arms: 34 },
  { date: '2026-01-15', weight: 87, waist: 91, chest: 101, arms: 34 },
  { date: '2026-02-01', weight: 86, waist: 90, chest: 100, arms: 35 },
  { date: '2026-02-15', weight: 85.5, waist: 89, chest: 100, arms: 35 },
  { date: '2026-03-01', weight: 84, waist: 88, chest: 99, arms: 36 },
  { date: '2026-03-15', weight: 83.5, waist: 87, chest: 99, arms: 36 },
  { date: '2026-04-01', weight: 83, waist: 86, chest: 98, arms: 37 },
  { date: '2026-04-15', weight: 82.5, waist: 85, chest: 98, arms: 37 },
  { date: '2026-05-01', weight: 82, waist: 84, chest: 97, arms: 38 },
]

export const mockStepLogs = [
  { date: '2026-04-28', steps: 8420 },
  { date: '2026-04-29', steps: 11300 },
  { date: '2026-04-30', steps: 6800 },
  { date: '2026-05-01', steps: 9200 },
  { date: '2026-05-02', steps: 12500 },
  { date: '2026-05-03', steps: 7400 },
  { date: '2026-05-04', steps: 4200 },
]

export const mockWorkoutPlan = {
  id: 'wp_1',
  name: 'Fat Loss — 5 Day Split',
  assignedBy: 'Anmol Gupta',
  assignedAt: '2026-04-01',
  days: [
    {
      day: 'Monday',
      label: 'Push Day',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', done: true },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', done: true },
        { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60s', done: false },
        { name: 'Shoulder Press', sets: 4, reps: '8-10', rest: '90s', done: false },
        { name: 'Lateral Raises', sets: 3, reps: '15', rest: '45s', done: false },
      ]
    },
    {
      day: 'Tuesday',
      label: 'Pull Day',
      exercises: [
        { name: 'Pull-ups', sets: 4, reps: '6-8', rest: '90s', done: false },
        { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s', done: false },
        { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '60s', done: false },
        { name: 'Face Pulls', sets: 3, reps: '15', rest: '45s', done: false },
        { name: 'Bicep Curls', sets: 3, reps: '12', rest: '45s', done: false },
      ]
    },
    {
      day: 'Wednesday',
      label: 'Rest Day',
      exercises: []
    },
    {
      day: 'Thursday',
      label: 'Legs Day',
      exercises: [
        { name: 'Squats', sets: 4, reps: '8-10', rest: '120s', done: false },
        { name: 'Leg Press', sets: 3, reps: '12', rest: '90s', done: false },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', rest: '90s', done: false },
        { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60s', done: false },
        { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s', done: false },
      ]
    },
    {
      day: 'Friday',
      label: 'Cardio + Core',
      exercises: [
        { name: 'Treadmill HIIT', sets: 1, reps: '20 min', rest: '-', done: false },
        { name: 'Plank', sets: 3, reps: '60s', rest: '30s', done: false },
        { name: 'Russian Twists', sets: 3, reps: '20', rest: '30s', done: false },
        { name: 'Hanging Leg Raises', sets: 3, reps: '15', rest: '45s', done: false },
      ]
    },
    { day: 'Saturday', label: 'Rest Day', exercises: [] },
    { day: 'Sunday', label: 'Active Recovery', exercises: [
      { name: 'Walking', sets: 1, reps: '30 min', rest: '-', done: false },
      { name: 'Stretching', sets: 1, reps: '15 min', rest: '-', done: false },
    ]},
  ]
}

export const mockFoodDatabase = [
  // Fruits
  { id: 'fd1', category: 'Fruits', name: 'Apple', per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }, benefits: 'Rich in fiber and antioxidants. Supports heart health and gut microbiome.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd2', category: 'Fruits', name: 'Banana', per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }, benefits: 'High in potassium and natural sugars. Excellent pre-workout energy source.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd3', category: 'Fruits', name: 'Watermelon', per100g: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 }, benefits: 'Very low calorie. Contains lycopene and citrulline for hydration and recovery.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd4', category: 'Fruits', name: 'Mango', per100g: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 }, benefits: 'High in vitamin C and A. Natural sugars provide quick energy.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd5', category: 'Fruits', name: 'Blueberries', per100g: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 }, benefits: 'Extremely high in antioxidants. Reduces oxidative stress from workouts.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  // Proteins
  { id: 'fd6', category: 'Proteins', name: 'Chicken Breast', per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, benefits: 'Lean complete protein. Ideal for muscle building and fat loss.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd7', category: 'Proteins', name: 'Eggs (whole)', per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }, benefits: 'Complete amino acid profile. Choline supports brain and liver health.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd8', category: 'Proteins', name: 'Paneer (Cottage Cheese)', per100g: { calories: 265, protein: 18, carbs: 3.4, fat: 20, fiber: 0 }, benefits: 'Good vegetarian protein source. High in calcium. Slow-digesting casein.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd9', category: 'Proteins', name: 'Tuna (canned)', per100g: { calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 }, benefits: 'Very high protein, very low fat. Omega-3 fatty acids support recovery.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd10', category: 'Proteins', name: 'Greek Yogurt', per100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 }, benefits: 'Probiotic benefits for gut health. High protein per calorie ratio.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  // Carbs
  { id: 'fd11', category: 'Carbohydrates', name: 'Brown Rice', per100g: { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 }, benefits: 'Complex carbs for sustained energy. Higher fiber than white rice.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd12', category: 'Carbohydrates', name: 'Oats', per100g: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10 }, benefits: 'High fiber slows digestion. Beta-glucan reduces cholesterol.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd13', category: 'Carbohydrates', name: 'Sweet Potato', per100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 }, benefits: 'High in beta-carotene. Lower GI than white potato. Good pre-workout carb.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd14', category: 'Carbohydrates', name: 'White Rice', per100g: { calories: 204, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6 }, benefits: 'Easily digestible. Fast energy for post-workout replenishment.', goalTags: { fat_loss: 'avoid', muscle_gain: 'eat', maintenance: 'limit' } },
  // Vegetables
  { id: 'fd15', category: 'Vegetables', name: 'Broccoli', per100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 }, benefits: 'High in vitamin K and C. Contains sulforaphane, a powerful anti-inflammatory.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd16', category: 'Vegetables', name: 'Spinach', per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }, benefits: 'Iron and magnesium for energy production. Nitrates improve exercise performance.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd17', category: 'Vegetables', name: 'Bell Peppers', per100g: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 }, benefits: 'Highest vitamin C of any vegetable. Antioxidants support immune health.', goalTags: { fat_loss: 'eat', muscle_gain: 'eat', maintenance: 'eat' } },
  // Fats
  { id: 'fd18', category: 'Fats', name: 'Almonds', per100g: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 }, benefits: 'Healthy monounsaturated fats. Vitamin E for skin and immune health.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd19', category: 'Fats', name: 'Avocado', per100g: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 }, benefits: 'Rich in potassium and healthy fats. Oleic acid reduces inflammation.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
  { id: 'fd20', category: 'Fats', name: 'Olive Oil', per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, benefits: 'Heart-healthy polyphenols. Reduces LDL cholesterol and inflammation.', goalTags: { fat_loss: 'limit', muscle_gain: 'eat', maintenance: 'eat' } },
]

export const mockWeeklyAnalysis = {
  weekStart: '2026-04-28',
  weekEnd: '2026-05-04',
  insights: [
    {
      type: 'macro',
      icon: 'nutrition',
      title: 'Protein slightly under target',
      detail: 'You averaged 142g of protein vs your 160g daily target. On 3 days you were 30g+ below. Try adding a protein shake or egg whites post-workout.',
      score: 71,
      color: 'amber',
    },
    {
      type: 'steps',
      icon: 'steps',
      title: 'Strong step week',
      detail: 'Your 7-day average was 8,589 steps — above your 8,000 target. You hit 10k+ on 2 days this week. Keep it up.',
      score: 95,
      color: 'green',
    },
    {
      type: 'workout',
      icon: 'workout',
      title: '3 of 5 sessions completed',
      detail: 'You completed Monday, Tuesday, and Thursday workouts. Friday\'s cardio session was missed. Consistency here is key for your fat loss goal.',
      score: 60,
      color: 'red',
    },
    {
      type: 'body',
      icon: 'body',
      title: 'Down 0.5kg this week',
      detail: 'Your weight went from 82.5kg to 82kg. You\'re trending in the right direction. At this rate, you\'ll hit your 78kg target in about 8 weeks.',
      score: 90,
      color: 'green',
    },
    {
      type: 'attendance',
      icon: 'attendance',
      title: '4/5 gym days attended',
      detail: 'You missed Sunday\'s active recovery session. Your 8-day streak is intact. Aim for 5/5 next week.',
      score: 80,
      color: 'blue',
    },
  ]
}

export const mockAttendanceData = (() => {
  const data = {}
  const clients = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
  const today = new Date('2026-05-04')

  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    data[dateStr] = {}
    clients.forEach(id => {
      const rand = Math.random()
      data[dateStr][id] = rand > 0.25 ? 'present' : 'absent'
    })
  }
  return data
})()

export const mockFollowUps = [
  { id: 'fu1', client: 'Vikram Singh', clientId: 'c3', trainer: 'Priya Patel', reason: 'Missed 3 consecutive sessions', severity: 'high', flaggedAt: '2026-05-01', status: 'open' },
  { id: 'fu2', client: 'Pooja Sharma', clientId: 'c6', trainer: 'Priya Patel', reason: 'No macro data logged in 5 days', severity: 'medium', flaggedAt: '2026-05-03', status: 'open' },
  { id: 'fu3', client: 'Raj Malhotra', clientId: 'c7', trainer: 'Rohit Verma', reason: 'Subscription expiring in 3 days', severity: 'medium', flaggedAt: '2026-05-04', status: 'open' },
  { id: 'fu4', client: 'Ankit Mehta', clientId: 'c1', trainer: 'Anmol Gupta', reason: 'Missed 3 consecutive sessions', severity: 'low', flaggedAt: '2026-04-28', status: 'resolved' },
]

export const mockAchievements = [
  { key: 'first_1000_steps', title: 'First Steps', description: 'Log 1,000 steps in a day', icon: '👟', unlocked: true, unlockedAt: '2026-01-15' },
  { key: 'first_5000_steps', title: 'On A Roll', description: 'Log 5,000 steps in a day', icon: '🏃', unlocked: true, unlockedAt: '2026-01-20' },
  { key: 'first_10000_steps', title: 'Step Master', description: 'Log 10,000 steps in a day', icon: '🥇', unlocked: true, unlockedAt: '2026-02-03' },
  { key: 'seven_day_streak', title: '7-Day Warrior', description: 'Attend 7 days in a row', icon: '🔥', unlocked: true, unlockedAt: '2026-02-10' },
  { key: 'thirty_day_streak', title: 'Iron Commitment', description: 'Attend 30 days in a row', icon: '💪', unlocked: false, progress: 8, target: 30 },
  { key: 'first_workout', title: 'First Rep', description: 'Complete your first workout', icon: '🏋️', unlocked: true, unlockedAt: '2026-01-06' },
  { key: 'goal_reached', title: 'Goal Crusher', description: 'Hit your primary fitness goal', icon: '🏆', unlocked: false, progress: 67, target: 100 },
  { key: 'calorie_week', title: 'Consistent Eater', description: 'Hit macro targets 5 days in a row', icon: '🥗', unlocked: true, unlockedAt: '2026-03-14' },
]

export const mockChatMessages = [
  { id: 'm1', senderId: 'usr_trainer_1', senderName: 'Anmol Gupta', content: 'Hey Ankit! Great work this week. Your push day form has improved a lot.', sentAt: '2026-05-03T10:15:00', isOwn: false },
  { id: 'm2', senderId: 'usr_client_1', senderName: 'Ankit Mehta', content: 'Thanks Anmol! The cue you gave for bench press really helped. Should I increase the weight next session?', sentAt: '2026-05-03T10:22:00', isOwn: true },
  { id: 'm3', senderId: 'usr_trainer_1', senderName: 'Anmol Gupta', content: 'Yes, go up by 2.5kg on each side. You\'re ready. Also make sure you\'re hitting your protein target — you were short by 30g yesterday.', sentAt: '2026-05-03T10:30:00', isOwn: false },
  { id: 'm4', senderId: 'usr_client_1', senderName: 'Ankit Mehta', content: 'Will do! I skipped the protein shake. Won\'t happen again.', sentAt: '2026-05-03T10:35:00', isOwn: true },
  { id: 'm5', senderId: 'usr_trainer_1', senderName: 'Anmol Gupta', content: 'Perfect. See you Monday!', sentAt: '2026-05-03T10:36:00', isOwn: false },
]

export const mockAdminStats = {
  totalClients: 35,
  activeTrainers: 3,
  todayAttendance: 22,
  followUpAlerts: 3,
  monthlyRevenue: 87500,
  avgAttendanceRate: 78,
}

export const mockTrainerStats = {
  totalClients: 12,
  presentToday: 8,
  pendingCheckIns: 3,
  unreadMessages: 2,
}
