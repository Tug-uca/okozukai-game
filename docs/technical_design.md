# おこづかいチャレンジ！ - 技術設計書

## 1. ドキュメント概要

本書は「おこづかいチャレンジ！」ゲームの技術設計書です。
HTML/CSS/JavaScriptのみを使用し、GitHub Pagesでホスティング可能な静的サイトとして実装します。

**設計方針：**
- コードのシンプルさを最優先
- 最小限のファイル構成
- 拡張性の確保（データ駆動設計）
- スマートフォン優先のレスポンシブデザイン

---

## 2. ファイル構成

### 2.1 ディレクトリ構造

```
okozukai-game/
├── index.html          # 単一HTMLファイル（全画面を含む）
├── css/
│   └── style.css       # 単一CSSファイル
├── js/
│   └── game.js         # 単一JavaScriptファイル
├── data/
│   ├── items.json      # アイテムデータ（お菓子、おもちゃ、ゲーム）
│   ├── goals.json      # 目標おもちゃデータ
│   └── happenings.json # ハプニングデータ
└── assets/
    └── images/         # 画像ファイル
        ├── goals/      # 目標おもちゃの画像
        ├── items/      # 購入可能アイテムの画像
        └── ui/         # UIアイコン（貯金箱など）
```

### 2.2 ファイルの役割

**index.html**
- 全画面を`<section>`で区切って定義
- 画面遷移は表示/非表示で制御
- セマンティックなHTML5構造

**style.css**
- CSS変数でテーマ管理
- モバイルファーストのレスポンシブデザイン
- 画面ごとのクラスで整理

**game.js**
- 機能ごとにコメントで区切り
- 初期化、画面制御、ゲームロジック、状態管理を含む
- シンプルな関数型アプローチ

**data/*.json**
- アイテム、目標、ハプニングをJSON形式で管理
- 拡張時はJSONファイルを編集するだけ

---

## 3. データ構造

### 3.1 ゲーム状態管理オブジェクト（gameState）

```javascript
const gameState = {
  currentScreen: 'title',  // 現在の画面

  // プレイヤーデータ
  player: {
    money: 0,              // 現在の所持金
    monthlyAllowance: 500, // 月のおこづかい
  },

  // ゲーム進行状況
  game: {
    selectedGoal: null,    // 選択した目標おもちゃオブジェクト
    currentMonth: 4,       // 現在の月（4=4月、5=5月、...12=12月、13=1月、14=2月、15=3月）
    startMonth: 4,         // 開始月（4月）
    plannedMonths: 0,      // 計画した月数
    recurringPurchases: [], // 毎月購入するアイテムのリスト（繰り返し）
    events: [],            // 発生したイベント履歴
  },

  // 統計情報
  stats: {
    resistedTemptations: 0, // 誘惑に勝った回数
    gavingInTemptations: 0, // 誘惑に負けた回数
  }
};
```

### 3.2 アイテムデータ構造（items.json）

```json
{
  "snacks": [
    {
      "id": "snack_1",
      "name": "チョコレート",
      "price": 100,
      "category": "snacks",
      "image": "assets/images/items/chocolate.png"
    },
    {
      "id": "snack_2",
      "name": "アイスクリーム",
      "price": 150,
      "category": "snacks",
      "image": "assets/images/items/icecream.png"
    },
    {
      "id": "snack_3",
      "name": "グミ",
      "price": 120,
      "category": "snacks",
      "image": "assets/images/items/gummy.png"
    },
    {
      "id": "snack_4",
      "name": "ポテトチップス",
      "price": 130,
      "category": "snacks",
      "image": "assets/images/items/chips.png"
    },
    {
      "id": "snack_5",
      "name": "キャンディー",
      "price": 100,
      "category": "snacks",
      "image": "assets/images/items/candy.png"
    },
    {
      "id": "snack_6",
      "name": "クッキー",
      "price": 180,
      "category": "snacks",
      "image": "assets/images/items/cookie.png"
    }
  ],
  "toys": [
    {
      "id": "toy_1",
      "name": "ミニカー",
      "price": 300,
      "category": "toys",
      "image": "assets/images/items/minicar.png"
    },
    {
      "id": "toy_2",
      "name": "ぬりえセット",
      "price": 400,
      "category": "toys",
      "image": "assets/images/items/coloring.png"
    },
    {
      "id": "toy_3",
      "name": "カードパック",
      "price": 500,
      "category": "toys",
      "image": "assets/images/items/cards.png"
    },
    {
      "id": "toy_4",
      "name": "小さいぬいぐるみ",
      "price": 600,
      "category": "toys",
      "image": "assets/images/items/small_plush.png"
    },
    {
      "id": "toy_5",
      "name": "ブロック",
      "price": 700,
      "category": "toys",
      "image": "assets/images/items/blocks.png"
    },
    {
      "id": "toy_6",
      "name": "ボール",
      "price": 800,
      "category": "toys",
      "image": "assets/images/items/ball.png"
    }
  ],
  "arcade": [
    {
      "id": "arcade_1",
      "name": "レースゲーム",
      "price": 100,
      "category": "arcade",
      "image": "assets/images/items/racegame.png"
    },
    {
      "id": "arcade_2",
      "name": "UFOキャッチャー",
      "price": 200,
      "category": "arcade",
      "image": "assets/images/items/ufocatcher.png"
    },
    {
      "id": "arcade_3",
      "name": "太鼓ゲーム",
      "price": 300,
      "category": "arcade",
      "image": "assets/images/items/drumgame.png"
    },
    {
      "id": "arcade_4",
      "name": "エアホッケー",
      "price": 200,
      "category": "arcade",
      "image": "assets/images/items/airhockey.png"
    },
    {
      "id": "arcade_5",
      "name": "もぐらたたき",
      "price": 100,
      "category": "arcade",
      "image": "assets/images/items/whackamole.png"
    }
  ]
}
```

**画像フォールバック対応：**
- 画像が存在しない場合は、`name`プロパティのテキストを表示
- HTMLの`<img>`タグに`onerror`属性を設定し、テキスト表示に切り替え

### 3.3 目標おもちゃデータ構造（goals.json）

```json
[
  {
    "id": "goal_1",
    "name": "ミニカー",
    "price": 1500,
    "image": "assets/images/goals/minicar.png",
    "difficulty": "easy"
  },
  {
    "id": "goal_2",
    "name": "ぬいぐるみ",
    "price": 2500,
    "image": "assets/images/goals/plush.png",
    "difficulty": "normal"
  },
  {
    "id": "goal_3",
    "name": "ゲーム",
    "price": 4000,
    "image": "assets/images/goals/game.png",
    "difficulty": "hard"
  },
  {
    "id": "goal_4",
    "name": "自転車",
    "price": 6000,
    "image": "assets/images/goals/bicycle.png",
    "difficulty": "very_hard"
  }
]
```

### 3.4 ハプニングデータ構造（happenings.json）

```json
[
  {
    "id": "happening_1",
    "type": "positive",
    "message": "おてつだいをしたよ！おこづかいがもらえた！",
    "amount": 100,
    "probability": 0.15
  },
  {
    "id": "happening_2",
    "type": "positive",
    "message": "おじいちゃん・おばあちゃんからおこづかいをもらった！",
    "amount": 300,
    "probability": 0.10
  },
  {
    "id": "happening_3",
    "type": "positive",
    "message": "たんじょう日で、おかねをもらった！",
    "amount": 500,
    "probability": 0.05
  },
  {
    "id": "happening_4",
    "type": "negative",
    "message": "おかねをおとしてしまった…",
    "amount": -200,
    "probability": 0.05
  }
]
```

**確率の合計について：**
- 全ハプニングの`probability`の合計は1.0以下
- 残りの確率はハプニングが発生しない

### 3.5 毎月の購入計画データ構造

プレイヤーは「毎月買うもの」を選択します。この選択は毎月繰り返されます。

```javascript
// recurringPurchases配列の例
// 毎月これらのアイテムを購入する計画
[
  {itemId: "snack_1", itemName: "チョコレート", price: 100, category: "snacks"},
  {itemId: "toy_1", itemName: "ミニカー", price: 300, category: "toys"},
]

// 合計支出: 400円/月
// 貯金額: 500円 - 400円 = 100円/月
// 目標3000円の場合: 30か月必要
```

---

## 4. 状態管理

### 4.1 画面遷移管理

**画面の種類：**
- `title`: タイトル画面
- `guide`: 説明画面
- `planning`: 作戦立案画面
- `playing`: 実行画面
- `result`: 結果画面

**遷移方法：**
```javascript
function showScreen(screenName) {
  // すべての画面を非表示
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });

  // 指定画面のみ表示
  document.getElementById(screenName).style.display = 'block';

  // 状態を更新
  gameState.currentScreen = screenName;
}
```

### 4.2 ローカルストレージによる状態保存

**実装方針：**
- ゲーム進行中の状態を自動保存
- ブラウザをリロードしても続きからプレイ可能
- ゲーム終了時（成功/失敗）はセーブを削除

**保存関数：**
```javascript
function saveGame() {
  localStorage.setItem('okozukaiGame', JSON.stringify(gameState));
}
```

**読み込み関数：**
```javascript
function loadGame() {
  const saved = localStorage.getItem('okozukaiGame');
  if (saved) {
    Object.assign(gameState, JSON.parse(saved));
    return true;
  }
  return false;
}
```

**削除関数：**
```javascript
function clearSave() {
  localStorage.removeItem('okozukaiGame');
}
```

**保存タイミング：**
- 計画を立て終わった時
- 月が進むたびに
- 誘惑に対して選択した時
- ハプニングが発生した時

**注意点：**
- ゲームクリア・失敗時はセーブを削除
- 次回プレイは新規からスタート

---

## 5. 主要な関数・モジュール

### 5.1 関数の分類

#### 初期化関数
```javascript
// データ読み込み
async function loadGameData()

// ゲーム開始
function initGame()
```

#### 画面制御（View層）
```javascript
function showScreen(screenName)
function renderTitleScreen()
function renderGuideScreen()
function renderPlanningScreen()
function renderPlayingScreen()
function renderResultScreen()
function updateMoneyDisplay()
function updateProgressBar()
```

#### ゲームロジック（Logic層）
```javascript
function selectGoal(goalId)
function addRecurringPurchase(itemId)
function removeRecurringPurchase(itemId)
function calculateRequiredMonths()
function calculateMonthlySavings()
function checkPlanViability()
function startGame()
function processMonth()
function generateTemptationEvent()
function generateHappeningEvent()
function handleTemptation(accept)
function checkGameEnd()
function getMonthName(monthNumber) // 4→"4月"
```

#### 計算ユーティリティ
```javascript
function calculateRequiredMonths()
function calculateMonthlyExpense(recurringPurchases)
function calculatePlanDifference()
function calculateProgress()
function checkGoalAchieved()
function getRandomItem(array)
function getRandomByProbability(items)
```

#### 状態管理
```javascript
function saveGame()
function loadGame()
function clearSave()
function resetGame()
```

### 5.2 主要関数の詳細

#### 5.2.1 必要月数の自動計算

```javascript
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
```

#### 5.2.2 誘惑イベント発生

```javascript
/**
 * 誘惑イベントを生成
 * @returns {Object} イベントオブジェクト
 */
function generateTemptationEvent() {
  // すべてのアイテムからランダムに選択
  const allItems = [
    ...itemsData.snacks,
    ...itemsData.toys,
    ...itemsData.arcade
  ];
  const randomItem = allItems[Math.floor(Math.random() * allItems.length)];

  return {
    type: 'temptation',
    item: randomItem,
    message: `${randomItem.name}がほしい！`
  };
}
```

#### 5.2.3 ハプニングイベント発生

```javascript
/**
 * ハプニングイベントを生成
 * @returns {Object|null} イベントオブジェクトまたはnull
 */
function generateHappeningEvent() {
  // 月に0〜1回（50%の確率で発生）
  if (Math.random() > 0.5) return null;

  // 確率に基づいて選択
  return getRandomByProbability(happeningsData);
}

/**
 * 確率に基づいてランダムにアイテムを選択
 * @param {Array} items - probabilityプロパティを持つアイテム配列
 * @returns {Object} 選択されたアイテム
 */
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
```

#### 5.2.4 計画との差分計算

```javascript
/**
 * 現在の所持金と計画上の貯金額の差を計算
 * @returns {number} 差分（プラスなら計画より多い、マイナスなら少ない）
 */
function calculatePlanDifference() {
  const startMonth = 4; // 4月スタート
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
```

#### 5.2.5 進捗バーの計算

```javascript
/**
 * 目標達成の進捗率を計算
 * @returns {number} 進捗率（0〜100）
 */
function calculateProgress() {
  const goalPrice = gameState.game.selectedGoal.price;
  const currentMoney = gameState.player.money;
  return Math.min((currentMoney / goalPrice) * 100, 100);
}
```

#### 5.2.6 月の表記変換

```javascript
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

// 使用例
// getMonthName(4)  → "4月"
// getMonthName(12) → "12月"
// getMonthName(13) → "1月"（翌年）
// getMonthName(15) → "3月"（翌年）
```

---

## 6. イベントシステム

### 6.1 イベントの種類

1. **誘惑イベント（Temptation）**
   - 月に2〜3回発生
   - すべてのアイテムからランダムに選択
   - プレイヤーの計画とは無関係に発生

2. **ハプニングイベント（Happening）**
   - 月に0〜1回発生
   - 確率に基づいて選択
   - プラス（お金が増える）またはマイナス（お金が減る）

### 6.2 イベントの実行順序

各月の流れ：

1. **月初め**
   - おこづかいをもらう（+500円）
   - メッセージ表示

2. **ハプニング発生**（0〜1回）
   - 50%の確率で発生
   - 発生した場合、確率に基づいてハプニングを選択
   - メッセージ表示、お金の増減

3. **お出かけイベント**（2〜3回）
   - 誘惑イベントをランダムに生成
   - アイテムカードを表示
   - プレイヤーが「買う」「がまんする」を選択
   - 結果の表示

4. **月末**
   - 今月の貯金額を表示
   - 計画との差を表示
   - 「次の月へ」ボタン

### 6.3 イベントデータの拡張

**アイテムの追加方法：**
1. `data/items.json`を開く
2. 該当カテゴリ（snacks/toys/arcade）に新しいオブジェクトを追加
3. 画像ファイルを配置
4. ページをリロード

**ハプニングの追加方法：**
1. `data/happenings.json`を開く
2. 新しいハプニングオブジェクトを追加
3. 確率（probability）を設定
4. ページをリロード

---

## 7. UI/UX実装方針

### 7.1 画面遷移の実装

- `display: none/block` で切り替え
- CSS transitionで簡単なフェード効果

### 7.2 アニメーション実装

**CSS主体でシンプルに：**
- ボタンホバー：CSS transition
- フェードイン/アウト：CSS transition
- 成功時のキラキラ：CSS animation

**JavaScript使用：**
- お金の増減：数字のカウントアップ/ダウン

### 7.3 レスポンシブデザイン（スマートフォン優先）

```css
/* モバイルファースト */
body {
  max-width: 100%;
  font-size: 16px;
  padding: 16px;
}

/* タブレット以上 */
@media (min-width: 768px) {
  body {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

### 7.4 タッチ対応

- ボタンサイズ最低44px×44px
- タップ時の視覚フィードバック（`:active`擬似クラス）
- タッチ操作に最適化されたUI

### 7.5 アクセシビリティ

- ボタンは`<button>`要素を使用
- 画像には`alt`属性
- セマンティックなHTML構造
- 画像がない場合はテキスト表示

---

## 8. ビジュアルデザイン

### 8.1 CSSフレームワーク

**使用しない**（コードのシンプルさを優先）

### 8.2 色のテーマ設定（CSS変数）

```css
:root {
  /* メインカラー */
  --primary-color: #4A90E2;      /* 青 */
  --secondary-color: #FFB84D;    /* オレンジ */
  --success-color: #7ED321;      /* 緑 */
  --warning-color: #F5A623;      /* 黄色 */
  --danger-color: #D0021B;       /* 赤 */

  /* 背景 */
  --bg-color: #FFF9E6;           /* クリーム色 */
  --card-bg: #FFFFFF;            /* 白 */

  /* 文字 */
  --text-color: #333333;         /* 濃いグレー */
  --text-light: #666666;         /* グレー */

  /* ボタン */
  --btn-primary: #4A90E2;        /* 青 */
  --btn-secondary: #95A5A6;      /* グレー */
}
```

### 8.3 フォント選定

```css
body {
  font-family: 'ヒラギノ角ゴ ProN', 'Hiragino Kaku Gothic ProN',
               'メイリオ', Meiryo, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}
```

**特徴：**
- 読みやすいゴシック体
- macOS、Windowsで適切なフォント選択
- Webフォント不使用（シンプルさを優先）

### 8.4 ルビ（振り仮名）の実装

**HTML：**
```html
<ruby>計<rt>けい</rt></ruby><ruby>画<rt>かく</rt></ruby>
```

**CSS：**
```css
ruby {
  ruby-align: center;
}

rt {
  font-size: 0.5em;
}
```

### 8.5 ボタンデザインの統一

```css
.btn {
  display: inline-block;
  padding: 12px 24px;
  min-width: 120px;
  min-height: 44px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.btn-primary {
  background: var(--btn-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-secondary {
  background: var(--btn-secondary);
  color: white;
}
```

### 8.6 画像フォールバック

**実装方法：**
```html
<img
  src="assets/images/items/chocolate.png"
  alt="チョコレート"
  onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
>
<span style="display:none;">チョコレート</span>
```

または、JavaScriptで一括処理：
```javascript
document.querySelectorAll('img').forEach(img => {
  img.onerror = function() {
    this.style.display = 'none';
    const text = document.createElement('div');
    text.className = 'img-fallback';
    text.textContent = this.alt;
    this.parentNode.insertBefore(text, this.nextSibling);
  };
});
```

---

## 9. 拡張性・保守性

### 9.1 コメント記述方針

```javascript
// ============================================
// 【セクション名】
// ============================================

/**
 * 関数の説明
 * @param {type} paramName - パラメータの説明
 * @returns {type} 戻り値の説明
 */
function functionName(paramName) {
  // 処理内容
}
```

### 9.2 定数の管理

```javascript
// ============================================
// 【定数定義】
// ============================================

const CONSTANTS = {
  MONTHLY_ALLOWANCE: 500,       // 月のおこづかい（★ここを変更すれば全体に反映）
  MIN_GOAL_PRICE: 1500,         // 最小目標金額
  MAX_GOAL_PRICE: 6000,         // 最大目標金額
  MAX_MONTHS: 12,               // 最大計画月数
  START_MONTH: 4,               // 開始月（4月）
  TEMPTATION_PER_MONTH: [2, 3], // 月の誘惑回数（最小、最大）
  HAPPENING_PROBABILITY: 0.5,   // ハプニング発生確率
};
```

**お小遣い額の一元管理：**
- `CONSTANTS.MONTHLY_ALLOWANCE`の値を変更すれば、ゲーム全体に反映される
- ゲーム状態の初期化時に`gameState.player.monthlyAllowance = CONSTANTS.MONTHLY_ALLOWANCE`で設定
- すべての計算関数は`gameState.player.monthlyAllowance`を参照
- この値を直接ハードコードしない

### 9.3 新しいアイテム追加手順

1. `data/items.json`を開く
2. 該当カテゴリ（snacks/toys/arcade）に新しいオブジェクトを追加
   ```json
   {
     "id": "snack_7",
     "name": "ドーナツ",
     "price": 150,
     "category": "snacks",
     "image": "assets/images/items/donut.png"
   }
   ```
3. 画像ファイルを`assets/images/items/`に配置（オプション）
4. ページをリロード → 自動的に反映

### 9.4 イベント追加手順

1. `data/happenings.json`を開く
2. 新しいハプニングオブジェクトを追加
   ```json
   {
     "id": "happening_5",
     "type": "positive",
     "message": "テストで100点をとった！ごほうびをもらった！",
     "amount": 200,
     "probability": 0.08
   }
   ```
3. 確率（probability）を設定
   - 全体の合計が1.0以下になるように調整
4. ページをリロード → 自動的に反映

### 9.5 目標おもちゃ追加手順

1. `data/goals.json`を開く
2. 新しい目標オブジェクトを追加
   ```json
   {
     "id": "goal_5",
     "name": "スケートボード",
     "price": 8000,
     "image": "assets/images/goals/skateboard.png",
     "difficulty": "expert"
   }
   ```
3. 画像ファイルを配置（オプション）
4. ページをリロード → 自動的に反映

### 9.6 デバッグ方針

```javascript
// デバッグモード
const DEBUG = false;

function log(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// 使用例
log('現在の状態:', gameState);
log('イベント発生:', event);
```

**デバッグ時：**
- `DEBUG = true`に設定
- コンソールに詳細なログが出力される

---

## 10. 実装の優先順位

Phase 3（実装フェーズ）では、以下の順序で実装を推奨：

### 10.1 優先度：高（コア機能）

1. **HTML構造の作成**
   - 全画面のセクション定義
   - 基本的なUI要素の配置

2. **CSS基本スタイル**
   - レイアウト
   - ボタンデザイン
   - 色のテーマ

3. **データ読み込み**
   - JSONファイルの読み込み
   - データの初期化

4. **画面遷移**
   - showScreen関数の実装
   - 基本的な画面遷移

5. **作戦立案画面**
   - 目標選択
   - 月ごとの計画
   - 計画の妥当性チェック

6. **実行画面（基本）**
   - 月の進行
   - お出かけイベント
   - 誘惑への対応

7. **結果画面**
   - 成功/失敗判定
   - フィードバック表示

### 10.2 優先度：中（拡張機能）

8. **ハプニングイベント**
   - ランダム発生
   - お金の増減

9. **状態保存**
   - ローカルストレージ
   - 保存/読み込み

10. **進捗表示**
    - 計画との差分
    - 進捗バー

### 10.3 優先度：低（演出・装飾）

11. **アニメーション**
    - お金の増減エフェクト
    - 画面遷移エフェクト

12. **ビジュアル改善**
    - 画像の配置
    - UIの微調整

---

## 11. テスト方針

### 11.1 手動テスト項目

**基本フロー：**
- [ ] タイトル → 説明 → 作戦立案 → 実行 → 結果の流れが正常に動作
- [ ] 目標を選択して計画を立てられる
- [ ] 計画が妥当性チェックされる
- [ ] 月が正常に進行する
- [ ] 誘惑イベントが発生する
- [ ] 誘惑に「買う」「がまんする」が選択できる
- [ ] ハプニングがランダムに発生する
- [ ] 成功/失敗が正しく判定される

**計算ロジック：**
- [ ] 所持金の計算が正しい
- [ ] 計画との差分が正しい
- [ ] 進捗バーが正しく表示される

**状態管理：**
- [ ] 状態がローカルストレージに保存される
- [ ] リロード後、続きからプレイできる
- [ ] ゲーム終了時、セーブが削除される

**UI/UX：**
- [ ] スマートフォンで正常に表示される
- [ ] ボタンが押しやすい
- [ ] 画像がない場合、テキストが表示される

### 11.2 エッジケースのテスト

- [ ] 計画で0円しか貯めない場合
- [ ] 目標金額を大幅に超える計画
- [ ] 誘惑に全て負ける場合
- [ ] ハプニングで所持金がマイナスになる場合

---

## 12. 今後の拡張案

Phase 1完成後に検討できる機能：

- **複数の難易度レベル**：簡単・普通・難しい
- **実績システム**：「◯回連続成功」などの記録
- **音声・効果音**：ボタン音、成功・失敗時の音
- **おこづかい額のカスタマイズ**：家庭ごとの金額設定
- **保護者向け機能**：プレイ記録の確認
- **より多様なイベント**：季節のイベント、友達との約束など

---

## 付録A：定数一覧

| 定数名 | 値 | 説明 |
|--------|-----|------|
| MONTHLY_ALLOWANCE | 500 | 月のおこづかい（円）★変更箇所 |
| MIN_GOAL_PRICE | 1500 | 最小目標金額（円） |
| MAX_GOAL_PRICE | 6000 | 最大目標金額（円） |
| MAX_MONTHS | 12 | 最大計画月数 |
| START_MONTH | 4 | 開始月（4月） |
| TEMPTATION_MIN | 2 | 月の誘惑最小回数 |
| TEMPTATION_MAX | 3 | 月の誘惑最大回数 |
| HAPPENING_PROBABILITY | 0.5 | ハプニング発生確率 |

---

## 付録B：画面一覧とHTML構造

```html
<!-- タイトル画面 -->
<section id="title" class="screen">
  <h1>おこづかいチャレンジ！</h1>
  <button class="btn btn-primary">スタート</button>
</section>

<!-- 説明画面 -->
<section id="guide" class="screen">
  <h2>あそびかた</h2>
  <p>...</p>
  <button class="btn btn-primary">さくせんを立てる</button>
</section>

<!-- 作戦立案画面 -->
<section id="planning" class="screen">
  <h2>さくせんを立てよう</h2>
  <!-- 目標選択 -->
  <!-- 月ごとの計画 -->
  <!-- 計画確認 -->
  <button class="btn btn-primary">チャレンジする！</button>
</section>

<!-- 実行画面 -->
<section id="playing" class="screen">
  <div class="header">
    <!-- 現在の月、所持金 -->
  </div>
  <div class="goal-display">
    <!-- 目標おもちゃ、進捗バー -->
  </div>
  <div class="event-area">
    <!-- イベント表示エリア -->
  </div>
</section>

<!-- 結果画面 -->
<section id="result" class="screen">
  <h2 id="result-title">せいこう！ / ざんねん…</h2>
  <div id="result-content">
    <!-- 結果の詳細 -->
  </div>
  <button class="btn btn-primary">もういちどあそぶ</button>
</section>
```

---

**技術設計書バージョン：** 1.0
**作成日：** 2025年12月9日
**対応企画書：** [docs/game_design.md](game_design.md) バージョン1.0
