/* Lunaris — лінійні SVG-обличчя карт.
 * Порт card-art.js + card-art-major.js + card-art-minor.js з дизайн-проєкту.
 * Повертає SVG-рядок: рендеримо через dangerouslySetInnerHTML — вміст генерує
 * тільки цей модуль (жодного вводу користувача), тож це безпечно.
 *
 * Ключі: Старші — римський номер ('0', 'I' … 'XXI'), Молодші — 'cups:VII', 'swords:Queen'.
 */
import { TAROT_DATA, type MajorCard, type MinorCard, type SuitKey } from '../data/tarotData'

const G = '#c9a24a', GS = '#e8c678', BG = '#160f28'

const star = (cx: number, cy: number, R: number, r: number, n = 8) => {
  let d = ''
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI * i / n - Math.PI / 2, k = i % 2 ? r : R
    d += (i ? 'L' : 'M') + (cx + k * Math.cos(a)).toFixed(1) + ' ' + (cy + k * Math.sin(a)).toFixed(1)
  }
  return d + 'Z'
}
const rays = (cx: number, cy: number, r1: number, r2: number, n: number, off = 0) => {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n + off
    d += `M${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)}L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(cy + r2 * Math.sin(a)).toFixed(1)}`
  }
  return d
}
const wave = (x1: number, x2: number, y: number, amp = 4, step = 16) => {
  let d = `M${x1} ${y}`
  for (let x = x1; x < x2; x += step) d += `q${step / 4} ${-amp} ${step / 2} 0t${step / 2} 0`
  return d
}
const P = (d: string, extra = '') => `<path d="${d}" ${extra}/>`
const head = (x: number, y: number, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${BG}"/>`
const dot = (x: number, y: number, r = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GS}" stroke="none"/>`
const F = `fill="${BG}"`, FG = `fill="${GS}" fill-opacity=".2"`
const lg = (g: string) => `<g opacity=".45">${g}</g>`

type Art = () => string[]

// ───────────── STARШІ АРКАНИ ─────────────
const ART: Record<string, Art> = {
  '0': () => [
    `<circle cx="158" cy="72" r="9"/>`, P(rays(158, 72, 13, 19, 12), `opacity=".7"`),
    P('M22 200H118L126 224V246'), P('M130 246L150 226L170 246M150 246L164 234L178 246', `opacity=".35"`),
    `<circle cx="96" cy="100" r="9"/>`,
    P('M86 97Q96 82 106 97Z', `fill="${GS}" fill-opacity=".25"`), P('M104 90q8 -14 18 -12q-8 2 -14 12', `opacity=".8"`),
    P('M89 112L80 160H112L103 112Z'), P('M82 150H110', `opacity=".5"`),
    P('M92 160L86 198M104 160L116 194'), P('M82 198h8M112 194l8 -2'),
    P('M90 120L108 104'), P('M80 132L132 80', `stroke-width="1.4"`),
    `<circle cx="134" cy="90" r="7" fill="${GS}" fill-opacity=".2"/>`, P('M132 80L134 83'),
    P('M88 124L70 140'), `<circle cx="67" cy="143" r="3.5" fill="${GS}" stroke="none"/>`,
    P('M48 196q0 -14 12 -14h8l4 -6 4 6q2 6 -4 8l-2 6M50 196v4M60 196v4M48 188q-8 -4 -6 -12'),
  ],
  'I': () => [
    P('M100 70c-6 -8 -18 -8 -18 0s12 8 18 0s18 -8 18 0s-12 8 -18 0', `stroke="${GS}" stroke-width="1.4"`),
    `<circle cx="100" cy="96" r="9"/>`,
    P('M91 108L80 180H120L109 108Z'), P('M88 140H112', `opacity=".6"`), P('M86 108h28', `opacity=".5"`),
    P('M91 114L70 88'), P('M64 78L76 98', `stroke-width="2"`),
    `<circle cx="63" cy="76" r="2.5" fill="${GS}" stroke="none"/><circle cx="77" cy="100" r="2.5" fill="${GS}" stroke="none"/>`,
    P(rays(63, 76, 5, 11, 8), `opacity=".5"`),
    P('M109 114L130 150L134 160'),
    `<rect x="36" y="176" width="128" height="8" fill="${G}" fill-opacity=".12"/>`, P('M44 184V240M156 184V240'),
    P('M48 162h16l-3 8h-10zM56 170v6M51 176h10'),
    P('M68 172h10', `stroke-width="2.4"`),
    P('M124 172H146M128 168v8'),
    `<circle cx="150" cy="166" r="6"/>`, P(star(150, 166, 5, 2, 5)),
    `<g opacity=".45">${[50, 66, 82, 98, 114, 130, 146].map(x => `<circle cx="${x}" cy="240" r="3"/>`).join('')}</g>`,
    P('M44 240H156', `opacity=".3"`),
  ],
  'II': () => [
    `<rect x="28" y="72" width="16" height="160"/><rect x="156" y="72" width="16" height="160"/>`,
    P('M24 72h24M152 72h24M24 232h24M152 232h24'),
    `<text x="36" y="156" fill="${G}" stroke="none" font-family="Cormorant Garamond,serif" font-size="13" text-anchor="middle">B</text><text x="164" y="156" fill="${G}" stroke="none" font-family="Cormorant Garamond,serif" font-size="13" text-anchor="middle">J</text>`,
    P('M44 78Q100 64 156 78', `opacity=".5"`),
    `<g opacity=".4">${[[56, 92], [144, 92], [60, 128], [140, 128], [58, 164], [142, 164]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>`,
    `<circle cx="100" cy="80" r="5" fill="${GS}" stroke="none"/>`, P('M88 74a8 8 0 0 0 0 12M112 74a8 8 0 0 1 0 12'),
    `<circle cx="100" cy="102" r="9"/>`,
    P('M90 98Q88 150 72 222H128Q112 150 110 98', `opacity=".6"`),
    P('M92 112L84 222H116L108 112Z'),
    P('M100 118v12M95 123h10'),
    P('M86 146l28 -6v10l-28 6z', `fill="${GS}" fill-opacity=".2"`),
    P('M84 228a18 14 0 0 0 32 0a15 10 0 0 1 -32 0z', `fill="${GS}" stroke="none"`),
  ],
  'III': () => [
    P('M24 232H176'), lg([...Array(12)].map((_, i) => { const x = 30 + i * 13; return P(`M${x} 246V228M${x} 232l-4 -4M${x} 236l4 -4`) }).join('')),
    P('M66 214V112Q100 72 134 112V214', F),
    P('M91 116Q78 170 64 222H136Q122 170 109 116Z', F),
    head(100, 104, 9),
    ...[-2, -1, 0, 1, 2].map(i => P(star(100 + i * 9, 88 - Math.abs(i) * -1.5 - (2 - Math.abs(i)) * 2, 3.2, 1.2, 6), `fill="${GS}" stroke="none"`)),
    P('M109 128L130 96'), dot(131, 94, 3),
    P('M68 170h20v14q0 12 -10 16q-10 -4 -10 -16z', F), `<circle cx="78" cy="180" r="4"/>`, P('M78 184v8M74 188h8'),
    P('M86 150Q100 156 114 150', `opacity=".5"`),
  ],
  'IV': () => [
    P('M20 150L48 106L72 150M128 150L154 100L180 150', `opacity=".4"`),
    P('M62 216V104H138V216', F),
    P('M62 104a8 8 0 1 1 8 8a4 4 0 1 1 -4 -4M138 104a8 8 0 1 0 -8 8a4 4 0 1 0 4 -4'),
    P('M90 120L80 212H120L110 120Z', F), P('M86 150H114M84 180H116', `opacity=".5"`),
    head(100, 108, 9), P('M91 100l3 -12 4 7 2 -10 2 10 4 -7 3 12z', FG),
    P('M93 112Q100 128 107 112', `opacity=".8"`),
    P('M110 140H130'), P('M130 116V176'), `<circle cx="130" cy="110" r="6"/>`, P('M122 120H138'),
    P('M90 140H76'), `<circle cx="70" cy="140" r="7"/>`, P('M70 133v-6M67 130h6'),
    P('M52 216H148M44 226H156'),
  ],
  'V': () => [
    `<rect x="30" y="76" width="14" height="140"/><rect x="156" y="76" width="14" height="140"/>`, P('M26 76h22M152 76h22'),
    P('M90 120L74 206H126L110 120Z', F), P('M96 120V206M104 120V206', `opacity=".6"`),
    P('M94 150h4M96 148v4M102 176h4M104 174v4', `opacity=".7"`),
    head(100, 110, 8), P('M90 102Q100 58 110 102Z', FG), P('M91 96h18M93 88h14M95 80h10', `opacity=".8"`), P('M100 64v-6M97 61h6'),
    P('M90 130L74 112'), P('M74 112l-2 -8M74 112l-6 -6'),
    P('M110 130H128'), P('M128 84V208'), P('M122 92h12M120 100h16M118 108h20'),
    P('M82 210L118 234M118 210L82 234'), `<circle cx="80" cy="208" r="4"/><circle cx="120" cy="208" r="4"/>`,
    head(56, 214, 6), P('M48 238Q48 222 56 222Q64 222 64 238'), head(144, 214, 6), P('M136 238Q136 222 144 222Q152 222 152 238'),
  ],
  'VI': () => [
    `<circle cx="100" cy="68" r="9"/>`, P(rays(100, 68, 12, 18, 12), `opacity=".6"`),
    P('M98 94Q62 76 46 106Q74 100 98 110M102 94Q138 76 154 106Q126 100 102 110', FG),
    head(100, 90, 7), P('M94 98L92 122H108L106 98Z', F),
    P('M84 226L100 176L116 226', `opacity=".45"`),
    P('M24 226H176'),
    P('M36 226V174'), ...[180, 190, 200].map(y => P(`M36 ${y}l-7 -6M36 ${y}l7 -6`, `opacity=".7"`)),
    P('M164 226V184'), `<circle cx="164" cy="168" r="14" ${F}/>`, lg([[158, 164], [170, 162], [164, 174]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')),
    P('M164 222q-6 -6 0 -10q6 -4 0 -10q-6 -4 0 -10', `stroke="${GS}"`),
    head(66, 160, 7), P('M60 170L56 222H76L72 170Z', F), P('M72 178L84 170'),
    head(134, 160, 7), P('M128 156q-2 14 -4 20M140 156q2 14 4 20', `opacity=".6"`), P('M128 170Q124 200 122 222H146Q144 200 140 170Z', F), P('M128 178L116 170'),
  ],
  'VII': () => [
    P('M20 150h8v-10h6v10h8v-16h6v16h6M142 150h6v-12h6v12h8v-18h6v18h12', `opacity=".35"`),
    P('M62 96H138'), lg([70, 84, 100, 116, 130].map(x => `<circle cx="${x}" cy="102" r="1.6"/>`).join('')),
    P('M64 96V168M136 96V168'),
    P(star(100, 100, 4, 1.6, 6), `fill="${GS}" stroke="none"`),
    head(100, 114, 8), P('M88 124H112L108 152H92Z', F), P('M112 128L126 104'), dot(127, 102, 2.5),
    `<rect x="64" y="150" width="72" height="44" ${F}/>`, P('M84 170Q100 160 116 170M84 170Q100 176 116 170', `opacity=".7"`), dot(100, 170, 2.5),
    `<circle cx="74" cy="200" r="10" ${F}/><circle cx="126" cy="200" r="10" ${F}/>`, P(rays(74, 200, 2, 10, 6) + rays(126, 200, 2, 10, 6), `opacity=".6"`),
    P('M36 242V228Q36 216 48 216L52 206Q58 200 64 206L66 216H84V242Z', FG),
    P('M116 242V216H134L136 206Q142 200 148 206L152 216Q164 216 164 228V242Z', F),
    P('M24 242H176', `opacity=".5"`),
  ],
  'VIII': () => [
    P('M84 70c-5 -7 -15 -7 -15 0s10 7 15 0s15 -7 15 0s-10 7 -15 0', `stroke="${GS}" stroke-width="1.4"`),
    lg([76, 80, 84, 88, 92].map(x => `<circle cx="${x}" cy="88" r="2"/>`).join('')),
    head(84, 96, 8), P('M76 106Q64 160 58 228H114Q104 160 92 106Z', F),
    P('M92 122Q110 136 120 154M80 126Q100 150 118 172'),
    P('M140 182Q172 178 172 212V230M122 188V230M150 208V230'), P('M172 208q14 -4 8 -22', `opacity=".8"`),
    P(rays(130, 166, 13, 23, 18)), `<circle cx="130" cy="166" r="12" ${F}/>`,
    `<circle cx="126" cy="162" r="1.6" fill="${GS}" stroke="none"/><circle cx="134" cy="162" r="1.6" fill="${GS}" stroke="none"/>`, P('M126 172q4 3 8 0'),
    P('M24 230H176'), lg([36, 52, 164].map(x => P(`M${x} 230q2 -8 6 -10`)).join('')),
  ],
  'IX': () => [
    lg([[40, 70], [62, 90], [150, 74], [168, 98], [34, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5"/>`).join('')),
    P('M20 242L72 214L98 206L136 216L180 242'),
    P('M86 112L68 210H126L114 112Z', F),
    P('M86 114Q84 84 102 84Q118 88 116 114Z', F), P('M96 104Q100 120 110 116', `opacity=".8"`),
    P('M74 96L66 212', `stroke-width="1.6"`), P('M88 130L74 132'),
    P('M114 124L140 118'), P('M142 118V126'),
    P('M136 126H148L150 140L142 146L134 140Z', F), P(star(142, 136, 5, 2, 6), `fill="${GS}" stroke="none"`), P(rays(142, 136, 14, 20, 10), `opacity=".45"`),
  ],
  'X': () => [
    `<circle cx="100" cy="152" r="50" ${F}/><circle cx="100" cy="152" r="38"/><circle cx="100" cy="152" r="12"/>`,
    P(rays(100, 152, 12, 38, 8)),
    ...['T', 'A', 'R', 'O'].map((t, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; return `<text x="${(100 + 44 * Math.cos(a)).toFixed(1)}" y="${(152 + 44 * Math.sin(a) + 4).toFixed(1)}" text-anchor="middle" fill="${GS}" stroke="none" font-family="Cormorant Garamond,serif" font-size="11">${t}</text>` }),
    P('M88 102V92Q88 84 96 84L100 76L104 84Q112 84 112 92V102', F), P('M100 76V60', `stroke-width="1.4"`), P('M96 68h8'),
    P('M44 104q8 12 0 24q-8 12 0 24q8 12 0 24q-4 6 -2 12', `stroke="${GS}"`),
    P('M150 196q8 -10 6 -26q-2 -12 6 -22M154 150l8 -6 4 8', `opacity=".8"`),
    ...[[34, 70], [166, 70], [34, 236], [166, 236]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" ${FG}/>` + P(star(x, y, 5, 2, 4), `fill="${GS}" stroke="none"`)),
  ],
  'XI': () => [
    `<rect x="30" y="78" width="12" height="144"/><rect x="158" y="78" width="12" height="144"/>`, P('M42 84Q100 70 158 84', `opacity=".5"`),
    P('M90 116L76 220H124L110 116Z', F),
    head(100, 104, 8), P('M92 97V88H108V97'), dot(100, 92, 2),
    P('M110 128H124'), P('M126 66V132', `stroke-width="1.6"`), P('M119 132H133M126 132V140'),
    P('M90 132L76 146'), P('M74 142V150M56 150H92'), P('M56 150L50 166M56 150L62 166M92 150L86 166M92 150L98 166', `opacity=".7"`),
    P('M48 166Q56 174 64 166ZM84 166Q92 174 100 166Z', FG),
    P('M60 220H140M54 228H146'),
  ],
  'XII': () => [
    P('M52 72H148', `stroke-width="1.6"`), P('M60 72V236M140 72V236', `stroke-width="1.6"`),
    lg(P('M60 120l-6 -4M60 170l6 -4M140 130l6 -4M140 190l-6 -4M52 72l-4 -6M148 72l4 -6')),
    P('M100 72V88'),
    P('M100 88V140'), P('M100 140L118 118L100 110'),
    P('M90 140H110L106 186H94Z', F),
    P('M92 150L84 172L94 182M108 150L116 172L106 182', `opacity=".8"`),
    `<circle cx="100" cy="198" r="17" ${FG}/>`, P(rays(100, 198, 19, 25, 14), `opacity=".55"`), head(100, 198, 9),
    P('M24 236H176'),
  ],
  'XIII': () => [
    P('M24 214H176'),
    `<rect x="30" y="176" width="14" height="38"/><rect x="156" y="176" width="14" height="38"/>`, P('M30 176l7 -9 7 9M156 176l7 -9 7 9'),
    P('M86 120Q84 86 100 84Q116 86 114 120'),
    `<circle cx="100" cy="104" r="8"/>`, `<circle cx="97" cy="102" r="1.8" fill="${GS}" stroke="none"/><circle cx="103" cy="102" r="1.8" fill="${GS}" stroke="none"/>`, P('M100 106v2M97 110h6', `opacity=".8"`),
    P('M86 120L74 214H126L114 120Z', `fill="#0e0a1a"`), P('M100 126V210', `opacity=".3"`),
    P('M136 76L122 232', `stroke-width="1.6"`),
    P('M136 76Q104 64 72 90Q104 78 132 88Z', `fill="${GS}" fill-opacity=".18" stroke="${GS}"`),
    P('M112 132L128 138M112 176L125 180'),
    P('M50 214l-4 -8 6 3 4 -6 4 6 6 -3 -4 8z', `transform="rotate(-24 56 210)"`),
    `<circle cx="160" cy="236" r="4" fill="${GS}" stroke="none"/>`, P('M160 240v6M156 244l4 -2', `opacity=".7"`),
  ],
  'XIV': () => [
    P('M30 172L44 150L58 172', `opacity=".45"`), `<circle cx="44" cy="142" r="5" ${FG}/>`,
    P('M40 216Q50 190 50 174', `opacity=".35" stroke-dasharray="3 3"`),
    P('M96 110Q54 80 42 132Q70 122 94 132M104 110Q146 80 158 132Q130 122 106 132', FG),
    P('M92 108L82 212H118L108 108Z', F), P('M95 120H105V130H95Z'), P('M96 128L100 121L104 128Z', `opacity=".8"`),
    `<circle cx="100" cy="96" r="13" opacity=".4"/>`, head(100, 96, 8), dot(100, 92, 1.6),
    P('M92 130L80 142M108 136L120 164'),
    P('M72 136h14l-2 8h-10z', F), P('M114 164h14l-2 8h-10z', F),
    P('M84 140Q102 146 118 164', `stroke="${GS}" stroke-dasharray="2 2"`),
    P('M24 216H104'), P(wave(106, 176, 218, 3)), P(wave(114, 170, 232, 2.6), `opacity=".55"`),
    lg(P('M50 216q-2 -10 4 -12q4 4 0 12M62 216q0 -8 5 -10')),
  ],
  'XV': () => [
    `<g transform="rotate(180 100 72)">${P(star(100, 72, 12, 4.8, 5))}</g>`,
    P('M92 120L56 96L64 110L48 112L62 124L46 134L90 136M108 120L144 96L136 110L152 112L138 124L154 134L110 136', FG),
    P('M90 116L86 162H114L110 116Z', F),
    head(100, 104, 10), P('M92 98Q84 86 88 76M108 98Q116 86 112 76'), `<circle cx="96" cy="102" r="1.6" fill="${GS}" stroke="none"/><circle cx="104" cy="102" r="1.6" fill="${GS}" stroke="none"/>`,
    P('M88 140L70 174'), P('M68 176q-4 6 0 10q4 -4 2 -10', `fill="${GS}" stroke="none"`),
    P('M110 128L124 116M124 116l2 -6M124 116l6 -2'),
    `<rect x="76" y="162" width="48" height="26" ${F}/>`, `<circle cx="100" cy="175" r="3.5"/>`,
    P('M97 177Q80 192 66 198M103 177Q120 192 134 198', `stroke-dasharray="3 2"`),
    head(62, 198, 6), P('M58 196l-2 -6M66 196l2 -6', `opacity=".7"`), P('M56 206L54 238H70L68 206Z', F),
    head(138, 198, 6), P('M134 196l-2 -6M142 196l2 -6', `opacity=".7"`), P('M132 206Q130 222 130 238H146Q146 222 144 206Z', F),
    P('M24 238H176'),
  ],
  'XVI': () => [
    P('M80 232V112H120V232'), P('M72 232H128'),
    `<rect x="95" y="126" width="10" height="16"/><rect x="87" y="170" width="8" height="14"/><rect x="106" y="196" width="8" height="14"/>`,
    `<g transform="rotate(28 132 92)">${P('M118 102V88l6 6 6 -10 6 10 6 -6V102z')}</g>`,
    P('M52 58L80 86L70 90L100 116', `stroke="${GS}" stroke-width="1.8"`),
    `<g fill="${GS}" stroke="none">${[[64, 140], [56, 168], [142, 150], [150, 184], [60, 200], [138, 122]].map(([x, y]) => `<path d="M${x} ${y}l2 5 -2 5 -2 -5z"/>`).join('')}</g>`,
    P('M40 240q20 -8 40 0M120 240q20 -8 40 0', `opacity=".5"`),
  ],
  'XVII': () => [
    P(star(100, 86, 28, 10), `fill="${GS}" fill-opacity=".12"`), P(star(100, 86, 16, 6), `fill="${GS}" stroke="none"`),
    ...[[46, 70], [154, 70], [36, 104], [164, 104], [56, 132], [144, 132], [100, 130]].map(([x, y]) => P(star(x, y, 6, 2.2))),
    P('M24 206H116'), P(wave(118, 178, 210, 3.5)), P(wave(126, 172, 224, 3), `opacity=".6"`), P(wave(134, 168, 238, 2.5), `opacity=".35"`),
    `<circle cx="98" cy="150" r="7"/>`, P('M92 146q-6 10 -2 22M104 146q6 10 2 22', `opacity=".6"`),
    P('M93 158Q88 172 92 184H108Q110 172 104 158Z'),
    P('M92 184L76 200L98 204M108 184L122 196L122 212'),
    P('M94 164L72 176M104 164L128 172'),
    P('M62 172q0 -8 8 -8q8 0 8 8q-2 8 -8 8q-6 0 -8 -8zM66 164l-4 -4', `fill="${GS}" fill-opacity=".2"`),
    P('M130 168q0 -8 8 -8q8 0 8 8q-2 8 -8 8q-6 0 -8 -8zM142 160l4 -4', `fill="${GS}" fill-opacity=".2"`),
    P('M62 176Q54 186 56 204', `stroke="${GS}" stroke-dasharray="2 3"`), P('M146 172Q152 186 150 208', `stroke="${GS}" stroke-dasharray="2 3"`),
    P('M36 206V176M36 186l-8 -6M36 194l8 -6', `opacity=".5"`),
  ],
  'XVIII': () => [
    `<circle cx="100" cy="84" r="20" ${F}/>`, P('M100 64A20 20 0 0 1 100 104A13 20 0 0 0 100 64Z', FG), P(rays(100, 84, 24, 31, 16), `opacity=".7"`),
    lg([84, 100, 116].map((x, i) => P(`M${x} ${114 + i % 2 * 6}q-3 5 0 7q3 -2 0 -7z`, `fill="${GS}"`)).join('')),
    `<rect x="28" y="124" width="16" height="66" ${F}/><rect x="156" y="124" width="16" height="66" ${F}/>`, P('M28 124l8 -10 8 10M156 124l8 -10 8 10'),
    `<rect x="33" y="140" width="6" height="10"/><rect x="161" y="140" width="6" height="10"/>`,
    P('M20 190H86M114 190H180', `opacity=".6"`),
    P('M100 222Q84 206 100 196Q116 184 98 170Q88 160 100 146', `opacity=".55" stroke-dasharray="3 3"`),
    P('M58 190V180Q58 172 64 170L66 158L70 164L74 158L76 170Q82 176 80 190Z', FG), P('M66 158l-4 -8', `opacity=".6"`),
    P('M120 190V180Q120 172 126 170L128 158L132 164L136 158L138 170Q144 176 142 190Z', F), P('M136 158l4 -8', `opacity=".6"`),
    P(wave(36, 164, 222, 3)), P(wave(50, 150, 236, 2.6), `opacity=".5"`),
    `<ellipse cx="100" cy="230" rx="7" ry="4" ${F}/>`, P('M94 228l-6 -6M106 228l6 -6'),
  ],
  'XIX': () => [
    `<circle cx="100" cy="88" r="20" ${FG}/>`, P(rays(100, 88, 24, 38, 16)),
    `<circle cx="94" cy="86" r="1.6" fill="${GS}" stroke="none"/><circle cx="106" cy="86" r="1.6" fill="${GS}" stroke="none"/>`, P('M94 95q6 4 12 0'),
    P('M24 176H176M24 196H176'), lg(P('M40 176v20M64 176v20M88 176v20M112 176v20M136 176v20M160 176v20M24 186H176')),
    ...[40, 62, 138, 160].map(x => P(rays(x, 164, 4, 9, 10)) + dot(x, 164, 3.5) + P(`M${x} 168V176`)),
    P('M64 212Q64 198 84 198H118Q136 198 136 212Q136 224 118 224H84Q64 224 64 212Z', F),
    P('M126 204L140 184L152 188L140 206', F), P('M74 222V244M88 224V244M114 224V244M128 222V244'), P('M64 208q-12 4 -8 20', `opacity=".8"`),
    P('M96 184L94 204H106L104 184Z', F), head(100, 176, 7), P('M100 188L84 178M100 188L116 178'),
    P('M116 178L130 146'), P('M130 146Q146 142 158 150Q148 160 132 162Z', FG),
  ],
  'XX': () => [
    P('M20 206L40 180L60 206M140 206L160 176L180 206', `opacity=".35"`),
    P('M96 84Q60 62 44 92Q70 88 94 96M104 84Q140 62 156 92Q130 88 106 96', FG),
    head(100, 76, 7), P('M94 84L92 104H108L106 84Z', F),
    P('M38 116q8 -16 24 -10q10 -14 28 -6q14 -12 30 2q16 -6 24 8q14 2 16 14Z', F),
    P('M106 90L146 110L152 120L104 96Z', FG),
    `<rect x="126" y="112" width="18" height="16" ${F}/>`, P('M135 112V128M126 120H144', `stroke="${GS}"`),
    `<rect x="34" y="214" width="42" height="10" ${F}/><rect x="124" y="214" width="42" height="10" ${F}/>`,
    head(56, 186, 6), P('M56 194L44 174M56 194L68 174'), P('M52 194L50 214H62L60 194Z', F),
    head(144, 186, 6), P('M144 194L132 174M144 194L156 174'), P('M140 194Q138 204 138 214H150Q150 204 148 194Z', F),
    head(100, 198, 5), P('M100 204L92 188M100 204L108 188'), P('M96 204L95 218H105L104 204Z', F),
    P(wave(24, 176, 232, 3)), P(wave(40, 160, 244, 2.4), `opacity=".45"`),
  ],
  'XXI': () => {
    const leaves: string[] = []
    for (let i = 0; i < 36; i++) {
      const a = 2 * Math.PI * i / 36, x = 100 + 44 * Math.cos(a), y = 150 + 70 * Math.sin(a), r = (a * 180 / Math.PI) + 90
      leaves.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.2" ry="5" transform="rotate(${r.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)
    }
    return [
      `<ellipse cx="100" cy="150" rx="44" ry="70"/>`, lg(leaves.join('')),
      P('M92 74L108 86M108 74L92 86M92 214L108 226M108 214L92 226', `stroke="${GS}"`),
      P('M96 122L92 168H108L104 122Z', F), head(100, 112, 7),
      P('M92 126Q114 142 96 162Q84 178 106 192', `stroke="${GS}" opacity=".8"`),
      P('M98 168L94 198M102 168L114 186L100 190'),
      P('M96 130L80 140M104 128L120 120'), P('M74 132L84 148M116 112L126 128', `stroke-width="1.6"`),
      `<circle cx="36" cy="74" r="12" ${F}/>`, head(36, 72, 4), P('M32 78q-6 -2 -8 -8M40 78q6 -2 8 -8'),
      `<circle cx="164" cy="74" r="12" ${F}/>`, P('M156 78L164 68L172 78M164 68V80'),
      `<circle cx="36" cy="226" r="12" ${F}/>`, P('M30 222q-2 -8 2 -10M42 222q2 -8 -2 -10M30 222Q36 234 42 222'),
      `<circle cx="164" cy="226" r="12" ${F}/>`, P(rays(164, 226, 4, 9, 10)), dot(164, 226, 3.5),
    ]
  },
}

// ───────────── МОЛОДШІ АРКАНИ: піпи + фігури двору ─────────────
const PIP: Record<SuitKey, (x: number, y: number, s: number) => string> = {
  wands: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M0 -14V14', `stroke-width="1.8"`)}${P('M0 -8l5 -4M0 2l-5 -4M0 10l4 -3', `opacity=".7"`)}<circle cx="0" cy="-15" r="2" fill="${GS}" stroke="none"/></g>`,
  cups: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M-8 -12H8Q8 0 0 2Q-8 0 -8 -12Z', FG)}${P('M0 2V10M-6 12H6')}</g>`,
  swords: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M0 -15L2 -12V7H-2V-12Z', FG)}${P('M-6 7H6M0 7V13')}<circle cx="0" cy="14.5" r="1.6" fill="${GS}" stroke="none"/></g>`,
  pentacles: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="9" ${FG}/>${P(star(0, 0, 7, 2.8, 5))}</g>`,
}
const L = 64, R = 136, C = 100
const LAY: Record<string, [number, number][]> = {
  II: [[C, 100], [C, 200]], III: [[C, 88], [C, 150], [C, 212]],
  IV: [[L, 100], [R, 100], [L, 200], [R, 200]], V: [[L, 94], [R, 94], [C, 150], [L, 206], [R, 206]],
  VI: [[L, 90], [R, 90], [L, 150], [R, 150], [L, 210], [R, 210]],
  VII: [[L, 90], [R, 90], [C, 120], [L, 150], [R, 150], [L, 210], [R, 210]],
  VIII: [[L, 86], [R, 86], [C, 118], [L, 150], [R, 150], [C, 182], [L, 214], [R, 214]],
  IX: [[L, 82], [R, 82], [L, 126], [R, 126], [C, 150], [L, 174], [R, 174], [L, 218], [R, 218]],
  X: [[L, 80], [R, 80], [C, 104], [L, 126], [R, 126], [L, 174], [R, 174], [C, 196], [L, 220], [R, 220]],
}
const SCALE: Record<string, number> = { II: 1.5, III: 1.4, IV: 1.4, V: 1.3, VI: 1.3, VII: 1.2, VIII: 1.15, IX: 1.05, X: 1.0 }
const ROM: Record<string, string> = { Ace: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI', VII: 'VII', VIII: 'VIII', IX: 'IX', X: 'X', Page: 'Паж', Knight: 'Лицар', Queen: 'Королева', King: 'Король' }

function ace(s: SuitKey) {
  return [
    `<circle cx="100" cy="150" r="44" ${FG}/>`, P(rays(100, 150, 48, 60, 24), `opacity=".45"`),
    PIP[s](100, 150, 3.2),
    P('M24 98q6 -12 20 -8q8 -10 20 -2q10 0 10 10Q60 106 44 104Q30 108 24 98Z', F),
    P('M60 104Q70 114 72 124', `opacity=".6"`),
    P(wave(40, 160, 232, 3), `opacity=".45"`),
  ]
}
function pips(s: SuitKey, r: string) {
  const sc = SCALE[r]
  const out = LAY[r].map(([x, y]) => PIP[s](x, y, sc))
  if (s === 'swords' && r === 'III') return [
    P('M100 196C60 170 56 124 80 118C92 116 100 128 100 134C100 128 108 116 120 118C144 124 140 170 100 196Z', FG),
    PIP.swords(100, 154, 2.2),
    `<g transform="rotate(-38 100 158)">${PIP.swords(100, 158, 2.2)}</g>`,
    `<g transform="rotate(38 100 158)">${PIP.swords(100, 158, 2.2)}</g>`,
    P(wave(30, 170, 228, 3), `opacity=".4" stroke-dasharray="2 3"`),
  ]
  if (s === 'cups' && r === 'II') out.push(P('M82 150h36M100 138v24', `opacity=".5"`), `<circle cx="100" cy="150" r="7" opacity=".5"/>`)
  return out
}
function court(s: SuitKey, r: string) {
  const em = (x: number, y: number, k = 1.7) => PIP[s](x, y, k)
  if (r === 'Page') return [
    P('M24 232H176'), P('M40 232L60 214L84 232M120 232L146 210L170 232', `opacity=".35"`),
    P('M90 122L82 190H118L110 122Z', F), P('M92 190L88 226M108 190L112 226'), P('M82 226h8M110 226h8'),
    head(100, 110, 8), P('M90 104Q100 92 110 104Z', FG),
    P('M92 132L82 150M108 132L122 112'), em(128, 96, 1.5),
  ]
  if (r === 'Knight') return [
    P('M24 238H176', `opacity=".5"`),
    P('M50 186Q50 170 72 170H124Q142 170 142 186Q142 200 124 200H72Q50 200 50 186Z', F),
    P('M132 178L148 150L162 156L148 180', F), P('M150 152l2 -8', `opacity=".7"`),
    P('M62 198L52 222M76 200V236M120 200L130 224M132 196L144 214'), P('M50 182q-14 2 -14 20', `opacity=".8"`),
    P('M92 142L90 178H110L108 142Z', F), head(100, 132, 8), P('M92 126Q100 116 108 126V132H92Z', FG), P('M108 124l10 -8', `opacity=".7"`),
    P('M108 150L124 140'), em(130, 122, 1.5),
  ]
  const throne = [P('M62 222V116Q100 90 138 116V222', F), P('M52 222H148M46 230H154')]
  const crown = (y: number, big: boolean) => P(big ? `M89 ${y}l2 -14 5 8 4 -12 4 12 5 -8 2 14z` : `M91 ${y}l2 -10 4 6 3 -9 3 9 4 -6 2 10z`, FG)
  if (r === 'Queen') return [...throne,
    P('M90 124Q78 176 68 222H132Q122 176 110 124Z', F), head(100, 112, 8), crown(106, false),
    P('M90 108q-4 14 -2 24M110 108q4 14 2 24', `opacity=".6"`),
    P('M92 140L100 158M108 140L100 158'), em(100, 170, 1.7),
  ]
  return [...throne,
    P('M88 124L78 222H122L112 124Z', F), head(100, 112, 9), crown(104, true), P('M93 116Q100 132 107 116', `opacity=".8"`),
    P('M112 140H128'), P('M128 110V196'), P(star(128, 106, 4, 1.6, 6), `fill="${GS}" stroke="none"`),
    P('M88 140L76 156'), em(70, 168, 1.6),
  ]
}

const SUITS: SuitKey[] = ['wands', 'cups', 'swords', 'pentacles']
const RANKS = ['Ace', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Page', 'Knight', 'Queen', 'King']
SUITS.forEach(s => RANKS.forEach(r => {
  ART[s + ':' + r] = () => r === 'Ace' ? ace(s) : LAY[r] ? pips(s, r) : court(s, r)
}))

// ───────────── Рамка карти ─────────────
export interface CardArtOptions {
  /** Перевернута карта — сцена обертається на 180°, рамка й підписи лишаються. */
  rev?: boolean
  /** Текст над сценою; за замовчуванням — ключ. */
  label?: string
}

let uid = 0
export function cardArtSvg(key: string, name: string, opt: CardArtOptions = {}): string {
  const fn = ART[key] || (() => [P(star(100, 145, 40, 14), `fill="${GS}" fill-opacity=".12"`)])
  const art = fn()
  const label = opt.label != null ? opt.label : key
  // Унікальний id для градієнтів — інакше 78 SVG на сторінці ділять один <defs>
  const id = 'ca' + (++uid)
  const N = String(name).toUpperCase(), long = N.length > 13
  return `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
<defs><linearGradient id="${id}b" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#2a1e42"/><stop offset=".6" stop-color="#160f28"/><stop offset="1" stop-color="#0e0a1a"/></linearGradient>
<radialGradient id="${id}g" cx=".5" cy=".48" r=".5"><stop offset="0" stop-color="${G}" stop-opacity=".16"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></radialGradient></defs>
<rect width="200" height="300" fill="url(#${id}b)"/><rect width="200" height="300" fill="url(#${id}g)"/>
<g fill="none" stroke="${G}" stroke-width="1">
<rect x="6" y="6" width="188" height="288"/><rect x="11" y="11" width="178" height="278" opacity=".35"/>
${[[11, 11], [189, 11], [11, 289], [189, 289]].map(([x, y]) => P(star(x, y, 5, 1.6, 4), `fill="${G}" stroke="none"`)).join('')}
<path d="M24 46H80M120 46H176M24 254H176" opacity=".45"/>
</g>
<text x="100" y="42" text-anchor="middle" fill="${GS}" font-family="Cormorant Garamond,serif" font-style="italic" font-size="15" letter-spacing="3">${label}</text>
<g fill="none" stroke="${G}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" ${opt.rev ? 'transform="rotate(180 100 150)"' : ''}>${art.join('')}</g>
<text x="100" y="276" text-anchor="middle" fill="#ede4d3" font-family="Cormorant Garamond,serif" font-size="${N.length > 16 ? 11 : 13}" letter-spacing="${long ? 1.6 : 3.5}" ${N.length > 15 ? 'textLength="170" lengthAdjust="spacingAndGlyphs"' : ''}>${N}</text>
</svg>`
}

/** Карта з TAROT_DATA. suit не передаємо для Старших арканів. */
export function cardSvg(c: MajorCard | MinorCard, suit?: SuitKey, opt: CardArtOptions = {}): string {
  if (suit) {
    const r = (c as MinorCard).r
    return cardArtSvg(suit + ':' + r, c.ua, { label: /^(Page|Knight|Queen|King)$/.test(r) ? '✦' : ROM[r], ...opt })
  }
  return cardArtSvg((c as MajorCard).rom, c.ua, opt)
}

export const minorLabel = (r: string) => ROM[r] || r

// Бекенд (DrawnCardDto) віддає лише українську назву карти — шукаємо її в колоді.
// Апострофи вирівнюємо: LLM чи БД можуть повернути ’ або ʼ замість '.
const normName = (s: string) => s.trim().toLowerCase().replace(/[’ʼ`]/g, "'")
const BY_NAME = new Map<string, { c: MajorCard | MinorCard; suit?: SuitKey }>([
  ...TAROT_DATA.majorArcana.map(c => [normName(c.ua), { c }] as const),
  ...(Object.keys(TAROT_DATA.minorMeanings) as SuitKey[]).flatMap(s =>
    TAROT_DATA.minorMeanings[s].cards.map(c => [normName(c.ua), { c, suit: s }] as const)),
])

/** SVG за українською назвою; невідома назва — нейтральна зірка з підписом. */
export function cardSvgByName(ua: string, opt: CardArtOptions = {}): string {
  const f = BY_NAME.get(normName(ua))
  return f ? cardSvg(f.c, f.suit, opt) : cardArtSvg('', ua, { label: '✦', ...opt })
}
