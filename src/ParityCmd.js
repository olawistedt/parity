
const GameParity = require('./Parity');

function play() {
  localGameParity = new GameParity(2, globalJudgeParity);  // Two AI players

  localGameParity.upperHandPlayer.setName('Computer');
  localGameParity.lowerHandPlayer.setName('Ola');
  localGameParity.lowerHandPlayer.setAiLevel(2);

  let sum_ai = 0;
  let sum_pl = 0;
  let turn = 0;

  // Play a partie.
  // Game is 100 points. The loser is lurched (skunked) for failing to reach 67
  // points, and double-lurched for failing to reach 50.
  let dealOrder = localGameParity.dealer.randomDealer();

  while (true) {
    //    console.log('The player that deals is ' + dealOrder[0].getName())
    localGameParity.judge.init(dealOrder[0], dealOrder[1]);
    localGameParity.dealer.shuffle();
    localGameParity.dealer.deal();
    localGameParity.upperHandPlayer.sortHand();
    localGameParity.lowerHandPlayer.sortHand();
    localGameParity.judge.setTrump(localGameParity.judge.leader.getTrump());
    localGameParity.judge.setParity(
        localGameParity.judge.opponent.getParity());
    for (let i = 0; i < 15; i++) {
      //   console.log('Upper hand ' +
      //   localGameParity.upperHandPlayer.getHand()); console.log('Lower hand
      //   ' + localGameParity.lowerHandPlayer.getHand());

      let lCard = localGameParity.judge.leader.getCard();
      localGameParity.judge.setLeadCard(lCard);
      let oCard = localGameParity.judge.opponent.getCard();
      localGameParity.judge.setOpponentCard(oCard);
      //    console.log('Leader ' + localGameParity.judge.leader.getName() + '
      //    plays
      //    '
      //    + lCard); console.log('Opponent ' +
      //    localGameParity.judge.opponent.getName() + ' plays ' + oCard);

      let winningPlayer = localGameParity.judge.getWinnerOfTrick();
      //    console.log('Winner ' + winningPlayer.getName());
      winningPlayer.addTrick([
        localGameParity.judge.getLeadCard(),
        localGameParity.judge.getOpponentCard()
      ]);
    }

    //    console.log(
    //        localGameParity.upperHandPlayer.getName() + ': ' +
    //        localGameParity.upperHandPlayer.getNrOfTricks());
    //    console.log(
    //        localGameParity.lowerHandPlayer.getName() + ': ' +
    //        localGameParity.lowerHandPlayer.getNrOfTricks());

    if (localGameParity.upperHandPlayer.getNrOfTricks() >
        localGameParity.lowerHandPlayer.getNrOfTricks()) {
      sum_ai += 1;
    } else {
      sum_pl += 1;
    }
    turn += 1;

    if (turn % 10000 == 0) {
      console.log(
          localGameParity.upperHandPlayer.getName() + ' ' + sum_ai + ' : ' +
          localGameParity.lowerHandPlayer.getName() + ' ' + sum_pl)
    }

    if (turn % 100000 == 0) {
      console.log('Ratio: ' + sum_pl / turn);
      return;
    }

    // Switch dealer
    localGameParity.dealer.nextDealer();
  }
}

play();
