# Iteração 22.2 — diagnóstico inicial

Populações confirmadas na seed pública 217021: 5 Slimes/1 lobo, 8/3 e 9/5. Respawn v1: Slime 24 s, lobo 32 s, distância de segurança 6. O servidor tenta apenas o ponto original a cada tick vencido; não conhece câmera nem mantém contadores de tentativas. A câmera orbital tem zoom limitado a 30, mas proporção de viewport não é transmitida. Visibilidade exata não pode ser prometida; usar envelope conservador e respawn pendente.

Superfícies atuais permitem rampas ascendentes e pisos retangulares sem obstáculos próprios. Caverna exige alturas negativas, colisores por superfície e monstros que se movam na própria superfície sem atravessar conectores. Persistência online já possui transações de mortes, loot privado e personagens; estender de forma aditiva para o encontro e suas recompensas atômicas.

Não acessar dados remotos, apagar saves ou alterar os arquivos-base. Capacidade e carga serão verificadas localmente.
