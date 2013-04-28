﻿/// <reference path="underscore.js" />
/// <reference path="knockout.js" />
/// <reference path="X0App.js" />

(function () {

    function dummyPlayerTurnAction(board, notifyMark) {
        var firstNonMarkedCell = null;

        _.each(board, function (row, rowIndex) {
            if (firstNonMarkedCell) {
                return;
            }
            _.each(row, function (cell, cellIndex) {
                if (firstNonMarkedCell || board[rowIndex][cellIndex] !== null) {
                    return;
                }

                firstNonMarkedCell = new X0App.Advanced.Cell(cellIndex, rowIndex);
            });
        });

        notifyMark.call(firstNonMarkedCell, firstNonMarkedCell);
    }

    function Player(name, mark, turnAction){
        var self = this,
            appPlayer = new X0App.Player(mark, name, turnAction);

        this.AppPlayer = appPlayer;
        this.Score = ko.observable(appPlayer.Score);
        this.NameAndInfo = ko.computed(function () {
            return self.AppPlayer.Name
                + ' - '
                + self.Score();
        });
    }

    function AppViewModel() {

        var players = ko.observableArray([
                new Player('Dummy PC', 'PC', dummyPlayerTurnAction),
                //new Player('Player 0', '0', manualPlayerTurnAction),
                new Player('Hintee', 'H', manualPlayerTurnAction)
            ]),
            gameInfo = new X0App.GameInfo(3, _.pluck(players(), 'AppPlayer'), 1),
            gameCoordinator = new X0App.GameCoordinator(gameInfo),
            finishedBoards = ko.observableArray(),
            currentBoard = ko.observable(),
            isManualPlay = ko.observable(false),
            markNotifier = null;

        this.GameInfo = gameInfo;
        this.Players = players;
        this.Start = start;
        this.Boards = finishedBoards;
        this.CurrentBoard = currentBoard;
        this.IsManualPlay = isManualPlay;
        this.MarkCell = markCell;

        function start() {
            gameCoordinator.Play();
        }

        function markCell(x, y) {
            if (!markNotifier) {
                return;
            }
            markNotifier.call(this, new X0App.Advanced.Cell(x, y));
        }

        function manualPlayerTurnAction(board, notifyMark) {
            isManualPlay(true);
            markNotifier = function (cellToMark) {
                isManualPlay(false);
                markNotifier = null;
                notifyMark(cellToMark);
            }
        }

        function construct() {

            function updateCurrentBoard(board) {
                currentBoard(board);
            }

            gameCoordinator.Events.AddNewGameHandler(updateCurrentBoard);
            gameCoordinator.Events.AddCellMarkedHandler(updateCurrentBoard);
            gameCoordinator.Events.AddGameEndedHandler(function (gameEndInfo) {
                finishedBoards.push(gameEndInfo.Board);
                if (!gameEndInfo.HasWinner) {
                    return;
                }
                var winningPlayer = gameInfo.PlayerByMark(gameEndInfo.WinningCells[0].Mark);
                _.find(players(), function (p) { return p.AppPlayer === winningPlayer; }).Score(winningPlayer.Score);
            });
        }

        construct();
    }

    this.AppViewModel = AppViewModel;

}).call(this);