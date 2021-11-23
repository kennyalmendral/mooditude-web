const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.updateUserM3AssessmentScores = functions.https.onCall((data, context) => {
  let allScore = 0;
  let gatewayScore = 0;
  let depressionScore = 0;
  let gadScore = 0;
  let panicScore = 0;
  let ptsdScore = 0;
  let ocdScore = 0;
  let bipolarScore = 0;

  const questions = data.rawData.split(',').map(question => parseInt(question));

  questions.forEach((value, index) => {
    let questionIndex = index + 1;

    if ((questionIndex == 7) || (questionIndex == 9)) {
      return;
    }

    allScore += value;
    
    let scaledValue = getRiskScoringValue(value);

    if (questionIndex <= 9) {
      depressionScore += scaledValue;
    }

    if ((questionIndex >= 10) && (questionIndex <= 11)) {
      gadScore += scaledValue;
    }

    if ((questionIndex >= 12) && (questionIndex <= 13)) {
      panicScore += scaledValue;
    }

    if ((questionIndex >= 15) && (questionIndex <= 18)) {
      ptsdScore += scaledValue;
    }

    if ((questionIndex >= 19) && (questionIndex <= 21)) {
      ocdScore += scaledValue;
    }

    if ((questionIndex >= 22) && (questionIndex <= 25)) {
      bipolarScore += scaledValue;
    }
    
    if ((questionIndex == 5) || (questionIndex > 25)) {
      gatewayScore += getGatewayScoringValue(questionIndex, value);
    }
  });

  function getRiskScoringValue(value) {
    if ((value == 0) || (value == 1)) return 0;
    if (value == 2) return 1;
    if (value == 3) return 2;
    if (value == 4) return 2;

    return 0;
  }

  function getGatewayScoringValue(index, value) {
    if ((index == 5) && (value >= 1)) return 1;
    if ((index >= 26) && (index < 29) && (value >= 3)) return 3;
    if ((index == 29) && (value >= 1)) return 1;
    
    return 0;
  }

  const fireStore = admin.firestore();

  console.log(data);
  console.log(fireStore);

  fireStore
    .collection('M3Assessment')
    .doc(data.userId)
    .collection('scores')
    .doc(data.epochId)
    .update({
      allScore: allScore,
      bipolarScore: bipolarScore,
      depressionScore: depressionScore,
      gadScore: gadScore,
      gatewayScore: gatewayScore,
      ocdScore: ocdScore,
      panicScore: panicScore,
      ptsdScore: ptsdScore
    });

  return {
    allScore,
    gatewayScore,
    depressionScore,
    gadScore,
    panicScore,
    ptsdScore,
    ocdScore,
    bipolarScore
  };
});