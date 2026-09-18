# Real screenshots for the carousel

Drop PNGs in this folder and the carousel uses them. Nothing else changes: each frame already
carries the drawn screen underneath, and a photo simply covers it once it has loaded. A file that
is not here leaves the drawing in place, so this can be filled in one screen at a time.

## Names

`<screen>-<theme>.png` — one per screen, per theme:

```
board-dark.png    board-light.png
charge-dark.png   charge-light.png
live-dark.png     live-light.png
map-dark.png      map-light.png
report-dark.png   report-light.png
wear-dark.png     wear-light.png
auto-dark.png     auto-light.png
```

Both themes matter: the page follows the browser's preference, or the clock when it states none
(light 06:00–18:00, dark after), and a dark screenshot on the ivory page looks like a mistake. If
only one theme is available, supply the dark set — that is what most visitors will see in the
evening — and the drawings cover the other one.

Charge and Map cycle through several faces while they are centred. They look for a numbered file
first and fall back to the plain name above, so per-face photos are optional:

```
charge-1-…  charging now       map-1-…  chargers nearby
charge-2-…  plugged in, idle   map-2-…  a past drive
charge-3-…  session complete   map-3-…  navigating
charge-4-…  the session curve
```

## Shape

- Phone screens (board, charge, live, map, report): the app's own aspect, portrait, **no** system
  status bar cropping needed — the frame shows the whole image and crops from the bottom if it is
  taller than the slot. 1080×2400 straight off the phone is right.
- `wear-*`: the watch face, square or round; it is masked to a circle.
- `auto-*`: **landscape**, 16:10-ish — the Android Auto screen, not a phone. A phone screenshot in
  that frame will letterbox badly.

## Before taking them

Take them from a device in the app's **tutorial / demo mode**, not from a live account. Real screens
carry the home address, drive routes, charger locations and the VIN. The privacy policy discloses
those as *stored*; publishing them on the product page is a different promise, and once a PNG is on
the live site it is public and cached.

Anything that slips through anyway — a street name in a map screen, a plate, a charger that is the
driveway — crop it out before the file lands here.
