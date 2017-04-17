/**
 * enchant.js を使う前にフレームワークを有効するための必要な処理。
 */
enchant();

/*
 * ページがロードされた際に実行される関数。
 * すべての処理はページがロードされてから行うため、 window.onload の中で実行する。
 * 特に new Core(); は、<body> タグが存在しないとエラーになるので注意。
 */
window.onload = function(){
    /**
     * Core オブジェクトを作成する。
     * 画面の大きさは 960ピクセル x 640ピクセル に設定する。
     */
    var game = new Core(960, 640); //この大きさだとモバイル端末でも遊べます

    /**
     * 必要なファイルを相対パスで引数に指定する。 ファイルはすべて、ゲームが始まる前にロードされる。
     */
    var mapFrame  = "./resources/mapframe.png";
    game.preload(mapFrame);

    var mapBackground00  = "./resources/map00.png";
    game.preload(mapBackground00);

    var mapTiles  = "./resources/maptiles.png";
    game.preload(mapTiles);

    var GameMap = Class.create({
      initialize: function(scene, mapData/*コンストラクタを定義*/) {
        //枠
        //960X640のスライドを作成
        var frame = new Sprite(960, 640);
        //枠の画像を読み込む
        //frame.image = new Sprite(960, 640);<-エラー
        frame.image = game.assets[mapFrame];
        //画面の枠を描画する
        scene.addChild(frame);

        //背景
        var background = new Sprite(64*13, 64*9);
        //同様に背景も表示する。
        background.image = game.assets[mapBackground00];
        background.x = 64;
        background.y = 10;
        scene.addChild(background);

        //マス
        var tiles = new Map(64,64);
        tiles.image = game.assets[mapTiles];
        tiles.x = 64;
        tiles.y = 10;
        tiles.loadData(mapData);
        tiles.opacity = 0.5;
        scene.addChild(tiles);

        tiles.touchEnabled = true;//タッチを可能にする。
        /**touchEnableではなく
          *touchEnabledである
          *↓enchent.jsのイベント目録
          *http://wise9.github.io/enchant.js/doc/core/ja/symbols/enchant.Event.html
          */
        tiles.addEventListener(enchant.Event.TOUCH_END, function(params){
            alert("タッチ x:"+params.x +", y:"+params.y);
        });
      },
    });

    game.onload = function(){

      var sceneGameMain = new Scene();

      //マス
      var mapDisplayData = [
            [3, 3, 2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
            [3, 2, 0, 0, 2, 3, 3, 2, 0, 1, 0, 0, 0],
            [3, 0, 4, 0, 2, 3, 3, 2, 0, 0, 0, 0, 0],
            [3, 0, 0, 0, 0, 2, 2, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 4, 0, 0, 0, 1, 1, 0, 4, 0],
            [1, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2],
            [0, 0, 0, 3, 3, 2, 0, 0, 0, 0, 4, 2, 3],
            [0, 0, 0, 3, 3, 3, 2, 0, 0, 2, 2, 3, 3],
        ];

        //ここでGameMapクラスを使う
        var map = new GameMap(sceneGameMain/*追加するシーン*/,mapDisplayData/*マスのデータを指定*/);

        game.pushScene(sceneGameMain);
    };

    game.start();
};
