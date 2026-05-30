import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  update,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpk3UNRpaAqsjseQQzxFlYCj5BabAwpKQ",
  authDomain: "wansni.firebaseapp.com",
  databaseURL: "https://wansni-default-rtdb.firebaseio.com",
  projectId: "wansni",
  storageBucket: "wansni.firebasestorage.app",
  messagingSenderId: "315838161219",
  appId: "1:315838161219:web:dfeb588b0f4c83470acff6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const sounds = {};

function playSound(file, volume = 0.7) {

  if (!sounds[file]) {
    sounds[file] = new Audio(file);
  }

  const audio = sounds[file];

  audio.pause();
  audio.currentTime = 0;
  audio.volume = volume;

  audio.play().catch(() => {});
}
let roomCode = "";
let playerId = "";
let playerName = "";
let selectedCategory = "kuwait";
let localTimers = {};
let selectedNextPlayer = null;
let selectedAvatar = "😎";
let wheelInterval = null;
let wheelFinalPlayer = null;
let roundSoundEnabled = true;

const avatars = ["😎","😂","🤖","👑","🦁","🐺","🐵","🧠","🔥","⚡","🎭","🕶️"];

let kuwaitQuestions = [];
let riddlesQuestions = [];
let proverbsQuestions = [];
let challengesQuestions = [];
let speedQuestions = [];
let wouldyouratherQuestions = [];
let truthQuestions = [];
let challengeplusQuestions = [];
let religionQuestions = [];
let kuwaitArtQuestions = [];

async function loadQuestions() {
  const response = await fetch("questions/kuwait.json");
  kuwaitQuestions = await response.json();

categories.kuwait.questions = kuwaitQuestions;

const riddlesResponse = await fetch("questions/riddles.json");
riddlesQuestions = await riddlesResponse.json();

categories.riddles.questions = riddlesQuestions;

const proverbsResponse = await fetch("questions/proverbs.json");
proverbsQuestions = await proverbsResponse.json();

categories.proverbs.questions = proverbsQuestions;

const challengesResponse = await fetch("questions/challenges.json");
challengesQuestions = await challengesResponse.json();

categories.challenges.questions = challengesQuestions;

const speedResponse = await fetch("questions/speed.json");
speedQuestions = await speedResponse.json();

categories.speed.questions = speedQuestions;

const wouldyouratherResponse = await fetch("questions/wouldyourather.json");
wouldyouratherQuestions = await wouldyouratherResponse.json();

categories.wouldyourather.questions = wouldyouratherQuestions;

const truthResponse = await fetch("questions/truth.json");
truthQuestions = await truthResponse.json();

categories.truth.questions = truthQuestions;

const challengeplusResponse = await fetch("questions/challengeplus.json");
challengeplusQuestions = await challengeplusResponse.json();

categories.challengeplus.questions = challengeplusQuestions;

const religionResponse = await fetch("questions/religion.json");
religionQuestions = await religionResponse.json();

categories.religion.questions = religionQuestions;

const kuwaitArtResponse = await fetch("questions/kuwaitArt.json");
kuwaitArtQuestions = await kuwaitArtResponse.json();

categories.kuwaitArt.questions = kuwaitArtQuestions;
}
const categories = {
  kuwait: {
    name: "معلومات عن الكويت 🇰🇼",
    time: 30,
    questions: kuwaitQuestions
  },

  riddles: {
    name: "ألغاز 🧠",
    time: 30,
    questions: riddlesQuestions
  },

  proverbs: {
    name: "أمثال كويتية 🎭",
    time: 20,
    questions: proverbsQuestions
  },

  challenges: {
    name: "تحديات 🔥",
    time: 20,
    questions: challengesQuestions
  },

  speed: {
    name: "سرعة بديهة ⚡",
    time: 10,
    questions: speedQuestions
  },

wouldyourather: {
  name: "🤔 تختار شنو؟",
  time: 15,
  questions: wouldyouratherQuestions
},

truth: {
  name: "😳 الصراحة",
  time: 20,
  questions: truthQuestions
},

challengeplus: {
  name: "🔥 تحديات أقوى",
  time: 20,
  questions: challengeplusQuestions
},
  religion: {
    name: "أسئلة دينية 🕌",
    time: 30,
    questions: religionQuestions
  },

  kuwaitArt: {
    name: "الفن الكويتي 🎬",
    time: 30,
    questions: kuwaitArtQuestions
  }
};

window.createRoom = async function () {
  const adminInput = document.getElementById("adminName").value.trim();
  playerName = adminInput || "الأدمن";

  roomCode = Math.floor(1000 + Math.random() * 9000).toString();
const winScore =
  parseInt(document.getElementById("winScoreInput").value) || 70;

  await set(ref(db, "rooms/" + roomCode), {
    createdAt: Date.now(),
    currentRound: null,
    status: "waiting",
    selectedCategory: selectedCategory,
    usedQuestions: {},
winScore: winScore
  });

  const adminRef = push(ref(db, "rooms/" + roomCode + "/players"));
  playerId = adminRef.key;

  await set(adminRef, {
  name: playerName,
  avatar: "👑",
  points: 0,
  admin: true,
  joinedAt: Date.now()
});

  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("adminScreen").classList.remove("hidden");
  document.getElementById("roomCodeText").innerText = roomCode;

  const joinUrl = window.location.origin + window.location.pathname + "?room=" + roomCode;

  document.getElementById("qrcode").innerHTML = "";

  new QRCode(document.getElementById("qrcode"), {
    text: joinUrl,
    width: 180,
    height: 180
  });

  renderCategories();
  listenAdmin();
  listenPlayer();
};

function renderCategories() {
  const box = document.getElementById("categoriesBox");
  if (!box) return;

  box.innerHTML = "";

  Object.keys(categories).forEach(key => {
    const cat = categories[key];

    const btn = document.createElement("button");
    btn.className = "categoryBtn" + (selectedCategory === key ? " active" : "");
    btn.innerText = cat.name + " — " + cat.time + " ثانية";
    btn.onclick = async () => {
      selectedCategory = key;
      await update(ref(db, "rooms/" + roomCode), {
        selectedCategory: key
      });
      renderCategories();
    };

    box.appendChild(btn);
  });
}

window.joinRoomByCode = function () {
  const code = document.getElementById("roomInput").value.trim();

  if (code === "") {
    alert("اكتب رقم القعدة");
    return;
  }

  roomCode = code;
  showPlayerScreen();
};

function showPlayerScreen() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  renderAvatars();

  setTimeout(() => {
    listenPlayer();
  }, 300);
}

function renderAvatars() {
  const box = document.getElementById("avatarBox");
  if (!box) return;

  box.innerHTML = "";

  avatars.forEach(avatar => {
    const btn = document.createElement("button");
    btn.className = "avatarBtn" + (selectedAvatar === avatar ? " active" : "");
    btn.innerText = avatar;

    btn.onclick = () => {
      selectedAvatar = avatar;
      renderAvatars();
    };

    box.appendChild(btn);
  });
}

window.joinAsPlayer = async function () {
  const name = document.getElementById("playerName").value.trim();

  if (name === "") {
    alert("اكتب اسمك 😅");
    return;
  }

  playerName = name;

playSound("sounds/vote.mp3", 0.01);

  const playerRef = push(ref(db, "rooms/" + roomCode + "/players"));
  playerId = playerRef.key;

  await set(playerRef, {
  name: playerName,
  avatar: selectedAvatar,
  points: 0,
  admin: false,
  joinedAt: Date.now()
});

  document.getElementById("joinForm").classList.add("hidden");
  document.getElementById("playerGame").classList.remove("hidden");
  document.getElementById("welcomePlayer").innerText = "حياك الله يا " + playerName;

};

function listenAdmin() {
onValue(ref(db, "rooms/" + roomCode), snapshot => {
  const room = snapshot.val();
  if (!room) return;

  if (room.status === "finished" && room.winner) {
    showWinnerScreen(room.winner);
  }
});
  onValue(ref(db, "rooms/" + roomCode), snapshot => {
    const room = snapshot.val();
    if (!room) return;

    selectedCategory = room.selectedCategory || "kuwait";
    renderCategories();
  });

  onValue(ref(db, "rooms/" + roomCode + "/players"), snapshot => {
    const players = snapshot.val() || {};
    const box = document.getElementById("adminPlayers");

    box.innerHTML = "";

const sortedPlayers = Object.entries(players)
  .sort((a, b) => (b[1].points || 0) - (a[1].points || 0));

const leaderboard = document.getElementById("leaderboardBox");

if (leaderboard) {

  leaderboard.innerHTML = "";

  sortedPlayers.forEach((entry, index) => {

    const p = entry[1];

    let medal = "🎖️";

    if(index === 0) medal = "🥇";
    else if(index === 1) medal = "🥈";
    else if(index === 2) medal = "🥉";

    leaderboard.innerHTML += `
      <div class="playerItem">
        <span>
          ${medal} ${p.avatar || "😎"} ${p.name}
        </span>

        <span>
          ${p.points || 0} نقطة
        </span>
      </div>
    `;
  });

onValue(ref(db, "rooms/" + roomCode + "/players"), snapshot => {

  const players = snapshot.val() || {};

  const leaderboard = document.getElementById("playerLeaderboard");

  if (!leaderboard) return;

  const sortedPlayers = Object.entries(players)
    .sort((a, b) => (b[1].points || 0) - (a[1].points || 0));

  leaderboard.innerHTML = "";

  sortedPlayers.forEach((entry, index) => {

    const p = entry[1];

    let medal = "🎖️";

    if(index === 0) medal = "🥇";
    else if(index === 1) medal = "🥈";
    else if(index === 2) medal = "🥉";

    leaderboard.innerHTML += `
      <div class="playerItem">
        <span>
          ${medal} ${p.avatar || "😎"} ${p.name}
        </span>

        <span>
          ${p.points || 0} نقطة
        </span>
      </div>
    `;
  });

});
}
    Object.keys(players).forEach(id => {
      const p = players[id];

      box.innerHTML += `
        <div class="playerItem">
          <span>${p.avatar || "😎"} ${p.admin ? "👑 " : ""}${p.name}</span>
          <span>🏆 ${p.points || 0}</span>
          <button class="smallBtn red" onclick="kickPlayer('${id}')">طرد</button>
        </div>
      `;
    });
  });

  onValue(ref(db, "rooms/" + roomCode + "/currentRound"), snapshot => {
    const round = snapshot.val();
    renderRound(round, "roundBox");
  });

  onValue(ref(db, "rooms/" + roomCode + "/votes"), snapshot => {
    const votes = snapshot.val() || {};

    let success = 0;
    let fail = 0;

    Object.values(votes).forEach(v => {
      if (v.vote === "success") success++;
      if (v.vote === "fail") fail++;
    });

    document.getElementById("votesBox").innerHTML = `
      ✅ نجح: ${success}<br>
      ❌ فشل: ${fail}
    `;
  });
}

window.randomPlayerShow = async function () {
  const playersSnap = await get(ref(db, "rooms/" + roomCode + "/players"));
  const players = playersSnap.val();

  if (!players || Object.keys(players).length === 0) {
    alert("لا يوجد لاعبين");
    return;
  }

  const ids = Object.keys(players);
  let counter = 0;
  const totalSpins = 35;

  playSound("sounds/spin.mp3", 0.4);

  await set(ref(db, "rooms/" + roomCode + "/spinState"), {
    active: true,
    startedAt: Date.now(),
    playersCount: ids.length
  });

  const spin = setInterval(async () => {
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    const p = players[randomId];

    await update(ref(db, "rooms/" + roomCode + "/spinState"), {
      currentName: p.name,
      currentAvatar: p.avatar || "😎",
      counter: counter
    });

    counter++;

    if (counter >= totalSpins) {
      clearInterval(spin);

      const finalId = ids[Math.floor(Math.random() * ids.length)];
      const finalPlayer = players[finalId];

      selectedNextPlayer = finalId;

      // playSound("sounds/correct.mp3", 0.8);

      await update(ref(db, "rooms/" + roomCode + "/spinState"), {
        active: false,
        selectedPlayerId: finalId,
        currentName: finalPlayer.name,
        currentAvatar: finalPlayer.avatar || "😎",
        finishedAt: Date.now()
      });
    }
  }, 90);
};
window.startRound = async function () {
roundSoundEnabled = true;

  const roomSnap = await get(ref(db, "rooms/" + roomCode));
  const room = roomSnap.val() || {};

  const categoryKey = room.selectedCategory || selectedCategory;

if (!categoryKey || !categories[categoryKey]) {
  alert("اختر القسم أولاً قبل بدء الجولة");
  return;
}

  const category = categories[categoryKey];
if (!category.questions || !Array.isArray(category.questions) || category.questions.length === 0) {
  alert("هذا القسم لا يحتوي على أسئلة أو صيغة الأسئلة غير صحيحة");
  return;
}

  const playersSnap = await get(ref(db, "rooms/" + roomCode + "/players"));
  const players = playersSnap.val();

  if (!players || Object.keys(players).length < 1) {
    alert("لازم لاعب واحد على الأقل");
    return;
  }

  const ids = Object.keys(players);

const randomId =
  selectedNextPlayer ||
  ids[Math.floor(Math.random() * ids.length)];

selectedNextPlayer = null;
  const randomPlayer = players[randomId];

  const used = room.usedQuestions?.[categoryKey] || {};
  let available = category.questions
    .map((q, index) => ({ ...q, index }))
    .filter(q => !used[q.index]);

  if (available.length === 0) {
    await set(ref(db, "rooms/" + roomCode + "/usedQuestions/" + categoryKey), {});
    available = category.questions.map((q, index) => ({ ...q, index }));
  }

  const question = available[Math.floor(Math.random() * available.length)];

  await set(ref(db, "rooms/" + roomCode + "/votes"), null);

  await update(ref(db, "rooms/" + roomCode + "/usedQuestions/" + categoryKey), {
    [question.index]: true
  });

  await set(ref(db, "rooms/" + roomCode + "/currentRound"), {
    playerId: randomId,
    playerName: randomPlayer.name,
    categoryKey: categoryKey,
    categoryName: category.name,
    question: question.q || question.question,
answer: question.a || question.answer || "لا توجد إجابة محددة",
points: question.points || 10,
    prepSeconds: 5,
    answerSeconds: category.time,
    startedAt: Date.now(),
    phase: "prep",
answerRevealed: false
  });
};

function renderRound(round, elementId) {
  const box = document.getElementById(elementId);
  if (!box) return;

  if (!round) {
  if (localTimers[elementId]) {
    clearInterval(localTimers[elementId]);
    localTimers[elementId] = null;
  }

  box.innerHTML = "بانتظار بدء الجولة...";
  return;
}

  if (localTimers[elementId]) clearInterval(localTimers[elementId]);

  function draw() {
    const now = Date.now();
    const elapsed = Math.floor((now - round.startedAt) / 1000);

    if (elapsed < round.prepSeconds) {
      const left = round.prepSeconds - elapsed;

      box.innerHTML = `
        <h2>🎯 الدور على: ${round.playerName}</h2>
        <p>📚 القسم: ${round.categoryName}</p>
        <div class="timer">${left}</div>
        <p>استعد...</p>
      `;
      return;
    }

    const answerElapsed = elapsed - round.prepSeconds;
    const left = Math.max(round.answerSeconds - answerElapsed, 0);
if (left > 0 && left <= 5 && round.phase !== "finished") {
  playSound("sounds/tick.mp3", 0.3);
}
    box.innerHTML = `
      <h2>🎯 الدور على: ${round.playerName}</h2>
      <p>📚 القسم: ${round.categoryName}</p>
      <div class="timer">${left}</div>
      <div class="question">${round.question}</div>
      ${left === 0 || round.answerRevealed ? `<div class="answer">الإجابة: ${round.answer}</div>` : ""}
      <p>النقاط: ${round.points}</p>
    `;

    if (left <= 0 && localTimers[elementId]) {
  clearInterval(localTimers[elementId]);
}
  }

  draw();
  localTimers[elementId] = setInterval(draw, 1000);
}

function listenSpinState() {
  onValue(ref(db, "rooms/" + roomCode + "/spinState"), snapshot => {
    const spin = snapshot.val();
    if (!spin) return;

    const adminBox = document.getElementById("nextPlayerBox");
    const playerBox = document.getElementById("playerSpinBox");

    const html = `
      <div style="
        margin:20px auto;
        width:230px;
        height:230px;
        border-radius:50%;
        border:10px solid #facc15;
        display:flex;
        align-items:center;
        justify-content:center;
        background:radial-gradient(circle, #1e293b, #020617);
        box-shadow:0 0 35px rgba(250,204,21,0.7);
        animation:${spin.active ? "wheelSpin 0.5s linear infinite" : "none"};
      ">
        <div style="text-align:center;">
          <div style="font-size:70px;">${spin.currentAvatar || "😎"}</div>
          <div style="font-size:24px;font-weight:bold;color:#facc15;margin-top:8px;">
            ${spin.currentName || "..."}
          </div>
        </div>
      </div>

      <div style="
        margin-top:12px;
        color:${spin.active ? "#38bdf8" : "#4ade80"};
        font-size:22px;
        font-weight:bold;
      ">
        ${spin.active ? "🎡 جاري الاختيار..." : "🎯 اللاعب المختار"}
      </div>
    `;

    if (adminBox) adminBox.innerHTML = html;
    if (playerBox) playerBox.innerHTML = html;
  });
}

function listenPlayer() {
  onValue(ref(db, "rooms/" + roomCode + "/currentRound"), snapshot => {
    const round = snapshot.val();
    renderRound(round, "playerRoundBox");

    if (!round) return;

    const voteArea = document.getElementById("voteArea");

if (round.playerId === playerId) {
  voteArea.classList.add("hidden");
} else {
  voteArea.classList.remove("hidden");

  voteArea.innerHTML = `
    <button class="btn green" onclick="vote('success')">✅ نجح</button>
    <button class="btn red" onclick="vote('fail')">❌ فشل</button>
  `;
}
  });

  onValue(ref(db, "rooms/" + roomCode + "/players/" + playerId), snapshot => {
    if (!snapshot.exists() && playerId) {
      alert("تم إخراجك من القعدة");
      location.reload();
    }
  });

  onValue(ref(db, "rooms/" + roomCode), snapshot => {
  const room = snapshot.val();
  if (!room) return;

  if (room.status === "finished" && room.winner) {
    showWinnerScreen(room.winner);
  }

  if (room.status === "ended") {
    alert("انتهت اللعبة");
    location.reload();
  }
});
onValue(ref(db, "rooms/" + roomCode + "/spinState"), snapshot => {
  const spin = snapshot.val();
  if (!spin) return;

  const adminBox = document.getElementById("nextPlayerBox");
  const playerBox = document.getElementById("playerSpinBox");

  const html = `
    <div style="
      margin:20px auto;
      width:230px;
      height:230px;
      border-radius:50%;
      border:10px solid #facc15;
      display:flex;
      align-items:center;
      justify-content:center;
      background:radial-gradient(circle, #1e293b, #020617);
      box-shadow:0 0 35px rgba(250,204,21,0.7);
      animation:${spin.active ? "wheelSpin 0.5s linear infinite" : "none"};
    ">
      <div style="text-align:center;">
        <div style="font-size:70px;">${spin.currentAvatar || "😎"}</div>
        <div style="
          font-size:24px;
          font-weight:bold;
          color:#facc15;
          margin-top:8px;
        ">
          ${spin.currentName || "..."}
        </div>
      </div>
    </div>

    ${!spin.active ? `
      <div style="
        margin-top:12px;
        color:#4ade80;
        font-size:22px;
        font-weight:bold;
      ">
        🎯 اللاعب المختار
      </div>
    ` : `
      <div style="
        margin-top:12px;
        color:#38bdf8;
        font-size:20px;
        font-weight:bold;
      ">
        🎡 جاري الاختيار...
      </div>
    `}
  `;

  if (adminBox) adminBox.innerHTML = html;
  if (playerBox) playerBox.innerHTML = html;
});

onValue(ref(db, "rooms/" + roomCode + "/players"), snapshot => {
  const players = snapshot.val() || {};
  const leaderboard = document.getElementById("playerLeaderboard");

  if (!leaderboard) return;

  const sortedPlayers = Object.entries(players)
    .sort((a, b) => (b[1].points || 0) - (a[1].points || 0));

  leaderboard.innerHTML = "";

  sortedPlayers.forEach((entry, index) => {
    const p = entry[1];

    let medal = "🎖️";
    if (index === 0) medal = "🥇";
    else if (index === 1) medal = "🥈";
    else if (index === 2) medal = "🥉";

    leaderboard.innerHTML += `
      <div class="playerItem">
        <span>${medal} ${p.avatar || "😎"} ${p.name}</span>
        <span>${p.points || 0} نقطة</span>
      </div>
    `;
  });
});

onValue(ref(db, "rooms/" + roomCode + "/lastResult"), snapshot => {
roundSoundEnabled = false;

  const result = snapshot.val();
  if (!result) return;

  const box = document.getElementById("playerRoundBox");
  if (!box) return;

  box.innerHTML = `
    <h2>📢 النتيجة</h2>
    <div class="answer">${result.message}</div>
    <p>✅ نجح: ${result.success}</p>
    <p>❌ فشل: ${result.fail}</p>
  `;
});
}
function playBeep(type = "click") {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === "success") oscillator.frequency.value = 700;
  else if (type === "fail") oscillator.frequency.value = 220;
  else if (type === "spin") oscillator.frequency.value = 420;
  else oscillator.frequency.value = 500;

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.18);
}
window.vote = async function (result) {
playSound("sounds/vote.mp3");

  const voteRef = ref(db, "rooms/" + roomCode + "/votes/" + playerId);

  const existingVote = await get(voteRef);

  if (existingVote.exists()) {
    alert("صوتت بالفعل 😄");
    return;
  }

  const roundSnap = await get(ref(db, "rooms/" + roomCode + "/currentRound"));
  const round = roundSnap.val();

  if (!round) {
    alert("لا توجد جولة حالياً");
    return;
  }

  if (round.playerId === playerId) {
playSound("sounds/wrong.mp3");
    alert("لا يمكنك تقييم نفسك 😅");
    return;
  }
playBeep(result === "success" ? "success" : "fail");
  await set(voteRef, {
    playerName: playerName,
    vote: result
  });

  document.getElementById("voteArea").innerHTML = `
    <div class="answer">
      ✅ تم تسجيل تصويتك
    </div>
  `;
};

window.finishVoting = async function () {
roundSoundEnabled = false;

  const roundSnap = await get(ref(db, "rooms/" + roomCode + "/currentRound"));
  const round = roundSnap.val();

  if (!round) {
    alert("ماكو جولة حالياً");
    return;
  }

  const votesSnap = await get(ref(db, "rooms/" + roomCode + "/votes"));
  const votes = votesSnap.val() || {};

  let success = 0;
  let fail = 0;

  Object.values(votes).forEach(v => {
    if (v.vote === "success") success++;
    if (v.vote === "fail") fail++;
  });

  let pointsChange = success >= fail ? round.points : -5;

if (success >= fail) {
  playSound("sounds/correct.mp3", 0.8);
} else {
  playSound("sounds/wrong.mp3", 0.8);
}
  const playerPath = "rooms/" + roomCode + "/players/" + round.playerId;

  const playerSnap = await get(ref(db, playerPath));
  const player = playerSnap.val();

  if (!player) {
    alert("اللاعب غير موجود");
    return;
  }

  const newPoints = (player.points || 0) + pointsChange;

await update(ref(db, playerPath), {
  points: newPoints
});

const roomSnap2 = await get(ref(db, "rooms/" + roomCode));
const roomData = roomSnap2.val() || {};

const winScore = roomData.winScore || 70;

if (newPoints >= winScore) {
playSound("sounds/winner.mp3", 1);

  await update(ref(db, "rooms/" + roomCode), {
    status: "finished",
    winner: {
      name: player.name,
      avatar: player.avatar || "😎",
      points: newPoints
    }
  });

await update(ref(db, "rooms/" + roomCode + "/currentRound"), {
  phase: "finished"
});
  await set(ref(db, "rooms/" + roomCode + "/currentRound"), null);

document.body.innerHTML = `
  <div style="
    min-height:100vh;
    background:#0f172a;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column;
    color:white;
    font-family:sans-serif;
    text-align:center;
    padding:30px;
  ">
    <div style="font-size:90px;">🏆</div>

    <h1 style="font-size:50px;color:#facc15;margin:10px 0;">
      ${player.avatar || "😎"} ${player.name}
    </h1>

    <h2 style="font-size:28px;color:#4ade80;">
      الفائز بالقعدة
    </h2>

    <div style="margin-top:20px;font-size:24px;">
      ${newPoints} نقطة
    </div>

    <div style="margin-top:40px;display:flex;gap:15px;flex-wrap:wrap;justify-content:center;">
      <button onclick="restartGame()" style="background:#22c55e;border:none;padding:16px 28px;border-radius:16px;color:white;font-size:20px;font-weight:bold;">
        🔄 قعدة جديدة
      </button>

      <button onclick="exitGame()" style="background:#ef4444;border:none;padding:16px 28px;border-radius:16px;color:white;font-size:20px;font-weight:bold;">
        🚪 إنهاء وخروج
      </button>
    </div>
  </div>
`;

  return;
}

  document.getElementById("votesBox").innerHTML += `
  <div style="
    margin-top:15px;
    background:#065f46;
    padding:12px;
    border-radius:12px;
    font-weight:bold;
  ">
    ${pointsChange > 0
      ? `✅ نجح ${round.playerName} وحصل على ${pointsChange} نقطة`
      : `❌ فشل ${round.playerName}`}
  </div>
`;
await set(ref(db, "rooms/" + roomCode + "/lastResult"), {
  playerName: round.playerName,
  pointsChange: pointsChange,
  success: success,
  fail: fail,
  message: pointsChange > 0
    ? `✅ نجح ${round.playerName} وحصل على ${pointsChange} نقطة`
    : `❌ فشل ${round.playerName} وخسر 5 نقاط`,
  createdAt: Date.now()
});

await update(ref(db, "rooms/" + roomCode + "/currentRound"), {
  phase: "finished"
});
  await set(ref(db, "rooms/" + roomCode + "/currentRound"), null);
await set(ref(db, "rooms/" + roomCode + "/votes"), null);
};

window.kickPlayer = async function (id) {
  if (!confirm("هل تريد طرد هذا اللاعب؟")) return;
  await remove(ref(db, "rooms/" + roomCode + "/players/" + id));
};

window.leaveGame = async function () {
  if (!playerId) {
    location.reload();
    return;
  }

  await remove(ref(db, "rooms/" + roomCode + "/players/" + playerId));
  location.reload();
};

window.endGame = async function () {
  if (!confirm("هل تريد إنهاء اللعبة؟")) return;

  await update(ref(db, "rooms/" + roomCode), {
    status: "ended",
    currentRound: null,
    spinState: null,
    votes: null
  });

  alert("تم إنهاء اللعبة");
  location.reload();
};
window.revealAnswerEarly = async function () {
  const roundSnap = await get(ref(db, "rooms/" + roomCode + "/currentRound"));
  const round = roundSnap.val();

  if (!round) {
    alert("ماكو جولة حالياً");
    return;
  }
playSound("sounds/correct.mp3");
  await update(ref(db, "rooms/" + roomCode + "/currentRound"), {
    answerRevealed: true
  });
};

window.toggleHostMode = function () {
  document.body.classList.toggle("hostMode");

  const isHost = document.body.classList.contains("hostMode");

  if (isHost) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
};

window.restartGame = async function () {
  const playersSnap = await get(ref(db, "rooms/" + roomCode + "/players"));
  const players = playersSnap.val() || {};

  for (const id in players) {
    await update(ref(db, "rooms/" + roomCode + "/players/" + id), {
      points: 0
    });
  }

  await update(ref(db, "rooms/" + roomCode), {
    status: "waiting",
    winner: null,
    currentRound: null,
    votes: null,
    spinState: null,
    lastResult: null
  });

  location.reload();
};

window.exitGame = async function () {
  await remove(ref(db, "rooms/" + roomCode));
  location.reload();
};
function showWinnerScreen(winner) {
  if (!winner) return;

  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      background:#0f172a;
      display:flex;
      justify-content:center;
      align-items:center;
      flex-direction:column;
      color:white;
      font-family:sans-serif;
      text-align:center;
      padding:30px;
    ">
      <div style="font-size:90px;">🏆</div>

      <h1 style="font-size:46px;color:#facc15;margin:10px 0;">
        ${winner.avatar || "😎"} ${winner.name}
      </h1>

      <h2 style="font-size:28px;color:#4ade80;">
        الفائز بالقعدة
      </h2>

      <div style="margin-top:20px;font-size:24px;">
        ${winner.points || 0} نقطة
      </div>

      <div style="margin-top:35px;font-size:20px;color:#cbd5e1;">
        🎉 مبروك للفائز 🎉
      </div>
    </div>
  `;
}
loadQuestions();
const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl = urlParams.get("room");

if (roomFromUrl) {
  roomCode = roomFromUrl;
  showPlayerScreen();
}