const fs = require('fs');
const os = require('os');
const path = require('path');

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
};
const SPECIES = [
  'duck',
  'goose',
  'blob',
  'cat',
  'dragon',
  'octopus',
  'owl',
  'penguin',
  'turtle',
  'snail',
  'ghost',
  'axolotl',
  'capybara',
  'cactus',
  'robot',
  'rabbit',
  'mushroom',
  'chonk',
];
const EYES = ['·', '✦', '×', '◉', '@', '°'];
const HATS = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'];
const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'];
const RARITY_FLOOR = {
  common: 5,
  uncommon: 15,
  rare: 25,
  epic: 35,
  legendary: 50,
};
const DEFAULT_SALT = 'friend-2026-401';
const BODIES = {
  duck: [
    ['            ', '    __      ', '  <({E} )___  ', '   (  ._>   ', '    `--´    '],
    ['            ', '    __      ', '  <({E} )___  ', '   (  ._>   ', '    `--´~   '],
    ['            ', '    __      ', '  <({E} )___  ', '   (  .__>  ', '    `--´    '],
  ],
  goose: [
    ['            ', '     ({E}>    ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
    ['            ', '    ({E}>     ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
    ['            ', '     ({E}>>   ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
  ],
  blob: [
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (      )  ', '   `----´   '],
    ['            ', '  .------.  ', ' (  {E}  {E}  ) ', ' (        ) ', '  `------´  '],
    ['            ', '    .--.    ', '   ({E}  {E})   ', '   (    )   ', '    `--´    '],
  ],
  cat: [
    ['            ', '   /\\_/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")   '],
    ['            ', '   /\\_/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")~  '],
    ['            ', '   /\\-/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")   '],
  ],
  dragon: [
    ['            ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (   ~~   ) ', '  `-vvvv-´  '],
    ['            ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (        ) ', '  `-vvvv-´  '],
    ['   ~    ~   ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (   ~~   ) ', '  `-vvvv-´  '],
  ],
  octopus: [
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  \\/\\/\\/\\/  '],
    ['     o      ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
  ],
  owl: [
    ['            ', '   /\\  /\\   ', '  (({E})({E}))  ', '  (  ><  )  ', '   `----´   '],
    ['            ', '   /\\  /\\   ', '  (({E})({E}))  ', '  (  ><  )  ', '   .----.   '],
    ['            ', '   /\\  /\\   ', '  (({E})(-))  ', '  (  ><  )  ', '   `----´   '],
  ],
  penguin: [
    ['            ', '  .---.     ', '  ({E}>{E})     ', ' /(   )\\    ', '  `---´     '],
    ['            ', '  .---.     ', '  ({E}>{E})     ', ' |(   )|    ', '  `---´     '],
    ['  .---.     ', '  ({E}>{E})     ', ' /(   )\\    ', '  `---´     ', '   ~ ~      '],
  ],
  turtle: [
    ['            ', '   _,--._   ', '  ( {E}  {E} )  ', ' /[______]\\ ', '  ``    ``  '],
    ['            ', '   _,--._   ', '  ( {E}  {E} )  ', ' /[______]\\ ', '   ``  ``   '],
    ['            ', '   _,--._   ', '  ( {E}  {E} )  ', ' /[======]\\ ', '  ``    ``  '],
  ],
  snail: [
    ['            ', ' {E}    .--.  ', '  \\  ( @ )  ', '   \\_`--´   ', '  ~~~~~~~   '],
    ['            ', '  {E}   .--.  ', '  |  ( @ )  ', '   \\_`--´   ', '  ~~~~~~~   '],
    ['            ', ' {E}    .--.  ', '  \\  ( @  ) ', '   \\_`--´   ', '   ~~~~~~   '],
  ],
  ghost: [
    ['            ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  ~`~``~`~  '],
    ['            ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  `~`~~`~`  '],
    ['    ~  ~    ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  ~~`~~`~~  '],
  ],
  axolotl: [
    ['            ', '}~(______)~{', '}~({E} .. {E})~{', '  ( .--. )  ', '  (_/  \\_)  '],
    ['            ', '~}(______){~', '~}({E} .. {E}){~', '  ( .--. )  ', '  (_/  \\_)  '],
    ['            ', '}~(______)~{', '}~({E} .. {E})~{', '  (  --  )  ', '  ~_/  \\_~  '],
  ],
  capybara: [
    ['            ', '  n______n  ', ' ( {E}    {E} ) ', ' (   oo   ) ', '  `------´  '],
    ['            ', '  n______n  ', ' ( {E}    {E} ) ', ' (   Oo   ) ', '  `------´  '],
    ['    ~  ~    ', '  u______n  ', ' ( {E}    {E} ) ', ' (   oo   ) ', '  `------´  '],
  ],
  cactus: [
    ['            ', ' n  ____  n ', ' | |{E}  {E}| | ', ' |_|    |_| ', '   |    |   '],
    ['            ', '    ____    ', ' n |{E}  {E}| n ', ' |_|    |_| ', '   |    |   '],
    [' n        n ', ' |  ____  | ', ' | |{E}  {E}| | ', ' |_|    |_| ', '   |    |   '],
  ],
  robot: [
    ['            ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ ==== ]  ', '  `------´  '],
    ['            ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ -==- ]  ', '  `------´  '],
    ['     *      ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ ==== ]  ', '  `------´  '],
  ],
  rabbit: [
    ['            ', '   (\\__/)   ', '  ( {E}  {E} )  ', ' =(  ..  )= ', '  (")__(")  '],
    ['            ', '   (|__/)   ', '  ( {E}  {E} )  ', ' =(  ..  )= ', '  (")__(")  '],
    ['            ', '   (\\__/)   ', '  ( {E}  {E} )  ', ' =( .  . )= ', '  (")__(")  '],
  ],
  mushroom: [
    ['            ', ' .-o-OO-o-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
    ['            ', ' .-O-oo-O-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
    ['   . o  .   ', ' .-o-OO-o-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
  ],
  chonk: [
    ['            ', '  /\\    /\\  ', ' ( {E}    {E} ) ', ' (   ..   ) ', '  `------´  '],
    ['            ', '  /\\    /|  ', ' ( {E}    {E} ) ', ' (   ..   ) ', '  `------´  '],
    ['            ', '  /\\    /\\  ', ' ( {E}    {E} ) ', ' (   ..   ) ', '  `------´~ '],
  ],
};
const HAT_LINES = {
  none: '',
  crown: '   \\^^^/    ',
  tophat: '   [___]    ',
  propeller: '    -+-     ',
  halo: '   (   )    ',
  wizard: '    /^\\     ',
  beanie: '   (___)    ',
  tinyduck: '    ,>      ',
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function rollRarity(rng) {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (const rarity of RARITIES) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll < 0) {
      return rarity;
    }
  }
  return 'common';
}

function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity];
  const peak = pick(rng, STAT_NAMES);
  let dump = pick(rng, STAT_NAMES);
  while (dump === peak) {
    dump = pick(rng, STAT_NAMES);
  }

  const stats = {};
  for (const name of STAT_NAMES) {
    if (name === peak) {
      stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
    } else if (name === dump) {
      stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
    } else {
      stats[name] = floor + Math.floor(rng() * 40);
    }
  }
  return stats;
}

function rollWithSalt(userId, salt) {
  const rng = mulberry32(hashString(userId + salt));
  const rarity = rollRarity(rng);
  return {
    rarity,
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
    inspirationSeed: Math.floor(rng() * 1e9),
  };
}

function renderSprite(bones, frame = 0) {
  const frames = BODIES[bones.species];
  const body = frames[frame % frames.length].map(line => line.replaceAll('{E}', bones.eye));
  const lines = [...body];
  if (bones.hat !== 'none' && !lines[0].trim()) {
    lines[0] = HAT_LINES[bones.hat];
  }
  if (!lines[0].trim() && frames.every(f => !f[0].trim())) {
    lines.shift();
  }
  return lines;
}

function spriteFrameCount(species) {
  return BODIES[species].length;
}

function renderBlinkSprite(bones, frame = 0) {
  return renderSprite(bones, frame).map(line => line.replaceAll(bones.eye, '-'));
}

function renderSpriteFrames(bones) {
  const count = spriteFrameCount(bones.species);
  const frames = [];
  for (let i = 0; i < count; i += 1) {
    frames.push(renderSprite(bones, i));
  }
  return frames;
}

function renderFace(bones) {
  const eye = bones.eye;
  switch (bones.species) {
    case 'duck':
    case 'goose':
      return `(${eye}>`;
    case 'blob':
      return `(${eye}${eye})`;
    case 'cat':
      return `=${eye}ω${eye}=`;
    case 'dragon':
      return `<${eye}~${eye}>`;
    case 'octopus':
      return `~(${eye}${eye})~`;
    case 'owl':
      return `(${eye})(${eye})`;
    case 'penguin':
      return `(${eye}>)`;
    case 'turtle':
      return `[${eye}_${eye}]`;
    case 'snail':
      return `${eye}(@)`;
    case 'ghost':
      return `/${eye}${eye}\\`;
    case 'axolotl':
      return `}${eye}.${eye}{`;
    case 'capybara':
      return `(${eye}oo${eye})`;
    case 'cactus':
      return `|${eye}  ${eye}|`;
    case 'robot':
      return `[${eye}${eye}]`;
    case 'rabbit':
      return `(${eye}..${eye})`;
    case 'mushroom':
      return `|${eye}  ${eye}|`;
    case 'chonk':
      return `(${eye}.${eye})`;
    default:
      return bones.species;
  }
}

function detectUserId() {
  const home = os.homedir();
  const candidates = [
    path.join(home, '.claude', '.config.json'),
    path.join(home, '.claude.json'),
  ];

  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) {
        continue;
      }
      const raw = fs.readFileSync(candidate, 'utf8');
      const config = JSON.parse(raw);
      const userId = config.oauthAccount?.accountUuid || config.userID;
      if (userId) {
        return userId;
      }
    } catch {
      // Ignore malformed files and continue.
    }
  }

  throw new Error(`Could not detect userId from ${candidates.join(', ')}`);
}

function generateSalt(prefix, index, length) {
  if (prefix.length > length) {
    throw new Error(`salt prefix length ${prefix.length} exceeds target length ${length}`);
  }
  const suffixLength = Math.max(0, length - prefix.length);
  return prefix + String(index).padStart(suffixLength, '0').slice(-suffixLength);
}

function parseMinStat(value) {
  if (!value) {
    return null;
  }
  const [rawName, rawThreshold] = value.split(':');
  const name = String(rawName || '').trim().toUpperCase();
  const threshold = Number(rawThreshold);
  if (!STAT_NAMES.includes(name) || !Number.isFinite(threshold)) {
    throw new Error(`Invalid min stat value: ${value}`);
  }
  return { name, threshold };
}

function matchesFilters(result, filters) {
  if (filters.species && result.species !== filters.species) return false;
  if (filters.rarity && result.rarity !== filters.rarity) return false;
  if (filters.eye && result.eye !== filters.eye) return false;
  if (filters.hat && result.hat !== filters.hat) return false;
  if (filters.shiny && !result.shiny) return false;
  if (filters.minStat && result.stats[filters.minStat.name] < filters.minStat.threshold) return false;
  return true;
}

function searchSalts({
  userId,
  total = 100000,
  prefix = 'lab-',
  length = DEFAULT_SALT.length,
  filters = {},
  maxMatches = 20,
}) {
  const matches = [];
  for (let i = 0; i < total; i += 1) {
    const salt = generateSalt(prefix, i, length);
    const result = rollWithSalt(userId, salt);
    if (matchesFilters(result, filters)) {
      matches.push({ salt, buddy: result });
      if (matches.length >= maxMatches) {
        break;
      }
    }
  }
  return matches;
}

module.exports = {
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
  spriteFrameCount,
};
