
TEST = false;
const GameParity = require('./Parity');

function play() {
  let localGameParity =
      new GameParity(1, 3, globalJudgeParity);  // Two AI players

  localGameParity.upperHandPlayer.setName('Computer');
  localGameParity.lowerHandPlayer.setName('Ola');

  let sum_deal_ai = 0;
  let sum_deal_pl = 0;
  let sum_ai = 0;
  let sum_pl = 0;
  let turn = 0;
  let nr_of_deals = 0;

  let totalPoints;
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
      totalPoints = localGameParity.judge.setTotalPoints();

      nr_of_deals++;
      if (localGameParity.upperHandPlayer.deal_points >
          localGameParity.lowerHandPlayer.deal_points) {
        sum_deal_ai++;
      } else {
        sum_deal_pl++;
      }

    } while (totalPoints < 100)

    turn += 1;

    if (localGameParity.upperHandPlayer.total_points >
        localGameParity.lowerHandPlayer.total_points) {
      sum_ai++;
    } else {
      sum_pl++;
    }

    if (turn % 100 == 0) {
      console.log('Deals: ' +
          localGameParity.upperHandPlayer.getName() + ' ' + sum_deal_ai + ' : ' +
          localGameParity.lowerHandPlayer.getName() + ' ' + sum_deal_pl + ' : Totals: ' +
          localGameParity.upperHandPlayer.getName() + ' ' + sum_ai + ' : ' +
          localGameParity.lowerHandPlayer.getName() + ' ' + sum_pl);
    }

    if (turn % 1000 == 0) {
      console.log('Ratio deals: ' + sum_deal_pl / nr_of_deals);
      console.log('Ratio totals: ' + sum_pl / turn);
      return;
    }
  }
}

play();
