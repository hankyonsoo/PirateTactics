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
    game.fps = 30; //一秒に何回を画面更新するのか

    /**
     * 必要なファイルを相対パスで引数に指定する。 ファイルはすべて、ゲームが始まる前にロードされる。
     */
    var mapFrame  = "./resources/mapframe.png";
    game.preload(mapFrame);

    var mapBackground00  = "./resources/map00.png";
    game.preload(mapBackground00);

    var mapTiles  = "./resources/maptiles.png";
    game.preload(mapTiles);

    var shipsSpriteSheet  = "./resources/ships.png";
    game.preload(shipsSpriteSheet);

    /**
     * Map のマスの定義
     */
    var tileTypes = {
      umi: {id: 0, name:"umi"},//海
      arai: {id: 1, name:"arai"},//荒い海
      asai: {id: 2, name:"asai"},//浅い海
      riku: {id: 3, name:"riku"},//陸
      iwa: {id: 4,name:"iwa"},//岩
    }

    /**
    *船クラス
    */
    var Fune = Class.create(Sprite, {
        initialize: function(scene) {
            Sprite.call(this, 64, 64);
            this.image = game.assets[shipsSpriteSheet];
            this.frame = [0, 0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 3, 3, 3];

            this.stats = {
              //移動力を表すプロパティを追加
              movement: 3,
            };
        },
        getMovement() {
          //移動を取得するメソッド
          return this.stats.movement;
        }
    });
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
        //this.mapCollisionData = mapCollisionData

        // playLayer
        var playLayer = new Group()
        scene.addChild(playLayer);
        this.playLayer = playLayer;

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
      toLocalSpace:function(worldX,worldY) {
        /**
        *ワールド座標を与えるとローカル座標(localX, localY)を返す
        */
        var localX = worldX -this.tiles.x;
        var localY = worldY -this.tiles.y;
        /**
        * ワールド座標からtilesの座標をマイナス
        */
        return {x:localX, y:localY}
      },
      toWorldSpace:function(localX, localY) {
        /**
        *ローカル座標を与えるとワールド座標(worldX,worldY)を返す
        */
        var worldX = localX + this.tiles.x;
        var worldY = localY + this.tiles.y;
        /**
        * ローカル座標からtilesの座標をプラス
        */
        return {x:worldX, y:worldY}
      },
      getMapTileAtPosition:function(localX, localY) {
        return {
          /**
          *ローカル座標を与えるとマス目(i,j)を返す
          */
          i: Math.floor(localX/64),
          j: Math.floor(localY/64)
        };
      },
      getMapPositionAtTile: function(i,j) {
        return {
          /**
          *マス目を与えるとローカル座標(localX,localY)を返す
          */
          localX: i *64,
          localY: j *64
        };
      },
      getTileInfo:function(id) {
        for(t in tileTypes) {
          if (tileTypes[t].id == id) {
            return tileTypes[t];
          }
        }
      },
      addChild: function(object) {
        //レイアーにオブジェクトを追加
        this.playLayer.addChild(object);
        //playLayerと言うグループも本にはないので自分で探す必要がある。
      },
      positionObject: function(object, i, j){
        /**
        *オブジェクトのi,jの位置を記憶するためのmap.positionObject
        *を少し変更する。
        */
        var position = this.getMapPositionAtTile(i,j);
        //マスの位置からローカル座標を計算
        var worldPosition = this.toWorldSpace(position.localX,position.localY);
        //ローカル座標からワールド座標を計算

        object.x = worldPosition.x;
        object.y = worldPosition.y;

        object.i = i;//iを保存
        object.j = j;//jを保存
      },
      positionFune: function(fune, i, j) {
        this.positionObject(fune, i, j);
      },
      setActiveFune: function(fune) {
        this.activeFune = fune;
      },
      getManhattanDistance: function(startI, startJ, endI, endJ) {
        var distance = Math.abs(startI - endI) +Math.abs(startJ -endJ);
        //Math.absは絶対値を返しますIの距離とJの絶対値を足します。
        return distance;
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
        /**
        *checkTile: function(x, y) {
        *    if (x < 0 //xが0より小さい
        *    || this.width <= x
        *    || y < 0
        *    || this.height <= y
        *    ) {
        *        return false;
        *    }
        *    var width = this._image.width;
        *    var height = this._image.height;
        *    var tileWidth = this._tileWidth || width;
        *    var tileHeight = this._tileHeight || height;
        *    x = x / tileWidth | 0;
        *    y = y / tileHeight | 0;
        *    //		return this._data[y][x];
        *    var data = this._data[0];
        *    return data[y][x];
        *}
        */
        var tileInfo = this.getTileInfo(tileData);

        if(this.tiles.hitTest(localPosition.x, localPosition.y) == true) {
          //動かせないマスであればメッセージを表示
          alert("通れない、"+tileInfo.name);
          console.log("通れない", tileInfo.name, "world X", params.x, "localX", localPosition.x, "worldY", params.y, "localY", localPosition.y)
        } else {
          //動かせる時はクリックした位置からタイルの情報を習得
          var tile = this.getMapTileAtPosition(localPosition.x, localPosition.y);
          /**
          *船を指定位置まで移動させる
          */
          if (this.getManhattanDistance(this.activeFune.i, this.activeFune.j, tile.i, tile.j) <= this.activeFune.getMovement())
          {
            this.positionFune(this.activeFune, tile.i, tile.j);
          }
          console.log("通れる", tileInfo.name, "world X", params.x, "localX", localPosition.x, "worldY", params.y, "localY", localPosition.y)
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

        //船をシーンに追加
        var fune = new Fune();
        map.addChild(fune);
        //ここでaddChildと言うファンションは本に記述されてないのでサンプルを見て
        //自分で探す必要がある。
        map.positionFune(fune, 3, 3);
        map.setActiveFune(fune);

        //ゲームにシーンを追加
        game.pushScene(sceneGameMain);
    };

    game.start();
};
