# Agent Guidelines & Standing Rules

## Database Write Frequency & Loop Restrictions
Never write to Firestore inside the face-detection loop (`startFaceDetection`/`matchStudent`) or any function called on every detection tick. Firestore writes are only allowed on confirmed events: successful attendance marks, registration approvals/rejections, and link generation/revocation. Debug/diagnostic logging (e.g. `matchLog`) must stay in `localStorage` only.

## Geofence Buffer & Tolerance Rules
Geofence tolerance must scale with actual GPS reading accuracy (capped at 15m), never as a flat radius override — if false rejections occur, fix the specific polygon or the reading-collection logic, not the buffer cap.
