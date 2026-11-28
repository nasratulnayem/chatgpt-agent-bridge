import { runFullSequence } from './storyboard_sequence.js';

runFullSequence(2)
  .then(() => console.log('Sequence finished!'))
  .catch(err => console.error('Sequence stopped with error:', err));

function getRunsequenceRetryDelay(attempt, baseMs = 500) {
  const step = Math.max(0, Math.min(Number(attempt) || 0, 5));
  return Math.round(baseMs * Math.pow(1.8, step));
}
