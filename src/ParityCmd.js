
TEST = false;
const GameParity = require('./Parity');

function play() {
  let localGameParity = new GameParity(1, 3, globalJudgeParity);  // Two AI players

  localGameParity.upperHandPlayer.setName('Computer');
  localGameParity.lowerHandPlayer.setName('Ola');

  let sum_ai = 0;
  let sum_pl = 0;
  let turn = 0;

  while (true) {
    localGameParity.newGame();

    do {
      localGameParity.newSingleDeal();
      localGameParity.dealer.shuffle();
      localGameParity.dealer.deal();
      localGameParity.upperHandPlayer.sortHand();
      localGameParity.lowerHandPlayer.sortHand();
      localGameParity.judge.setTrump(localGameParity.judge.leader.getTrump());
      localGameParity.judge.setParity(
          localGameParity.judge.opponent.getParity());

      // Play a single deal
      while (!localGameParity.judge.isEndOfSingleDeal()) {
        let lCard = localGameParity.judge.leader.getCard();
        localGameParity.judge.setLeadCard(lCard);
        let oCard = localGameParity.judge.opponent.getCard();
        localGameParity.judge.setOpponentCard(oCard);
        let winningPlayer = localGameParity.judge.getWinnerOfTrick();
        winningPlayer.addTrick([
          localGameParity.judge.getLeadCard(),
          localGameParity.judge.getOpponentCard()
        ]);
      }

      localGameParity.dealer.nextDealer();

    } while (localGameParity.judge.setTotalPoints() < 100)

    turn += 1;

    if(localGameParity.upperHandPlayer.total_points > localGameParity.lowerHandPlayer.total_points) {
        sum_ai++;
    } else {
        sum_pl++;
    }

    if (turn % 10000 == 0) {
      console.log(
          localGameParity.upperHandPlayer.getName() + ' ' + sum_ai + ' : ' +
          localGameParity.lowerHandPlayer.getName() + ' ' + sum_pl)
    }

    if (turn % 100000 == 0) {
      console.log('Ratio: ' + sum_pl / turn);
      return;
    }
  }
}

play();
