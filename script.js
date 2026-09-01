const PIN = '110201';
const PASSWORD = 'TanushP14';
const pinInput = document.querySelector('#pinInput');
const passwordInput = document.querySelector('#passwordInput');
const errorMessage = document.querySelector('#errorMessage');
const keyboard = document.querySelector('#keyboard');
const keyboardToggle = document.querySelector('#keyboardToggle');
let mode = 'pin';
let shifted = true;
let welcomeReady = false;
let unlockPending = false;
let isLoggedIn = false;
let inactivityTimer;
const INACTIVITY_LIMIT = 5 * 60 * 1000;
const welcomeBackground = document.querySelector('#welcomeBannerImage');
const videoLauncher = document.querySelector('#videoLauncher');
const accountMenuButton = document.querySelector('#accountMenuButton');
const profilePanel = document.querySelector('#profilePanel');
const profilePanelClose = document.querySelector('#profilePanelClose');
const profilePanelBackdrop = document.querySelector('#profilePanelBackdrop');
const dashboardLogout = document.querySelector('#dashboardLogout');
const welcomeKicker = document.querySelector('#welcomeKicker');
const welcomeTitle = document.querySelector('#welcomeTitle');
const quotes = [
  'Small steps still move you forward.',
  'Focus on progress, not perfection.',
  'Your future self is built today.',
  'Make today count in a quiet way.',
  'Consistency turns effort into results.',
  'One focused hour can change your day.',
];

function beginWelcomeSequence() {
  if (!unlockPending || !welcomeReady) return;
  const welcome = document.querySelector('#welcomeScreen');
  welcomeKicker.textContent = 'ACCESS GRANTED';
  welcomeTitle.innerHTML = 'Welcome<span>!</span>';
  welcome.classList.remove('is-logging-out');
  const hour = new Date().getHours();
  const salutation = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  document.querySelector('#dashboardGreeting').textContent = `${salutation}, Tanush!`;
  window.requestAnimationFrame(() => welcome.classList.add('is-active'));
  window.setTimeout(() => { videoLauncher.hidden = false; }, 5000);
}

function resetInactivityTimer() {
  if (!isLoggedIn) return;
  window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(logOutForInactivity, INACTIVITY_LIMIT);
}

function logOutForInactivity() {
  isLoggedIn = false;
  window.clearTimeout(inactivityTimer);
  if (profilePanel.classList.contains('is-open')) closeProfilePanel();
  videoLauncher.hidden = true;
  const welcome = document.querySelector('#welcomeScreen');
  welcome.hidden = false;
  welcomeKicker.textContent = 'SESSION COMPLETE';
  welcomeTitle.innerHTML = 'See you soon<span>!</span>';
  welcome.classList.add('is-logging-out');
  window.setTimeout(() => {
    welcome.classList.remove('is-logging-out', 'is-active');
    welcome.hidden = true;
    document.querySelector('#lockScreen').style.display = '';
    pinInput.value = '';
    passwordInput.value = '';
    errorMessage.textContent = '';
  }, 1950);
  window.setTimeout(() => {
    const lockScreen = document.querySelector('#lockScreen');
    document.body.classList.remove('intro');
    document.body.classList.add('intro');
    lockScreen.classList.add('reentering');
    lockScreen.style.display = '';
    window.setTimeout(() => lockScreen.classList.remove('reentering'), 120);
    window.setTimeout(() => document.body.classList.remove('intro'), 6100);
  }, 2000);
}

['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'].forEach(eventName => {
  document.addEventListener(eventName, resetInactivityTimer, { passive: eventName !== 'keydown' });
});

function updateDashboardDateTime() {
  const now = new Date();
  document.querySelector('#dashboardTime').textContent = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(now);
  document.querySelector('#dashboardDateLong').textContent = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(now);
  document.querySelector('#dashboardDateNumeric').textContent = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(now);
}

function setDailyQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.querySelector('#dailyQuote').textContent = quote;
}

function weatherSymbol(code, isDay) {
  if (code === 0) return isDay ? '☀' : '☾';
  if (code <= 2) return isDay ? '⛅' : '☾';
  if (code === 3 || code === 45 || code === 48) return '☁';
  if (code <= 67 || code <= 82) return '☂';
  if (code <= 77) return '❄';
  return 'ϟ';
}

async function updateDelhiWeather() {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,weather_code,is_day&timezone=Asia%2FKolkata');
    if (!response.ok) throw new Error('Weather request failed');
    const { current } = await response.json();
    document.querySelector('#weatherTemperature').textContent = `${Math.round(current.temperature_2m)}°`;
    document.querySelector('#weatherIcon').textContent = weatherSymbol(current.weather_code, current.is_day);
  } catch {
    document.querySelector('#weatherTemperature').textContent = '--°';
  }
}

updateDashboardDateTime();
setDailyQuote();
updateDelhiWeather();
window.setInterval(updateDashboardDateTime, 1000);
window.setInterval(updateDelhiWeather, 20 * 60 * 1000);

function openVideo() {
  window.location.href = 'https://tanushp14.netlify.app/images/acemate-blank.mp4';
}

videoLauncher.addEventListener('click', openVideo);

function openProfilePanel() {
  profilePanel.classList.add('is-open');
  profilePanel.setAttribute('aria-hidden', 'false');
  accountMenuButton.setAttribute('aria-expanded', 'true');
}

function closeProfilePanel() {
  if (!profilePanel.classList.contains('is-open')) return;
  profilePanel.classList.remove('is-open');
  profilePanel.classList.add('is-closing');
  accountMenuButton.setAttribute('aria-expanded', 'false');
  window.setTimeout(() => {
    profilePanel.classList.remove('is-closing');
    profilePanel.setAttribute('aria-hidden', 'true');
  }, 600);
}

accountMenuButton.addEventListener('click', openProfilePanel);
profilePanelClose.addEventListener('click', closeProfilePanel);
profilePanelBackdrop.addEventListener('click', closeProfilePanel);
dashboardLogout.addEventListener('click', logOutForInactivity);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && profilePanel.classList.contains('is-open')) closeProfilePanel();
});

function markWelcomeReady() {
  welcomeBackground.decode()
    .catch(() => {})
    .finally(() => {
      welcomeReady = true;
      beginWelcomeSequence();
    });
}

if (welcomeBackground.complete && welcomeBackground.naturalWidth > 0) {
  markWelcomeReady();
} else {
  welcomeBackground.addEventListener('load', markWelcomeReady, { once: true });
}

document.body.classList.add('intro');
window.setTimeout(() => document.body.classList.remove('intro'), 6100);

const keyboardRows = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];
function renderKeyboard() {
  keyboard.innerHTML = keyboardRows.map(row => `<div class="key-row">${row.map(key => {
    const character = shifted ? key : key.toLowerCase();
    return `<button data-letter="${character}">${character}</button>`;
  }).join('')}</div>`).join('') + `<div class="key-row"><button class="wide ${shifted ? 'is-shifted' : ''}" data-shift>⇧ Shift</button><button class="space" data-letter=" ">Space</button><button class="wide" data-backspace>⌫ Delete</button></div>`;
}
renderKeyboard();

function activeInput() { return mode === 'pin' ? pinInput : passwordInput; }
function addCharacter(value) {
  const input = activeInput();
  const limit = mode === 'pin' ? 6 : 40;
  if (input.value.length < limit) input.value += value;
  errorMessage.textContent = '';
}
function removeCharacter() { const input = activeInput(); input.value = input.value.slice(0, -1); errorMessage.textContent = ''; }

document.querySelectorAll('.mode-tab').forEach(tab => tab.addEventListener('click', () => {
  mode = tab.dataset.mode;
  document.querySelectorAll('.mode-tab').forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', active); });
  document.querySelectorAll('.panel').forEach(panel => { const active = panel.id === `${mode}Panel`; panel.classList.toggle('active', active); panel.hidden = !active; });
  errorMessage.textContent = '';
}));

document.querySelectorAll('.numpad [data-key]').forEach(button => button.addEventListener('click', () => addCharacter(button.dataset.key)));
document.addEventListener('click', event => {
  if (event.target.closest('[data-backspace]')) removeCharacter();
  if (event.target.closest('[data-shift]')) { shifted = !shifted; renderKeyboard(); return; }
  const letter = event.target.dataset.letter;
  if (letter !== undefined) { addCharacter(letter); if (shifted) { shifted = false; renderKeyboard(); } }
  if (event.target.dataset.clear) { document.querySelector(`#${event.target.dataset.clear}`).value = ''; errorMessage.textContent = ''; }
});
keyboardToggle.addEventListener('click', () => { const shown = !keyboard.hidden; keyboard.hidden = shown; keyboardToggle.innerHTML = shown ? '<span>⌨</span> Open keyboard' : '<span>⌨</span> Hide keyboard'; });

function unlock() {
  const correct = mode === 'pin' ? PIN : PASSWORD;
  if (activeInput().value === correct) {
    isLoggedIn = true;
    resetInactivityTimer();
    document.querySelector('#lockScreen').style.display = 'none';
    const welcome = document.querySelector('#welcomeScreen');
    welcome.hidden = false;
    unlockPending = true;
    beginWelcomeSequence();
  } else {
    errorMessage.textContent = 'That doesn’t look right. Please try again.';
    activeInput().value = '';
  }
}
document.querySelectorAll('[data-submit]').forEach(button => button.addEventListener('click', unlock));

[pinInput, passwordInput].forEach(input => {
  input.addEventListener('input', () => { errorMessage.textContent = ''; });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') unlock();
  });
});
