/// <reference path="underscore.js" />
/// <reference path="knockout.js" />
/// <reference path="X0App.js" />
/// <reference path="SmartPlayer.js" />
/// <reference path="RandomCellPlayer.js" />
/// <reference path="AggressivePlayer.js" />

(function () {

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

    function ArchivedBoard(gameEndInfo) {

        var board = [],
            winnerInfo = new WinnerInfo(gameEndInfo.HasWinner ? gameEndInfo.WinningCells[0].Mark : 'No winner in this game');

        function Cell(mark, x, y, isWinner) {
            this.Mark = mark || '';
            this.X = x;
            this.Y = y;
            this.IsWinner = isWinner;
        }

        function WinnerInfo(name) {
            this.Name = name || '';
        }

        function construct() {
            _(gameEndInfo.Board).each(function (row, rowIndex) {
                board.push([]);
                _(row).each(function (cell, cellIndex) {
                    board[rowIndex].push(new Cell(
                        cell,
                        cellIndex,
                        rowIndex,
                        _(gameEndInfo.WinningCells).any(function (c) {
                            return c.X === cellIndex && c.Y === rowIndex;
                        })
                        ));
                });
            });
        }

        construct();

        this.Board = board;
        this.Winner = winnerInfo;
    }

    function AppViewModel() {

        var players = ko.observableArray([
                //new Player('Smart PC', 'SmtCPU', SmartPlayer.TurnAction),
                //new Player('Random PC', 'RndCPU', RandomCellPlayer.TurnAction),
                new Player('Aggressive PC', 'AgrCPU', AggressivePlayer.TurnAction),
                new Player('Hintee', 'H', manualPlayerTurnAction),
        ]),
            gameInfo = new X0App.GameInfo(3, _.pluck(players(), 'AppPlayer'), 1),
            gameCoordinator = new X0App.GameCoordinator(gameInfo),
            finishedBoards = ko.observableArray(),
            currentBoard = ko.observable(),
            gamesPlayed = ko.observable(0),
            isManualPlay = ko.observable(false),
            markNotifier = null;

        this.GameInfo = gameInfo;
        this.Players = players;
        this.Start = start;
        this.Boards = finishedBoards;
        this.CurrentBoard = currentBoard;
        this.GamesPlayed = gamesPlayed;
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

        function manualPlayerTurnAction(board, ownMark, notifyMark) {
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
                finishedBoards.push(new ArchivedBoard(gameEndInfo));
                gamesPlayed(gamesPlayed() + 1);
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