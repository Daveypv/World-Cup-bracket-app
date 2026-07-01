const BOARD_SIZE = 1100;
const CENTER = BOARD_SIZE / 2;
const TOTAL_TEAMS = 32;
const STORAGE_KEY = 'worldCupBracketBuilder:v1';

const TEAMS = [
  { id: 'fra', code: 'FRA', name: 'France', flag: '🇫🇷' },
  { id: 'par', code: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
  { id: 'ger', code: 'GER', name: 'Germany', flag: '🇩🇪' },
  { id: 'bra', code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { id: 'jpn', code: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { id: 'civ', code: 'CIV', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { id: 'nor', code: 'NOR', name: 'Norway', flag: '🇳🇴' },
  { id: 'mex', code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { id: 'ecu', code: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  { id: 'eng', code: 'ENG', name: 'England', flag: '🇬🇧' },
  { id: 'cod', code: 'COD', name: 'DR Congo', flag: '🇨🇩' },
  { id: 'arg', code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { id: 'cpv', code: 'CPV', name: 'Cape Verde', flag: '🇨🇻' },
  { id: 'aus', code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { id: 'egy', code: 'EGY', name: 'Egypt', flag: '🇪🇬' },
  { id: 'sui', code: 'SUI', name: 'Switzerland', flag: '🇨🇭' },
  { id: 'alg', code: 'ALG', name: 'Algeria', flag: '🇩🇿' },
  { id: 'col', code: 'COL', name: 'Colombia', flag: '🇨🇴' },
  { id: 'gha', code: 'GHA', name: 'Ghana', flag: '🇬🇭' },
  { id: 'sen', code: 'SEN', name: 'Senegal', flag: '🇸🇳' },
  { id: 'bel', code: 'BEL', name: 'Belgium', flag: '🇧🇪' },
  { id: 'bih', code: 'BIH', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { id: 'usa', code: 'USA', name: 'United States', flag: '🇺🇸' },
  { id: 'aut', code: 'AUT', name: 'Austria', flag: '🇦🇹' },
  { id: 'esp', code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { id: 'cro', code: 'CRO', name: 'Croatia', flag: '🇭🇷' },
  { id: 'por', code: 'POR', name: 'Portugal', flag: '🇵🇹' },
  { id: 'mar', code: 'MAR', name: 'Morocco', flag: '🇲🇦' },
  { id: 'ned', code: 'NED', name: 'Netherlands', flag: '🇳🇱' },
  { id: 'can', code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { id: 'rsa', code: 'RSA', name: 'South Africa', flag: '🇿🇦' },
  { id: 'swe', code: 'SWE', name: 'Sweden', flag: '🇸🇪' },
];

const ROUNDS = [
  { key: 'round32', label: 'Round of 32', count: 32, radius: 500 },
  { key: 'round16', label: 'Round of 16', count: 16, radius: 382 },
  { key: 'quarter', label: 'Quarter-final', count: 8, radius: 270 },
  { key: 'semi', label: 'Semi-final', count: 4, radius: 168 },
  { key: 'final', label: 'Final', count: 2, radius: 92 },
  { key: 'winner', label: 'Winner', count: 1, radius: 0 },
];

const teamById = new Map(TEAMS.map((team) => [team.id, team]));
const roundByKey = new Map(ROUNDS.map((round, index) => [round.key, { ...round, index }]));

const bracketLines = document.querySelector('#bracketLines');
const bracketSlots = document.querySelector('#bracketSlots');
const teamPool = document.querySelector('#teamPool');
const selectedTeam = document.querySelector('#selectedTeam');
const toast = document.querySelector('#toast');
const teamModal = document.querySelector('#teamModal');
const modalToggleButton = document.querySelector('#modalToggleButton');
const modalCloseButton = document.querySelector('#modalCloseButton');
const modalBackdrop = document.querySelector('#modalBackdrop');

let state = loadState();
let selected = null;
let toastTimer = null;

function createInitialState() {
  const initialState = {};

  ROUNDS.forEach((round) => {
    for (let index = 0; index < round.count; index += 1) {
      initialState[getSlotId(round.key, index)] = null;
    }
  });

  TEAMS.forEach((team, index) => {
    initialState[getSlotId('round32', index)] = team.id;
  });

  return initialState;
}

function loadState() {
  const initialState = createInitialState();

  try {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
      return initialState;
    }

    return normalizeSavedState(JSON.parse(savedState), initialState);
  } catch (error) {
    console.warn('Could not load saved bracket state.', error);
    return initialState;
  }
}

function normalizeSavedState(savedState, initialState) {
  if (!savedState || typeof savedState !== 'object' || Array.isArray(savedState)) {
    return initialState;
  }

  return Object.keys(initialState).reduce((nextState, slotId) => {
    const savedTeamId = savedState[slotId];
    const isValidTeam = savedTeamId === null || teamById.has(savedTeamId);

    return {
      ...nextState,
      [slotId]: isValidTeam ? savedTeamId : initialState[slotId],
    };
  }, initialState);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Could not save bracket state.', error);
  }
}

function getSlotId(roundKey, index) {
  return `${roundKey}-${index}`;
}

function parseSlotId(slotId) {
  const lastDashIndex = slotId.lastIndexOf('-');
  const roundKey = slotId.slice(0, lastDashIndex);
  const index = Number(slotId.slice(lastDashIndex + 1));

  return { roundKey, index };
}

function getSlotPosition(roundIndex, slotIndex) {
  const round = ROUNDS[roundIndex];

  if (round.count === 1) {
    return { x: CENTER, y: CENTER, angle: 0, radius: 0 };
  }

  const step = 360 / TOTAL_TEAMS;
  const teamsPerSlot = TOTAL_TEAMS / round.count;
  const angleDegrees = -90 + (slotIndex + 0.5) * teamsPerSlot * step;
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    x: CENTER + Math.cos(angleRadians) * round.radius,
    y: CENTER + Math.sin(angleRadians) * round.radius,
    angle: angleRadians,
    radius: round.radius,
  };
}

function render() {
  renderLines();
  renderSlots();
  renderTeamPool();
  renderSelectedTeam();
}

function renderLines() {
  bracketLines.innerHTML = '';

  ROUNDS.slice(0, -1).forEach((round, roundIndex) => {
    const nextRound = ROUNDS[roundIndex + 1];

    for (let parentIndex = 0; parentIndex < nextRound.count; parentIndex += 1) {
      const parentPosition = getSlotPosition(roundIndex + 1, parentIndex);
      const childPositions = [
        getSlotPosition(roundIndex, parentIndex * 2),
        getSlotPosition(roundIndex, parentIndex * 2 + 1),
      ];
      const connector = createSteppedConnector(childPositions, parentPosition, round, nextRound);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      path.setAttribute('d', connector.pathData);
      path.setAttribute('class', 'connector');
      bracketLines.appendChild(path);

      if (connector.mergePoint) {
        addConnectorNode(connector.mergePoint.x, connector.mergePoint.y, 3);
      }

      addConnectorNode(parentPosition.x, parentPosition.y, nextRound.key === 'winner' ? 5 : 4);
    }
  });
}

function createSteppedConnector(childPositions, parentPosition, childRound, parentRound) {
  const [firstChild, secondChild] = childPositions;

  if (parentRound.key === 'winner') {
    return {
      mergePoint: null,
      pathData: [
        `M ${firstChild.x} ${firstChild.y} L ${parentPosition.x} ${parentPosition.y}`,
        `M ${secondChild.x} ${secondChild.y} L ${parentPosition.x} ${parentPosition.y}`,
      ].join(' '),
    };
  }

  const mergeRadius = parentRound.radius + (childRound.radius - parentRound.radius) * 0.45;
  const firstElbow = getPolarPoint(firstChild.angle, mergeRadius);
  const secondElbow = getPolarPoint(secondChild.angle, mergeRadius);
  const mergePoint = getPolarPoint(parentPosition.angle, mergeRadius);

  return {
    mergePoint,
    pathData: [
      `M ${firstChild.x} ${firstChild.y} L ${firstElbow.x} ${firstElbow.y} L ${mergePoint.x} ${mergePoint.y}`,
      `M ${secondChild.x} ${secondChild.y} L ${secondElbow.x} ${secondElbow.y} L ${mergePoint.x} ${mergePoint.y}`,
      `M ${mergePoint.x} ${mergePoint.y} L ${parentPosition.x} ${parentPosition.y}`,
    ].join(' '),
  };
}

function getPolarPoint(angle, radius) {
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function addConnectorNode(x, y, radius) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r', radius);
  circle.setAttribute('class', 'connector-node');
  bracketLines.appendChild(circle);
}

function renderSlots() {
  bracketSlots.innerHTML = '';

  ROUNDS.forEach((round, roundIndex) => {
    for (let index = 0; index < round.count; index += 1) {
      const slotId = getSlotId(round.key, index);
      const position = getSlotPosition(roundIndex, index);
      const teamId = state[slotId];
      const team = teamById.get(teamId);
      const slot = document.createElement('div');

      slot.className = ['slot', team ? '' : 'is-empty', round.key === 'winner' ? 'winner' : '']
        .filter(Boolean)
        .join(' ');
      slot.dataset.slotId = slotId;
      slot.dataset.label = `${round.label}${round.count > 1 ? ` ${index + 1}` : ''}`;
      slot.style.left = `${position.x}px`;
      slot.style.top = `${position.y}px`;
      slot.title = slot.dataset.label;

      slot.addEventListener('dragover', handleDragOver);
      slot.addEventListener('dragleave', handleDragLeave);
      slot.addEventListener('drop', handleDrop);
      slot.addEventListener('click', () => handleSlotClick(slotId));
      slot.addEventListener('contextmenu', (event) => handleClearSlot(event, slotId));

      if (team) {
        slot.appendChild(createTeamToken(team, slotId));

        if (round.key !== 'round32') {
          slot.appendChild(createClearButton(slotId));
        }
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'placeholder';
        placeholder.textContent = round.key === 'winner' ? 'Winner' : 'Drop';
        slot.appendChild(placeholder);
      }

      bracketSlots.appendChild(slot);
    }
  });
}

function createTeamToken(team, slotId) {
  const token = document.createElement('button');
  token.type = 'button';
  token.className = 'team-token';
  token.draggable = true;
  token.dataset.teamId = team.id;
  token.dataset.sourceSlotId = slotId;
  token.title = `${team.name} — drag, click, or double-click to advance`;
  token.setAttribute('aria-label', `${team.name}, ${team.code}`);

  if (selected?.teamId === team.id && selected?.sourceSlotId === slotId) {
    token.classList.add('is-selected');
  }

  token.innerHTML = `
    <span class="flag" aria-hidden="true">${team.flag}</span>
    <span class="team-code">${team.code}</span>
  `;

  token.addEventListener('click', (event) => {
    event.stopPropagation();
    selectTeam(team.id, slotId);
  });

  token.addEventListener('dblclick', (event) => {
    event.stopPropagation();
    autoAdvanceTeam(team.id, slotId);
  });

  token.addEventListener('dragstart', (event) => {
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ teamId: team.id, sourceSlotId: slotId }),
    );
  });

  return token;
}

function createClearButton(slotId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'clear-slot';
  button.textContent = '×';
  button.title = 'Clear this slot';
  button.setAttribute('aria-label', 'Clear this slot');

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    clearSlot(slotId);
  });

  return button;
}

function renderTeamPool() {
  teamPool.innerHTML = '';

  TEAMS.forEach((team) => {
    const token = createTeamToken(team, null);
    token.classList.toggle('is-selected', selected?.teamId === team.id && selected?.sourceSlotId === null);
    teamPool.appendChild(token);
  });
}

function renderSelectedTeam() {
  if (!selected) {
    selectedTeam.className = 'selected-team empty';
    selectedTeam.textContent = 'No team selected';
    return;
  }

  const team = teamById.get(selected.teamId);
  selectedTeam.className = 'selected-team';
  selectedTeam.innerHTML = `<span class="flag" aria-hidden="true">${team.flag}</span><span>${team.name}</span>`;
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('is-drop-target');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('is-drop-target');
}

function handleDrop(event) {
  event.preventDefault();
  const targetSlotId = event.currentTarget.dataset.slotId;
  event.currentTarget.classList.remove('is-drop-target');

  try {
    const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
    placeTeam(payload.teamId, payload.sourceSlotId, targetSlotId);
  } catch (error) {
    showToast('Could not read the dropped team. Try clicking instead.');
  }
}

function handleSlotClick(targetSlotId) {
  if (!selected) {
    return;
  }

  placeTeam(selected.teamId, selected.sourceSlotId, targetSlotId);
}

function handleClearSlot(event, slotId) {
  event.preventDefault();
  clearSlot(slotId);
}

function selectTeam(teamId, sourceSlotId) {
  const isSameSelection = selected?.teamId === teamId && selected?.sourceSlotId === sourceSlotId;
  selected = isSameSelection ? null : { teamId, sourceSlotId };
  render();
}

function placeTeam(teamId, sourceSlotId, targetSlotId) {
  if (!teamById.has(teamId) || !targetSlotId) {
    return;
  }

  if (sourceSlotId === targetSlotId) {
    selected = null;
    render();
    return;
  }

  const target = parseSlotId(targetSlotId);
  const source = sourceSlotId ? parseSlotId(sourceSlotId) : null;

  if (target.roundKey === 'round32' && source?.roundKey === 'round32') {
    const previousTargetTeam = state[targetSlotId];
    state[targetSlotId] = teamId;
    state[sourceSlotId] = previousTargetTeam;
    showToast('Opening round teams swapped.');
  } else {
    state[targetSlotId] = teamId;
    showToast(`${teamById.get(teamId).name} placed in ${getRoundLabel(targetSlotId)}.`);
  }

  selected = null;
  saveState();
  render();
}

function autoAdvanceTeam(teamId, sourceSlotId) {
  if (!sourceSlotId) {
    showToast('Select a bracket slot first, then double-click to advance.');
    return;
  }

  const parentSlotId = getParentSlotId(sourceSlotId);

  if (!parentSlotId) {
    showToast(`${teamById.get(teamId).name} is already holding the trophy.`);
    return;
  }

  state[parentSlotId] = teamId;
  selected = null;
  saveState();
  render();
  showToast(`${teamById.get(teamId).name} advanced to ${getRoundLabel(parentSlotId)}.`);
}

function getParentSlotId(slotId) {
  const { roundKey, index } = parseSlotId(slotId);
  const roundInfo = roundByKey.get(roundKey);

  if (!roundInfo || roundInfo.index >= ROUNDS.length - 1) {
    return null;
  }

  const nextRound = ROUNDS[roundInfo.index + 1];
  return getSlotId(nextRound.key, Math.floor(index / 2));
}

function clearSlot(slotId) {
  const { roundKey } = parseSlotId(slotId);

  if (roundKey === 'round32') {
    showToast('Opening round slots stay fixed. Use Reset all to restore them.');
    return;
  }

  state[slotId] = null;
  selected = null;
  saveState();
  render();
}

function getRoundLabel(slotId) {
  const { roundKey, index } = parseSlotId(slotId);
  const round = roundByKey.get(roundKey);

  if (!round) {
    return 'the bracket';
  }

  return `${round.label}${round.count > 1 ? ` ${index + 1}` : ''}`;
}

function clearProgress() {
  Object.keys(state).forEach((slotId) => {
    const { roundKey } = parseSlotId(slotId);

    if (roundKey !== 'round32') {
      state[slotId] = null;
    }
  });

  selected = null;
  saveState();
  render();
  showToast('Progress cleared. Opening round teams kept.');
}

function resetAll() {
  state = createInitialState();
  selected = null;
  saveState();
  render();
  showToast('Bracket reset. Chaos cancelled.');
}

function openTeamModal() {
  teamModal.hidden = false;
  teamModal.setAttribute('aria-hidden', 'false');
  modalToggleButton.setAttribute('aria-expanded', 'true');
  modalCloseButton.focus();
}

function closeTeamModal() {
  teamModal.hidden = true;
  teamModal.setAttribute('aria-hidden', 'true');
  modalToggleButton.setAttribute('aria-expanded', 'false');
  modalToggleButton.focus();
}

function toggleTeamModal() {
  if (teamModal.hidden) {
    openTeamModal();
  } else {
    closeTeamModal();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape' && !teamModal.hidden) {
    closeTeamModal();
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');

  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2200);
}

document.querySelector('#clearProgressButton').addEventListener('click', clearProgress);
document.querySelector('#resetButton').addEventListener('click', resetAll);
modalToggleButton.addEventListener('click', toggleTeamModal);
modalCloseButton.addEventListener('click', closeTeamModal);
modalBackdrop.addEventListener('click', closeTeamModal);
document.addEventListener('keydown', handleDocumentKeydown);

render();
