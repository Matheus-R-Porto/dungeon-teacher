// A compatibility contract, independent of the legacy transport number.
export const RELEASE=Object.freeze({version:'0.6.15',protocol:4,assets:'native-art-40',campaign:'school-41',compatibility:'dt41-native40-campaign1'});
export const COMPATIBILITY_MESSAGE='Versões incompatíveis. Use Dungeon Teacher ADM e Aluno 0.6.15 da mesma entrega escolar.';
export const compatibleBuild=value=>value===RELEASE.compatibility;
