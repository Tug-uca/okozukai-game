# おこづかいチャレンジ！

**おこづかいを貯めて、ほしいものをゲットしよう！**

小学生向けの金銭教育ゲームです。計画的に貯金する大切さを楽しく学べます。

## ゲーム概要

このゲームでは、プレイヤーは毎月500円のおこづかいをもらいながら、目標のおもちゃを買うために貯金をします。

- 目標のおもちゃを選ぶ
- 月ごとの計画を立てる（何を買うか、何も買わないか）
- 誘惑に負けずに貯金する
- 目標金額に到達したら成功！

## 遊び方

### 1. 目標を決める
ほしいおもちゃを4つの中から選びます。
- ミニカー（1,500円）- かんたん
- ぬいぐるみ（2,500円）- ふつう
- ゲーム（4,000円）- むずかしい
- 自転車（6,000円）- とてもむずかしい

### 2. 計画を立てる
毎月500円のおこづかいをもらえます。月ごとに何を買うか（または何も買わないか）を計画します。

計画が目標金額に届くように調整しましょう！

### 3. チャレンジする
計画通りにいくかな？

**月の流れ：**
1. おこづかいをもらう（+500円）
2. ハプニングが発生するかも（お手伝いでお金がもらえる、お金を落とすなど）
3. お出かけイベント（2〜3回）
   - 誘惑が発生！お菓子やおもちゃ、ゲームセンターなどの誘惑に勝てるか？
   - 「買う」か「がまんする」を選択
4. 月末
   - 今月の貯金額を確認
   - 計画との差を確認

### 4. 結果
目標金額に到達したら成功！到達できなかったら残念…でもまたチャレンジしよう！

## 技術スタック

このゲームはシンプルな技術で作られています。

- **HTML5** - セマンティックな構造
- **CSS3** - CSS変数、フレックスボックス、グリッドレイアウト
- **JavaScript (Vanilla)** - フレームワーク不使用
- **JSON** - データ駆動設計

### 特徴
- ライブラリ・フレームワークなし
- 単一ページアプリケーション（SPA）
- レスポンシブデザイン（スマートフォン優先）
- ローカルストレージでゲーム状態を保存

## ファイル構成

```
okozukai-game/
├── index.html          # メインHTMLファイル
├── css/
│   └── style.css       # スタイルシート
├── js/
│   └── game.js         # ゲームロジック
├── data/
│   ├── items.json      # アイテムデータ
│   ├── goals.json      # 目標おもちゃデータ
│   └── happenings.json # ハプニングデータ
├── assets/
│   └── images/         # 画像ファイル（オプション）
│       ├── goals/      # 目標おもちゃの画像
│       ├── items/      # アイテムの画像
│       └── ui/         # UIアイコン
└── docs/               # 設計ドキュメント
    ├── game_design.md
    ├── technical_design.md
    └── 03_plan.md
```

## セットアップ

### ローカルで実行

1. リポジトリをクローンまたはダウンロード
   ```bash
   git clone https://github.com/yourusername/okozukai-game.git
   cd okozukai-game
   ```

2. ローカルサーバーを起動
   ```bash
   # Pythonを使う場合
   python -m http.server 8000

   # Node.jsのhttp-serverを使う場合
   npx http-server
   ```

3. ブラウザで開く
   ```
   http://localhost:8000
   ```

### GitHub Pagesへのデプロイ

1. GitHubリポジトリにプッシュ
2. Settings > Pages から GitHub Pages を有効化
3. ソースを `main` ブランチに設定
4. 数分後、`https://yourusername.github.io/okozukai-game/` でアクセス可能

## 開発者向け情報

### データの拡張

#### 新しいアイテムを追加

`data/items.json` を編集：

```json
{
  "snacks": [
    {
      "id": "snack_7",
      "name": "ドーナツ",
      "price": 150,
      "category": "snacks",
      "image": "assets/images/items/donut.png"
    }
  ]
}
```

#### 新しい目標おもちゃを追加

`data/goals.json` を編集：

```json
[
  {
    "id": "goal_5",
    "name": "スケートボード",
    "price": 8000,
    "image": "assets/images/goals/skateboard.png",
    "difficulty": "expert"
  }
]
```

#### 新しいハプニングを追加

`data/happenings.json` を編集：

```json
[
  {
    "id": "happening_5",
    "type": "positive",
    "message": "テストで100点をとった！ごほうびをもらった！",
    "amount": 200,
    "probability": 0.08
  }
]
```

注意: すべてのハプニングの `probability` の合計が1.0以下になるように調整してください。

### 画像について

画像ファイルは `assets/images/` 配下に配置できます。画像が存在しない場合、代わりにテキストが表示されます。

### デバッグモード

`js/game.js` の `DEBUG` 変数を `true` に設定すると、コンソールに詳細なログが出力されます。

```javascript
const DEBUG = true; // デバッグモードを有効化
```

### 定数の変更

ゲームバランスを調整する場合は、`js/game.js` の `CONSTANTS` オブジェクトを編集してください。

```javascript
const CONSTANTS = {
  MONTHLY_ALLOWANCE: 500,       // 月のおこづかい
  TEMPTATION_MIN: 2,            // 月の誘惑最小回数
  TEMPTATION_MAX: 3,            // 月の誘惑最大回数
  HAPPENING_PROBABILITY: 0.5,   // ハプニング発生確率
};
```

## ブラウザサポート

- Chrome（推奨）
- Firefox
- Safari
- Edge

モダンブラウザであれば動作します。

## ライセンス

このプロジェクトは教育目的で作成されています。自由に使用・改変できます。

## 今後の拡張案

- 複数の難易度レベル
- 実績システム
- 音声・効果音
- おこづかい額のカスタマイズ
- 保護者向けプレイ記録機能
- 季節のイベント

## 貢献

バグ報告や機能提案は Issue でお願いします。

## 作成者

Phase 3（実装フェーズ）で作成されました。

---

**楽しく貯金を学ぼう！**
