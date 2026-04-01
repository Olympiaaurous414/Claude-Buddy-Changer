#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { applyBinary, detectBinarySalt, resolveBinaryPath, restoreBinary } = require('./binary.js');
const { getRecordedOriginalSalt, getStateFilePath, recordOriginalSalt } = require('./state.js');
const {
  DEFAULT_SALT,
  EYES,
  HATS,
  RARITIES,
  SPECIES,
  STAT_NAMES,
  detectUserId,
  parseMinStat,
  renderFace,
  renderBlinkSprite,
  renderSprite,
  renderSpriteFrames,
  rollWithSalt,
  searchSalts,
} = require('./buddy-core.js');

const PORT = Number(process.env.PORT || 43123);
const STATIC_FILE = path.join(__dirname, 'index.html');

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/meta' && req.method === 'GET') {
    let userId = '';
    let detectionError = null;
    try {
      userId = detectUserId();
    } catch (error) {
      detectionError = error.message;
    }
    const binary = detectBinarySalt();
    return sendJson(res, 200, {
      defaultSalt: DEFAULT_SALT,
      species: SPECIES,
      rarities: RARITIES,
      eyes: EYES,
      hats: HATS,
      statNames: STAT_NAMES,
      detectedUserId: userId,
      detectionError,
      binary: binary ? {
        path: binary.filePath,
        currentSalt: binary.salt,
        saltLength: binary.length,
        originalSaltRecorded: getRecordedOriginalSalt(binary.filePath),
        stateFile: getStateFilePath(),
      } : null,
    });
  }

  if (pathname === '/api/preview' && req.method === 'POST') {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    const userId = body.userId || detectUserId();
    const salt = body.salt || DEFAULT_SALT;
    const buddy = rollWithSalt(userId, salt);
    return sendJson(res, 200, {
      userId,
      salt,
      buddy,
      face: renderFace(buddy),
      sprite: renderSprite(buddy, 0),
      spriteFrames: renderSpriteFrames(buddy),
      blinkFrame: renderBlinkSprite(buddy, 0),
    });
  }

  if (pathname === '/api/search' && req.method === 'POST') {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    const userId = body.userId || detectUserId();
    const total = Number(body.total || 100000);
    const prefix = body.prefix || 'lab-';
    const length = Number(body.length || DEFAULT_SALT.length);
    const filters = {
      species: body.species || undefined,
      rarity: body.rarity || undefined,
      eye: body.eye || undefined,
      hat: body.hat || undefined,
      shiny: !!body.shiny,
      minStat: parseMinStat(body.minStat || ''),
    };
    const matches = searchSalts({ userId, total, prefix, length, filters, maxMatches: 24 });
    return sendJson(res, 200, {
      userId,
      searched: total,
      matches: matches.map(match => ({
        ...match,
        face: renderFace(match.buddy),
        sprite: renderSprite(match.buddy, 0),
        spriteFrames: renderSpriteFrames(match.buddy),
        blinkFrame: renderBlinkSprite(match.buddy, 0),
      })),
    });
  }

  if (pathname === '/api/binary' && req.method === 'GET') {
    const detected = detectBinarySalt();
    if (!detected) {
      return sendJson(res, 200, {
        binary: null,
        stateFile: getStateFilePath(),
      });
    }
    return sendJson(res, 200, {
      binary: {
        path: detected.filePath,
        currentSalt: detected.salt,
        saltLength: detected.length,
        originalSaltRecorded: getRecordedOriginalSalt(detected.filePath),
      },
      stateFile: getStateFilePath(),
    });
  }

  if (pathname === '/api/apply' && req.method === 'POST') {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    if (!body.salt) {
      return sendJson(res, 400, { error: 'salt is required' });
    }
    const resolvedBinaryPath = resolveBinaryPath(body.binaryPath);
    if (!resolvedBinaryPath) {
      return sendJson(res, 400, { error: 'Could not find claude binary.' });
    }
    const detected = detectBinarySalt(resolvedBinaryPath);
    if (!detected) {
      return sendJson(res, 400, { error: 'Could not detect current salt in Claude Code binary.' });
    }
    recordOriginalSalt(resolvedBinaryPath, detected.salt);
    const result = applyBinary(body.salt, resolvedBinaryPath);
    return sendJson(res, 200, {
      ok: true,
      ...result,
      originalSaltRecorded: getRecordedOriginalSalt(resolvedBinaryPath),
    });
  }

  if (pathname === '/api/restore' && req.method === 'POST') {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    const resolvedBinaryPath = resolveBinaryPath(body.binaryPath);
    if (!resolvedBinaryPath) {
      return sendJson(res, 400, { error: 'Could not find claude binary.' });
    }
    const originalSalt = getRecordedOriginalSalt(resolvedBinaryPath);
    if (!originalSalt) {
      return sendJson(res, 400, {
        error: 'No recorded original salt found for this binary.',
      });
    }
    const result = restoreBinary(originalSalt, resolvedBinaryPath);
    return sendJson(res, 200, {
      ok: true,
      ...result,
      originalSaltRecorded: originalSalt,
    });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url.pathname);
      return;
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = fs.readFileSync(STATIC_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Claude Buddy Changer running at http://127.0.0.1:${PORT}`);
});
