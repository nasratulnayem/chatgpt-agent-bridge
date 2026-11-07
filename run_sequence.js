import { runFullSequence } from './storyboard_sequence.js';

runFullSequence(2)
  .then(() => console.log('Sequence finished!'))
  .catch(err => console.error('Sequence stopped with error:', err));
