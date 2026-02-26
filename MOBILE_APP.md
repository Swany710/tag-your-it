# Mobile App Architecture — NFC Tap System

## Purpose
The mobile app lets you (or your reps) do three things in the field:
1. **Write** NFC tags (program a URL onto a blank tag)
2. **Scan & identify** tags (see which rep/job it belongs to)
3. **Manage** reps and leads from the field

---

## Stack: React Native + Expo

### Why Expo?
- Same React/TypeScript skills as Next.js
- Deploy to both iOS and Android from one codebase
- NFC support via `react-native-nfc-manager`
- EAS Build makes App Store submission easy

### Core Libraries
```
expo@latest
react-native-nfc-manager      — NFC read/write
@tanstack/react-query         — API data fetching
expo-secure-store             — Token storage
react-navigation              — Screen navigation
nativewind                    — Tailwind for React Native
```

---

## Project Structure

```
nfc-tap-mobile/
  app/
    (tabs)/
      index.tsx          — Home / dashboard
      reps.tsx           — Rep list
      scanner.tsx        — NFC scanner
      leads.tsx          — Recent leads
    rep/[id].tsx         — Rep detail
    write.tsx            — Write NFC tag
  components/
    RepCard.tsx
    LeadRow.tsx
    NFCWriter.tsx
    NFCScanner.tsx
  lib/
    api.ts               — Fetch wrapper to your Railway backend
    nfc.ts               — NFC read/write helpers
    auth.ts              — Login/token management
  app.json
```

---

## NFC Write Flow (Most Important Feature)

```typescript
// lib/nfc.ts
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export async function writeTagUrl(url: string): Promise<void> {
  await NfcManager.start();
  await NfcManager.requestTechnology(NfcTech.Ndef);

  const message = [Ndef.uriRecord(url)];
  const bytes = Ndef.encodeMessage(message);

  await NfcManager.ndefHandler.writeNdefMessage(bytes);
  await NfcManager.cancelTechnologyRequest();
}

export async function readTagUid(): Promise<string | null> {
  await NfcManager.start();
  await NfcManager.requestTechnology(NfcTech.NfcA);

  const tag = await NfcManager.getTag();
  await NfcManager.cancelTechnologyRequest();

  return tag?.id ?? null;
}
```

---

## Write Screen (Key Screen)

The "Write Tag" screen in the mobile app:

1. Pick a rep from dropdown (shows Rep #1–4)
2. See the URL that will be written: `https://yourdomain.com/r/1`
3. Tap "Write Tag" button
4. Hold blank NTAG216 to back of phone
5. Success confirmation + option to register UID in admin
6. Repeat for next tag

This replaces the manual NFC Tools app for bulk production.

---

## Scanner Screen

When you scan an existing tag:
- Read the URL from the tag
- Detect rep ID from URL pattern (`/r/1` → Rep #1)
- Show: rep name, tap count today, leads count
- Quick action: Call rep, view leads

---

## API Integration

The mobile app talks to the same Railway backend:

```typescript
// lib/api.ts
const BASE = process.env.EXPO_PUBLIC_API_URL; // your Railway URL

export async function fetchReps(token: string) {
  const res = await fetch(`${BASE}/api/reps?stats=true`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchLeads(token: string, repId?: number) {
  const params = repId ? `?repId=${repId}` : '';
  const res = await fetch(`${BASE}/api/leads${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
```

Note: You'll want to add a JWT Bearer token option to the API (vs. just session cookies) for mobile. This is a 30-minute addition to the Next.js backend.

---

## NFC Hardware Notes

- **iOS**: NFC writing requires iPhone XS or newer (iOS 13+)
- **Android**: Most Android 5+ phones support NFC writing
- **Testing**: Android is more permissive — test write on Android first

---

## Bootstrap Commands

```bash
npx create-expo-app nfc-tap-mobile --template blank-typescript
cd nfc-tap-mobile
npx expo install react-native-nfc-manager
npm install @tanstack/react-query nativewind
npx expo install expo-secure-store expo-router
```

---

## Priority Build Order

**Phase 1 (week 2–3):**
- Login screen → stores JWT
- Rep list screen → mirrors admin web view
- Write NFC screen → write URL to blank tag
- Read NFC screen → scan and identify tag

**Phase 2:**
- Lead viewing from field
- Quick lead entry (no web required)
- Push notifications for new leads

---

## Cost
- Expo development: free
- EAS Build (for App Store): free tier available (25 builds/month)
- Apple Developer: $99/year (needed for App Store / real device testing)
- Google Play: $25 one-time
