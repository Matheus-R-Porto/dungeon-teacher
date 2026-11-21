import {classIcon} from './class-icons.js';
// Small code-native pixel silhouettes; no emoji/font-dependent artwork or GPU textures.
const paths={
 physicalTraining:'M3 15h5V8h5v7h3V5h5v10h5v11H8v-5H3z M4 28h22v3H4z',
 attackSpeed:'M5 3h8v14h12v10H3v-8h2z M20 1h9l-5 8h6L17 22l4-11h-5z',
 hpRecovery:'M3 8h3V5h6v3h6V5h6v3h3v10h-3v3h-3v3h-3v3h-6v-3H9v-3H6v-3H3z M13 9h4v5h5v4h-5v5h-4v-5H8v-4h5z',
 mpRecovery:'M13 2h5v5h3v5h4v5h3v8h-5v4H8v-4H3v-8h4v-5h3V7h3z M12 17h3v-4h4v4h4v4h-4v4h-4v-4h-3z',
 magicTraining:'M3 3h11l2 3 2-3h11v23H18l-2 3-2-3H3z M6 7h5v3H6z M6 13h5v3H6z M21 6h5l-4 8h5l-9 10 3-9h-4z',
 powerStrike:'M23 3h6v6h-3v3h-3v3h-3v3h-3v3h-3l-3 3-3-3 3-3v-3h3v-3h3v-3h3V6h3z M5 23h4v4H5z',
 doubleAttack:'M5 3h4v13l4 4-3 3-5-5z M19 3h4v13l4 4-3 3-5-5z M4 24h5v5H4z M18 24h5v5h-5z',
 doubleShot:'M3 8h19V4l7 6-7 6v-4H3z M3 22h19v-4l7 6-7 6v-4H3z',
 energyBall:'M12 5h8v3h5v5h3v8h-3v5h-5v3h-8v-3H7v-5H4v-8h3V8h5z M1 2h4v4H1z M26 1h4v4h-4z',
 regeneration:'M13 3h6v8h8v6h-8v12h-6V17H5v-6h8z M2 23h5v5H2z M25 23h5v5h-5z'
};
export const abilityIcon=id=>classIcon(id)||`<svg viewBox="0 0 32 32" aria-hidden="true" class="destiny-icon" shape-rendering="crispEdges"><path d="${paths[id]??''}" fill="currentColor"/><path d="M14 10h4v4h-4z" fill="#fff1c0"/></svg>`;
