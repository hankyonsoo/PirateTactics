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

    var mapUI  = "./resources/mapui.png";
    game.preload(mapUI);

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

    var GameManager = Class.create({
      initialize: function() {
        /**
        *　ゲーム管理クラスの初期化
        */
        this.playerList = [];
      /**
      *プレイヤーを人数を増やしやすくするため配列に宣言する。
      */
        this.turnCounter = 0;
      },

      addPlayer: function(player){
        /**
        *プレイヤーを追加するメソッド
        */
        player.setController(this);
        this.playerList.push(player);
      },

      setMap: function(map) {
        /**
        *マップを追加する。
        */
        map.setController(this);
        this.map = map;
      },

      setTurnUI: function(ui) {
        /**
        *ターンを表示の追加メソッド
        */
        this.turnUI = ui;
      },

      setStartPositions: function(startPositions) {
        /**
        * 初期位置の設定メソッド
        */
        this.startPositions = startPositions;
      },

      getActivePlayer: function() {
        /**
        *　現在誰のターンかを返すメソッド
        */
        return this.playerList[this.turnCounter % this.playerList.length];
      },

      beginGame: function() {
        //プレイヤー１をアクティブにする
        var player1 = this.playerList[0];
        for(var funeIndex = 0; funeIndex < player1.getFuneCount(); funeIndex++) {
          //player1の配列の分ループを回す。
          var fune = player1.getFune(funeIndex)
          /**
          * 船を初期位置に配置
          */
          this.map.addChild(fune);
          var startPosition = this.startPositions.player1[funeIndex]
          this.map.positionFune(fune, startPosition.i, startPosition.j);
        }

        var player2 = this.playerList[1];
        for(funeIndex = 0; funeIndex <player2.getFuneCount(); funeIndex++) {
          //player2の配列の分ループを回す
          var fune = player2.getFune(funeIndex);
          fune.OriginX = 32;
          fune.scaleX = -1;
          this.map.addChild(fune);
          var startPosition = this.startPositions.player2[funeIndex]
          this.map.positionFune(fune, startPosition.i, startPosition.j);
        }
        
        this.startTurn();
      },

      startTurn: function() {
        /**
        *　ターンの初期処理
        */
        var player = this.getActivePlayer();
        player.setActive(true);

        this.updateTurn();
      },

      updateTurn: function() {
        /**
        * ターンの更新処理
        */
        this.map.setActiveFune(this.getActivePlayer().getActiveFune());
        this.map.drawMovementRange();
        this.turnUI.updateTurn(this.turnCounter);
      },

      endTurn: function() {//ターン終了

        var player = this.getActivePlayer();
        player.setActive(false);
        /**
        * 現在のプレイヤーを非アクディブにしてターンカウンターを1つ増やし次のターンを開始する。
        */
        this.turnCounter++;
        this. startTurn();
      },
    })
    /**
    *船クラス
    */
    var Fune = Class.create(Sprite, {
        initialize: function(scene) {
          //スプライトの読み込む大きさ指定
            Sprite.call(this, 64, 64);
            //イメージはshipsSpriteSheetに指定
            this.image = game.assets[shipsSpriteSheet];
            this.frame = [0, 0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 3, 3, 3];

            this.stats = {
              //移動力を表すプロパティを追加
              movement: 3,
            };
        },
        getMovement: function() {
          //移動を取得するメソッド
          return this.stats.movement;
        },

        ontouchend: function(params) {
          if(this.player.getActiveFune() == this) {
            //現在動かしている船を選択した場合
            alert("現在選択中の船です");
          } else {
            //それ以外の船を選択した場合動かす船を変える
            this.player.setActiveFune(this);
          }
        }
    });

  /**
   * プレイヤー
  */
    var GamePlayer = Class.create({
        initialize: function() {
          //船の配列(船の数設定)を作る
            this.funeList = [];
        },
        isActive: function() {
            return this.myTurn;
        },
        setActive: function(flag) {
            this.myTurn = flag;
        },
        setController: function(controller) {
            this.controller = controller;
        },
        addFune: function(fune) {
            fune.player = this;
            this.funeList.push(fune)
        },
        getFune: function(index) {
            return this.funeList[index];
        },
        getFuneCount: function() {
            return this.funeList.length;
        },
        getActiveFune: function() {
            if (this.activeShip) {
                return this.activeShip;
            } else {
                return this.funeList[0];
            }
        },
        setActiveFune: function(fune) {
            //現在動かす船の設定
            this.activeShip = fune;
            //コントローラーアップデート
            this.controller.updateTurn();
        },
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
        this.frame = frame;

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

        // underLayer
        var underLayer = new Group();
        underLayer.touchEnabled = false;
        scene.addChild(underLayer);
        this.underLayer = underLayer;

        // playLayer
        var playLayer = new Group();
        playLayer.touchEnabled = false;
        scene.addChild(playLayer);
        this.playLayer = playLayer;

        /**
        * overLayerは本に書かれてないので余注意
        * 本当くそみたいな説明しか書かれてない本だ。
        */
        // overLayer
        var overLayer = new Group();
        overLayer.touchEnabled = false;;
        scene.addChild(overLayer);
        this.overLayer = overLayer;


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

        tiles.addEventListener(enchant.Event.TOUCH_START, function(params){
            self.ontouchupdate(params)
        });

        tiles.addEventListener(enchant.Event.TOUCH_MOVE, function(params){
            self.ontouchupdate(params)
        });
      },

      setController: function(controller) {
        this.controller = controller;
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
        console.log("x :"+ worldX+", y :"+ worldY);
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
      positonObject: function(object, i, j){
        /**
        *オブジェクトのi,jの位置を記憶するためのmap.positonObject
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
        this.positonObject(fune, i, j);
      },
      setActiveFune: function(fune) {
        fune.map = this;
        this.activeFune = fune;
        this.drawMovementRange()
      },
      outOfBorders: function(i, j) {
          if (i < 0) return true;
          if (i >= this.mapWidth) return true;
          if (j < 0) return true;
          if (j >= this.mapHeight) return true;

          return false;
      },
      getManhattanDistance: function(startI, startJ, endI, endJ) {
        var distance = Math.abs(startI - endI) +Math.abs(startJ -endJ);
        //Math.absは絶対値を返しますIの距離とJの絶対値を足します。
        return distance;
      },
      drawMovementRange: function(){
        console.log("update drawMovementRange")

        if (this.areaRangeLayer) {
          /**
          * 移動範囲を示すレイヤーがあったら消す
          */
          this.underLayer.removeChild(this.areaRangeLayer);
          delete this.areaRangeLayer;
        }
        this.areaRangeLayer = new Group();
        this.underLayer.addChild(this.areaRangeLayer);
        /**
        *現在位置を中心にした四角形を左下から右上の順に調べる
        */
        for (var rangeI = -this.activeFune.getMovement(); rangeI <= this.activeFune.getMovement(); rangeI++) {
          var targetI = this.activeFune.i +rangeI;
          for (var rangeJ = -this.activeFune.getMovement(); rangeJ <= this.activeFune.getMovement(); rangeJ++) {
            var targetJ = this.activeFune.j + rangeJ;

            if (!this.outOfBorders(targetI, targetJ)) {
              /**
              * outOfBordersでマップ内であることを確認
              */
              if (this.getManhattanDistance(this.activeFune.i,
              this.activeFune.j, targetI, targetJ) <=
              this.activeFune.getMovement()) {
                /**
                *さらにgetManhattanDistanceで調べて移動力以内ならば
                */
                var areaSprite = new Sprite(64, 64);
                areaSprite.touchEnabled = false;
                areaSprite.image = game.assets[mapUI]
                /**
                *　移動可能範囲をしますスプライトを作成
                */
                var position = this.getMapPositionAtTile(targetI,
                targetJ);

                /**
                *岩や陸のマスであれば
                */
                if (this.tiles.hitTest(position.localX, position.localY) == true) {
                  areaSprite.frame = 3;
                  //赤く表示
                } else {
                  areaSprite.frame = 2;
                  //そうでなければ白く表示
                }
                this.positonObject(areaSprite, targetI, targetJ);
                this.areaRangeLayer.addChild(areaSprite);
              }
            }
          }
        }
      },
      ontouchend:function(params) {
        if (this.mapMarker) {
            this.overLayer.removeChild(this.mapMarker)
            delete this.mapMarker;
        }
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
          console.log("通れない", tileInfo.name, "world X", params.x, "localX", localPosition.x, "worldY", params.y, "localY", localPosition.y)
        } else {
          console.log("通れる", tileInfo.name, "world X", params.x, "localX", localPosition.x, "worldY", params.y, "localY", localPosition.y)

          //動かせる時はクリックした位置からタイルの情報を習得
          var tile = this.getMapTileAtPosition(localPosition.x, localPosition.y);
          /**
          *船を指定位置まで移動させる
          */
          if (this.outOfBorders(tile.i, tile.j)) {
            return;
          }
          console.log("i",tile.i,"j",tile.j,"distance",this.getManhattanDistance(this.activeFune.i, tile.i , tile.j));

          if (this.getManhattanDistance(this.activeFune.i, this.activeFune.j, tile.i, tile.j) <= this.activeFune.getMovement()) {
            this.positionFune(this.activeFune, tile.i, tile.j);
            this.controller.endTurn();
          }
        }
      },
      ontouchupdate: function(params) {
        //ローカルポジションを取得
        var localPosition = this.toLocalSpace(params.x, params.y);
        var tile = this. getMapTileAtPosition(localPosition.x, localPosition.y);
        if (this.outOfBorders(tile.i, tile.j)) {
        /**
        * マップ以外のマスのない場所は何もしないのでreturnで中断
        */
          return
        }
        if (this.mapMarker == undefined) {
          /**
          *Xマークのオブジェクトがない場合, Xのスプライトオブジェクトを作る
          */
          this.mapMarker = new Sprite(64,64);
          this.mapMarker.image = game.assets[mapUI];
          this.positonObject(this.mapMarker, tile.i, tile.j);
          this.overLayer.addChild(this.mapMarker);
        } else {
          /**
          *Xマークのオブジェクトがあるときは、　それを移動する。
          */
          this.positonObject(this.mapMarker, tile.i, tile.j);
        }

        if (this.tiles.hitTest(localPosition.x, localPosition.y) == true) {
          /**
          *岩や陸の上には動けないので距離に関係なく灰色マークにする。
          */
          this.mapMarker.frame = 1;
        } else {
          if (this.getManhattanDistance(this.activeFune.i, this.activeFune.j,
             tile.i, tile.j) <= this.activeFune.getMovement()) {
               //距離範囲内はマークを赤く
               this.mapMarker.frame = 0;
             } else {
               //範囲距離外はマークを灰色にする
               this.mapMarker.frame = 1;
             }
        }
      },

    });

    /**
    *　ターン関係の情報を表示するクラス
    */
    var TurnUI = Class.create(Label, {
      initialize: function(scene) {
        //ターンを初期化
        Label.call(this);
        scene.addChild(this);
        this.x = 64;
        this.y = 640-50;
        this.font = "32px 'ＭＳ ゴシック', arial, sans-serif";
        this.color = "rgba(20, 20, 255, 1.0)"
      },

      updateTurn: function(turn) {
        this.text = "ターン:"+turn;
      },
    })
    game.onload = function(){
      var sceneGameMain = new Scene();

      //ゲームロジックの管理
      var manager = new GameManager();

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
        manager.setMap(map);

        //ターンのUIを追加
        var turnUI = new TurnUI(sceneGameMain);
        manager.setTurnUI(turnUI);

        //プレイヤー１をゲームマネージャーに追加
        var player1 = new GamePlayer();
        manager.addPlayer(player1);

        //プレイヤー２をゲームマネージャーに追加する
        var player2 = new GamePlayer();
        manager.addPlayer(player2);

        //船をプレイヤーに追加
        for(var i=0; i<4; ++i) {
          //プレイヤー1を4人追加する。
          var fune = new Fune();
          player1.addFune(fune);
        }

        for(var i=0; i<4; ++i) {
          //プレイヤー２を４人追加
          var fune = new Fune();
          player2.addFune(fune);
        }
        // 船の初期の位置
        var startPositions = {
          //プレイヤー１のスタートポイント指定
            player1: [
                {i: 0, j: 8}, {i: 0, j: 6}, {i: 1, j: 7}, {i: 2, j: 8}
            ],
            player2: [
              　{i: 12, j: 0}, {i: 10, j: 0}, {i: 11, j: 1}, {i: 12, j: 2}
            ],
        }
      //ゲームマネージャーにスタートポイント追加
      manager.setStartPositions(startPositions);

      //ゲームにシーンを追加
      game.pushScene(sceneGameMain);

      //ゲームのロジック開始
      manager.beginGame();
    };

    game.start();
};
