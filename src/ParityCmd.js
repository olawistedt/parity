
const parity = require('./Parity');

function play() {
  globalGameParity.upperHandPlayer.setName('Computer');
  globalGameParity.lowerHandPlayer.setName('Ola');
  globalGameParity.lowerHandPlayer.setAiLevel(2);

  let sum_ai = 0;
  let sum_pl = 0;
  let turn = 0;

  // Play a partie.
  // Game is 100 points. The loser is lurched (skunked) for failing to reach 67
  // points, and double-lurched for failing to reach 50.
  let dealOrder = globalGameParity.dealer.randomDealer();

  while (true) {
    //    console.log('The player that deals is ' + dealOrder[0].getName())
    globalGameParity.judge.init(dealOrder[0], dealOrder[1]);
    globalGameParity.dealer.shuffle();
    globalGameParity.dealer.deal();
    globalGameParity.upperHandPlayer.sortHand();
    globalGameParity.lowerHandPlayer.sortHand();
    globalGameParity.judge.setTrump(globalGameParity.judge.leader.getTrump());
    globalGameParity.judge.setParity(globalGameParity.judge.opponent.getParity());
    for (let i = 0; i < 15; i++) {
      //   console.log('Upper hand ' + globalGameParity.upperHandPlayer.getHand());
      //   console.log('Lower hand ' + globalGameParity.lowerHandPlayer.getHand());

      let lCard = globalGameParity.judge.leader.getCard();
      globalGameParity.judge.setLeadCard(lCard);
      let oCard = globalGameParity.judge.opponent.getCard();
      globalGameParity.judge.setOpponentCard(oCard);
      //    console.log('Leader ' + globalGameParity.judge.leader.getName() + ' plays
      //    '
      //    + lCard); console.log('Opponent ' +
      //    globalGameParity.judge.opponent.getName() + ' plays ' + oCard);

      let winningPlayer = globalGameParity.judge.getWinnerOfTrick();
      //    console.log('Winner ' + winningPlayer.getName());
      winningPlayer.addTrick([
        globalGameParity.judge.getLeadCard(), globalGameParity.judge.getOpponentCard()
      ]);
    }

    //    console.log(
    //        globalGameParity.upperHandPlayer.getName() + ': ' +
    //        globalGameParity.upperHandPlayer.getNrOfTricks());
    //    console.log(
    //        globalGameParity.lowerHandPlayer.getName() + ': ' +
    //        globalGameParity.lowerHandPlayer.getNrOfTricks());

    if (globalGameParity.upperHandPlayer.getNrOfTricks() >
        globalGameParity.lowerHandPlayer.getNrOfTricks()) {
      sum_ai += 1;
    } else {
      sum_pl += 1;
    }
    turn += 1;

    if (turn % 10000 == 0) {
      console.log(
          globalGameParity.upperHandPlayer.getName() + ' ' + sum_ai + ' : ' +
          globalGameParity.lowerHandPlayer.getName() + ' ' + sum_pl)
    }

    if (turn % 100000 == 0) {
      console.log('Ratio: ' + sum_pl / turn);
      return;
    }

    // Switch dealer
    globalGameParity.dealer.nextDealer();
  }
}

play();
