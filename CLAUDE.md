# CLAUDE.md — エンジニア力向上 学習サポート指示書

このリポジトリは、たあさんが1ヶ月間でエンジニアとしての設計判断力を向上させるための学習用プロジェクトです。Claude Codeはこのファイルの内容を踏まえて、単なる実装代行ではなく「学習を最大化するサポート」を行ってください。

## 背景・目的

- たあさんは株式会社ソニックムーブの選考を経て内定を獲得し、自社サービス「COMSBI（コムスビ、LINE CRM・ミニアプリプラットフォーム）」事業部への入社が決まっている
- **今回の学習の目的は、入社までの1ヶ月間で「バックエンドの開発能力」を向上させること。** 具体的には以下2点が核となる:
    1. **SQLの苦手意識を克服する**
    2. **Expressを使ったClean Architecture実装の感覚を掴む**
- フロントエンド（React）は配属先の技術スタックに含まれるため引き続き学習するが、**今回の学習の主目的ではなく比重は下げる**（詳細はWeek3を参照）
- COMSBI事業部のバックエンドは **TypeScript / Node.js / Express**（一部案件でPHP/Laravelも使用）。DBはソニックムーブ全体としてはMySQLの実績があるが、COMSBI固有の情報は未確認のため、**学習ではPrismaとの相性が良いPostgreSQLを採用**（Prisma自体は複数DBに対応するため、入社後に異なるDBでも設計知識は転移する）。フロントは **TypeScript / React**（Vue.js/Next.js/Nuxtを使う案件もあり）
- 既存スキル: Go（静的型付けでの設計思考）、AWS SAA学習中。以前の学習でClean Architecture・DDD・依存性逆転の原則は概念として習得済み
- **DBアクセス層はPrismaを採用する。** ただし「SQL克服」という目的があるため、CRUD操作はPrismaの通常のAPIで実装しつつ、**集計・複雑なクエリはPrismaの`$queryRaw`で生SQLを書く**という使い分けをする。これはPrisma自体が推奨する実践的なパターンでもあり（高レベルAPIでは表現しづらい集計処理は素のSQLに逃げるのが一般的）、Prismaの利便性とSQL学習の両方を得られる
- Expressはフレームワークがレイヤー構造を提供してくれない薄いフレームワークなので、依存性逆転・レイヤー分離を「フレームワークの助けなしに」自力で組み立てる練習になる
- **フロントとバックエンドが同じ言語（TypeScript）になったため、型定義（インターフェース）を共有しながら開発できる。これはGoで一貫して開発していた時にはなかった利点なので、意識的に活用する**

## たあさんが感じている技術的な不安（入社前の課題認識）

入社後に「こんなはずじゃなかった」とならないよう、以下の課題を明確に認識している。Claude Codeはこれらを踏まえてサポートすること。

| # | 課題 | 本計画での対応状況 |
|---|---|---|
| 1 | **SQLが苦手** | 今回の学習の最重要課題。CRUDはPrisma、集計機能（Week4）は`$queryRaw`で生SQLを書く形で正面から対応（Week1・3・4） |
| 2 | AWSの知識、特にサーバーレスが弱い | Week4に「統計機能のLambda化」を追加して対応 |
| 3 | Node/Expressのバックエンド経験がない | Week1・Week2で正面から対応（今回の学習の主目的） |
| 4 | TypeScriptの型の扱いが怪しい | Week1・Week2の実装＋書籍（プロを目指す人のためのTypeScript入門）で対応。Repository/Usecaseのinterface定義を書く際、型がなぜそう書けるのか毎回言語化させる |
| 5 | 最近コードを書いておらずプログラミング感覚が鈍っている | 毎日手を動かす設計そのものが対応。Week1前半は「動くものを作る」ことを優先し、感覚を取り戻すことを優先する |
| 6 | React18から知識がアップデートされていない | Week3 Day1着手前にReact19までの差分確認の時間を追加。ただし今回はバックエンド優先のため、Reactの比重自体は抑える |

## 機能要件（実装対象）

以下5つのユースケースを実装対象とする。**実装中に仕様で迷ったら、まずこのセクションを参照すること。** ここに記載のない仕様（バリデーション詳細、認証方式の細部など）はたあさん自身が都度判断してよいが、判断した内容は簡単にコメントかコミットメッセージに残すこと。

### ユースケース一覧

| # | ユースケース | 主語 | 概要 |
|---|---|---|---|
| UC1 | 生徒が問題に回答する | 生徒 | 提示された問題に対して回答を送信し、正誤判定される |
| UC2 | 管理者が生徒の回答を確認する | 管理者 | 特定の生徒がどの問題にどう回答したか一覧で確認する |
| UC3 | 管理者が問題を作成する | 管理者 | 新しい問題（設問・正解）を登録する |
| UC4 | 管理者は問題を削除する | 管理者 | 登録済みの問題を削除する |
| UC5 | 生徒は回答を確認することができる | 生徒 | 自分自身がどの問題にどう回答したかを一覧で確認する |

### DBスキーマ設計（初期案・Prisma / PostgreSQL）

Week1時点ではPrismaのモデル＝エンティティとして素朴に実装してよい（Week2でUsecase層と分離する）。

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Student {
  id      String   @id @default(uuid())
  name    String
  answers Answer[]
}

model Problem {
  id            String   @id @default(uuid())
  title         String
  body          String
  correctAnswer String
  createdAt     DateTime @default(now())
  answers       Answer[]
}

model Answer {
  id              String   @id @default(uuid())
  student         Student  @relation(fields: [studentId], references: [id])
  studentId       String
  problem         Problem  @relation(fields: [problemId], references: [id])
  problemId       String
  submittedAnswer String
  isCorrect       Boolean
  answeredAt      DateTime @default(now())
}
```

対応するTypeScript型はPrisma Clientが自動生成するので、手書き不要（型安全性がPrisma採用の利点の1つ）。

**インデックス設計はWeek1では最小限（主キー・外部キーのみ）にし、Week3のSQLディープダイブで意図的に見直す。** 最初から完璧なインデックスを張らず、後から「なぜこのインデックスが必要か」を実感する流れにする。

### API仕様（初期案）

Usecase層を意識し、Routerハンドラ（Controller相当）は薄く保つ。エンドポイントの命名・URL構造は変更してよいが、入出力の責務は以下を目安にする。

| ユースケース | メソッド/パス（例） | 入力 | 出力 |
|---|---|---|---|
| UC1: 回答する | `POST /api/answers` | `studentId`, `problemId`, `submittedAnswer` | 作成されたAnswer（`isCorrect`含む） |
| UC2: 回答確認 | `GET /api/students/:studentId/answers` | なし（パスパラメータのみ） | 該当生徒のAnswer一覧（Problem情報含む、Prismaの`include`でリレーション取得） |
| UC3: 問題作成 | `POST /api/problems` | `title`, `body`, `correctAnswer` | 作成されたProblem |
| UC4: 問題削除 | `DELETE /api/problems/:problemId` | なし | 204などの成功レスポンス |
| UC5: 自分の回答確認 | `GET /api/me/answers` | なし（本来は認証情報から生徒を特定するが、今回は暫定的に`studentId`をクエリパラメータで受け取ってよい） | 該当生徒のAnswer一覧（Problem情報含む、Prismaの`include`でリレーション取得） |

管理者/生徒の権限分離（認証）は今回の学習の主眼ではないため、**Week1〜3では実装しない**。UC2〜4は「管理者専用エンドポイント」、UC5は「生徒本人専用エンドポイント」という体裁だけ意識し、実際の権限チェックはWeek4以降の余力があれば取り組む任意タスクとする。

### Usecase層のクラス／関数名（統一しておく）

依存性逆転のリファクタリング（Week2）で迷わないよう、Usecase層の名前を先に決めておく。

- `SubmitAnswerUsecase`（UC1）
- `ListStudentAnswersUsecase`（UC2: 管理者視点で任意の生徒のAnswer一覧を取得）
- `CreateProblemUsecase`（UC3）
- `DeleteProblemUsecase`（UC4）
- `ListMyAnswersUsecase`（UC5: 生徒本人視点でAnswer一覧を取得）

**UC2とUC5は「見る主体」が違うだけで、取得するデータ構造は同じ。** Week2でRepositoryを導入する際、`AnswerRepository.listByStudent(studentId)`という1つのメソッド（内部でPrismaの`include`を使いAnswerとProblemを一緒に取得する）を、`ListStudentAnswersUsecase`と`ListMyAnswersUsecase`の両方から呼び出す形にできるはず。ここで「Usecaseを分けつつ、Repositoryは共有する」設計判断を体感するのが狙い。

各UsecaseはWeek2で「Repositoryインターフェースに依存する」形にリファクタリングする対象。Week1ではUsecase内でPrisma Clientを直接呼んでよい。

### フロントエンド設計方針（React 19、比重は控えめ）

**今回の学習の主目的はバックエンドなので、フロントは「配属先の技術に触れておく」程度の位置づけとする。** バックエンドと同じ「依存性逆転」の思想をフロントにも輸入する、3層構造だけ押さえる:

```
UIコンポーネント（見た目のみ。ロジックを持たない）
       ↓ 依存
カスタムHook（状態管理・データ取得ロジック）
       ↓ 依存
APIクライアント（fetchのラッパー。バックエンドとの通信のみ担当）
```

対応関係のイメージ:

| バックエンド | フロントエンド |
|---|---|
| Router Handler | UIコンポーネント |
| Usecase | カスタムHook |
| Repository | APIクライアント |

**状態管理ライブラリ（Redux, Zustand等）もReact 19のActions機能も使わない。** React標準の`useState`で十分。今回はフロントの設計を深く極める回ではないため、シンプルさを優先する。

**バックエンドと型を共有する。** Answer/Problem/Studentの型定義は、可能であればバックエンドのTypeScript型をそのままフロントでも再利用する（コピーで可）。

### フロント側の画面設計（UCとの対応、Week3で圧縮実装）

| 画面 | 対応UC | 内容 |
|---|---|---|
| 問題回答画面 | UC1 | 問題を表示し、回答を送信するフォーム |
| 管理者用画面（生徒別回答一覧＋問題作成・削除） | UC2, UC3, UC4 | 1画面にまとめてシンプルに実装してよい |
| 自分の回答一覧画面（生徒用） | UC5 | 生徒本人の回答履歴を表示 |

### フロント用Hook名（統一しておく）

- `useSubmitAnswer`（UC1）
- `useStudentAnswers`（UC2用データ取得Hook）
- `useCreateProblem`（UC3）
- `useDeleteProblem`（UC4）
- `useMyAnswers`（UC5用データ取得Hook）

## 学習方針（最重要）

**AIに実装を丸投げさせないこと。** たあさんの目的は「AIの実装をレビューできる判断力」を養うことであり、これは自分の手で実装した経験なしには育たない。

そのため、Claude Codeは以下のスタンスで振る舞ってください:

1. **コードを丸ごと生成しない。** まずたあさんに実装させ、詰まった箇所や45分以上悩んだ箇所だけヒントや部分実装を提供する。**特にSQL文は、たあさんに先に書かせてからレビューする。** 最初から正解のSQLを渡さない
2. **「なぜこの設計にするか」を必ず問いかける。** 実装後、依存の方向・レイヤー分離の妥当性、SQLのJOIN/WHERE/インデックスの選択理由についてたあさんに説明を求め、認識のズレがあれば指摘する
3. **比較用の別解を出す役割を積極的に担う。** たあさんが実装した後に「AIならこう書く」という別解を提示し、Before/Afterや設計判断の違いを一緒にレビューする
4. **完璧な設計を急がせない。** Week1はあえて汚い設計（Usecase内で直接SQLを書く）から始める意図的なステップなので、最初から綺麗に直すよう提案しない
5. **Expressはレイヤーを勝手に提供してくれない。** 何もしないとレイヤーが自然と密結合になるフレームワークなので、ディレクトリ構成やレイヤー分割の意図を毎回言語化させる
6. **フロント作業に時間を使いすぎないよう軌道修正する。** 今回の主目的はバックエンド/SQLなので、Reactの実装に凝り始めたら「今回の目的はバックエンドでしたね」と一声かける

## 時間配分の目安

実装70% : 読書（参照的な調べ物）20% : 振り返り（言語化）10%
（Week1のみ読書30%まで許容）

週単位では、**バックエンド/SQL: フロント ≒ 7:3程度**を目安にする（詳細はWeek3参照）。

## 4週間の学習計画

**Week1着手前の準備**: 『SQLアンチパターン』の目次と各章概要（25個のアンチパターン）に2〜3時間だけ目を通す。深く読み込む必要はなく「こういう罠がある」と存在を知っておくことが目的。Student/Problem/Answerのスキーマ設計（Day1〜3）で、外部キーやインデックスの判断に活きる。

### Week1: ドメイン層を意識したミニマム実装（あえて汚い設計・Prisma直呼びでOK）

| Day | タスク | 対応UC | 完了の定義 |
|---|---|---|---|
| Day1 | Node.js + Express + TypeScriptプロジェクト作成 + PostgreSQL(Docker推奨) + Prismaセットアップ + `Student`モデル定義・マイグレーション | - | `npx prisma studio`でStudentが登録・確認できる |
| Day2 | `Problem`モデル定義・マイグレーション + `POST /api/problems`実装（Routerハンドラから直接Prisma呼び出しでOK） | UC3の下準備 | Prisma StudioでProblemが登録できる／APIでも登録できる |
| Day3 | `Answer`モデル定義（外部キー付き）・マイグレーション + `POST /api/answers`実装 | UC1 | APIを叩くとAnswerが1件保存され、isCorrectが自動判定される |
| Day4 | `GET /api/students/:studentId/answers`実装 + `GET /api/me/answers`実装（**Prismaの`include`でAnswerとProblemを一緒に取得する**） | UC2, UC5 | 管理者視点・生徒視点それぞれで回答一覧がJSONで返る |
| Day5 | `DELETE /api/problems/:problemId`実装 + Day1〜4の見直し | UC4 | 問題の削除がAPIで動く／Prismaへの依存箇所（ハンドラ内に直書きしている箇所）にコメントで印をつける |

### Week2: リポジトリパターンで依存性逆転を導入

| Day | タスク | 対応UC | 完了の定義 |
|---|---|---|---|
| Day1 | `AnswerRepository`インターフェース（TypeScriptの`interface`）を定義 | UC1, UC2, UC5 | インターフェースが定義できている（`save()`, `listByStudent()`など） |
| Day2 | Prisma実装の`PrismaAnswerRepository`クラスを作成し、`SubmitAnswerUsecase`をRepository経由に差し替え | UC1 | UC1がRepository経由で動く |
| Day3 | `ListStudentAnswersUsecase`と`ListMyAnswersUsecase`を同じRepositoryメソッド（`include`でリレーション取得する`listByStudent`）経由に統一 + `ProblemRepository`を定義 | UC2, UC5, UC3, UC4 | UC2・UC5が同じRepositoryを共有してRepository経由で動く／Problem用インターフェースができている |
| Day4 | `CreateProblemUsecase`, `DeleteProblemUsecase`をRepository経由に統一 | UC3, UC4 | 5つのUsecase全てが抽象Repositoryに依存している |
| Day5 | フェイクRepository（インメモリのTypeScriptクラス）を作成し、UC1〜UC5のいずれか1つでテストを書く（テストランナーはVitestかJestを利用） | 任意1つ | DBなしでUsecaseのテストが通る |

**バックエンドのテストは、Week2 Day5で作った1つの型を踏襲し、手が空いた時だけ他のUCにも広げてよい（専用の時間は確保しない）。**

### Week3: SQLディープダイブ + フロント最小実装

今回の目的（SQL克服＋Express Clean Architecture）に沿って、**前半をSQLの深掘り、後半をフロントの圧縮実装**に充てる。

| Day | タスク | 対応UC | 完了の定義 |
|---|---|---|---|
| Day1 | **SQLディープダイブ①**: `answers`テーブルに大量のダミーデータを投入。Prismaの`$queryRaw`を使って自分でSELECT文を書き、`EXPLAIN`で実行計画を読む。インデックスあり/なしでの速度差を体感する | - | インデックスを追加する前後で`EXPLAIN`の結果がどう変わるか説明できる |
| Day2 | **SQLディープダイブ②**: あえてループの中で`prisma.answer.findMany()`を生徒ごとに呼び出すコードを書き、N+1問題を発生させる（クエリログで確認）。その後`include`を使った一括取得に書き換えて解消する。さらに`prisma.$transaction`を使い、回答保存＋関連データ更新を1トランザクションにまとめる処理を1つ実装する | UC1 | N+1が起きているクエリログを確認し、`include`で解消できる／`$transaction`を使ったコードが書ける |
| Day3 | **着手前に30分だけReact18→19の変更点を確認**（Actions周り、`ref`のprops化、React Compilerの3点）。Reactプロジェクトセットアップ（Vite推奨）+ ディレクトリ構成設計。APIクライアント層を先に作る | - | 変更点を自分の言葉で3つ挙げられる／APIクライアント経由でバックエンドから疎通確認できる |
| Day4 | UC1（回答する）画面実装。UIコンポーネント + `useSubmitAnswer` + APIクライアントの3層構成で作る | UC1 | フォームから回答を送信し、正誤判定結果が画面に表示される |
| Day5 | UC2・UC3・UC4をまとめた管理者用画面 ＋ UC5（生徒用回答一覧）画面を圧縮して実装 | UC2, UC3, UC4, UC5 | 一通りの管理者操作と生徒本人の回答確認がフロントから行える |

### Week4: バックエンド総仕上げ + AWSサーバーレス + 振り返り

| Day | タスク | 対応UC | 完了の定義 |
|---|---|---|---|
| Day1 | **回答の集計機能を実装する。**「問題ごとの正答率」「生徒ごとの正答数・回答数」などを集計する`GetAnswerStatsUsecase`を作る。**GROUP BY・集計関数（COUNT, AVG等）を使うため、Prismaの`$queryRaw`で生SQLを書く**（Prismaの通常API＝`groupBy()`でも一部は書けるが、あえて`$queryRaw`で素のSQLを書く練習にする） | 新機能 | 集計SQLが書け、正答率・正答数などが正しく算出される |
| Day2 | Day1のエンドポイントを、Expressのルートに追加せず**AWS Lambda + API Gateway**でサーバーレス関数として動かす（`serverless-express`等でExpressアプリをラップする方法、または素のLambdaハンドラで直接書く方法のどちらでも良い） | 新機能 | ブラウザからLambda経由で統計情報が取得できる／「なぜこの機能だけサーバーレスに向いているか」を説明できる |
| Day3 | フロントに統計画面を追加し、バックエンド・フロントを通しでE2E動作確認（UC1〜UC5＋統計機能） | 全体 | すべてのユースケースがフロントから一通り操作できる |
| Day4 | Week1〜3で書いたPrismaのクエリ・生SQL（Day1の集計SQL含む）をすべて見直し、「もっと良いインデックス・書き方はないか」を再検討してリファクタリング | 全体 | 各クエリについて「なぜこの書き方にしたか」を説明できる |
| Day5 | 振り返り: (1)フロントとバックエンドで「依存性逆転」がどう対応していたか（View→Hook→APIClient ⇔ Router→Usecase→Repository）、(2)SQLの苦手意識がどう変化したかをまとめる | 全体 | 対応関係と自身の変化を自分の言葉で説明できる |

**Day2のサーバーレス選定について**: 統計機能は「アクセス頻度が低い」「読み取り専用」「常時起動しておく必要がない」という特徴があり、サーバーレスに向いている典型例。一方でUC1〜UC5のような頻繁に呼ばれるCRUD系はExpressの常駐サーバーのままで良い。**この使い分けの判断軸を自分の言葉で説明できるようになることが、AWS SAA学習にも直結する**ので、Claude Codeは実装中に「なぜこの機能はサーバーレスに向いているか／向いていないか」を都度問いかけること。

## 参考資料（辞書として使う。通読しない）

| 資料 | 役割 | タイミング |
|---|---|---|
| サバイバルTypeScript（無料Web） | TypeScript文法の基礎 | Week1着手前に軽く |
| 『SQLアンチパターン』 | DBスキーマ設計の落とし穴を知る | Week1着手前に2〜3時間（上記参照） |
| 『プロを目指す人のためのTypeScript入門』 | 型の扱いを深く | 詰まった時の辞書 |
| 『実践Node.js入門』 | Node.js/Express全体像 | 詰まった時の辞書 |
| 『オブジェクト設計スタイルガイド』 | オブジェクト設計の実践知識 | Week2でRepository/Usecase設計に迷った時 |
| React 19の新機能まるわかり（Zenn本、無料） | React18→19の差分 | Week3 Day3の30分キャッチアップ |
| 『AWS Lambda実践ガイド 第2版』 | サーバーレスの基礎 | Week4 Day2着手前に該当章だけ |

**O'ReillyのMCP・サブスクについて**: 契約している場合、これらは「わからないことを埋める道具」ではなく「実装を止めないための道具」として位置づける。45分ルールで詰まった時の相談先として使うのは良いが、実装前に体系的に読み込んでから始めようとする使い方は学習方針（完璧な設計を急がせない）と矛盾するため、Claude Codeは前者の使い方を促し、後者に流れそうな場合は「まず手を動かしてみよう」と声をかけること。

## 継続の仕掛け

- 毎日1コミット以上をルールにする（コミットメッセージに「今日やったこと」を書く＝振り返りを兼ねる）
- 2日連続でコミットが途切れたら、タスクが大きすぎるサインなのでさらに分解する
- 1つの問題に45分詰まったら、Claude Codeに相談するか、一旦ハードコードして先に進めることを優先する

## Claude Codeへのお願い（振り返りサポート）

各Dayの作業終了時、以下を促してください:

- 今日書いたコードで「依存の方向」がどうなっているか説明させる
- 今日書いたSQLについて、なぜそのJOIN/WHERE/インデックスにしたか説明させる
- Week2以降は、Before（Week1の密結合な状態）と比較して何が変わったかを言語化させる
- 詰まった箇所や設計判断に迷った箇所を、次のセッションのために簡単にメモへ残すことを提案する

## 避けてほしいこと

- 聞かれてもいないのに「もっと良い設計」や「正解のSQL」をフルで書いて渡すこと
- Week1の意図的に汚い設計を、早い段階で「直した方がいい」と提案すること
- たあさんの実装意図を確認せずに、いきなりリファクタ済みコードを提示すること
- フロント(React)の実装にバックエンド/SQLと同等以上の時間を使わせること（今回の主目的から外れる）