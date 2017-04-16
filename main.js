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

    game.onload = function(){

        var sceneGameMain = new Scene();

        //枠
        //960X640のスライドを作成
        var frame = new Sprite(960, 640);
        //枠の画像を読み込む
        frame.image = game.assets[mapFrame];
        //画面の枠を描画する
        sceneGameMain.addChild(frame);

        //背景
        var background = new Sprite(64*13, 64*9);
        //同様に背景も表示する。
        background.image = game.assets[mapBackground00];
        background.x = 64;
        background.y = 10;
        sceneGameMain.addChild(background);

        //マス
        var map = new Map(64, 64);
        map.x = 64;
        map.y = 10;

        //ここでgameをgmaeに間違えるミス発生
        map.image = game.assets[mapTiles];

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
        map.loadData(mapDisplayData);

        //マップの透明度を0.5にする。
        map.opacity = 0.5

        // マップをシーンに追加
        sceneGameMain.addChild(map);


        game.pushScene(sceneGameMain);
    };

    game.start();
};
