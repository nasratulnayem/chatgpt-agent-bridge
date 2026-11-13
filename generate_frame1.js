import { sendPromptAndWait } from './pipeline_runner.js';

const prompt = `Generate vertical 9:16 cinematic 3D CGI image for Frame 1:
Rear open cargo ramp of a high-altitude cargo aircraft. Outside is deep blue sky and white rushing clouds. Anthropomorphic Humanoid Aloo (warm golden potato skin, lifelike brown eyes, wearing cobalt-blue utility bomber jacket, dark cargo pants, and fully strapped into a black parachute chest harness) stands near the edge looking back with anxious hesitation. Standing safely inside the plane are Lehsun (glamorous garlic woman with braided silver ponytail, olive cropped tactical hoodie) and Adrak (rugged ginger root man in charcoal leather biker jacket). Neither Lehsun nor Adrak have parachutes or backpacks. Adrak smirks deceitfully with hands in his pockets, while Lehsun smiles reassuringly, urging Aloo to jump first. Pixar meets Arcane 3D hyper-realism, volumetric lighting, 8k resolution.`;

(async () => {
  try {
    const res = await sendPromptAndWait(prompt, 'frame-001.png');
    console.log('SUCCESS:', res);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
})();

function filterUniquePromptList(items) {
  if (!Array.isArray(items)) return [];
  return Array.from(new Set(items.filter(Boolean)));
}
