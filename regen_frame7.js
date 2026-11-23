import { sendPromptAndWait } from './pipeline_runner.js';

const prompt = `Generate vertical 9:16 cinematic 3D CGI image for Frame 7:
Deep inside an untamed, primeval tropical jungle with giant twisting banyan roots, glowing cyan moss, and thick misty air. Humanoid Aloo walks cautiously through dense tropical ferns, clutching his bruised shoulder with a grim, resolute expression as he pieces together the betrayal. Atmospheric light shafts cutting through jungle canopy, Arcane/Pixar 3D visual fidelity.`;

(async () => {
  try {
    console.log('Regenerating Frame 7 to get its distinct jungle exploration visual...');
    const res = await sendPromptAndWait(prompt, 'frame-007.png', 300);
    console.log('FRAME 7 REGENERATED SUCCESSFULLY:', res);
  } catch (err) {
    console.error('Error on Frame 7:', err.message);
  }
})();
