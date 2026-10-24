// Small code-native pixel silhouettes; no emoji/font-dependent artwork or GPU textures.
const paths={
 powerStrike:'M23 3h6v6h-3v3h-3v3h-3v3h-3v3h-3l-3 3-3-3 3-3v-3h3v-3h3v-3h3V6h3z M5 23h4v4H5z',
 doubleAttack:'M5 3h4v13l4 4-3 3-5-5z M19 3h4v13l4 4-3 3-5-5z M4 24h5v5H4z M18 24h5v5h-5z',
 doubleShot:'M3 8h19V4l7 6-7 6v-4H3z M3 22h19v-4l7 6-7 6v-4H3z',
 energyBall:'M12 5h8v3h5v5h3v8h-3v5h-5v3h-8v-3H7v-5H4v-8h3V8h5z M1 2h4v4H1z M26 1h4v4h-4z',
 regeneration:'M13 3h6v8h8v6h-8v12h-6V17H5v-6h8z M2 23h5v5H2z M25 23h5v5h-5z'
};
export const abilityIcon=id=>`<svg viewBox="0 0 32 32" aria-hidden="true" class="destiny-icon" shape-rendering="crispEdges"><path d="${paths[id]??''}" fill="currentColor"/><path d="M14 10h4v4h-4z" fill="#fff1c0"/></svg>`;
