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
     * ゲームにシーンを追加
     */
    var sceneGameMain = new Scene();

    /**
    *ゲーム画像をロードします。
    */
    game.preload("./resources/boat.png")

    game.onload = function(){
        /**
        * スプライトを作成
        */
        var sprite = new Sprite(512,512);
        sprite.x = 100;
        sprite.y = 0;

        /**
        * imageにファイル画像ファイルを当てはまる
        */
        sprite.image = game.assets["./resources/boat.png"];
        sceneGameMain.addChild(sprite);

        game.pushScene(sceneGameMain);
    }
    game.start();
};
