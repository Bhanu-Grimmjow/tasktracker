// 50+ warrior/discipline quotes — rotate by day of year
const ALL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The pain you feel today is the strength you feel tomorrow.", author: "Unknown" },
  { text: "It does not matter how slowly you go, as long as you do not stop.", author: "Confucius" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard is not impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "To see what is right and not do it is a lack of courage.", author: "Confucius" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "Every strike brings me closer to the next home run.", author: "Babe Ruth" },
  { text: "Definiteness of purpose is the starting point of all achievement.", author: "W. Clement Stone" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang Von Goethe" },
  { text: "Imagine your life is perfect in every respect; what would it look like?", author: "Brian Tracy" },
  { text: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
  { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
  { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
  { text: "You've got to get up every morning with determination if you're going to go to bed with satisfaction.", author: "George Lorimer" },
  { text: "To avoid criticism, do nothing, say nothing, be nothing.", author: "Elbert Hubbard" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
  { text: "Many of life's failures are people who did not realize how close they were to success when they gave up.", author: "Thomas A. Edison" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss" },
];

// Returns a different quote each day of the year
export function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return ALL_QUOTES[dayOfYear % ALL_QUOTES.length];
}

// Returns N quotes starting from today (for variety across components)
export function getQuotes(count = 1, offset = 0) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Array.from({ length: count }, (_, i) =>
    ALL_QUOTES[(dayOfYear + offset + i) % ALL_QUOTES.length]
  );
}

export default ALL_QUOTES;
