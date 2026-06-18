import React, { useEffect, useRef } from 'react';

const W = 400, H = 520, CX = 200;

// Palette
const SK = '#f0a478', SKD = '#c07848', SKH = '#ffc898', HAI = '#221508', HAIL = '#3e2a18';
const SU = '#1c2d48', SU2 = '#263c5e', SU_DARK = '#08101e';
const SHT = '#edf1ff', SHTD = '#ccd0e0';
const LIP = '#c06860', EYB = '#221508';
// ============================================================================
// AVATAR RIGGING & BONE HIERARCHY
// 
// Root (Torso)
//  ├── Head
//  ├── Neck
//  ├── Left Shoulder -> Left Upper Arm -> Left Elbow -> Left Forearm -> Left Wrist -> Left Hand -> Five Fingers
//  └── Right Shoulder -> Right Upper Arm -> Right Elbow -> Right Forearm -> Right Wrist -> Right Hand -> Five Fingers
// ============================================================================

const TIE = '#a31d24', TIED = '#6b0d12', TIEL = '#d43f47';

// Corrected shoulder anchors (moved outward to avoid originating from neck)
const SL = [110, 185], SR = [290, 185];

// ── Pose library ──────────────────────────────────────────────────────────────
// eL/wL = left elbow/wrist, eR/wR = right elbow/wrist
// hL/hR = hand shape, tilt = head tilt (rad), nod = head Y offset (px)
const P = {
  default:     {eL:[110,268],wL:[102,360],hL:'rest',   eR:[290,268],wR:[298,360],hR:'rest',   tilt:0,    nod:0 },
  hello:       {eL:[110,268],wL:[102,360],hL:'rest',   eR:[298,176],wR:[335,118],hR:'flat',   tilt:-0.04,nod:0 },
  hi:          {eL:[110,268],wL:[102,360],hL:'rest',   eR:[298,176],wR:[335,118],hR:'flat',   tilt:-0.04,nod:0 },
  thank_you:   {eL:[110,268],wL:[102,360],hL:'rest',   eR:[256,210],wR:[224,168],hR:'flat',   tilt:0.04, nod:2 },
  yes:         {eL:[110,268],wL:[102,360],hL:'rest',   eR:[264,243],wR:[238,193],hR:'fist',   tilt:0,    nod:5 },
  no:          {eL:[110,268],wL:[102,360],hL:'rest',   eR:[266,229],wR:[245,178],hR:'point',  tilt:0,    nod:0 },
  please:      {eL:[110,268],wL:[102,360],hL:'rest',   eR:[250,229],wR:[214,197],hR:'flat',   tilt:0.03, nod:0 },
  sorry:       {eL:[110,268],wL:[102,360],hL:'rest',   eR:[248,229],wR:[211,199],hR:'fist',   tilt:0.05, nod:3 },
  help:        {eL:[148,244],wL:[165,234],hL:'flat',   eR:[250,253],wR:[229,225],hR:'fist',   tilt:0,    nod:-2},
  emergency:   {eL:[124,198],wL:[139,130],hL:'open',   eR:[277,198],wR:[262,130],hR:'open',   tilt:0,    nod:0 },
  water:       {eL:[110,268],wL:[102,360],hL:'rest',   eR:[260,219],wR:[234,164],hR:'w',      tilt:0.03, nod:2 },
  food:        {eL:[110,268],wL:[102,360],hL:'rest',   eR:[258,216],wR:[226,160],hR:'pinch',  tilt:0.03, nod:2 },
  friend:      {eL:[147,241],wL:[181,215],hL:'point',  eR:[257,241],wR:[227,215],hR:'point',  tilt:0,    nod:0 },
  love:        {eL:[157,241],wL:[197,203],hL:'flat',   eR:[251,241],wR:[211,203],hR:'flat',   tilt:0.04, nod:2 },
  good_morning:{eL:[110,268],wL:[102,360],hL:'rest',   eR:[284,229],wR:[278,148],hR:'open',   tilt:-0.03,nod:-2},
  good_night:  {eL:[110,268],wL:[102,360],hL:'rest',   eR:[268,233],wR:[254,165],hR:'flat',   tilt:0.05, nod:4 },
  hospital:    {eL:[147,229],wL:[167,219],hL:'open',   eR:[257,229],wR:[241,219],hR:'open',   tilt:0,    nod:0 },
  doctor:      {eL:[147,239],wL:[161,237],hL:'flat',   eR:[254,241],wR:[228,217],hR:'d_shape',tilt:0.02, nod:0 },
  stop:        {eL:[110,268],wL:[102,360],hL:'rest',   eR:[285,189],wR:[291,130],hR:'flat',   tilt:0,    nod:-2},
  fine:        {eL:[110,268],wL:[102,360],hL:'rest',   eR:[253,226],wR:[220,193],hR:'open',   tilt:0,    nod:0 },
  ok:          {eL:[110,268],wL:[102,360],hL:'rest',   eR:[270,239],wR:[251,191],hR:'asl_ok', tilt:0,    nod:0 },
  need_doctor: {eL:[147,239],wL:[161,237],hL:'flat',   eR:[254,241],wR:[228,217],hR:'d_shape',tilt:0.02, nod:0 },
  how_are_you: {eL:[148,244],wL:[165,234],hL:'open',   eR:[250,244],wR:[235,220],hR:'open',   tilt:0,    nod:0 },
};

// ── Motion overlays (sinusoidal oscillation on wrist during gesture hold) ─────
const MOT = {
  hello:       {dur:1100,axis:'x',amp:13,tgt:'R',cycles:2  },
  yes:         {dur:900, axis:'y',amp:18,tgt:'R',cycles:2  },
  no:          {dur:900, axis:'x',amp:17,tgt:'R',cycles:2.5},
  please:      {dur:800, axis:'x',amp:10,tgt:'R',cycles:2  },
  sorry:       {dur:800, axis:'x',amp:12,tgt:'R',cycles:2  },
  emergency:   {dur:900, axis:'x',amp:11,tgt:'B',cycles:2  },
  good_morning:{dur:900, axis:'y',amp:14,tgt:'R',cycles:1.5},
  thank_you:   {dur:800, axis:'y',amp:12,tgt:'R',cycles:1  },
  water:       {dur:700, axis:'y',amp:8, tgt:'R',cycles:2  },
  food:        {dur:700, axis:'y',amp:8, tgt:'R',cycles:2  },
  hi:          {dur:1100,axis:'x',amp:13,tgt:'R',cycles:2  },
};

// ── Finger joints bends mapping ───────────────────────────────────────────────
// [spreadOffset, a1 (MCP), a2 (PIP), a3 (DIP)] in radians
const FINGER_POSES = {
  flat: {
    thumb:  [-0.3, 0.2, 0.1, 0.1],
    index:  [0, 0, 0, 0],
    middle: [0, 0, 0, 0],
    ring:   [0, 0, 0, 0],
    pinky:  [0, 0, 0, 0]
  },
  open: {
    thumb:  [-0.6, 0.1, 0.1, 0.1],
    index:  [-0.15, 0, 0, 0],
    middle: [0, 0, 0, 0],
    ring:   [0.15, 0, 0, 0],
    pinky:  [0.3, 0, 0, 0]
  },
  fist: {
    thumb:  [0.1, 1.2, 1.0, 0.8],
    index:  [0, 1.4, 1.4, 1.0],
    middle: [0, 1.4, 1.4, 1.0],
    ring:   [0, 1.4, 1.4, 1.0],
    pinky:  [0, 1.4, 1.4, 1.0]
  },
  rest: {
    thumb:  [-0.3, 0.4, 0.3, 0.2],
    index:  [-0.04, 0.5, 0.4, 0.3],
    middle: [0, 0.5, 0.4, 0.3],
    ring:   [0.04, 0.5, 0.4, 0.3],
    pinky:  [0.08, 0.5, 0.4, 0.3]
  },
  point: {
    thumb:  [0.1, 1.2, 1.0, 0.8],
    index:  [0, 0, 0, 0],
    middle: [0, 1.4, 1.4, 1.0],
    ring:   [0, 1.4, 1.4, 1.0],
    pinky:  [0, 1.4, 1.4, 1.0]
  },
  w: {
    thumb:  [0.1, 1.2, 1.0, 0.8],
    index:  [-0.15, 0, 0, 0],
    middle: [0, 0, 0, 0],
    ring:   [0.15, 0, 0, 0],
    pinky:  [0, 1.4, 1.4, 1.0]
  },
  pinch: {
    thumb:  [-0.2, 0.6, 0.5, 0.3],
    index:  [0, 0.8, 0.8, 0.6],
    middle: [0.08, 0.3, 0.3, 0.2],
    ring:   [0.12, 0.4, 0.3, 0.2],
    pinky:  [0.16, 0.5, 0.4, 0.3]
  },
  asl_ok: {
    thumb:  [-0.1, 0.7, 0.6, 0.4],
    index:  [0, 1.0, 1.0, 0.8],
    middle: [0, 0, 0, 0],
    ring:   [0.1, 0, 0, 0],
    pinky:  [0.2, 0, 0, 0]
  },
  d_shape: {
    thumb:  [-0.2, 0.5, 0.4, 0.3],
    index:  [0, 0, 0, 0],
    middle: [0, 1.0, 0.9, 0.7],
    ring:   [0.08, 1.0, 0.9, 0.7],
    pinky:  [0.16, 1.0, 0.9, 0.7]
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const lv   = (a, b, t) => a + (b - a) * t;
const la   = (a, b, t) => [lv(a[0], b[0], t), lv(a[1], b[1], t)];

// Inverse Kinematics solver to compute natural elbow positions
function solveIK(S, W, L1, L2, side) {
  const dx = W[0] - S[0];
  const dy = W[1] - S[1];
  let D = Math.sqrt(dx * dx + dy * dy);
  const minD = Math.abs(L1 - L2) + 0.1;
  const maxD = L1 + L2 - 0.1;
  if (D < minD) D = minD;
  if (D > maxD) D = maxD;
  
  const ux = dx / D;
  const uy = dy / D;
  
  const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  
  const vx = side === 'L' ? -uy : uy;
  const vy = side === 'L' ? ux : -ux;
  
  const ex = S[0] + ux * a + vx * h;
  const ey = S[1] + uy * a + vy * h;
  
  return [ex, ey];
}

// Adjust wrist target to prevent stretching limbs beyond physiological limits
function adjustWrist(S, W, L1, L2) {
  const dx = W[0] - S[0];
  const dy = W[1] - S[1];
  const D = Math.sqrt(dx * dx + dy * dy);
  const maxD = L1 + L2 - 1.0;
  if (D > maxD) {
    const scale = maxD / D;
    return [S[0] + dx * scale, S[1] + dy * scale];
  }
  return W;
}

// Draw realistic vector fingernails on fingertips
function drawFingernail(ctx, tx, ty, angle, width) {
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(angle);
  
  // Base nail plate gradient
  const nailGrad = ctx.createLinearGradient(0, -width * 0.6, 0, width * 0.6);
  nailGrad.addColorStop(0, '#fccbca');
  nailGrad.addColorStop(0.5, '#e5a3a1');
  nailGrad.addColorStop(1, '#cb8988');
  ctx.fillStyle = nailGrad;
  ctx.strokeStyle = 'rgba(120, 60, 50, 0.3)';
  ctx.lineWidth = 0.5;
  
  ctx.beginPath();
  ctx.ellipse(-1.5, 0, 2.5, width * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Highlight edge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(0.5, 0, width * 0.35, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  
  ctx.restore();
}

function lerpPose(a, b, t) {
  const f = ease(Math.max(0, Math.min(1, t)));
  return {
    eL: la(a.eL, b.eL, f), wL: la(a.wL, b.wL, f),
    eR: la(a.eR, b.eR, f), wR: la(a.wR, b.wR, f),
    hL: f > 0.5 ? b.hL : a.hL, hR: f > 0.5 ? b.hR : a.hR,
    tilt: lv(a.tilt, b.tilt, f), nod: lv(a.nod, b.nod, f),
  };
}

function getInterpolatedFingerBends(shapeA, shapeB, t) {
  const f = ease(Math.max(0, Math.min(1, t)));
  const poseA = FINGER_POSES[shapeA] || FINGER_POSES.rest;
  const poseB = FINGER_POSES[shapeB] || FINGER_POSES.rest;
  
  const result = {};
  for (const finger of ['thumb', 'index', 'middle', 'ring', 'pinky']) {
    const arrA = poseA[finger];
    const arrB = poseB[finger];
    result[finger] = [
      lv(arrA[0], arrB[0], f),
      lv(arrA[1], arrB[1], f),
      lv(arrA[2], arrB[2], f),
      lv(arrA[3], arrB[3], f)
    ];
  }
  return result;
}

// Rounded-rect helper
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const R = typeof r === 'number' ? r : r[0] || 0;
    ctx.moveTo(x + R, y);
    ctx.lineTo(x + w - R, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + R);
    ctx.lineTo(x + w, y + h - R);
    ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
    ctx.lineTo(x + R, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - R);
    ctx.lineTo(x, y + R);
    ctx.quadraticCurveTo(x, y, x + R, y);
    ctx.closePath();
  }
}

// Draw tapered sleeve segment
function drawSleeve(ctx, x1, y1, x2, y2, w1, w2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.1) return;
  const angle = Math.atan2(dy, dx);
  
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(angle);
  
  ctx.strokeStyle = SU_DARK;
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.moveTo(0, -w1 / 2);
  ctx.lineTo(len, -w2 / 2);
  ctx.lineTo(len, w2 / 2);
  ctx.lineTo(0, w1 / 2);
  ctx.closePath();
  
  const grad = ctx.createLinearGradient(0, -w1 / 2, 0, w1 / 2);
  grad.addColorStop(0, SU2);
  grad.addColorStop(0.5, SU);
  grad.addColorStop(1, SU_DARK);
  ctx.fillStyle = grad;
  ctx.fill();
  
  ctx.stroke();
  ctx.restore();
}

// Draw a tapered finger capsule
function drawCapsule(ctx, xa, ya, xb, yb, r1, r2) {
  const dx = xb - xa;
  const dy = yb - ya;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return;
  
  const angle = Math.atan2(dy, dx);
  
  ctx.save();
  ctx.translate(xa, ya);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.arc(0, 0, r1, Math.PI / 2, -Math.PI / 2);
  ctx.lineTo(len, -r2);
  ctx.arc(len, 0, r2, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  
  const grad = ctx.createLinearGradient(0, -r1, 0, r1);
  grad.addColorStop(0, SKH);
  grad.addColorStop(0.4, SK);
  grad.addColorStop(1, SKD);
  ctx.fillStyle = grad;
  ctx.fill();
  
  ctx.strokeStyle = SKD;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  
  // Highlight line
  ctx.beginPath();
  ctx.moveTo(3, -r1 * 0.4);
  ctx.lineTo(len - 3, -r2 * 0.4);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.35;
  ctx.stroke();
  
  ctx.restore();
}

// Draw individual finger using forward kinematics
const drawFinger = (ctx, startX, startY, spread, lengthL1, lengthL2, lengthL3, bends, isThumb) => {
  const [spreadOffset, a1, a2, a3] = bends;
  const baseAngle = -Math.PI / 2 + spread + spreadOffset;
  
  const x0 = startX;
  const y0 = startY;
  
  const x1 = x0 + Math.cos(baseAngle + a1) * lengthL1;
  const y1 = y0 + Math.sin(baseAngle + a1) * lengthL1;
  
  const x2 = x1 + Math.cos(baseAngle + a1 + a2) * lengthL2;
  const y2 = y1 + Math.sin(baseAngle + a1 + a2) * lengthL2;
  
  let x3 = x2, y3 = y2;
  if (lengthL3 > 0) {
    x3 = x2 + Math.cos(baseAngle + a1 + a2 + a3) * lengthL3;
    y3 = y2 + Math.sin(baseAngle + a1 + a2 + a3) * lengthL3;
  }
  
  const w0 = isThumb ? 5.2 : 4.2;
  const w1 = isThumb ? 4.4 : 3.5;
  const w2 = isThumb ? 3.6 : 2.9;
  const w3 = isThumb ? 0.0 : 2.3;
  
  // Knuckles base dots for anatomy
  ctx.fillStyle = SKD;
  ctx.beginPath(); ctx.arc(x0, y0, w0 * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x1, y1, w1 * 0.6, 0, Math.PI * 2); ctx.fill();
  if (lengthL3 > 0) {
    ctx.beginPath(); ctx.arc(x2, y2, w2 * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  
  // Tapered segments
  drawCapsule(ctx, x0, y0, x1, y1, w0, w1);
  drawCapsule(ctx, x1, y1, x2, y2, w1, w2);
  if (lengthL3 > 0) {
    drawCapsule(ctx, x2, y2, x3, y3, w2, w3);
    drawFingernail(ctx, x3, y3, baseAngle + a1 + a2 + a3, w3);
  } else {
    drawFingernail(ctx, x2, y2, baseAngle + a1 + a2, w2);
  }
};

// ── Draw hand shape ───────────────────────────────────────────────────────────
function drawHand(ctx, wx, wy, angle, shape, side, bends) {
  const flip = side === 'L' ? -1 : 1;
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(angle + Math.PI / 2);
  
  // Reduce oversized hands to make them proportional and natural
  ctx.scale(flip * 0.58, 0.58);
  
  // Palm background
  const pg = ctx.createLinearGradient(-10, -20, 10, 0);
  pg.addColorStop(0, SKH);
  pg.addColorStop(0.5, SK);
  pg.addColorStop(1, SKD);
  ctx.fillStyle = pg;
  ctx.strokeStyle = SKD;
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.moveTo(-9.5, 0);
  ctx.quadraticCurveTo(-13.5, -8, -12.5, -12);
  ctx.quadraticCurveTo(-12.5, -22, -9.5, -26);
  ctx.lineTo(9.5, -24);
  ctx.quadraticCurveTo(10.5, -12, 8.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Anatomy palm lines
  ctx.strokeStyle = 'rgba(170, 90, 70, 0.45)';
  ctx.lineWidth = 1.2;
  
  // Life Line
  ctx.beginPath();
  ctx.moveTo(-8, -24);
  ctx.quadraticCurveTo(-7, -12, -3, -4);
  ctx.stroke();
  
  // Heart Line
  ctx.beginPath();
  ctx.moveTo(8, -18);
  ctx.quadraticCurveTo(2, -16, -5, -20);
  ctx.stroke();
  
  // Head Line
  ctx.beginPath();
  ctx.moveTo(-8, -22);
  ctx.quadraticCurveTo(0, -18, 7, -13);
  ctx.stroke();
  
  // Render order: Pinky -> Ring -> Middle -> Index -> Thumb
  // Placed with precise spacing to prevent overlapping or duplication
  drawFinger(ctx, 9.0, -24, 0.16, 12, 9, 7, bends.pinky, false);
  drawFinger(ctx, 4.0, -27, 0.05, 15, 11, 8, bends.ring, false);
  drawFinger(ctx, -1.5, -28, -0.01, 16, 12, 9, bends.middle, false);
  drawFinger(ctx, -7.0, -26, -0.08, 14, 11, 8, bends.index, false);
  drawFinger(ctx, -11.5, -8, -0.65, 14, 11, 0, bends.thumb, true);
  
  ctx.restore();
}

// ── Draw arm (sleeve + hand) ──────────────────────────────────────────────────
function drawArm(ctx, [sx, sy], [ex, ey], [wx, wy], hShape, side, bends) {
  // Suit sleeves
  drawSleeve(ctx, sx, sy, ex, ey, 24, 20);
  drawSleeve(ctx, ex, ey, wx, wy, 20, 16);
  
  // Elbow connector joints
  ctx.save();
  ctx.beginPath();
  ctx.arc(ex, ey, 10, 0, Math.PI * 2);
  ctx.fillStyle = SU;
  ctx.fill();
  ctx.strokeStyle = SU_DARK;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  
  // White shirt cuff
  const ang = Math.atan2(wy - ey, wx - ex);
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(ang);
  ctx.fillStyle = SHT;
  ctx.strokeStyle = SHTD;
  ctx.lineWidth = 1.0;
  
  // Scaled shirt cuff to fit the hand size
  rr(ctx, -5, -7.5, 10, 15, 2.0);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  
  drawHand(ctx, wx, wy, ang, hShape, side, bends);
}

// ── Draw neck ─────────────────────────────────────────────────────────────────
function drawNeck(ctx, headX, headY, neckBotX, neckBotY) {
  const nTopX = headX;
  const nTopY = headY + 38;
  const h = neckBotY - nTopY;
  if (h < 2) return;
  const ng = ctx.createLinearGradient(CX - 15, 0, CX + 15, 0);
  ng.addColorStop(0, SKD);
  ng.addColorStop(0.3, SK);
  ng.addColorStop(0.7, SKH);
  ng.addColorStop(1, SKD);
  ctx.fillStyle = ng;
  ctx.strokeStyle = SKD;
  ctx.lineWidth = 1.5;
  
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(nTopX - 14, nTopY);
  ctx.lineTo(neckBotX - 14, neckBotY);
  ctx.lineTo(neckBotX + 14, neckBotY);
  ctx.lineTo(nTopX + 14, nTopY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  
  // Cast shadow below the chin for realism
  const neckShadowG = ctx.createLinearGradient(nTopX, nTopY, nTopX, nTopY + 14);
  neckShadowG.addColorStop(0, 'rgba(0,0,0,0.18)');
  neckShadowG.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = neckShadowG;
  ctx.fillRect(nTopX - 14, nTopY, 28, 14);
}

// ── Draw torso ────────────────────────────────────────────────────────────────
function drawTorso(ctx, bY, shoulderL, shoulderR) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  
  const slX = shoulderL[0];
  const slY = shoulderL[1];
  const srX = shoulderR[0];
  const srY = shoulderR[1];
  const avgY = (slY + srY) / 2;
  
  // Jacket body
  const suitG = ctx.createLinearGradient(100, avgY, 300, H + 10);
  suitG.addColorStop(0, SU2);
  suitG.addColorStop(1, SU);
  ctx.fillStyle = suitG;
  ctx.strokeStyle = SU_DARK;
  ctx.lineWidth = 2.0;
  
  // Upgraded sloped/curved premium shoulders
  ctx.beginPath();
  ctx.moveTo(slX - 70, H + 10);
  ctx.lineTo(slX - 20, slY + 14);
  ctx.quadraticCurveTo(slX - 10, slY - 2, slX, slY);
  ctx.lineTo(srX, srY);
  ctx.quadraticCurveTo(srX + 10, srY - 2, srX + 20, srY + 14);
  ctx.lineTo(srX + 70, H + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  
  // Shirt V-neck panel
  const shirtG = ctx.createLinearGradient(CX - 30, avgY + 5, CX + 30, H);
  shirtG.addColorStop(0, SHT);
  shirtG.addColorStop(1, SHTD);
  ctx.fillStyle = shirtG;
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(CX - 28, avgY + 5);
  ctx.lineTo(CX + 28, avgY + 5);
  ctx.lineTo(CX + 30, H + 10);
  ctx.lineTo(CX - 30, H + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Dark red silk tie
  const tieG = ctx.createLinearGradient(CX - 8, avgY + 5, CX + 8, H - 30);
  tieG.addColorStop(0, TIEL);
  tieG.addColorStop(0.5, TIE);
  tieG.addColorStop(1, TIED);
  ctx.fillStyle = tieG;
  ctx.beginPath();
  ctx.moveTo(CX - 6, avgY + 5);
  ctx.lineTo(CX + 6, avgY + 5);
  ctx.lineTo(CX + 10, H - 50);
  ctx.lineTo(CX, H - 20);
  ctx.lineTo(CX - 10, H - 50);
  ctx.closePath();
  ctx.fill();
  
  // Tie knot
  ctx.beginPath();
  ctx.moveTo(CX - 7, avgY + 5);
  ctx.lineTo(CX + 7, avgY + 5);
  ctx.lineTo(CX + 5, avgY + 19);
  ctx.lineTo(CX - 5, avgY + 19);
  ctx.closePath();
  ctx.fill();
  
  // Tie stripes
  ctx.strokeStyle = 'rgba(255, 200, 50, 0.25)';
  ctx.lineWidth = 2.0;
  for (let sy = avgY + 25; sy < H - 40; sy += 25) {
    ctx.beginPath();
    ctx.moveTo(CX - 8, sy);
    ctx.lineTo(CX + 8, sy - 8);
    ctx.stroke();
  }
  
  // Lapels
  const lapelG = ctx.createLinearGradient(120, avgY, 280, avgY + 60);
  lapelG.addColorStop(0, SU2);
  lapelG.addColorStop(1, SU_DARK);
  ctx.fillStyle = lapelG;
  ctx.strokeStyle = SU_DARK;
  ctx.lineWidth = 1.5;
  
  // Left Lapel
  ctx.beginPath();
  ctx.moveTo(slX, slY);
  ctx.lineTo(CX - 10, slY + 58);
  ctx.lineTo(CX - 32, slY + 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Right Lapel
  ctx.beginPath();
  ctx.moveTo(srX, srY);
  ctx.lineTo(CX + 10, srY + 58);
  ctx.lineTo(CX + 32, srY + 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Shirt collar left
  ctx.fillStyle = SHT;
  ctx.strokeStyle = SHTD;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(CX - 12, avgY - 37);
  ctx.lineTo(CX - 30, avgY + 5);
  ctx.lineTo(CX - 10, avgY - 2);
  ctx.lineTo(CX - 6, avgY - 37);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Shirt collar right
  ctx.beginPath();
  ctx.moveTo(CX + 12, avgY - 37);
  ctx.lineTo(CX + 30, avgY + 5);
  ctx.lineTo(CX + 10, avgY - 2);
  ctx.lineTo(CX + 6, avgY - 37);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Pocket square
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(slX + 20, slY + 42);
  ctx.lineTo(slX + 26, slY + 34);
  ctx.lineTo(slX + 32, slY + 42);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = SU_DARK;
  rr(ctx, slX + 18, slY + 41, 18, 4, 1);
  ctx.fill();
  
  // Buttons
  ctx.fillStyle = '#e5a93b';
  ctx.strokeStyle = '#b8801c';
  ctx.lineWidth = 0.8;
  [avgY + 53, avgY + 81, avgY + 109].forEach(by2 => {
    ctx.beginPath();
    ctx.arc(CX, by2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

// ── Draw head + face ──────────────────────────────────────────────────────────
function drawHead(ctx, [hx, hy], tilt, blinkAmt, talkAmt) {
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(tilt);
  
  // 1. Back hair layer (more volume & styling details)
  ctx.fillStyle = HAI;
  ctx.beginPath();
  ctx.ellipse(0, -10, 50, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 2. Ears
  [[-44, -0.1], [44, 0.1]].forEach(([ex, rot]) => {
    ctx.fillStyle = SK;
    ctx.strokeStyle = SKD;
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(ex, 4);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Internal fold
    ctx.strokeStyle = SKD;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, 4, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  });
  
  // 3. Face shape (elegant structured jaw)
  ctx.beginPath();
  ctx.moveTo(-44, -15);
  ctx.bezierCurveTo(-44, 25, -28, 48, 0, 48);
  ctx.bezierCurveTo(28, 48, 44, 25, 44, -15);
  ctx.bezierCurveTo(44, -48, -44, -48, -44, -15);
  ctx.closePath();
  
  const hg = ctx.createRadialGradient(-10, -15, 5, 0, 0, 52);
  hg.addColorStop(0, SKH);
  hg.addColorStop(0.6, SK);
  hg.addColorStop(1, SKD);
  ctx.fillStyle = hg;
  ctx.strokeStyle = SKD;
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  
  // Subtle cheek blush for high-quality realism
  [[-24, 8], [24, 8]].forEach(([cx, cy]) => {
    const blushG = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
    blushG.addColorStop(0, 'rgba(235, 120, 110, 0.22)');
    blushG.addColorStop(1, 'rgba(235, 120, 110, 0)');
    ctx.fillStyle = blushG;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 4. Eyebrows (tapered & stylized)
  ctx.strokeStyle = EYB;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-28, -20);
  ctx.quadraticCurveTo(-18, -26, -8, -19);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -19);
  ctx.quadraticCurveTo(18, -26, 28, -20);
  ctx.stroke();
  
  // 5. High-Quality almond eyes with double eyelids & eyelashes
  const eo = Math.max(0, 1 - blinkAmt);
  if (eo > 0.05) {
    [[-16, 1], [16, -1]].forEach(([ex, eyeSide]) => {
      ctx.save();
      ctx.translate(ex, -8);
      
      // Sclera (almond shaped path)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.quadraticCurveTo(0, -7 * eo, 12, 0);
      ctx.quadraticCurveTo(0, 7 * eo, -12, 0);
      ctx.closePath();
      ctx.fill();
      
      // Sclera shadow for depth
      const scleraShadow = ctx.createRadialGradient(0, 0, 8, 0, 0, 12);
      scleraShadow.addColorStop(0, 'rgba(255,255,255,0)');
      scleraShadow.addColorStop(1, 'rgba(0,0,0,0.06)');
      ctx.fillStyle = scleraShadow;
      ctx.fill();
      
      // Iris (deep layered blue gradient)
      const irisG = ctx.createRadialGradient(-1, -1, 1, 0, 0, 5.5);
      irisG.addColorStop(0, '#5ea3d8');
      irisG.addColorStop(0.5, '#2c6fa5');
      irisG.addColorStop(1, '#113354');
      ctx.fillStyle = irisG;
      ctx.beginPath();
      ctx.ellipse(0, 0, 5.8, 5.8 * eo, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Pupil
      ctx.fillStyle = '#0a0d12';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.8, 2.8 * eo, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight reflections
      if (eo > 0.3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(-2, -2.5, 1.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(2, 2, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Double eyelid line
      ctx.strokeStyle = 'rgba(120, 70, 50, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(0, -9 - eo * 1.5, 11, 2, 0, 0, Math.PI, true);
      ctx.stroke();
      
      // Upper eyelash/eyelid stroke
      ctx.strokeStyle = '#18120d';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.quadraticCurveTo(0, -7 * eo, 12, 0);
      ctx.stroke();
      
      // Eyelashes
      ctx.strokeStyle = '#18120d';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Outer lash
      ctx.moveTo(11 * eyeSide, -1);
      ctx.quadraticCurveTo(14 * eyeSide, -4, 16 * eyeSide, -2);
      // Mid lash
      ctx.moveTo(9 * eyeSide, -2);
      ctx.quadraticCurveTo(11 * eyeSide, -6, 13 * eyeSide, -5);
      ctx.stroke();
      
      ctx.restore();
    });
  } else {
    // Closed blink arcs
    [[-16], [16]].forEach(([ex]) => {
      ctx.strokeStyle = '#18120d';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(ex, -8, 11, 0, 0, 0, Math.PI);
      ctx.stroke();
    });
  }
  
  // 6. Nose bridge and tip with detailed shading
  ctx.strokeStyle = 'rgba(190, 110, 80, 0.25)';
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -2);
  ctx.quadraticCurveTo(-6, 8, -4, 11);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, -2);
  ctx.quadraticCurveTo(6, 8, 4, 11);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(-4, 11);
  ctx.quadraticCurveTo(0, 13, 4, 11);
  ctx.strokeStyle = SKD;
  ctx.stroke();
  
  // Nose tip soft lighting highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 9, 1.8, 0, Math.PI * 2);
  ctx.fill();
  
  // 7. Dynamic Talking Mouth with Cupid's bow and highlights
  ctx.save();
  ctx.translate(0, 24);
  if (talkAmt > 0.05) {
    const mouthH = talkAmt * 12;
    // Inner mouth cavity
    ctx.fillStyle = '#4a151b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, mouthH, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -mouthH + 3, 10, 2.5, 0, 0, Math.PI);
    ctx.fill();
    
    // Tongue
    ctx.fillStyle = '#e2808a';
    ctx.beginPath();
    ctx.ellipse(0, mouthH - 2, 8, 3, 0, Math.PI, 0);
    ctx.fill();
    
    // Upper and lower lips
    ctx.strokeStyle = LIP;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, mouthH, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Friendly closed mouth with Cupid's bow details
    ctx.strokeStyle = LIP;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    // Draw upper lip Cupid's bow line
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.quadraticCurveTo(-6, -3, 0, -1);
    ctx.quadraticCurveTo(6, -3, 13, 0);
    ctx.stroke();
    
    // Full lip shape filling
    ctx.fillStyle = LIP;
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.quadraticCurveTo(-6, -3, 0, -1);
    ctx.quadraticCurveTo(6, -3, 13, 0);
    ctx.quadraticCurveTo(0, 5, -13, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  
  // 8. Front hair fringes and styling
  ctx.fillStyle = HAI;
  ctx.beginPath();
  ctx.ellipse(0, -38, 48, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const hairGrad = ctx.createLinearGradient(-30, -50, 30, -20);
  hairGrad.addColorStop(0, HAI);
  hairGrad.addColorStop(0.5, HAIL);
  hairGrad.addColorStop(1, HAI);
  ctx.fillStyle = hairGrad;
  
  ctx.beginPath();
  // Bangs locks
  ctx.moveTo(-45, -28);
  ctx.bezierCurveTo(-30, -42, -10, -42, 5, -30);
  ctx.bezierCurveTo(-10, -34, -30, -32, -45, -28);
  
  ctx.moveTo(-15, -34);
  ctx.bezierCurveTo(5, -45, 25, -38, 42, -24);
  ctx.bezierCurveTo(20, -34, 0, -30, -15, -34);
  
  // Sideburns
  ctx.moveTo(-43, -20);
  ctx.bezierCurveTo(-46, -10, -46, 5, -44, 10);
  ctx.bezierCurveTo(-42, 5, -42, -10, -43, -20);
  
  ctx.moveTo(43, -20);
  ctx.bezierCurveTo(46, -10, 46, 5, 44, 10);
  ctx.bezierCurveTo(42, 5, 42, -10, 43, -20);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = HAIL;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-35, -45);
  ctx.quadraticCurveTo(0, -52, 35, -45);
  ctx.stroke();
  
  ctx.restore();
}

// ── Main component ────────────────────────────────────────────────────────────
const Avatar2D = ({ gesture = 'default', speedRate = 1.0 }) => {
  const canvasRef = useRef(null);
  const sRef = useRef({
    prev: { ...P.default }, targ: { ...P.default },
    transT: 1, motT: 0, motioning: false,
    idleT: 0, blinkT: 0, nextBlink: 3000, blinkAmt: 0,
    rafId: 0, lastMs: 0, curGesture: 'default',
  });

  useEffect(() => {
    const s = sRef.current;
    const cur = lerpPose(s.prev, s.targ, Math.min(1, s.transT));
    s.prev = cur;
    s.targ = P[gesture] || P.default;
    s.transT = 0; s.motT = 0; s.motioning = false; s.curGesture = gesture;
  }, [gesture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = sRef.current;
    let dead = false;

    const loop = (ms) => {
      if (dead) return;
      const dt = Math.min(50, ms - (s.lastMs || ms));
      s.lastMs = ms;

      // Transition progress
      if (s.transT < 1) {
        s.transT = Math.min(1, s.transT + dt / (420 / speedRate));
        if (s.transT >= 1 && !s.motioning) { s.motioning = true; s.motT = 0; }
      }

      // Motion overlays
      const mot = MOT[s.curGesture];
      if (s.motioning && mot) s.motT = Math.min(1, s.motT + dt / (mot.dur / speedRate));

      s.idleT += dt * 0.001;

      // Blink timing
      s.blinkT += dt;
      if (s.blinkT >= s.nextBlink) { s.blinkAmt = 1; s.blinkT = 0; s.nextBlink = 2800 + Math.random() * 2600; }
      if (s.blinkAmt > 0) s.blinkAmt = Math.max(0, s.blinkAmt - dt * 0.016);

      // Build joint poses
      const cp = lerpPose(s.prev, s.targ, Math.min(1, s.transT));

      // Apply motion sways
      if (s.motioning && mot && s.motT < 1) {
        const env = Math.sin(s.motT * Math.PI);
        const off = Math.sin(s.motT * mot.cycles * Math.PI * 2) * mot.amp * env;
        const ki = mot.axis === 'x' ? 0 : 1;
        if (mot.tgt === 'R' || mot.tgt === 'B') { cp.wR = [...cp.wR]; cp.wR[ki] += off; }
        if (mot.tgt === 'L' || mot.tgt === 'B') { cp.wL = [...cp.wL]; cp.wL[ki] += off; }
      }

      // Smooth finger bend morphs
      const bendsL = getInterpolatedFingerBends(s.prev.hL, s.targ.hL, Math.min(1, s.transT));
      const bendsR = getInterpolatedFingerBends(s.prev.hR, s.targ.hR, Math.min(1, s.transT));

      // Idle breathing and drifts
      const bY    = Math.sin(s.idleT * 1.42) * 2.0;
      const hSwX  = Math.sin(s.idleT * 0.68) * 1.6;
      const hSwY  = Math.cos(s.idleT * 0.91) * 1.1;
      const headX = CX + hSwX;
      const headY = 90  + hSwY + cp.nod * 0.35;
      const headTilt = cp.tilt + Math.sin(s.idleT * 0.76) * 0.009;

      // Subtle arm drift to prevent freeze-look
      if (s.curGesture === 'default') {
        const armDrift = Math.sin(s.idleT * 0.8) * 1.5;
        cp.wR[0] += armDrift;
        cp.wL[0] -= armDrift;
      }

      // Check speech talk activity
      let talkAmt = 0;
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        talkAmt = Math.abs(Math.sin(s.idleT * 12)) * 0.8;
      }

      // Resize canvas to client dimensions if they change (enables true responsiveness)
      const rect = canvas.getBoundingClientRect();
      const clientW = Math.round(rect.width) || W;
      const clientH = Math.round(rect.height) || H;
      if (canvas.width !== clientW || canvas.height !== clientH) {
        canvas.width = clientW;
        canvas.height = clientH;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial glowing background aura
      const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.42, 55, canvas.width / 2, canvas.height * 0.42, Math.max(canvas.width, canvas.height) * 0.6);
      bg.addColorStop(0, 'rgba(28,45,72,0.22)');
      bg.addColorStop(1, 'rgba(8,14,26,0.08)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Enforce true responsiveness and correct size (70-80% of viewport height)
      const targetHeight = canvas.height * 0.74; // approx 74% of viewport height
      const targetWidth = canvas.width * 0.85;
      const originalHeight = 480; // height of head-to-torso base
      const originalWidth = 320;  // width of shoulder span
      const globalScale = Math.min(targetHeight / originalHeight, targetWidth / originalWidth);
      
      const transX = canvas.width / 2 - CX * globalScale;
      const transY = canvas.height / 2 - 280 * globalScale;

      ctx.save();
      ctx.translate(transX, transY);
      ctx.scale(globalScale, globalScale);

      // Neck top originates from under head
      const neckTopX = headX;
      const neckTopY = headY + 38;
      const neckLength = 50;
      const neckAngle = headTilt; // neck sways with head tilt

      // Neck bottom / base
      const neckBotX = neckTopX - Math.sin(neckAngle) * neckLength;
      const neckBotY = neckTopY + Math.cos(neckAngle) * neckLength;

      // Shoulder offsets from neck bottom, dynamic and sways naturally
      const shoulderOffset = 85;
      const shoulderL = [
        neckBotX - shoulderOffset * Math.cos(neckAngle),
        neckBotY - shoulderOffset * Math.sin(neckAngle)
      ];
      const shoulderR = [
        neckBotX + shoulderOffset * Math.cos(neckAngle),
        neckBotY + shoulderOffset * Math.sin(neckAngle)
      ];

      const adjWL = adjustWrist(shoulderL, cp.wL, 95, 93);
      const adjWR = adjustWrist(shoulderR, cp.wR, 95, 93);
      const elbowL = solveIK(shoulderL, adjWL, 95, 93, 'L');
      const elbowR = solveIK(shoulderR, adjWR, 95, 93, 'R');

      // Draw Layers: Draw torso, neck and head first, and then overlay arms
      // to keep hands in front of body/neck and ensure natural attachments.
      drawTorso(ctx, bY, shoulderL, shoulderR);
      drawNeck(ctx, headX, headY, neckBotX, neckBotY);
      drawHead(ctx, [headX, headY], headTilt, s.blinkAmt, talkAmt);

      drawArm(ctx, shoulderL, elbowL, adjWL, cp.hL, 'L', bendsL);
      drawArm(ctx, shoulderR, elbowR, adjWR, cp.hR, 'R', bendsR);

      ctx.restore();

      s.rafId = requestAnimationFrame(loop);
    };

    s.rafId = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(s.rafId); };
  }, [speedRate]);

  return (
    <canvas
      ref={canvasRef}
      width={W} height={H}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

export default Avatar2D;
