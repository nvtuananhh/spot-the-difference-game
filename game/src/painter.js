// painter.js — every picture in the game is drawn here, in code.
// Each scene painter receives the set of difference ids that are "changed"
// for this panel. The left panel is always painted with an empty set (the
// original); the right panel is painted with every difference applied.
// A difference is therefore a real branch in the drawing code, never a
// pasted overlay, so the two pictures genuinely differ where the game says.

export const PANEL_W = 600;
export const PANEL_H = 440;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function cloud(ctx, x, y, scale) {
  ctx.fillStyle = '#ffffff';
  circle(ctx, x, y, 22 * scale, '#ffffff');
  circle(ctx, x + 26 * scale, y - 8 * scale, 26 * scale, '#ffffff');
  circle(ctx, x + 54 * scale, y, 20 * scale, '#ffffff');
  ctx.fillRect(x - 20 * scale, y, 96 * scale, 18 * scale);
}

function flower(ctx, x, y, petal, centre) {
  for (let i = 0; i < 6; i += 1) {
    const a = (i * Math.PI) / 3;
    circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(ctx, x, y, 5, centre);
  line(ctx, x, y + 6, x, y + 26, '#2e7d32', 3);
  ellipse(ctx, x - 6, y + 18, 7, 3.5, '#2e7d32');
}

// ---------------------------------------------------------------- garden
function paintGarden(ctx, diffs) {
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#8fd3f4');
  sky.addColorStop(1, '#e8f8ff');
  rect(ctx, 0, 0, PANEL_W, 270, '#000');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 270);
  // Sun: the "sun-rays" difference removes the rays entirely.
  circle(ctx, 500, 70, 34, '#ffd54a');
  circle(ctx, 500, 70, 26, '#ffec8b');
  if (!diffs.has('sun-rays')) {
    ctx.strokeStyle = '#ffca28';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      line(ctx, 500 + Math.cos(a) * 42, 70 + Math.sin(a) * 42,
        500 + Math.cos(a) * 58, 70 + Math.sin(a) * 58, '#ffca28', 5);
    }
  }
  cloud(ctx, 96, 58, 1);
  cloud(ctx, 300, 42, 0.8);
  // Hills and lawn.
  ellipse(ctx, 120, 300, 240, 90, '#7ec850');
  ellipse(ctx, 500, 310, 260, 100, '#66bb4a');
  rect(ctx, 0, 330, PANEL_W, 110, '#5da83f');
  // Cottage.
  rect(ctx, 150, 218, 220, 142, '#fff3d6');
  rect(ctx, 150, 218, 220, 10, '#e8c9a0');
  poly(ctx, [[132, 222], [260, 138], [388, 222]], '#c96f4a');
  poly(ctx, [[150, 222], [260, 152], [370, 222]], '#d97f57');
  rect(ctx, 318, 168, 26, 56, '#a85b3c');
  rect(ctx, 314, 162, 34, 10, '#8d4a30');
  // Chimney smoke: the "smoke" difference removes every puff.
  if (!diffs.has('smoke')) {
    circle(ctx, 331, 146, 12, 'rgba(255,255,255,0.9)');
    circle(ctx, 340, 128, 16, 'rgba(255,255,255,0.85)');
    circle(ctx, 352, 106, 20, 'rgba(255,255,255,0.8)');
  }
  // Door and path.
  roundRect(ctx, 236, 288, 48, 72, 6, '#8d5a2b');
  circle(ctx, 276, 326, 3.5, '#ffd54a');
  poly(ctx, [[248, 360], [272, 360], [292, 440], [228, 440]], '#e6d3ac');
  line(ctx, 260, 366, 260, 436, '#cbb98e', 3);
  // Windows. The right window's flower box is the difference.
  for (const wx of [178, 298]) {
    roundRect(ctx, wx, 248, 46, 46, 4, '#7fb3d5');
    rect(ctx, wx + 3, 248, 40, 40, '#bfe3f2');
    line(ctx, wx + 23, 250, wx + 23, 292, '#fff3d6', 4);
    line(ctx, wx + 3, 270, wx + 43, 270, '#fff3d6', 4);
    rect(ctx, wx - 2, 246, 50, 5, '#8d5a2b');
  }
  if (!diffs.has('flower-box')) {
    roundRect(ctx, 294, 292, 54, 12, 3, '#a85b3c');
    flower(ctx, 304, 288, '#e84a6f', '#ffd54a');
    flower(ctx, 320, 288, '#e84a6f', '#ffd54a');
    flower(ctx, 336, 288, '#e84a6f', '#ffd54a');
  }
  // Tree.
  rect(ctx, 468, 238, 24, 96, '#7a4a26');
  circle(ctx, 480, 196, 52, '#3e8e3a');
  circle(ctx, 442, 214, 38, '#4da344');
  circle(ctx, 518, 214, 38, '#4da344');
  circle(ctx, 480, 164, 34, '#57b04a');
  circle(ctx, 462, 180, 7, '#e84a6f');
  circle(ctx, 500, 200, 7, '#e84a6f');
  circle(ctx, 486, 152, 7, '#e84a6f');
  // Fence.
  for (let x = 20; x < PANEL_W; x += 34) {
    poly(ctx, [[x, 356], [x + 8, 344], [x + 16, 356], [x + 16, 392], [x, 392]], '#f5e6c8');
  }
  rect(ctx, 0, 366, PANEL_W, 6, '#e0c896');
  // Cat: orange in the original, slate-grey in the changed picture.
  const cat = diffs.has('cat-grey') ? '#7d8aa0' : '#f39c3d';
  const catDark = diffs.has('cat-grey') ? '#5d6b82' : '#d97f26';
  ellipse(ctx, 110, 340, 26, 20, cat);
  circle(ctx, 132, 318, 15, cat);
  poly(ctx, [[122, 308], [128, 294], [134, 306]], cat);
  poly(ctx, [[136, 306], [144, 294], [146, 308]], cat);
  line(ctx, 88, 338, 72, 316, cat, 7);
  circle(ctx, 136, 316, 2.5, '#222');
  line(ctx, 138, 321, 146, 321, catDark, 2);
  // Flowers along the lawn. One flower vanishes in the changed picture.
  const flowerXs = [52, 108, 176, 252, 336, 420, 500];
  const petalColours = ['#e84a6f', '#ff8a3d', '#ffd54a', '#b678e8', '#e84a6f', '#ff8a3d', '#ffd54a'];
  flowerXs.forEach((fx, i) => {
    if (diffs.has('missing-flower') && fx === 420) {
      line(ctx, fx, 392, fx, 414, '#2e7d32', 3);
      ellipse(ctx, fx - 6, 406, 7, 3.5, '#2e7d32');
      return;
    }
    flower(ctx, fx, 392, petalColours[i], '#fff3d6');
  });
  // Butterfly.
  ellipse(ctx, 348, 138, 9, 6, '#b678e8');
  ellipse(ctx, 362, 138, 9, 6, '#8a5fd0');
  line(ctx, 355, 132, 355, 144, '#333', 2);
}

// ---------------------------------------------------------------- harbour
function paintHarbour(ctx, diffs) {
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#5b3a8c');
  sky.addColorStop(0.55, '#e86a6a');
  sky.addColorStop(1, '#ffb35c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 250);
  circle(ctx, 110, 128, 30, '#ffe9a8');
  circle(ctx, 110, 128, 22, '#fff6cf');
  // Gulls: three in the original, two in the changed picture.
  const gulls = diffs.has('gull-gone') ? [[240, 66], [392, 84]] : [[240, 66], [300, 92], [392, 84]];
  for (const [gx, gy] of gulls) {
    line(ctx, gx - 12, gy, gx, gy - 5, '#2b2340', 3);
    line(ctx, gx, gy - 5, gx + 12, gy, '#2b2340', 3);
  }
  // Distant headland.
  poly(ctx, [[0, 250], [0, 210], [90, 226], [170, 250]], '#4a3566');
  // Sea.
  const sea = ctx.createLinearGradient(0, 250, 0, PANEL_H);
  sea.addColorStop(0, '#e8865c');
  sea.addColorStop(0.25, '#3a6ea8');
  sea.addColorStop(1, '#1d4e7e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 250, PANEL_W, 190);
  for (let y = 268; y < 436; y += 30) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 20) {
      const yy = y + Math.sin((x + y * 3) / 34) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Lighthouse on the rocks, right.
  poly(ctx, [[452, 300], [468, 300], [516, 300], [532, 300], [540, 250], [444, 250]], '#5d4a6e');
  rect(ctx, 462, 132, 60, 118, '#f5ead2');
  rect(ctx, 462, 168, 60, 22, '#d94f4f');
  rect(ctx, 462, 214, 60, 22, '#d94f4f');
  rect(ctx, 470, 100, 44, 34, '#2b2340');
  rect(ctx, 474, 106, 36, 20, '#ffe9a8');
  poly(ctx, [[466, 100], [492, 76], [518, 100]], '#d94f4f');
  // The beam is the difference: on in the original, off in the changed one.
  if (!diffs.has('beam-off')) {
    ctx.fillStyle = 'rgba(255,233,168,0.45)';
    poly(ctx, [[474, 116], [300, 84], [300, 148], [474, 116]], 'rgba(255,233,168,0.45)');
    circle(ctx, 492, 116, 10, '#fff6cf');
  }
  // Sailboat.
  poly(ctx, [[150, 330], [230, 330], [214, 352], [166, 352]], '#8d5a2b');
  line(ctx, 190, 330, 190, 238, '#5d3a1a', 4);
  poly(ctx, [[192, 244], [192, 318], [240, 318]], '#fdf6e3');
  poly(ctx, [[188, 258], [188, 318], [152, 318]], '#f2d8a0');
  // The flag is red in the original, green in the changed picture.
  poly(ctx, [[190, 238], [216, 246], [190, 254]], diffs.has('flag-green') ? '#2e9e5b' : '#d94f4f');
  // Rowboat with an oar that vanishes in the changed picture.
  ellipse(ctx, 356, 348, 52, 16, '#7a4a26');
  ellipse(ctx, 356, 344, 52, 12, '#a06a38');
  rect(ctx, 330, 336, 52, 6, '#7a4a26');
  if (!diffs.has('oar-gone')) {
    line(ctx, 386, 330, 420, 362, '#5d3a1a', 5);
    ellipse(ctx, 422, 366, 10, 6, '#8d5a2b');
  }
  // Buoy: striped in the original, plain in the changed picture.
  circle(ctx, 452, 386, 18, '#d94f4f');
  if (!diffs.has('buoy-plain')) {
    rect(ctx, 436, 380, 32, 8, '#fdf6e3');
    circle(ctx, 452, 370, 6, '#ffd54a');
  } else {
    circle(ctx, 452, 370, 6, '#ffd54a');
  }
  line(ctx, 452, 404, 452, 418, '#2b2340', 3);
  // Pier, left.
  rect(ctx, 0, 356, 190, 18, '#8d5a2b');
  rect(ctx, 0, 374, 190, 8, '#6e4520');
  for (const px of [24, 84, 144]) rect(ctx, px, 382, 10, 58, '#5d3a1a');
  rect(ctx, 0, 350, 190, 6, '#a06a38');
  // Lantern on a post.
  rect(ctx, 30, 312, 8, 44, '#2b2340');
  roundRect(ctx, 22, 292, 24, 22, 4, '#2b2340');
  circle(ctx, 34, 303, 7, '#ffe9a8');
  // Crate: present in the original, gone in the changed picture.
  if (!diffs.has('crate-gone')) {
    rect(ctx, 66, 312, 44, 40, '#c99a4e');
    rect(ctx, 66, 312, 44, 6, '#a87c34');
    line(ctx, 66, 312, 110, 352, '#a87c34', 3);
    line(ctx, 110, 312, 66, 352, '#a87c34', 3);
  }
  // Rope coil: present in the original, gone in the changed picture.
  if (!diffs.has('rope-gone')) {
    circle(ctx, 158, 344, 14, '#e8d9a8');
    circle(ctx, 158, 344, 9, '#c9b578');
    circle(ctx, 158, 344, 4, '#e8d9a8');
  }
}

// ---------------------------------------------------------------- library
function paintLibrary(ctx, diffs) {
  rect(ctx, 0, 0, PANEL_W, PANEL_H, '#4a3226');
  rect(ctx, 0, 0, PANEL_W, 300, '#5d4030');
  // Window with night sky. Moon: crescent original, full in changed picture.
  roundRect(ctx, 236, 30, 128, 128, 8, '#2b3a5e');
  rect(ctx, 242, 36, 116, 116, '#1d2c4e');
  line(ctx, 300, 36, 300, 152, '#8d6a44', 5);
  line(ctx, 242, 94, 358, 94, '#8d6a44', 5);
  const starSpots = [[258, 52], [280, 66], [326, 50], [350, 62], [338, 128]];
  starSpots.forEach(([sx, sy], i) => {
    if (diffs.has('star-gone') && i === 3) return;
    star(ctx, sx, sy, 6, '#fff6cf');
  });
  if (diffs.has('moon-full')) {
    circle(ctx, 300, 76, 18, '#fdf6d8');
  } else {
    circle(ctx, 300, 76, 18, '#fdf6d8');
    circle(ctx, 310, 70, 16, '#1d2c4e');
  }
  ellipse(ctx, 300, 152, 90, 10, '#3a2c20');
  // Bookshelves.
  for (const sx of [24, 396]) {
    rect(ctx, sx, 36, 168, 264, '#6e4520');
    for (let row = 0; row < 3; row += 1) {
      const ry = 52 + row * 84;
      rect(ctx, sx + 8, ry, 152, 62, '#3a2c20');
    }
    rect(ctx, sx, 36, 168, 8, '#8d5a2b');
    rect(ctx, sx, 292, 168, 8, '#8d5a2b');
  }
  // Books, left shelf. One spine changes colour in the changed picture.
  const spineColours = ['#d94f4f', '#2e7d8a', '#e8a13d', '#5b8a3c', '#b678e8', '#3a6ea8'];
  for (let row = 0; row < 3; row += 1) {
    const ry = 52 + row * 84;
    for (let b = 0; b < 6; b += 1) {
      const bx = 36 + b * 25;
      let colour = spineColours[(b + row * 2) % spineColours.length];
      if (diffs.has('spine-teal') && row === 1 && b === 2) colour = '#2e9e8a';
      rect(ctx, bx, ry + 8, 20, 52, colour);
      rect(ctx, bx, ry + 8, 20, 6, 'rgba(255,255,255,0.25)');
    }
  }
  // Books, right shelf (unchanged in both pictures).
  for (let row = 0; row < 3; row += 1) {
    const ry = 52 + row * 84;
    for (let b = 0; b < 6; b += 1) {
      const bx = 408 + b * 25;
      rect(ctx, bx, ry + 8, 20, 52, spineColours[(b + row + 1) % spineColours.length]);
      rect(ctx, bx, ry + 8, 20, 6, 'rgba(255,255,255,0.25)');
    }
  }
  // Wall clock: hands at 3 o'clock originally, 6 o'clock in the changed picture.
  circle(ctx, 486, 318, 30, '#fdf6e3');
  circle(ctx, 486, 318, 26, '#fffdf5');
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    circle(ctx, 486 + Math.cos(a) * 22, 318 + Math.sin(a) * 22, 2, '#333');
  }
  if (diffs.has('clock-six')) {
    line(ctx, 486, 318, 486, 300, '#333', 3);
    line(ctx, 486, 318, 486, 338, '#d94f4f', 3);
  } else {
    line(ctx, 486, 318, 486, 300, '#333', 3);
    line(ctx, 486, 318, 506, 318, '#d94f4f', 3);
  }
  circle(ctx, 486, 318, 3, '#d94f4f');
  // Floor and rug. The rug's centre diamond vanishes in the changed picture.
  rect(ctx, 0, 300, PANEL_W, 140, '#7a5230');
  for (let x = 0; x < PANEL_W; x += 48) line(ctx, x, 300, x - 20, 440, 'rgba(0,0,0,0.12)', 2);
  poly(ctx, [[196, 336], [404, 336], [440, 428], [160, 428]], '#a8323e');
  poly(ctx, [[216, 348], [384, 348], [412, 416], [188, 416]], '#d9a03d');
  if (!diffs.has('rug-diamond-gone')) {
    poly(ctx, [[300, 356], [332, 382], [300, 408], [268, 382]], '#a8323e');
  }
  // Armchair.
  roundRect(ctx, 96, 292, 108, 96, 14, '#2e6e5e');
  roundRect(ctx, 84, 318, 28, 70, 10, '#27604f');
  roundRect(ctx, 180, 318, 28, 70, 10, '#27604f');
  roundRect(ctx, 108, 282, 84, 34, 10, '#358576');
  // Reading lamp. Shade striped originally, plain in the changed picture.
  rect(ctx, 150, 236, 6, 52, '#2b2340');
  poly(ctx, [[132, 236], [174, 236], [166, 208], [140, 208]], '#ffd54a');
  if (!diffs.has('shade-plain')) {
    line(ctx, 142, 210, 138, 234, '#e8a13d', 4);
    line(ctx, 156, 210, 156, 234, '#e8a13d', 4);
    line(ctx, 168, 210, 172, 234, '#e8a13d', 4);
  }
  ellipse(ctx, 153, 288, 20, 5, '#2b2340');
  // Side table, candle and teacup.
  rect(ctx, 420, 300, 92, 10, '#8d5a2b');
  rect(ctx, 428, 310, 8, 60, '#6e4520');
  rect(ctx, 496, 310, 8, 60, '#6e4520');
  rect(ctx, 448, 286, 8, 16, '#fdf6e3');
  // Candle flame: lit originally, out in the changed picture.
  if (!diffs.has('flame-out')) {
    ellipse(ctx, 452, 278, 5, 9, '#ffb35c');
    ellipse(ctx, 452, 280, 2.5, 5, '#fff6cf');
  }
  // Teacup with steam that vanishes in the changed picture.
  roundRect(ctx, 516, 276, 26, 20, 5, '#7fb3d5');
  line(ctx, 542, 282, 550, 288, '#7fb3d5', 3);
  if (!diffs.has('steam-gone')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(524, 270);
    ctx.quadraticCurveTo(520, 260, 526, 250);
    ctx.moveTo(534, 270);
    ctx.quadraticCurveTo(530, 260, 536, 250);
    ctx.stroke();
  }
  // Cat curled on the rug. Its tail is up originally, flat in the changed picture.
  ellipse(ctx, 316, 392, 34, 16, '#e8e0d0');
  circle(ctx, 344, 380, 14, '#e8e0d0');
  poly(ctx, [[336, 370], [340, 360], [346, 368]], '#e8e0d0');
  poly(ctx, [[348, 368], [354, 358], [356, 368]], '#e8e0d0');
  line(ctx, 350, 378, 354, 378, '#8a7a64', 2);
  if (diffs.has('tail-flat')) {
    line(ctx, 284, 394, 258, 400, '#e8e0d0', 7);
  } else {
    line(ctx, 284, 392, 272, 372, '#e8e0d0', 7);
    circle(ctx, 270, 368, 5, '#e8e0d0');
  }
  // Stack of books on the floor.
  rect(ctx, 226, 404, 52, 12, '#3a6ea8');
  rect(ctx, 232, 392, 46, 12, '#d94f4f');
  rect(ctx, 228, 380, 50, 12, '#5b8a3c');
}

export const PAINTERS = {
  garden: paintGarden,
  harbour: paintHarbour,
  library: paintLibrary,
};

export function paintScene(ctx, sceneId, diffs) {
  ctx.save();
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  PAINTERS[sceneId](ctx, diffs);
  ctx.restore();
}
