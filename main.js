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

    var tileTypes = {
      umi: {id: 0, name:"umi"},//海
      arai: {id: 1, name:"arai"},//荒い海
      asai: {id: 2, name:"asai"},//浅い海
      riku: {id: 3, name:"riku"},//陸
      iwa: {id: 4,name:"iwa"},//岩
    }

    /**
    * マップクラス
    */
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
        this.background = background;

        //マス
        var tiles = new Map(64,64);
        tiles.image = game.assets[mapTiles];
        tiles.x = 64;
        tiles.y = 10;
        tiles.loadData(mapData);
        tiles.opacity = 0.5;
        scene.addChild(tiles);
        this.tiles = tiles;

        //マップの大きさを保存
        this.mapHeight = mapData.length;
        this.mapWidth = mapData[0].length;

        //元のマップデータから陸や岩のcollisionデータを生成
        var mapCollisionData = [];
        for(var j=0; j < this.mapHeight; j++) {
          /**
          * マップの縦の分だけループする
          */
          mapCollisionData[j] = []
          for(var i=0; i < this.mapWidth; i++) {
          /**
          * マップの横の分だけループする。
          */
            if (mapData[j][i] == tileTypes.riku.id || mapData[j][i] == tileTypes.iwa.id) {
              /**
              * もしも「陸」または「岩」だったら
              * 通行不可にする
              */
              mapCollisionData[j].push(1);
            }
            else {
              /**
              * それ以外は通行可
              */
              mapCollisionData[j].push(0);
            }
          }
        }
        this.tiles.collisionData = mapCollisionData

        var self = this;

        tiles.touchEnabled = true;//タッチを可能にする。
        /**touchEnableではなく
          *touchEnabledである
          *↓enchent.jsのイベント目録
          *http://wise9.github.io/enchant.js/doc/core/ja/symbols/enchant.Event.html
          */
        tiles.addEventListener(enchant.Event.TOUCH_END, function(params){
            self.ontouchend(params);
        });
      },
      toLocalSpace:function(x,y) {
        var localX = x -this.tiles.x;
        var localY = y -this.tiles.y;
        /**
        * ワールド座標からtilesの座標をマイナス
        */
        return {x:localX, y:localY}
      },
      getTileInfo:function(id) {
        for(t in tileTypes) {
          if (tileTypes[t].id == id) {
            return tileTypes[t];
          }
        }
      },
      ontouchend:function(params) {
        //collisionデータを利用して判定する。
        /**
        *if (this.hitTest(params.x, params.y) == true) {
        *  alert("通れない")
        *} else {
        *  alert("通れる")
        *}
        *ここは本に書かれた内容まったく一致しなかったので自分でソース把握の後修正
        */
        var localPosition = this.toLocalSpace(params.x, params.y);

        var tileData = this.tiles.checkTile(localPosition.x, localPosition.y);
        var tileInfo = this.getTileInfo(tileData);

        if(this.tiles.hitTest(localPosition.x, localPosition.y) == true) {
          alert("通れない、"+tileInfo.name);
        } else {
          alert("通れる、"+tileInfo.name);
        }
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
