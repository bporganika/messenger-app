# 🚀 Pulse Messenger — Полная инструкция установки

## Что в этом пакете

```
.claude/skills/
├── pulse-design/SKILL.md    — Дизайн-система (темы, токены, компоненты, анимации)
├── pulse-arch/SKILL.md      — Архитектура (БД, API, Socket, WebRTC, структура проекта)
├── pulse-screens/SKILL.md   — Все экраны (блюпринты, навигация, жесты, push)
└── quality-check/SKILL.md   — Чеклист качества перед коммитом

CLAUDE.md                    — Главный файл контекста проекта
```

Claude Code читает эти файлы АВТОМАТИЧЕСКИ при старте. Не нужно ничего вручную подключать.

---

## Шаг 1: Установи необходимое

```bash
# Node.js 22 (через nvm)
nvm install 22
nvm use 22

# Claude Code
npm install -g @anthropic-ai/claude-code

# Первый запуск (авторизация через браузер)
claude
# Ctrl+C после успешной авторизации
```

## Шаг 2: Подключи MCP-серверы

```bash
# GitHub — управление репозиторием, PR, issues
claude mcp add github -- npx -y @modelcontextprotocol/server-github
# Потом в терминале: export GITHUB_TOKEN=ghp_ваш_токен

# Context7 — актуальная документация React Native, WebRTC, Fastify и т.д.
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Sequential Thinking — помогает разбивать сложные задачи на шаги
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking

# Memory — запоминает решения между сессиями
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

# Проверь что всё работает:
claude mcp list
```

## Шаг 3: Создай проект и скопируй скилы

```bash
# Создай корневую папку
mkdir pulse && cd pulse

# Распакуй архив со скилами СЮДА (в корень pulse/)
# .claude/ и CLAUDE.md должны быть в корне
unzip ~/Downloads/pulse-skills-pack.zip

# Проверь:
ls -la .claude/skills/
# Должно показать: pulse-arch/ pulse-design/ pulse-screens/ quality-check/
cat CLAUDE.md
# Должно показать описание проекта
```

## Шаг 4: Запусти Claude Code и начни строить

```bash
cd pulse
claude
```

---

## Порядок промптов для Claude Code

### Фаза 1: Инфраструктура (1 день)

**Промпт 1:**
> Настрой монорепо с npm workspaces. Структура: packages/shared (types, schemas, constants), apps/mobile (React Native bare workflow + TypeScript), apps/server (Node.js + Fastify + Prisma). Создай package.json в корне, tsconfig.base.json, и package.json в каждом workspace.

**Промпт 2:**
> Инициализируй React Native приложение в apps/mobile с TypeScript template. Установи все зависимости из CLAUDE.md: react-navigation, reanimated, react-native-webrtc, callkeep, socket.io-client, zustand, tanstack query, fast-image, biometrics, i18next, react-native-contacts.

**Промпт 3:**
> Создай дизайн-систему в apps/mobile/src/design-system/ по спецификации из скила pulse-design: tokens.ts (все цвета, spacing, radius), theme.ts (ThemeProvider с dark/light/auto), typography.ts (Plus Jakarta Sans + JetBrains Mono), animations.ts (spring configs), haptics.ts (feedback helpers).

### Фаза 2: UI-компоненты (2-3 дня)

**Промпт 4:**
> Создай все UI-примитивы в apps/mobile/src/components/ui/ по спецификации из pulse-design: Text (обёртка над RN Text с типографикой), Button (primary/secondary/ghost/danger, все размеры, haptic, spring анимация), Input, Avatar (с online-кольцом), Badge, IconButton, GlassCard, Toast, Skeleton, BottomSheet, Modal, Switch, Divider, EmptyState.

**Промпт 5:**
> Создай chat-компоненты: ChatListItem, ChatBubble (sent/received, текст/фото/видео/голос/документ), MessageInput (с кнопками attach и mic/send), TypingIndicator (3 dots wave), ReplyPreview, VoiceRecorder (hold-to-record), VoicePlayer (waveform), PhotoBubble, VideoBubble, DocumentBubble, MessageStatus (✓ ✓✓ галочки).

### Фаза 3: Бэкенд (2-3 дня)

**Промпт 6:**
> Настрой Fastify сервер в apps/server. Создай Prisma схему из скила pulse-arch (все модели: User, Session, OTP, Conversation, Message, Attachment, Call, Contact, Block, Report, PushToken). Запусти миграцию.

**Промпт 7:**
> Реализуй авторизацию: POST /auth/otp/send (SMS через Twilio), POST /auth/otp/verify, POST /auth/google (верификация Google ID token), POST /auth/apple (верификация Apple identity token), POST /auth/refresh, POST /auth/logout. Single-device: при новом входе убивай старую сессию.

**Промпт 8:**
> Добавь Socket.IO в сервер. Реализуй все события из скила pulse-arch: message:send/delivered/read/delete, typing:start/stop, user:online/offline, session:revoked.

### Фаза 4: Экраны (3-5 дней)

**Промпт 9:**
> Создай навигацию по карте из скила pulse-screens: RootNavigator (auth check), AuthStack (Welcome→Phone→OTP→ProfileSetup), MainTabs (Chats/Calls/Contacts/Settings), ChatStack.

**Промпт 10:**
> Создай WelcomeScreen с кнопками Apple/Google/Phone/Email по блюпринту из pulse-screens. Анимированный вход: staggered fade-up.

**Промпт 11:**
> Создай PhoneAuthScreen + OTPScreen. Страна-пикер с флагами, авто-формат номера, 6 отдельных digit-boxes для OTP, auto-read SMS, shake на ошибку.

**Промпт 12:**
> Создай ProfileSetupScreen: аватар (камера/галерея), имя, фамилия, @username (проверка уникальности в реальном времени), пол (radio). Только для новых пользователей.

**Промпт 13:**
> Создай ChatListScreen по блюпринту. Search, swipe-actions (archive/delete), unread badges, online dots, last message preview с иконками типов (📷🎬🎤📎).

**Промпт 14:**
> Создай ChatScreen — самый сложный экран. Inverted FlatList, все типы bubbles, typing indicator, message input с attach/voice/send, swipe-to-reply, read receipts, cursor pagination.

**Промпт 15:**
> Создай CallHistoryScreen: список входящих/исходящих/пропущенных с иконками (↙↗↙🔴). Tap → перезвонить. Tap avatar → профиль.

**Промпт 16:**
> Создай ContactsScreen: поиск по @username/телефону, кнопка синхронизации контактов (с запросом разрешения), invite-ссылка.

**Промпт 17:**
> Создай все Settings экраны: EditProfile, Notifications (звук/вибрация/mute), Privacy (видимость телефона/статуса/аватара), Language (en/tr/de/fr), Appearance (dark/light/auto с превью), AppLock (PIN + biometric toggle), Storage (кэш + очистка), DeleteAccount.

### Фаза 5: Звонки (2-3 дня)

**Промпт 18:**
> Реализуй WebRTC signaling на сервере (Socket.IO) по схеме из pulse-arch: call:initiate, offer/answer/ice-candidate, accept/reject/end/busy.

**Промпт 19:**
> Создай VoiceCallScreen с пульсирующими кольцами вокруг аватара, таймером, кнопками mute/speaker/video/end. CallKit (iOS) и ConnectionService (Android) через react-native-callkeep.

**Промпт 20:**
> Создай VideoCallScreen: full-screen remote video, draggable PiP local video, auto-hide controls, camera flip. VoIP push для входящих на заблокированном экране.

### Фаза 6: Полировка (2 дня)

**Промпт 21:**
> Создай LockScreen: PIN ввод (numpad) + биометрия. Показывается при каждом открытии если включено. Проверяй при AppState change (background→active).

**Промпт 22:**
> Настрой push-уведомления: FCM для сообщений, VoIP push (iOS) для звонков. Deep linking: tap уведомление → открывает нужный чат/звонок.

**Промпт 23:**
> Добавь i18n: все строки через i18next. Создай файлы en.json, tr.json, de.json, fr.json. Авто-определение языка + ручная смена в настройках.

**Промпт 24:**
> Проведи quality-check по всем экранам. Проверь каждый пункт из чеклиста.
