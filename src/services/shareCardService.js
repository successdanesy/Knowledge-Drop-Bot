import sharp from 'sharp';
import { createCanvas, registerFont } from 'canvas';

// Register custom fonts (add to project)
try {
  registerFont('./fonts/Poppins-Bold.ttf', { family: 'Poppins' });
} catch (e) {
  console.log('⚠️ Custom fonts not found, using defaults');
}

const THEMES_COLORS = {
  countries: { bg: '#1e3c72', accent: '#2a5298' },
  nature: { bg: '#134e5e', accent: '#16a085' },
  history: { bg: '#5f27cd', accent: '#341f97' },
  africa_focus: { bg: '#ff6b35', accent: '#f7931e' },
  origins: { bg: '#00b4db', accent: '#0083b0' },
  random_mix: { bg: '#667eea', accent: '#764ba2' }
};

export async function generateShareCard(fact, themeId, username = 'Knowledge Drop') {
  try {
    const colors = THEMES_COLORS[themeId] || THEMES_COLORS.random_mix;
    const width = 1200;
    const height = 630;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(1, colors.accent);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 50) {
      for (let j = 0; j < height; j += 50) {
        ctx.fillRect(i, j, 30, 30);
      }
    }

    // Draw decorative circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width - 100, -50, 150, 0, Math.PI * 2);
    ctx.stroke();

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Poppins, Arial';
    ctx.textAlign = 'center';
    
    const lines = wrapText(fact.drop, 35);
    const lineHeight = 60;
    const startY = 120;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + (i * lineHeight));
    });

    // Draw divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    const dividerY = startY + (lines.length * lineHeight) + 30;
    ctx.beginPath();
    ctx.moveTo(150, dividerY);
    ctx.lineTo(width - 150, dividerY);
    ctx.stroke();

    // Draw snippet of expanded text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '18px Poppins, Arial';
    const snippet = fact.expand.substring(0, 100) + '...';
    const snippetLines = wrapText(snippet, 60);
    const snippetY = dividerY + 50;
    
    snippetLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, width / 2, snippetY + (i * 28));
    });

    // Draw watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px Poppins, Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`@${username}`, width - 30, height - 25);

    // Draw theme badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(30, height - 60, 180, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Poppins, Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`📚 ${themeId.replace('_', ' ')}`, 50, height - 30);

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating share card:', error);
    throw error;
  }
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  });

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

export async function generateCustomCard(fact, options = {}) {
  const {
    themeId = 'random_mix',
    bgColor = THEMES_COLORS[themeId].bg,
    accentColor = THEMES_COLORS[themeId].accent,
    textColor = '#ffffff',
    username = 'Knowledge Drop'
  } = options;

  // Similar to generateShareCard but with custom colors
  // Reuse the main logic with parameter variations
  try {
    const width = options.width || 1200;
    const height = options.height || 630;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Apply custom colors
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, accentColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Rest of card generation with custom colors...
    // (Include similar logic as above)

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating custom card:', error);
    throw error;
  }
}