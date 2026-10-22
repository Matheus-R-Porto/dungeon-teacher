import fs from 'node:fs';
import path from 'node:path';
const latest=kind=>{
 const dirs=fs.readdirSync('.logs').filter(n=>n.startsWith('iteration221-benchmark-'+kind+'-')).sort().reverse();
 for(const dir of dirs){const file=path.join('.logs',dir,'report.json');if(fs.existsSync(file)){const r=JSON.parse(fs.readFileSync(file));if(r.ok)return {file,...r};}}
 throw Error('No completed benchmark: '+kind);
};
const before=latest('v1'),after=latest('v2');
fs.writeFileSync('docs/ITERACAO-22.1-DESEMPENHO.json',JSON.stringify({before,after},null,2));
const f=n=>Number(n).toFixed(2),mib=n=>f(n/1048576);
let text=`# Iteração 22.1 — medições locais

Referência: ${before.file}. Atual: ${after.file}.

Windows; ${after.environment.cpu.trim()}; Node ${after.environment.node}; ${after.benchmarks[0].inventory.gpuRenderer}.
Um Electron real em ${after.benchmarks[0].inventory.width}×${after.benchmarks[0].inventory.height}, DPR ${after.benchmarks[0].inventory.dpr}, sombras ativas. Nos casos de 12 personagens, outros 11 são clientes de protocolo no servidor local, não 11 renderizadores. A contagem de personagens visíveis consta no JSON.

Cada amostra tem 2 s de aquecimento e 20 s de coleta. FPS = 1000 / média dos intervalos; 1% low = 1000 / média do 1% de intervalos mais lentos. p95/p99 em ms. Uma passagem por cenário, sem intervalo de confiança. A referência aplica a expansão v1 com o cliente atual; não é um executável histórico completo. Cidade animada/congelada isola as rotinas dos NPCs. Não se compara a primeira criação de mapas; pequenas travadas de carregamento continuam possíveis.

O servidor e o controlador de ensaio compartilham um processo Node. Tick Hz é contado na janela da amostra, incluindo a latência do coletor. Testes automatizados e outras janelas de ensaio foram encerrados antes da coleta. Controle de oclusão do Electron desativado nos dois casos. Frames próximos de 8,34 ms indicam um teto de apresentação: não provam capacidade gráfica ilimitada nem ganho de otimização.

| Estado | Cena | Quadros | FPS | p95 | p99 | 1% low | Draw calls | Triângulos | Materiais | Fontes de textura | Heap MiB | Tick Hz |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
`;
for(const [state,r]of [['v1',before],['v2',after]])for(const b of r.benchmarks)text+=`| ${state} | ${b.name} | ${b.frames.n} | ${f(b.fps)} | ${f(b.frames.p95)} | ${f(b.frames.p99)} | ${f(b.onePercentLow)} | ${b.inventory.drawCalls} | ${b.inventory.triangles} | ${b.inventory.materials} | ${b.inventory.textureSources} | ${mib(b.heap)} | ${f(b.tickHz)} |\n`;
const b=before.benchmarks.find(b=>b.name==='tower-twelve-grove'),a=after.benchmarks.find(b=>b.name==='tower-twelve-grove');
text+=`\nNo encontro com 12 personagens: draw calls ${b.inventory.drawCalls} → ${a.inventory.drawCalls}; triângulos ${b.inventory.triangles} → ${a.inventory.triangles}; materiais ${b.inventory.materials} → ${a.inventory.materials}; fontes de textura ${b.inventory.textureSources} → ${a.inventory.textureSources}. FPS ${f(b.fps)} → ${f(a.fps)}. Esses números documentam o custo da composição; não atribuem diferenças pequenas a otimização.\n\n`;
text+=`Heap é memória JavaScript, não VRAM. As três amostras adicionais no pavimento superior cobrem somente cerca de um minuto; variações de GC impedem concluir vazamento ou ausência dele. O PNG do ferreiro contém 2172×724 pixels: aproximadamente ${mib(2172*724*4)} MiB RGBA, sem contabilizar cópias/overhead. Não houve medição direta de utilização GPU/CPU nem teste nos computadores da escola. Não houve redução de jogadores, sombras ou regras de combate para obter estes resultados.\n`;
fs.writeFileSync('docs/ITERACAO-22.1-DESEMPENHO.md',text);
console.log(text);
