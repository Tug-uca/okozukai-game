// ============================================
// 【定数定義】
// ============================================

const CONSTANTS = {
  MONTHLY_ALLOWANCE: 500,       // 月のおこづかい（★ここを変更すれば全体に反映）
  MIN_GOAL_PRICE: 1500,         // 最小目標金額
  MAX_GOAL_PRICE: 6000,         // 最大目標金額
  MAX_MONTHS: 12,               // 最大計画月数
  START_MONTH: 4,               // 開始月（4月）
  TEMPTATION_PER_MONTH: 2,      // 月の誘惑回数（固定）
  HAPPENING_PROBABILITY: 0.5,   // ハプニング発生確率
};

const DEBUG = false;

// ============================================
// 【グローバル変数】
// ============================================

let itemsData = null;
let goalsData = null;
let happeningsData = null;

let gameState = {
  currentScreen: 'title',

  player: {
    money: 0,
    monthlyAllowance: CONSTANTS.MONTHLY_ALLOWANCE,
  },

  game: {
    selectedGoal: null,
    currentMonth: CONSTANTS.START_MONTH,  // 4月からスタート
    startMonth: CONSTANTS.START_MONTH,
    plannedMonths: 0,
    recurringPurchases: [],  // 毎月購入するアイテムのリスト
    events: [],
    temptationsThisMonth: 0,
    maxTemptationsThisMonth: 0,
  },

  stats: {
    resistedTemptations: 0,
    gavingInTemptations: 0,
  }
};

// ============================================
// 【デバッグ用ログ関数】
// ============================================

function log(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// ============================================
// 【データ読み込み】
// ============================================

async function loadGameData() {
  try {
    const [itemsRes, goalsRes, happeningsRes] = await Promise.all([
      fetch('data/items.json'),
      fetch('data/goals.json'),
      fetch('data/happenings.json')
    ]);

    itemsData = await itemsRes.json();
    goalsData = await goalsRes.json();
    happeningsData = await happeningsRes.json();

    log('Data loaded:', { itemsData, goalsData, happeningsData });
    return true;
  } catch (error) {
    console.error('Failed to load game data:', error);
    alert('ゲームデータの読み込みに失敗しました。ページをリロードしてください。');
    return false;
  }
}

// ============================================
// 【画像フォールバック処理】
// ============================================

function setupImageFallback(imgElement, fallbackText) {
  imgElement.onerror = function() {
    this.style.display = 'none';

    // 既存のフォールバック要素があれば削除
    const existingFallback = this.parentNode.querySelector('.img-fallback');
    if (existingFallback) {
      existingFallback.remove();
    }

    const fallback = document.createElement('div');
    fallback.className = 'img-fallback';
    fallback.textContent = fallbackText;
    this.parentNode.insertBefore(fallback, this.nextSibling);
  };
}

// ============================================
// 【画面制御】
// ============================================

function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(section => {
    section.style.display = 'none';
  });

  document.getElementById(screenName).style.display = 'flex';
  gameState.currentScreen = screenName;
  log('Screen changed to:', screenName);
}

function renderTitleScreen() {
  // タイトル画面は静的なので特に処理なし
}

function renderGuideScreen() {
  // 説明画面は静的なので特に処理なし
}

function renderPlanningScreen() {
  // 目標選択UIの生成
  const goalSelection = document.getElementById('goal-selection');
  goalSelection.innerHTML = '';

  goalsData.forEach(goal => {
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.onclick = () => selectGoal(goal.id);

    const img = document.createElement('img');
    img.src = goal.image;
    img.alt = goal.name;
    setupImageFallback(img, goal.name);

    const name = document.createElement('p');
    name.className = 'goal-name';
    name.textContent = goal.name;

    const price = document.createElement('p');
    price.className = 'goal-price';
    price.innerHTML = `${goal.price}<ruby>円<rt>えん</rt></ruby>`;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);
    goalSelection.appendChild(card);
  });
}

function renderPlayingScreen() {
  updateMoneyDisplay();
  updateProgressBar();
  updatePlanDifferenceDisplay();

  const monthDisplay = document.getElementById('current-month-display');
  monthDisplay.textContent = getMonthName(gameState.game.currentMonth);

  // 目標おもちゃの表示
  const goal = gameState.game.selectedGoal;
  document.getElementById('playing-goal-image').src = goal.image;
  document.getElementById('playing-goal-name').textContent = goal.name;
  document.getElementById('playing-goal-price').textContent = goal.price;

  setupImageFallback(
    document.getElementById('playing-goal-image'),
    goal.name
  );
}

function renderResultScreen(success) {
  const title = document.getElementById('result-title');
  const details = document.getElementById('result-details');
  const stats = document.getElementById('result-stats');

  if (success) {
    title.textContent = 'せいこう！';
    title.className = 'success';
    details.innerHTML = `
      <p><ruby>目標<rt>もくひょう</rt></ruby>の「${gameState.game.selectedGoal.name}」をゲットできたよ！</p>
      <p>おめでとう！</p>
      <p><ruby>計画<rt>けいかく</rt></ruby>を<ruby>立<rt>た</rt></ruby>てて、<ruby>誘惑<rt>ゆうわく</rt></ruby>に<ruby>負<rt>ま</rt></ruby>けずに<ruby>貯金<rt>ちょきん</rt></ruby>できたね！</p>
    `;
  } else {
    title.textContent = 'ざんねん…';
    title.className = 'failure';
    details.innerHTML = `
      <p><ruby>目標<rt>もくひょう</rt></ruby>の「${gameState.game.selectedGoal.name}」をゲットできなかったよ…</p>
      <p>でも、チャレンジしたことはすごいことだよ！</p>
      <p>もういちど<ruby>挑戦<rt>ちょうせん</rt></ruby>してみよう！</p>
    `;
  }

  const actualMonths = gameState.game.currentMonth - gameState.game.startMonth + 1;

  stats.innerHTML = `
    <h3><ruby>記録<rt>きろく</rt></ruby></h3>
    <p><ruby>計画期間<rt>けいかくきかん</rt></ruby>: ${gameState.game.plannedMonths}<ruby>ヶ月<rt>かげつ</rt></ruby></p>
    <p><ruby>実際<rt>じっさい</rt></ruby>の<ruby>期間<rt>きかん</rt></ruby>: ${actualMonths}<ruby>ヶ月<rt>かげつ</rt></ruby></p>
    <p><ruby>最終所持金<rt>さいしゅうしょじきん</rt></ruby>: <span>${gameState.player.money}</span><ruby>円<rt>えん</rt></ruby></p>
    <p><ruby>誘惑<rt>ゆうわく</rt></ruby>に<ruby>勝<rt>か</rt></ruby>った<ruby>回数<rt>かいすう</rt></ruby>: <span>${gameState.stats.resistedTemptations}</span><ruby>回<rt>かい</rt></ruby></p>
    <p><ruby>誘惑<rt>ゆうわく</rt></ruby>に<ruby>負<rt>ま</rt></ruby>けた<ruby>回数<rt>かいすう</rt></ruby>: <span>${gameState.stats.gavingInTemptations}</span><ruby>回<rt>かい</rt></ruby></p>
  `;
}

function updateMoneyDisplay() {
  const moneyDisplay = document.getElementById('current-money-display');
  if (moneyDisplay) {
    moneyDisplay.textContent = gameState.player.money;
  }
}

function updateProgressBar() {
  const progress = calculateProgress();
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-percentage');

  if (progressFill && progressText) {
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.floor(progress);
  }
}

function updatePlanDifferenceDisplay() {
  const goalPrice = gameState.game.selectedGoal.price;
  const currentMoney = gameState.player.money;
  const remaining = Math.max(0, goalPrice - currentMoney);

  const diffElement = document.getElementById('plan-difference');
  const diffAmount = document.getElementById('difference-amount');

  if (diffElement && diffAmount) {
    diffAmount.textContent = remaining;
    diffElement.className = 'plan-difference';
    if (remaining === 0) {
      diffElement.classList.add('positive');
    } else if (currentMoney < goalPrice * 0.5) {
      diffElement.classList.add('negative');
    }
  }
}

// ============================================
// 【作戦立案ロジック】
// ============================================

function selectGoal(goalId) {
  const goal = goalsData.find(g => g.id === goalId);
  gameState.game.selectedGoal = goal;

  // UI更新: 選択状態の表示
  document.querySelectorAll('.goal-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');

  // 選択した目標の詳細表示
  const display = document.getElementById('selected-goal-display');
  display.style.display = 'block';

  // 既存のフォールバック要素をクリア
  const goalImageContainer = document.getElementById('selected-goal-image').parentNode;
  const existingFallback = goalImageContainer.querySelector('.img-fallback');
  if (existingFallback) {
    existingFallback.remove();
  }

  // 画像要素をリセット
  const goalImage = document.getElementById('selected-goal-image');
  goalImage.style.display = 'block';
  goalImage.src = goal.image;

  document.getElementById('selected-goal-name').textContent = goal.name;
  document.getElementById('selected-goal-price').textContent = goal.price;

  setupImageFallback(goalImage, goal.name);

  // 毎月の購入アイテム選択セクションを表示
  document.getElementById('recurring-purchase-section').style.display = 'block';

  // 初期計画をリセット
  gameState.game.recurringPurchases = [];
  renderRecurringPurchaseSelection();
  updatePlanSummary();

  log('Goal selected:', goal);
}

/**
 * 毎月購入するアイテムの選択UIを表示
 */
function renderRecurringPurchaseSelection() {
  const itemSelection = document.getElementById('recurring-item-selection');
  itemSelection.innerHTML = '';

  // すべてのアイテムを表示（フラットな配列）
  itemsData.forEach(item => {
    const card = createRecurringItemCard(item);
    itemSelection.appendChild(card);
  });

  renderSelectedRecurringItems();
}

/**
 * 毎月購入アイテムのカードを作成
 */
function createRecurringItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';

  // すでに選択されているかチェック
  const isSelected = gameState.game.recurringPurchases.some(p => p.itemId === item.id);
  if (isSelected) {
    card.classList.add('selected');
  }

  card.onclick = () => toggleRecurringPurchase(item);

  // 画像コンテナ
  const imageContainer = document.createElement('div');
  imageContainer.className = 'item-image-container';

  const img = document.createElement('img');
  img.src = item.image;
  img.alt = item.name;
  img.onerror = function() {
    this.style.display = 'none';
    this.nextElementSibling.style.display = 'flex';
  };

  const fallback = document.createElement('div');
  fallback.className = 'img-fallback';
  fallback.textContent = item.name;

  imageContainer.appendChild(img);
  imageContainer.appendChild(fallback);

  const nameElement = document.createElement('p');
  nameElement.className = 'item-name';
  nameElement.textContent = item.name;

  const priceElement = document.createElement('p');
  priceElement.className = 'item-price';
  priceElement.innerHTML = `${item.price}<ruby>円<rt>えん</rt></ruby>`;

  card.appendChild(imageContainer);
  card.appendChild(nameElement);
  card.appendChild(priceElement);

  return card;
}

/**
 * 毎月購入アイテムの選択/解除を切り替え
 */
function toggleRecurringPurchase(item) {
  const index = gameState.game.recurringPurchases.findIndex(p => p.itemId === item.id);

  if (index >= 0) {
    // すでに選択されている場合は削除
    gameState.game.recurringPurchases.splice(index, 1);
  } else {
    // 選択されていない場合は追加
    gameState.game.recurringPurchases.push({
      itemId: item.id,
      itemName: item.name,
      price: item.price
    });
  }

  renderRecurringPurchaseSelection();
  updatePlanSummary();
  log('Recurring purchase toggled:', item.name);
}

/**
 * 選択した毎月購入アイテムのリストを表示
 */
function renderSelectedRecurringItems() {
  const selectedList = document.getElementById('selected-recurring-items');

  if (gameState.game.recurringPurchases.length === 0) {
    selectedList.innerHTML = '<p class="no-selection"><ruby>何<rt>なに</rt></ruby>も<ruby>選択<rt>せんたく</rt></ruby>されていません（<ruby>全額貯金<rt>ぜんがくちょきん</rt></ruby>）</p>';
    return;
  }

  selectedList.innerHTML = '';
  gameState.game.recurringPurchases.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'selected-item';
    itemDiv.innerHTML = `
      <span>${item.itemName}</span>
      <span>${item.price}<ruby>円<rt>えん</rt></ruby></span>
      <button class="btn-remove" onclick="removeRecurringPurchase('${item.itemId}')">×</button>
    `;
    selectedList.appendChild(itemDiv);
  });
}

/**
 * 毎月購入アイテムを削除
 */
function removeRecurringPurchase(itemId) {
  const index = gameState.game.recurringPurchases.findIndex(p => p.itemId === itemId);
  if (index >= 0) {
    gameState.game.recurringPurchases.splice(index, 1);
    renderRecurringPurchaseSelection();
    updatePlanSummary();
    log('Recurring purchase removed:', itemId);
  }
}

/**
 * 目標達成に必要な月数を計算
 * @returns {number} 必要な月数
 */
function calculateRequiredMonths() {
  const goalPrice = gameState.game.selectedGoal.price;
  const monthlyAllowance = gameState.player.monthlyAllowance;
  const recurringPurchases = gameState.game.recurringPurchases;

  // 毎月の支出を計算
  const monthlyExpense = recurringPurchases.reduce((sum, item) => sum + item.price, 0);

  // 毎月の貯金額
  const monthlySavings = monthlyAllowance - monthlyExpense;

  // 貯金額がマイナスまたは0の場合は達成不可能
  if (monthlySavings <= 0) {
    return Infinity;
  }

  // 必要な月数（切り上げ）
  return Math.ceil(goalPrice / monthlySavings);
}

/**
 * 毎月の貯金額を計算
 * @returns {number} 毎月の貯金額
 */
function calculateMonthlySavings() {
  const monthlyAllowance = gameState.player.monthlyAllowance;
  const recurringPurchases = gameState.game.recurringPurchases;
  const monthlyExpense = recurringPurchases.reduce((sum, item) => sum + item.price, 0);
  return monthlyAllowance - monthlyExpense;
}

/**
 * 計画のサマリーを更新
 */
function updatePlanSummary() {
  const goalPrice = gameState.game.selectedGoal.price;
  const monthlyExpense = gameState.game.recurringPurchases.reduce((sum, item) => sum + item.price, 0);
  const monthlySavings = calculateMonthlySavings();
  const requiredMonths = calculateRequiredMonths();

  // 毎月の支出を表示
  document.getElementById('monthly-expense').textContent = monthlyExpense;

  // 毎月の貯金額を表示
  document.getElementById('monthly-savings').textContent = monthlySavings;

  // 必要な月数を表示
  const monthsElement = document.getElementById('required-months');
  const statusElement = document.getElementById('plan-status');
  const startButton = document.getElementById('btn-start-challenge');

  if (monthlySavings <= 0) {
    // 支出がお小遣いを超える場合
    monthsElement.textContent = '∞';
    statusElement.textContent = '毎月の支払いがおこづかいより多いよ！';
    statusElement.className = 'plan-status error';
    startButton.disabled = true;
  } else if (requiredMonths === Infinity) {
    // 貯金できない場合
    monthsElement.textContent = '∞';
    statusElement.textContent = 'この計画では目標に届きません。';
    statusElement.className = 'plan-status error';
    startButton.disabled = true;
  } else if (requiredMonths > CONSTANTS.MAX_MONTHS) {
    // 月数が多すぎる場合
    monthsElement.textContent = requiredMonths;
    statusElement.textContent = `この計画だと${requiredMonths}か月かかるよ。もっとがまんする？`;
    statusElement.className = 'plan-status warning';
    startButton.disabled = false;
    gameState.game.plannedMonths = requiredMonths;
  } else {
    // 達成可能
    monthsElement.textContent = requiredMonths;
    statusElement.textContent = `計画OK！${requiredMonths}か月で達成できるよ！`;
    statusElement.className = 'plan-status success';
    startButton.disabled = false;
    gameState.game.plannedMonths = requiredMonths;
  }

  renderSelectedRecurringItems();
}

function startGame() {
  // ゲーム状態の初期化
  gameState.player.money = 0;
  gameState.game.currentMonth = CONSTANTS.START_MONTH;  // 4月からスタート
  gameState.game.events = [];
  gameState.stats.resistedTemptations = 0;
  gameState.stats.gavingInTemptations = 0;

  showScreen('playing');
  renderPlayingScreen();
  saveGame();

  // 最初の月を開始
  setTimeout(() => {
    processMonth();
  }, 500);

  log('Game started');
}

// ============================================
// 【実行画面ロジック】
// ============================================

function processMonth() {
  const eventArea = document.getElementById('event-area');
  eventArea.innerHTML = '';

  gameState.game.temptationsThisMonth = 0;
  gameState.game.maxTemptationsThisMonth = CONSTANTS.TEMPTATION_PER_MONTH;

  // 月初めのおこづかいをもらう
  showMonthStartEvent();
}

function showMonthStartEvent() {
  const eventArea = document.getElementById('event-area');

  const card = document.createElement('div');
  card.className = 'event-card fade-in';

  const message = document.createElement('p');
  message.className = 'event-message';
  message.innerHTML = `${getMonthName(gameState.game.currentMonth)}になったよ！<br>おこづかいを${gameState.player.monthlyAllowance}<ruby>円<rt>えん</rt></ruby>もらったよ！`;

  const button = document.createElement('button');
  button.className = 'btn btn-primary';
  button.textContent = 'OK';
  button.onclick = () => {
    gameState.player.money += gameState.player.monthlyAllowance;

    // 定期購入の自動支払い
    const recurringExpense = gameState.game.recurringPurchases.reduce((sum, item) => sum + item.price, 0);
    if (recurringExpense > 0) {
      gameState.player.money -= recurringExpense;
    }

    updateMoneyDisplay();
    updateProgressBar();
    updatePlanDifferenceDisplay();
    saveGame();

    // 定期購入の支払いを表示
    if (recurringExpense > 0) {
      setTimeout(() => {
        showRecurringPurchaseEvent(recurringExpense);
      }, 300);
    } else {
      // 定期購入がない場合は直接ハプニングへ
      setTimeout(() => {
        checkAndShowHappening();
      }, 300);
    }
  };

  card.appendChild(message);
  card.appendChild(button);
  eventArea.appendChild(card);
}

function showRecurringPurchaseEvent(expense) {
  const eventArea = document.getElementById('event-area');
  eventArea.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'event-card fade-in';

  const message = document.createElement('p');
  message.className = 'event-message';

  const itemNames = gameState.game.recurringPurchases.map(item => item.itemName).join('、');
  message.innerHTML = `<ruby>毎月<rt>まいつき</rt></ruby><ruby>買<rt>か</rt></ruby>うもの（${itemNames}）を<ruby>買<rt>か</rt></ruby>ったよ！`;

  const amountText = document.createElement('p');
  amountText.className = 'event-message';
  amountText.style.color = 'var(--danger-color)';
  amountText.style.fontWeight = 'bold';
  amountText.textContent = `-${expense}円`;

  const button = document.createElement('button');
  button.className = 'btn btn-primary';
  button.textContent = 'OK';
  button.onclick = () => {
    // ハプニングイベントの発生チェック
    setTimeout(() => {
      checkAndShowHappening();
    }, 300);
  };

  card.appendChild(message);
  card.appendChild(amountText);
  card.appendChild(button);
  eventArea.appendChild(card);
}

function checkAndShowHappening() {
  if (Math.random() < CONSTANTS.HAPPENING_PROBABILITY) {
    const happening = generateHappeningEvent();
    if (happening) {
      showHappeningEvent(happening);
      return;
    }
  }

  // ハプニングがない場合は誘惑イベントへ
  showNextTemptation();
}

function generateHappeningEvent() {
  return getRandomByProbability(happeningsData);
}

function showHappeningEvent(happening) {
  const eventArea = document.getElementById('event-area');
  eventArea.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'event-card fade-in';
  if (happening.type === 'positive') {
    card.classList.add('happening-positive');
  } else {
    card.classList.add('happening-negative');
  }

  const title = document.createElement('h3');
  title.textContent = 'ハプニング！';

  const message = document.createElement('p');
  message.className = 'event-message';
  message.textContent = happening.message;

  const amountText = document.createElement('p');
  amountText.className = 'event-message';
  amountText.style.fontWeight = 'bold';
  amountText.style.fontSize = '1.3em';
  if (happening.amount > 0) {
    amountText.style.color = 'var(--success-color)';
    amountText.textContent = `+${happening.amount}円`;
  } else {
    amountText.style.color = 'var(--danger-color)';
    amountText.textContent = `${happening.amount}円`;
  }

  const button = document.createElement('button');
  button.className = 'btn btn-primary';
  button.textContent = 'OK';
  button.onclick = () => {
    gameState.player.money += happening.amount;
    updateMoneyDisplay();
    updateProgressBar();
    updatePlanDifferenceDisplay();
    saveGame();

    gameState.game.events.push({
      type: 'happening',
      data: happening
    });

    // 誘惑イベントへ
    setTimeout(() => {
      showNextTemptation();
    }, 300);
  };

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(amountText);
  card.appendChild(button);
  eventArea.appendChild(card);
}

function showNextTemptation() {
  if (gameState.game.temptationsThisMonth >= gameState.game.maxTemptationsThisMonth) {
    // 誘惑イベント終了、月末へ
    showMonthEnd();
    return;
  }

  const temptation = generateTemptationEvent();
  showTemptationEvent(temptation);
}

function generateTemptationEvent() {
  // フラットな配列からランダムに選択
  const randomItem = itemsData[Math.floor(Math.random() * itemsData.length)];

  return {
    type: 'temptation',
    item: randomItem,
    message: `${randomItem.name}がほしい！`
  };
}

function showTemptationEvent(temptation) {
  const eventArea = document.getElementById('event-area');
  eventArea.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'event-card fade-in';

  const title = document.createElement('h3');
  title.innerHTML = '<ruby>お出<rt>でか</rt></ruby>けイベント！';

  const message = document.createElement('p');
  message.className = 'event-message';
  message.textContent = temptation.message;

  const itemDiv = document.createElement('div');
  itemDiv.className = 'temptation-item';

  // 画像コンテナ
  const imageContainer = document.createElement('div');
  imageContainer.className = 'item-image-container';

  const img = document.createElement('img');
  img.src = temptation.item.image;
  img.alt = temptation.item.name;
  img.onerror = function() {
    this.style.display = 'none';
    this.nextElementSibling.style.display = 'flex';
  };

  const fallback = document.createElement('div');
  fallback.className = 'img-fallback';
  fallback.textContent = temptation.item.name;

  imageContainer.appendChild(img);
  imageContainer.appendChild(fallback);

  const itemInfo = document.createElement('div');
  itemInfo.className = 'temptation-info';

  const itemName = document.createElement('p');
  itemName.className = 'temptation-name';
  itemName.textContent = temptation.item.name;

  const itemPrice = document.createElement('p');
  itemPrice.className = 'temptation-price';
  itemPrice.innerHTML = `${temptation.item.price}<ruby>円<rt>えん</rt></ruby>`;

  itemInfo.appendChild(itemName);
  itemInfo.appendChild(itemPrice);

  itemDiv.appendChild(imageContainer);
  itemDiv.appendChild(itemInfo);

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'event-buttons';

  const buyButton = document.createElement('button');
  buyButton.className = 'btn btn-danger';
  buyButton.innerHTML = '<ruby>買<rt>か</rt></ruby>う';
  buyButton.onclick = () => handleTemptation(true, temptation);

  const resistButton = document.createElement('button');
  resistButton.className = 'btn btn-success';
  resistButton.innerHTML = 'がまんする';
  resistButton.onclick = () => handleTemptation(false, temptation);

  buttonsDiv.appendChild(buyButton);
  buttonsDiv.appendChild(resistButton);

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(itemDiv);
  card.appendChild(buttonsDiv);
  eventArea.appendChild(card);

  gameState.game.temptationsThisMonth++;
}

function handleTemptation(accept, temptation) {
  const eventArea = document.getElementById('event-area');

  if (accept) {
    // 買う場合
    const newMoney = gameState.player.money - temptation.item.price;

    // 所持金がマイナスになる場合はゲームオーバー
    if (newMoney < 0) {
      gameState.player.money = newMoney;
      updateMoneyDisplay();
      saveGame();

      setTimeout(() => {
        clearSave();
        showScreen('result');
        renderResultScreen(false);
      }, 500);
      return;
    }

    gameState.player.money = newMoney;
    gameState.stats.gavingInTemptations++;

    eventArea.innerHTML = '';
    const resultCard = document.createElement('div');
    resultCard.className = 'event-card fade-in';
    resultCard.innerHTML = `
      <p class="event-message">${temptation.item.name}を買ったよ！</p>
      <p class="event-message" style="color: var(--danger-color); font-weight: bold;">-${temptation.item.price}円</p>
      <button class="btn btn-primary" onclick="continueAfterTemptation()">つづける</button>
    `;
    eventArea.appendChild(resultCard);
  } else {
    // がまんする場合
    gameState.stats.resistedTemptations++;

    eventArea.innerHTML = '';
    const resultCard = document.createElement('div');
    resultCard.className = 'event-card fade-in';
    resultCard.innerHTML = `
      <p class="event-message">がまんできた！えらい！</p>
      <button class="btn btn-primary" onclick="continueAfterTemptation()">つづける</button>
    `;
    eventArea.appendChild(resultCard);
  }

  updateMoneyDisplay();
  updateProgressBar();
  updatePlanDifferenceDisplay();
  saveGame();

  gameState.game.events.push({
    type: 'temptation',
    accepted: accept,
    data: temptation
  });
}

function continueAfterTemptation() {
  showNextTemptation();
}

function showMonthEnd() {
  const eventArea = document.getElementById('event-area');
  eventArea.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'event-card fade-in';

  const title = document.createElement('h3');
  title.innerHTML = `${getMonthName(gameState.game.currentMonth)}<ruby>終<rt>お</rt></ruby>わり！`;

  const savings = gameState.player.monthlyAllowance;
  let actualSpent = 0;
  gameState.game.events
    .filter(e => e.type === 'temptation' && e.accepted)
    .forEach(e => {
      actualSpent += e.data.item.price;
    });

  const message = document.createElement('p');
  message.className = 'event-message';
  message.innerHTML = `
    <ruby>今月<rt>こんげつ</rt></ruby>の<ruby>貯金<rt>ちょきん</rt></ruby>: ${savings - actualSpent}<ruby>円<rt>えん</rt></ruby><br>
    <ruby>現在<rt>げんざい</rt></ruby>の<ruby>所持金<rt>しょじきん</rt></ruby>: ${gameState.player.money}<ruby>円<rt>えん</rt></ruby>
  `;

  const button = document.createElement('button');
  button.className = 'btn btn-primary';
  button.innerHTML = '<ruby>次<rt>つぎ</rt></ruby>の<ruby>月<rt>つき</rt></ruby>へ';
  button.onclick = () => {
    checkGameEnd();
  };

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(button);
  eventArea.appendChild(card);
}

function checkGameEnd() {
  const goalAchieved = gameState.player.money >= gameState.game.selectedGoal.price;

  if (goalAchieved) {
    // 成功
    clearSave();
    showScreen('result');
    renderResultScreen(true);
  } else {
    // 経過月数を計算
    const startMonth = CONSTANTS.START_MONTH;
    const currentMonth = gameState.game.currentMonth;
    const monthsPassed = currentMonth - startMonth + 1;

    if (monthsPassed >= gameState.game.plannedMonths) {
      // 計画期間終了だが目標未達成
      clearSave();
      showScreen('result');
      renderResultScreen(false);
    } else {
      // 次の月へ
      gameState.game.currentMonth++;
      // 月が13以上（翌年の1月以降）になることを許可
      gameState.game.events = [];
      saveGame();
      renderPlayingScreen();
      setTimeout(() => {
        processMonth();
      }, 500);
    }
  }
}

// ============================================
// 【計算ユーティリティ】
// ============================================

/**
 * 現在の所持金と計画上の貯金額の差を計算
 * @returns {number} 差分（プラスなら計画より多い、マイナスなら少ない）
 */
function calculatePlanDifference() {
  const startMonth = CONSTANTS.START_MONTH;
  const currentMonth = gameState.game.currentMonth;
  const monthsPassed = currentMonth - startMonth + 1;

  // 計画上の毎月の貯金額
  const monthlySavings = calculateMonthlySavings();

  // 計画上の累計貯金額
  const plannedTotal = monthlySavings * monthsPassed;

  // 実際の所持金との差
  const actualMoney = gameState.player.money;
  const difference = actualMoney - plannedTotal;

  return difference;
}

function calculateProgress() {
  const goalPrice = gameState.game.selectedGoal.price;
  const currentMoney = gameState.player.money;
  return Math.min((currentMoney / goalPrice) * 100, 100);
}

function checkGoalAchieved() {
  return gameState.player.money >= gameState.game.selectedGoal.price;
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomByProbability(items) {
  const random = Math.random();
  let cumulative = 0;

  for (const item of items) {
    cumulative += item.probability;
    if (random <= cumulative) {
      return item;
    }
  }
  return items[items.length - 1];
}

/**
 * 月番号を月名に変換（4→"4月"）
 * @param {number} monthNumber - 月番号（4〜15、13以降は翌年）
 * @returns {string} 月名（例："4月"、"12月"、"1月"）
 */
function getMonthName(monthNumber) {
  // 13以降は翌年の1月、2月、3月
  const displayMonth = monthNumber > 12 ? monthNumber - 12 : monthNumber;
  return `${displayMonth}月`;
}

// ============================================
// 【状態管理】
// ============================================

function saveGame() {
  try {
    localStorage.setItem('okozukaiGame', JSON.stringify(gameState));
    log('Game saved');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem('okozukaiGame');
    if (saved) {
      Object.assign(gameState, JSON.parse(saved));
      log('Game loaded:', gameState);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

function clearSave() {
  try {
    localStorage.removeItem('okozukaiGame');
    log('Save cleared');
  } catch (error) {
    console.error('Failed to clear save:', error);
  }
}

function resetGame() {
  clearSave();

  gameState = {
    currentScreen: 'title',
    player: {
      money: 0,
      monthlyAllowance: CONSTANTS.MONTHLY_ALLOWANCE,
    },
    game: {
      selectedGoal: null,
      currentMonth: CONSTANTS.START_MONTH,
      startMonth: CONSTANTS.START_MONTH,
      plannedMonths: 0,
      recurringPurchases: [],
      events: [],
      temptationsThisMonth: 0,
      maxTemptationsThisMonth: 0,
    },
    stats: {
      resistedTemptations: 0,
      gavingInTemptations: 0,
    }
  };

  showScreen('title');
  log('Game reset');
}

// ============================================
// 【初期化】
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  log('DOM loaded');

  // データ読み込み
  const loaded = await loadGameData();
  if (!loaded) return;

  // イベントリスナーの設定
  document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('guide');
    renderGuideScreen();
  });

  document.getElementById('btn-to-planning').addEventListener('click', () => {
    showScreen('planning');
    renderPlanningScreen();
  });

  document.getElementById('btn-start-challenge').addEventListener('click', () => {
    startGame();
  });

  document.getElementById('btn-play-again').addEventListener('click', () => {
    resetGame();
  });

  // セーブデータの読み込みチェック
  if (loadGame() && gameState.currentScreen !== 'title') {
    // ゲーム中のセーブがある場合は確認
    const resume = confirm('前回の続きからプレイしますか？');
    if (resume) {
      showScreen(gameState.currentScreen);
      if (gameState.currentScreen === 'planning') {
        renderPlanningScreen();
        if (gameState.game.selectedGoal) {
          // 目標を再選択状態にする
          const goalCards = document.querySelectorAll('.goal-card');
          goalCards.forEach((card, index) => {
            if (goalsData[index].id === gameState.game.selectedGoal.id) {
              card.classList.add('selected');
            }
          });
          document.getElementById('selected-goal-display').style.display = 'block';
          document.getElementById('selected-goal-image').src = gameState.game.selectedGoal.image;
          document.getElementById('selected-goal-name').textContent = gameState.game.selectedGoal.name;
          document.getElementById('selected-goal-price').textContent = gameState.game.selectedGoal.price;
          document.getElementById('recurring-purchase-section').style.display = 'block';
          renderRecurringPurchaseSelection();
          updatePlanSummary();
        }
      } else if (gameState.currentScreen === 'playing') {
        renderPlayingScreen();
      }
    } else {
      resetGame();
    }
  }

  log('Game initialized');
});
