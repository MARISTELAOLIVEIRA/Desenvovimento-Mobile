
# UC Desenvolvimento Mobile (JS) — GitHub Pages

Este repositório é um template para a UC de Desenvolvimento Mobile usando **JavaScript**, priorizando **PWA** e **Expo (Snack/Expo Go)** para evitar dependência do Android Studio.

## Publicação
- Ative o GitHub Pages em **Settings → Pages** apontando para a branch `main`.
- Acesse a URL gerada para o site.

### Caminhos de arquivos (importante)
As páginas em subpastas (`lessons/`, `assignments/`) usam caminhos **relativos** para `../assets/...` para funcionar em GitHub Pages de projeto (URL inclui o nome do repositório). Se você migrar para domínio customizado onde o conteúdo fica na raiz, tudo continua funcionando.

### Service Worker & Offline
- `sw.js` implementa precache (lista estática) e estratégia network-first para navegação.
- `offline.html` serve de fallback quando a navegação falha sem conexão.
- Página de diagnóstico: `pwa-debug.html` (mostra caches, modo display e permite limpar caches / progresso).
 - Versão do cache incrementa (`mobile-v*`). Ao gerar novos ícones ou alterar arquivos existentes do precache, incremente para forçar atualização.

### Reset de progresso
Um botão "Reset" aparece ao lado do indicador de quizzes para limpar `localStorage`.

### Gerar ícones automaticamente
Script usando Sharp:
1. Instalar dependências (já listadas em `package.json`): `npm install`
2. Gerar (sem sobrescrever existentes): `npm run gen:icons`
3. Forçar sobrescrita: `npm run gen:icons -- --force`
Após gerar, publique / limpe caches (página `pwa-debug.html`).

## Estrutura
- `index.html` — Landing e navegação.
- `lessons/` — Aulas modulares.
- `assignments/` — Entregas integráveis ao GitHub Classroom.
- `assets/` — CSS/JS e manifest.
- `sw.js` — Service worker do PWA.

## Alternativas ao Android Studio
- **PWA:** App web instalável, com cache offline e APIs de dispositivo suportadas.
- **Expo:** Rodar no **Expo Go** (sem Android Studio) ou usar **Snack** (editor online).

## Licença
Use e modifique livremente para fins educacionais.
