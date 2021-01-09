
const parity = require('./Parity');

function play() {
  gameParity.upperHandPlayer.setName('Computer');
  gameParity.lowerHandPlayer.setName('Ola');
  gameParity.lowerHandPlayer.setAiLevel(2);

  let sum_ai = 0;
  let sum_pl = 0;
  let turn = 0;

  // Play a partie.
  // Game is 100 points. The loser is lurched (skunked) for failing to reach 67
  // points, and double-lurched for failing to reach 50.
  let dealOrder = gameParity.dealer.randomDealer();

  while (true) {
    //    console.log('The player that deals is ' + dealOrder[0].getName())
    gameParity.judge.init(dealOrder[0], dealOrder[1]);
    gameParity.dealer.shuffle();
    gameParity.dealer.deal();
    gameParity.upperHandPlayer.sortHand();
    gameParity.lowerHandPlayer.sortHand();
    gameParity.judge.setTrump(gameParity.judge.leader.getTrump());
    gameParity.judge.setParity(gameParity.judge.opponent.getParity());
    for (let i = 0; i < 15; i++) {
      //   console.log('Upper hand ' + gameParity.upperHandPlayer.getHand());
      //   console.log('Lower hand ' + gameParity.lowerHandPlayer.getHand());

      let lCard = gameParity.judge.leader.getCard();
      gameParity.judge.setLeadCard(lCard);
      let oCard = gameParity.judge.opponent.getCard();
      gameParity.judge.setOpponentCard(oCard);
      //    console.log('Leader ' + gameParity.judge.leader.getName() + ' plays
      //    '
      //    + lCard); console.log('Opponent ' +
      //    gameParity.judge.opponent.getName() + ' plays ' + oCard);

      let winningPlayer = gameParity.judge.getWinnerOfTrick();
      //    console.log('Winner ' + winningPlayer.getName());
      winningPlayer.addTrick([
        gameParity.judge.getLeadCard(), gameParity.judge.getOpponentCard()
      ]);
    }

    //    console.log(
    //        gameParity.upperHandPlayer.getName() + ': ' +
    //        gameParity.upperHandPlayer.getNrOfTricks());
    //    console.log(
    //        gameParity.lowerHandPlayer.getName() + ': ' +
    //        gameParity.lowerHandPlayer.getNrOfTricks());

    if (gameParity.upperHandPlayer.getNrOfTricks() >
        gameParity.lowerHandPlayer.getNrOfTricks()) {
      sum_ai += 1;
    } else {
      sum_pl += 1;
    }
    turn += 1;

    if (turn % 10000 == 0) {
      console.log(
          gameParity.upperHandPlayer.getName() + ' ' + sum_ai + ' : ' +
          gameParity.lowerHandPlayer.getName() + ' ' + sum_pl)
    }

    if (turn % 100000 == 0) {
      console.log('Ratio: ' + sum_pl / turn);
      return;
    }

    // Switch dealer
    let tmp = dealOrder[0];
    dealOrder[0] = dealOrder[1];
    dealOrder[1] = tmp;
  }
}

play();
