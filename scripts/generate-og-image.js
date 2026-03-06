/**
 * Generate og-image.png for social media previews
 * 
 * Prerequisites: npm install canvas (in project root)
 * Usage: node scripts/generate-og-image.js
 * 
 * Alternative: Use any design tool to create a 1200x630 PNG
 * and save it as apps/web/public/og-image.png
 */

try {
  const { createCanvas } = require('canvas');

  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1a1f3a');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circle
  ctx.beginPath();
  ctx.arc(900, 200, 250, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(79, 70, 229, 0.08)';
  ctx.fill();

  // AI Badge
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.roundRect(540, 100, 120, 50, 12);
  ctx.fill();
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('AI', 600, 133);

  // Title
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('MySkillStore', 600, 230);

  // Subtitle
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#818cf8';
  ctx.fillText('Private AI Assistant Setup', 600, 290);

  // Description
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Turn your PC into a real-life JARVIS', 600, 370);

  // Price badge
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.beginPath();
  ctx.roundRect(440, 420, 320, 50, 12);
  ctx.fill();
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('Starting at ₱5,000', 600, 452);

  // Footer
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('www.myskillstore.fun  •  Manila, Philippines', 600, 560);

  // Save
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'og-image.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${outputPath} (${buffer.length} bytes)`);

} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log('⚠️  canvas module not found.');
    console.log('   Install: npm install canvas');
    console.log('   Or manually create a 1200x630 PNG at: apps/web/public/og-image.png');
    console.log('   Use any design tool (Figma, Canva, etc.)');
  } else {
    console.error('Error:', err.message);
  }
}
