# Copilot Instructions for gpcal2

## Project Overview
- **gpcal2** is an Expo React Native app using TypeScript, with file-based routing in the `app/` directory.
- The project was scaffolded with `create-expo-app` and follows Expo conventions for builds and development.
- Android-specific code and build scripts are in the `android/` directory; most app logic is in `app/`, `components/`, and supporting folders.

## Key Workflows
- **Install dependencies:** `npm install`
- **Start development server:** `npx expo start`
- **Reset to blank app:** `npm run reset-project` (moves starter code to `app-example/`, creates blank `app/`)
- **Android builds:** Use Gradle scripts in `android/` for native builds; Expo handles JS bundling.

## Architectural Patterns
- **File-based routing:** Pages and modals are defined in `app/` using Expo Router conventions. Example: `app/(tabs)/Profile.tsx` is a tab screen.
- **Component organization:** Reusable UI components are in `components/`. Use these for consistent UI/UX.
- **Context and providers:** App-wide state is managed via React Contexts in `contexts/` and providers in `providers/`.
- **Utilities and constants:** Shared logic and data are in `utils/` and `constants/`.
- **Realm DB schemas:** Data models for local storage are in `models/realmSchemas.ts`.

## Conventions & Patterns
- **TypeScript:** All code is typed; use interfaces/types from `types.ts` and related files.
<!-- - **Theme and color scheme:** Use hooks from `hooks/` and theme data from `constants/theme.ts` for styling. -->
- **Font management:** Fonts are loaded via `providers/FontProvider.ts` and defined in `assets/fonts/`.
- **Modals:** Modal screens are placed in `app/(modals)/` and wrapped with `ModalWrapper` from `components/`.
- **Navigation:** Tabs and layouts are managed in `app/(tabs)/` and `app/_layout.tsx`.

## External Integrations
- **Expo:** Handles builds, device APIs, and development server.
- **Realm:** Used for local data persistence.
<!-- - **Custom scripts:** `scripts/reset-project.js` for project resets. -->

## Example: Adding a New Screen
1. Create a new file in `app/(modals)/` or `app/(tabs)/`, e.g., `app/(tabs)/NewScreen.tsx`.
2. Export a React component; it will be auto-routed.
3. Use shared components from `components/` and hooks from `hooks/`.

## References
- See `README.md` for setup and workflow basics.
- See `app/`, `components/`, and `contexts/` for main app logic and patterns.
- See `android/` for native build scripts and configuration.

---
**Feedback:** If any conventions or workflows are unclear, please specify which section needs more detail or examples.
