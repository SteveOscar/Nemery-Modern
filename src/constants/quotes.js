export const quotes = {
  // Motivational quotes for game over
  gameOver: [
    'Every expert was once a beginner. Keep playing!',
    'The only way to get better is to keep trying.',
    "Success is not final, failure is not fatal. It's the courage to continue that counts.",
    'The best way to predict the future is to create it.',
    "Don't watch the clock; do what it does. Keep going.",
    'The only limit to our realization of tomorrow is our doubts of today.',
    "It always seems impossible until it's done.",
    'The difference between the impossible and the possible lies in determination.',
    "Your time is limited, don't waste it living someone else's life.",
    'The future belongs to those who believe in the beauty of their dreams.',
  ],

  // Victory quotes
  victory: [
    "Congratulations! You've mastered the art of 2048!",
    "Incredible! You've reached the ultimate goal!",
    'You did it! Your persistence has paid off!',
    "Amazing! You've conquered the 2048 challenge!",
    "Outstanding! You've proven that anything is possible!",
    "Fantastic! You've achieved what many thought impossible!",
    "Brilliant! You've mastered the game of strategy!",
    'Excellent! Your strategic thinking has led to victory!',
    "Wonderful! You've shown incredible skill and patience!",
    "Magnificent! You've reached the pinnacle of 2048!",
  ],

  // High score quotes
  highScore: [
    "New personal best! You're getting better every time!",
    "Incredible score! You're on fire today!",
    "Amazing! You've broken your own record!",
    'Outstanding! Your skills are improving rapidly!',
    "Fantastic! You've set a new benchmark!",
    "Brilliant! You're reaching new heights!",
    'Excellent! Your strategy is working perfectly!',
    "Wonderful! You've achieved a remarkable score!",
    "Magnificent! You're becoming a 2048 master!",
    'Superb! Your dedication is paying off!',
  ],

  // Encouragement quotes for low scores
  encouragement: [
    "Don't give up! Every game makes you better.",
    'Keep practicing! Success comes with persistence.',
    "You're learning! Each attempt teaches you something new.",
    'Stay focused! The next game could be your best.',
    'Believe in yourself! You have what it takes.',
    'Keep going! Progress happens one move at a time.',
    "You're improving! Every game builds your skills.",
    'Stay determined! Great things take time.',
    'Keep trying! Your breakthrough is coming.',
    "Don't quit! Success is just around the corner.",
  ],

  // Tips and hints
  tips: [
    'Keep your highest tile in a corner for better control.',
    'Build chains of increasing values to maximize merges.',
    "Don't let small tiles scatter around the board.",
    'Plan your moves ahead to avoid getting stuck.',
    'Focus on building one strong chain rather than multiple weak ones.',
    'Use the undo feature wisely to learn from mistakes.',
    'Stay patient - rushing leads to poor decisions.',
    'Watch for patterns that can lead to big merges.',
    'Keep the board organized and avoid chaos.',
    'Remember: every move should have a purpose.',
  ],

  // Achievement quotes
  achievements: {
    firstGame: 'Welcome to the world of 2048! Your journey begins now.',
    firstHundred: "Great start! You're getting the hang of it.",
    firstThousand: "Excellent progress! You're becoming a skilled player.",
    first2048: "Incredible! You've reached the legendary 2048 tile!",
    first4096: "Amazing! You've gone beyond the impossible!",
    first8192: "Legendary! You've achieved what few can dream of!",
    perfectGame: "Perfect! You've played flawlessly!",
    speedRun: "Lightning fast! You've mastered speed and strategy!",
    marathon: "Endurance champion! You've played the long game!",
    strategist: 'Master strategist! Your planning was impeccable!',
  },

  // Daily motivation
  daily: [
    'Today is a new day to achieve greatness.',
    'Every morning brings new opportunities to improve.',
    'Start your day with determination and end it with satisfaction.',
    "Today's efforts are tomorrow's achievements.",
    'Make today count towards your goals.',
    'Every day is a chance to get better.',
    "Today's practice builds tomorrow's success.",
    'Start strong, finish stronger.',
    'Today is the day to push your limits.',
    'Make today your masterpiece.',
  ],

  // Zen quotes for calm gameplay
  zen: [
    'In the midst of chaos, find your center.',
    'Patience is the key to mastery.',
    'Focus on the present move, not the future outcome.',
    'Calm mind, clear strategy.',
    'Breathe deeply, think clearly.',
    'In stillness, find your strength.',
    'Every move is a meditation.',
    'Peace comes from within, not from the game.',
    'Stay centered, stay focused.',
    'The mind is everything. What you think, you become.',
  ],
};

// Helper function to get a random quote from a category
export const getRandomQuote = (category) => {
  const categoryQuotes = quotes[category];
  if (!categoryQuotes) {
    return 'Keep playing and have fun!';
  }

  if (Array.isArray(categoryQuotes)) {
    return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
  }

  return categoryQuotes;
};

// Helper function to get a quote based on score
export const getScoreBasedQuote = (score, previousBest) => {
  if (score >= 8192) {
    return getRandomQuote('victory');
  } else if (score >= 2048) {
    return getRandomQuote('highScore');
  } else if (score > previousBest) {
    return getRandomQuote('highScore');
  } else if (score < 100) {
    return getRandomQuote('encouragement');
  } else {
    return getRandomQuote('gameOver');
  }
};

// Helper function to get a daily quote
export const getDailyQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const dailyQuotes = quotes.daily;
  return dailyQuotes[dayOfYear % dailyQuotes.length];
};
