# JIRA Ticket: WC-2026-001

## Title

Create an interactive World Cup 2026 bracket builder

## User story

As a football fan, I want a simple interactive World Cup bracket page so that I can drag teams through the tournament and predict who wins.

## Background

The design should be inspired by a circular World Cup bracket poster. The page should feel fun, lightweight, and easy to use during a team demo or code review session.

## Acceptance criteria

1. The page displays a circular World Cup-style knockout bracket with clean, stepped connector lines between rounds.
2. The main bracket section uses the full page width instead of sharing space with a permanent sidebar.
3. The first round starts with 32 team flags.
4. A user can drag a flag into a later-round slot.
5. A user can click a flag and then click a target slot to place it.
6. A user can double-click a flag to advance it automatically to the next round.
7. A user can clear later-round progress without resetting the opening round.
8. A user can reset the whole bracket to the original state.
9. Team selection and the team pool are available inside a modal that can be toggled on and off.
10. The bracket state is saved in the browser and survives refresh.
11. The project works without external JavaScript packages.
12. The layout remains usable on desktop and smaller screens.
13. When a team is moved, auto-advanced, cleared, or reset, the latest bracket state is saved to local storage.
14. Reloading the page restores the saved bracket state.

## Out of scope

- Real World Cup data integration.
- Login/accounts.
- Sharing brackets online.
- Backend storage.
- Official FIFA branding/assets.
- Exporting bracket picks.

## Manual test cases

### Test 1: Initial page load

Steps:
1. Open `index.html`.
2. Confirm the bracket appears.
3. Confirm 32 teams appear around the outer ring.
4. Confirm there is no permanent right sidebar.
5. Confirm the bracket connector lines are straight/stepped instead of curved.

Expected result:
- The bracket loads with empty later rounds and filled opening-round slots.
- The bracket area uses the main page width.
- The route between rounds uses neat square-style connector lines.

### Test 2: Drag to later round

Steps:
1. Drag any opening-round flag into a Round of 16 slot.

Expected result:
- The selected team appears in that Round of 16 slot.
- The original opening-round flag remains in place.

### Test 3: Click-to-place

Steps:
1. Click a team flag.
2. Click an empty later-round slot.

Expected result:
- The selected team appears in the target slot.
- The selected team indicator resets.

### Test 4: Double-click auto-advance

Steps:
1. Double-click an opening-round team.

Expected result:
- The team appears in the correct next-round slot.

### Test 5: Clear progress

Steps:
1. Place several teams into later rounds.
2. Click **Clear progress**.

Expected result:
- Later rounds are cleared.
- Opening-round teams remain.

### Test 6: Reset all

Steps:
1. Change opening-round teams or progress.
2. Click **Reset all**.

Expected result:
- The bracket returns to its original state.

### Test 7: Team modal

Steps:
1. Click **Teams & selection**.
2. Confirm the modal opens.
3. Select a team from the team pool.
4. Close the modal.
5. Click a bracket slot.

Expected result:
- The selected team can be chosen from the modal and placed into the bracket.
- The modal can be closed with the close button, backdrop click, or Escape key.

### Test 8: Local storage persistence

Steps:
1. Move a team into a later round.
2. Refresh the browser.

Expected result:
- The moved team remains in the same bracket slot after refresh.

### Test 9: Clear saved state with reset

Steps:
1. Move teams around the bracket.
2. Click **Reset all**.
3. Refresh the browser.

Expected result:
- The bracket stays reset after refresh.

## Reviewer questions

- Does the code meet all acceptance criteria?
- Is the event handling easy to follow?
- Is browser storage handled safely enough?
- Is the modal implementation accessible enough?
- Is the UI usable without reading the code?
- Are constants and function names clear?
- Should any behavior be split into smaller functions?
- Would you approve this PR as-is?
