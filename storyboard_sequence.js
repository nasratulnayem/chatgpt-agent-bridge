import { sendPromptAndWait } from './pipeline_runner.js';

const FRAMES = [
  {
    num: 2,
    filename: 'frame-002.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 2:
Exterior wide shot. Anthropomorphic Humanoid Aloo in cobalt-blue oversized bomber jacket, cargo pants, and black parachute pack leaps out from the rear metal cargo ramp of a military plane into the open cloudy sky. Rushing wind and clouds whip around him. Framed inside the illuminated airplane cargo bay above, Lehsun (silver braided hair) and Adrak (leather jacket) stand completely still with no parachutes, calmly watching him plunge toward the distant misty tropical island ocean far below. Dramatic scale, Pixar meets Arcane hyper-realism, 8k.`
  },
  {
    num: 3,
    filename: 'frame-003.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 3:
Mid-air freefall close-up. Humanoid Aloo falling rapidly through the sky. Terrified expression with wide eyes and open mouth as he pulls the red parachute ripcord handle—only to find the nylon cord is cleanly severed and cut, frayed ends fluttering uselessly in the violent wind. No parachute deploys. Extreme panic and realization of sabotage. Volumetric wind streaks, ultra-detailed organic potato skin texture, 9:16 vertical.`
  },
  {
    num: 4,
    filename: 'frame-004.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 4:
Inside the high-tech cockpit of the cargo plane. Close-up on Adrak (ginger root man) speaking coldly into a tactical headset with a chilling, smug smirk. Beside him, Lehsun (ivory garlic woman in olive corset) looks on with cold detachment. Through the cockpit glass, storm clouds loom. Atmospheric cockpit lighting, glow from dashboard dials, Pixar/Arcane cinematic style.`
  },
  {
    num: 5,
    filename: 'frame-005.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 5:
Violent storm clouds. Mid-air close-up of Humanoid Aloo falling through dark purple and slate-gray tempest clouds with distant purple lightning flashes. Aloo clutches his buzzing tactical wrist-radio to his ear, crying out in anguish and betrayal with tears whipping from his eyes as rain lashes his cobalt bomber jacket. Intense drama, cinematic volumetric lighting.`
  },
  {
    num: 6,
    filename: 'frame-006.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 6:
Low angle shot on a wild, pristine tropical beach with dramatic black rocks and turquoise surf. Drenched, soaked Humanoid Aloo sits up weakly on the wet white sand, coughing up seawater, battered and alone. Towering primeval jungle cliffs rise in the background beneath stormy skies. Sunlight faintly breaks through clouds. Photorealistic water droplets on his organic potato skin and blue jacket.`
  },
  {
    num: 7,
    filename: 'frame-007.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 7:
Deep inside an untamed, primeval tropical jungle with giant twisting banyan roots, glowing cyan moss, and thick misty air. Humanoid Aloo walks cautiously through dense tropical ferns, clutching his bruised shoulder with a grim, resolute expression as he pieces together the betrayal. Atmospheric light shafts cutting through jungle canopy, Arcane/Pixar 3D visual fidelity.`
  },
  {
    num: 8,
    filename: 'frame-008.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 8:
Inside a secluded subterranean sea cave with crystalline turquoise water lapping against limestone walls. A weathered, rotting wooden rowboat sits beached on wet pebbles. Aloo rushes toward it with sudden hope, but stops in dismay as he sees massive gaping rot holes and broken planks along the hull. Crystalline water caustics reflecting on cave ceiling.`
  },
  {
    num: 9,
    filename: 'frame-009.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 9:
Close-up inside the sea cave. Humanoid Aloo kneels beside the broken wooden boat, inspecting the shattered planks with determined, focused eyes. He measures the wood with his hands, mentally planning how to patch and salvage it. Cinematic cave lighting, detailed wood grain and water reflections.`
  },
  {
    num: 10,
    filename: 'frame-010.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 10:
Inside a dark alcove of the sea cave, an ancient iron-banded treasure chest (Khazana) is cracked open, overflowing with radiant glowing gold coins, gold bullion bars, and glittering jewel artifacts! Brilliant golden light illuminates Humanoid Aloo's face. Aloo stares at the immense fortune, firmly shakes his head with solemn resolve, and turns his back on the gold—choosing survival and escape over riches. Stunning golden glow and high contrast.`
  },
  {
    num: 11,
    filename: 'frame-011.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 11:
Twilight high-angle vantage shot. Humanoid Aloo stands on a high rocky jungle cliff edge, concealed behind palm fronds, looking down at a heavily fortified modern outpost camp in the valley below. High watchtowers with sweeping bright floodlights, razor-wire perimeter, and armed guards. Dramatic sunset gradient in the sky.`
  },
  {
    num: 12,
    filename: 'frame-012.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 12:
Night setting in the jungle under heavy rain. Raindrops glisten on Aloo's blue utility bomber jacket. Close-up on Aloo's wrist as he checks a high-tech glowing tactical countdown watch face. His eyes narrow with intense adrenaline—knowing the villains leave at dawn and he only has tonight to act. Cyberpunk-meets-organic lighting accents.`
  },
  {
    num: 13,
    filename: 'frame-013.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 13:
Inside the villain compound's dimly lit industrial water hangar dock. A modern high-speed matte-black stealth motorboat floats at the pontoon. Shadows loom everywhere. Humanoid Aloo crouches stealthily behind large metal cargo shipping containers, timing his move. Moody cinematic noir lighting, wet concrete reflections.`
  },
  {
    num: 14,
    filename: 'frame-014.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 14:
Dramatic close-up under industrial dock floodlights. On the sleek matte-black side hull of the high-speed motorboat, bold white stenciled letters clearly read: "ESCAPE BOAT FOR ALOO". Humanoid Aloo stares at his own name printed on the vessel with eyes wide in utter disbelief and shock. High contrast floodlight glares.`
  },
  {
    num: 15,
    filename: 'frame-015.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 15:
Low-angle emotional shot. Humanoid Aloo touches the painted white letters of his name on the boat hull with trembling gloved fingers. His jaw is slack, eyes reflecting the harsh white dock light as the terrifying realization hits him that this entire journey was anticipated and manipulated. Cinematic suspense framing.`
  },
  {
    num: 16,
    filename: 'frame-016.png',
    prompt: `Generate vertical 9:16 cinematic 3D CGI image for Frame 16:
Extreme dramatic cinematic close-up on Humanoid Aloo's face. Bathed in ominous red dashboard warning lights. Organic potato skin texture with pores and water beads, wide lifelike brown eyes staring directly into the camera in haunting realization and shock. Sudden dramatic freeze-frame suspense cliffhanger! Peak cinematic Arcane/Pixar photorealism.`
  }
];

export async function runFullSequence(startFrame = 2) {
  for (const item of FRAMES) {
    if (item.num < startFrame) continue;
    console.log(`\n========================================`);
    console.log(`PRODUCING FRAME ${item.num}: ${item.filename}`);
    console.log(`========================================`);
    try {
      const res = await sendPromptAndWait(item.prompt, item.filename, 300);
      console.log(`Frame ${item.num} saved successfully!`, res);
      // Brief pause between requests to respect rate limits
      await new Promise(r => setTimeout(r, 6000));
    } catch (err) {
      console.error(`Error on Frame ${item.num}:`, err.message);
      break;
    }
  }
}
