# World Cup 2026 Bracket Builder

A small, dependency-free JavaScript project for a fun code review exercise.

The page displays a full-width circular World Cup-style knockout bracket with crisp, stepped connector lines. Users can drag flags into later rounds, click-to-place flags, double-click to auto-advance a team, clear progress, reset the bracket, and open a small modal for team selection. Team movement is saved to `localStorage`, so the bracket survives a browser refresh on the same device/browser.

## Files

```text
world-cup-review-bracket/
├── index.html
├── styles.css
├── app.js
├── jira-ticket.md
└── README.md
```

## How to run

You can open `index.html` directly in a browser.

Or run a tiny local server:

```bash
cd world-cup-review-bracket
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Code review exercise

For the review session, start by reading `jira-ticket.md` before looking at the code.

Suggested review flow:

1. Read the ticket and acceptance criteria.
2. Check whether the implementation solves the requested behavior.
3. Review branch/project structure.
4. Review JavaScript state management and event handling.
5. Review accessibility and keyboard/mouse usability.
6. Review CSS responsiveness.
7. Review browser storage behavior and state validation.
8. Review the modal implementation.
9. Identify what should be automated with linting/formatting.
10. Decide whether you would approve, request changes, or leave suggestions.

## Things worth discussing during the review

- Is the state shape simple enough?
- Is the drag/drop behavior understandable?
- Should advancing a team copy or move the flag?
- Are browser errors handled well enough?
- Are the stepped connector lines neat and easy to follow?
- Is the UI usable on smaller screens?
- Are the functions small and readable?
- Are there magic numbers that should become named constants?
- Should modal focus be trapped for stronger accessibility?
- Should the team list be fetched, configured, or kept static?

## Local storage behavior

The bracket uses this key:

```js
worldCupBracketBuilder:v1
```

The app saves whenever a team is placed, auto-advanced, cleared, or reset. Saved data is validated when the page loads, so invalid team IDs or broken saved data do not crash the page.

