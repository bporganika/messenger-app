# Pulse Messenger — v1.0

## Product Vision
Мессенджер для обмена сообщениями и звонками 1-на-1.
Платформы: iOS + Android (React Native).
Дизайн: с нуля, awwwards-уровень, без фирменного стиля — создаём свой.
Регионы запуска: Турция и Европа.
Монетизация v1: бесплатно.

---

## V1 Scope — Что делаем

### Ограничения v1
- Шифрование: стандартное TLS (E2E — следующая версия)
- Один аккаунт = одно устройство одновременно
- Файлы: максимум 100 МБ
- Только личные чаты (группы — следующая версия)
- Звонки: только 1-на-1 (голос + видео)

### Регистрация и вход
- По номеру телефона (OTP как в WhatsApp)
- По email
- Вход через Google (OAuth)
- Вход через Apple (Sign in with Apple)
- Поля при регистрации: имя, фамилия, уникальный @юзернейм, пол
- После входа на новом устройстве — предыдущая сессия завершается

### Профиль пользователя
Что видит другой пользователь:
- Аватар (фото профиля)
- Имя, фамилия
- @юзернейм
- Номер телефона (скрыт или виден контактам — настройка)
- Кнопка «Заблокировать»
- Кнопка «Пожаловаться»

### Поиск и добавление контактов
- Автоматически: кто из телефонной книги уже зарегистрирован
- Поиск по номеру телефона
- Поиск по @юзернейму
- Личная ссылка-приглашение (deeplink)
- Синхронизация с телефонной книгой: опциональная (пользователь сам решает)

### Типы сообщений
- ✏️ Текстовые (эмодзи встроены)
- 🖼️ Фотографии (из галереи + камера)
- 🎬 Видеофайлы
- 🎤 Голосовые сообщения
- 📎 Документы и файлы (PDF, Word и т.д. — до 100 МБ)

### Функции сообщений
- ✓✓ Статус «доставлено» / «прочитано» (галочки)
- ↩️ Ответить на конкретное сообщение (reply)
- Удаление сообщений

### Звонки
- Голосовые звонки 1-на-1
- Видеозвонки 1-на-1
- Выключить микрофон
- Переключить камеру (фронт/тыл)
- 🔔 Полноэкранное уведомление о входящем на заблокированном экране (CallKit iOS / ConnectionService Android)
- История звонков: входящие / исходящие / пропущенные

### Темы оформления
- Тёмная тема
- Светлая тема
- 📱 Авто: следовать теме телефона

### Настройки
- 🖼️ Смена фото профиля / аватара
- 🔔 Уведомления (звук, вибрация, беззвучно)
- 🔒 Конфиденциальность (кто видит статус и фото)
- 🌐 Смена языка интерфейса
- 🎨 Смена темы (тёмная / светлая / авто)
- 🧹 Очистка кэша и хранилища
- ⚠️ Удаление аккаунта

### Push-уведомления
- 💬 Новые сообщения
- 📞 Входящий звонок (VoIP push на iOS)

### Безопасность доступа
- 👤 Face ID / Touch ID (биометрика)
- 🔢 PIN-код при каждом открытии

---

## НЕ делаем в v1
- Групповые чаты
- E2E шифрование
- Мультидевайс (только одно устройство)
- Статусы/сторис
- Каналы/боты
- Платные функции

---

## Tech Stack
- **Mobile**: React Native 0.76+ (bare workflow) + TypeScript
- **State**: Zustand + TanStack React Query
- **Navigation**: React Navigation 7 (native stack)
- **Animations**: react-native-reanimated 3
- **Calls**: react-native-webrtc + react-native-callkeep (CallKit/ConnectionService)
- **VoIP push iOS**: react-native-voip-push-notification
- **Real-time**: Socket.IO
- **Backend**: Node.js + Fastify + Prisma
- **Database**: PostgreSQL + Redis
- **Storage**: S3-compatible (media, files up to 100MB)
- **Auth**: JWT + Google OAuth + Apple Sign-In + OTP (Twilio/custom)
- **Push**: Firebase FCM (Android + iOS) + APNs VoIP (iOS)
- **i18n**: react-native-localize + i18next (Turkish, English, German, Russish)
- **Biometrics**: react-native-biometrics
- **Contacts**: react-native-contacts (optional sync)

## Project Structure
```
/pulse
├── CLAUDE.md
├── .claude/skills/
├── packages/shared/         # Types, schemas, constants, i18n keys
├── apps/mobile/             # React Native app
│   └── src/
│       ├── app/             # Entry, Providers
│       ├── navigation/      # Auth, Main, Chat stacks
│       ├── screens/         # All screens
│       ├── components/      # UI primitives + feature components
│       ├── design-system/   # Tokens, theme, typography, animations
│       ├── services/        # API, Socket, WebRTC, Push
│       ├── stores/          # Zustand stores
│       ├── hooks/           # Custom hooks
│       ├── i18n/            # Localization files
│       └── utils/           # Helpers
└── apps/server/             # Node.js backend
    └── src/
        ├── routes/          # REST API
        ├── services/        # Business logic
        ├── websocket/       # Socket.IO handlers
        ├── middleware/       # Auth, validation, rate limit
        └── prisma/          # Schema + migrations
```

## Coding Rules
- NO `any` types
- NO unstyled default RN components
- NO ActivityIndicator — skeleton/shimmer only
- NO Alert.alert() — custom modal/toast only
- EVERY list → FlatList or FlashList
- EVERY animation → Reanimated (not Animated API)
- EVERY interactive element → haptic feedback
- EVERY screen → loading + empty + error states
- Components < 200 lines
- All strings through i18n (no hardcoded text for UI)
- RTL support ready (for future Arabic if needed)

## Git
- Conventional commits: feat:, fix:, chore:, style:
- Branch: feature/*, fix/*, chore/*
