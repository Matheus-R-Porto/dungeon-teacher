# Decisões da fundação — 24/09/2026

Após o plano, o usuário autorizou começar. Esta entrega aplica a recomendação de fundação, sem implementar o RPG inteiro.

1. **Stack:** JavaScript ES Modules, HTML/CSS, Three.js 0.186.1 e Vite 8.3.1. Versões fixadas e lockfile presente. As dependências foram obtidas pelo registro npm. Nenhum serviço externo participa do jogo em execução.
2. **Representação:** mundo lógico X/Z plano, câmera ortográfica a aproximadamente 35,3° de elevação, quatro orientações de 90° e zoom limitado. Não há plataforma sobreposta nem física de salto.
3. **Colisão e navegação:** personagem circular, obstáculos circulares/retangulares e grade A* de 0,5 unidade. Obstáculos retangulares são expandidos conservadoramente para testar segmentos, evitando cortar cantos. Movimento possui subpassos e deslizamento nas paredes.
4. **Simulação:** 30 atualizações por segundo, delta limitado a cinco ticks de recuperação e renderização interpolada. Velocidade de 3,6 unidades/s. A orientação atual da câmera define WASD mesmo durante a transição.
5. **Entrada:** WASD cancela caminho; Esc cancela caminho ativo e, sem caminho, pausa. Q/E rotaciona; F interage. Mouse só envia movimento a partir do canvas, sem atravessar painéis. Abrir diálogo, perder foco ou ocultar a aba limpa teclas pressionadas e pausa a simulação.
6. **Escopo visual:** geometria própria, refúgio fixo, tenda/poço/caixas/ruínas como obstáculos de teste, sem serviços de RPG falsamente funcionais. Portal apenas informativo. Árvores com transparência contextual preservam leitura.
7. **Persistência:** não implementada nem anunciada na interface. O guia de exploração e a posição reiniciam ao recarregar. O schema completo de save permanece no plano, para ser introduzido com o primeiro estado de RPG persistente. Não foi criado um repositório em memória sem consumidor apenas para preencher a estrutura sugerida de M0.
8. **Progressão de marcos:** M1a foi implementado antes de M1b, que reutiliza suas regras de colisão. A entrega inclui ambos para permitir testar as duas formas de movimento juntas. Não se considera encerrada a homologação humana de dez minutos nem o benchmark em notebook de referência.
9. **Save/schema e testes de M0:** configuração e conteúdo do Hub são validados; testes de domínio rodam sem browser. Schemas de personagem/save e adapter IndexedDB ficam para M3, quando terão dados reais para preservar.
10. **Próximo incremento:** M2a, com inimigo e fluxo básico de combate. Manter dano, aggro, alcance e ritmo das ações fora de Three.js e da UI.

As decisões não alteram os requisitos finais da Beta. Questões escolares, regras de aluguel e balanceamento de classes continuam pendentes para seus marcos.
