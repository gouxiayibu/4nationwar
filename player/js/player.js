"use strict";

 // 棋子表示：
 //
 // 00:  无
 // 01:  反面
 // 02:  军旗
 // 03:  地雷
 // 04:  炸弹
 // 05:  司令
 // 06:  军长
 // 07:  师长
 // 08:  旅长
 // 09:  团长
 // 0A:  营长
 // 0B:  连长
 // 0C:  排长
 // 0D:  工兵

var ChessPlayer = function() {
  // 初始化棋盘组件
  $("#board").empty();
  for (var i = 0; i <= 16; i++) {
    $("#board").append("<ul id='L" + (16-i) + "'></ul>");
  }

  for (var i = 0; i <= 16; i++) {
    for (var j = 0; j <= 16; j++) {
      var name = "P_" + i + "_" + j
      var item = '<li id="' + name + '" ></li>'
      $("#L" + i ).append(item);
    }
  }

  //$('<img>').attr('src', 'images/b0.png').attr("class", "chess").appendTo(item);
  this.show = "ALL";
  this._game = null;
};

ChessPlayer.prototype = {
  _emptyBoard: function() {
    // who: undefined 不能行棋的地方
    //        null      空位置
    this._board = [];
    for (var i = 0; i <= 16; i++) {
      this._board.push([])
      for (var j = 0; j <= 16; j++) {
        var pos = {};
        pos.who = null;
        pos.piece = 0;
        pos.img = null;

        if (i<=5 && j<=5) {
          pos.who = undefined;
        } else if ( j >=11 && i<= 5) {
          pos.who = undefined;
        } else if ( j >=11 && j>= 11) {
          pos.who = undefined;
        } else if ( j <=5 &&  j>= 11) {
          pos.who = undefined;
        }
        this._board[i].push(pos);
      }
    }

    for (var i = 0; i <= 16; i++) {
      for (var j = 0; j <= 16; j++) {
        var name = "#P_" + i + "_" + j;
        $(name).empty();    //清空图片
      }
    }
  },

  _getImage: function(who, piece) {
    if ( who === null) {
      return null;
    }

    var img = "";
    if ( who == "E") {
      img = "r";
    } else if ( who == "S") {
      img = "d";
    } else if ( who == "W") {
      img = "b";
    } else if ( who == "N") {
      img = "g";
    }

    // 根据 this.show 修改
    if ( this.show == "ALL" || who == this.myself ) {
      img = img + (13 - piece);
    } else {
      img = img + "0";
    }

    return img;
  },

  // 重新装载记录
  loadGame: function(newGame) {
    this._game = newGame;

    this.step = 0;
    this.totalMove = this._game.totalMove;
    this.myself = this._game.myself;

    this._emptyBoard();

    for (var i = 0; i <= 16; i++) {
      for (var j = 0; j <= 16; j++) {
        if ( this._game.board[i][j].who !== undefined) {
          this._board[i][j].who = this._game.board[i][j].who;
          this._board[i][j].piece = this._game.board[i][j].value;
        }
      }
    }
  },

  showGame: function() {
    for (var i = 0; i <= 16; i++) {
      for (var j = 0; j <= 16; j++) {
        if ( this._board[i][j].who !== undefined) {
          var img = this._getImage(this._board[i][j].who, this._board[i][j].piece);
          if ( img && img !== this._board[i][j].img) {
            this._board[i][j].img = img;
            var item = $("#P_" + i + "_" + j);
            item.empty();
            $('<img>').attr('src', 'images/' + img + ".png").attr("class", "chess").appendTo(item);
          } else if ( img === null) {
            this._board[i][j].img = null;
            var item = $("#P_" + i + "_" + j);
            item.empty();
          }
        }
      }
    }
  },

  _doMove: function(newBoard, move) {
    var xfrom = move.xfrom;
    var yfrom = move.yfrom;
    var xto = move.xto;
    var yto = move.yto;
    var who = move.who;
    var action = move.action;

    var piece = newBoard[yfrom][xfrom].piece;

    if ( action === "move" || action === "kill") {
      newBoard[yto][xto].who = who;
      newBoard[yto][xto].piece = piece;
      newBoard[yfrom][xfrom].who = null;
      newBoard[yfrom][xfrom].piece = 0;
    } else if ( action === "killed") {
      newBoard[yfrom][xfrom].who = null;
      newBoard[yfrom][xfrom].piece = 0;
    } else if ( action === "fired") {
      newBoard[yfrom][xfrom].who = null;
      newBoard[yfrom][xfrom].piece = 0;
      newBoard[yto][xto].who = null;
      newBoard[yto][xto].piece = 0;
    }

  },

  _updateTo: function(targetStep) {

    // 构造一个空棋盘
    var newBoard = [];
    for (var i = 0; i <= 16; i++) {
      newBoard.push([])
      for (var j = 0; j <= 16; j++) {
        var pos = {};
        pos.who = null;
        pos.piece = 0;

        if (i<=5 && j<=5) {
          pos.who = undefined;
        } else if ( j >=11 && i<= 5) {
          pos.who = undefined;
        } else if ( j >=11 && j>= 11) {
          pos.who = undefined;
        } else if ( j <=5 &&  j>= 11) {
          pos.who = undefined;
        }
        newBoard[i].push(pos);
      }
    }

    for (var i = 0; i <= 16; i++) {
      for (var j = 0; j <= 16; j++) {
        if ( this._game.board[i][j].who !== undefined) {
          newBoard[i][j].who = this._game.board[i][j].who;
          newBoard[i][j].piece = this._game.board[i][j].value;
        }
      }
    }

    // 更新行棋
    for(var i = 0; i < targetStep; i++) {
      this._doMove(newBoard, this._game.record[i]);
    }

    for (var i = 0; i <= 16; i++) {
      for (var j = 0; j <= 16; j++) {
        this._board[i][j].who = newBoard[i][j].who;
        this._board[i][j].piece = newBoard[i][j].piece;
      }
    }
  },

  doReset : function() {
    this.step = 0;
    this._updateTo(this.step);
  },

  doForward : function() {
    if ( this.step >= this.totalMove) {
      return;
    }
    this.step = this.step + 1;
    this._updateTo(this.step);
  },

  doBackward : function() {
    if ( this.step == 0) {
      return;
    }
    this.step = this.step - 1;
    this._updateTo(this.step);
  }
};
