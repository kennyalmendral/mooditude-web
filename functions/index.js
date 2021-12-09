const functions = require("firebase-functions");
const admin = require('firebase-admin');

const stripe = require('stripe')('sk_test_51K09rjAuTlAR8JLMimh1DvJBksnM2A1L6LVeDqQQoeO55f62ocwVsD8nkXbV004WzIrE8LyRYidKNk6lyGSaJqSJ00YRntqU8e');

admin.initializeApp(functions.config().firebase);

exports.updateUserM3AssessmentScores = functions.https.onCall((data, context) => {
  let allScore = 0;
  let gatewayScore = 0;
  let depressionScore = 0;
  let gadScore = 0;
  let panicScore = 0;
  let socialAnxietyScore = 0;
  let ptsdScore = 0;
  let ocdScore = 0;
  let bipolarScore = 0;
  let anxietyScore = 0;
  let overallScore = 0;

  let realDepressionScore = 0;
  let realAnxietyScore = 0;
  let realOcdSCore = 0;
  let realPtsdScore = 0;
  let realBipolarScore = 0;

  let allRiskLevel = '';
  let depressionRiskLevel = '';
  let anxietyRiskLevel = '';
  let ptsdRiskLevel = '';
  let bipolarRiskLevel = '';

  let hasSuicidalThoughts = false;
  let usedDrug = false;
  let usedAlcohol = false;

  let thoughtsOfSuicideAnswer = 0;
  let impairsWorkSchoolAnswer = 0;
  let impairsFriendsFamilyAnswer = 0;
  let ledToUsingAlcoholAnswer = 0;
  let ledToUsingDrugAnswer = 0;

  const questions = data.rawData.split(',').map(question => parseInt(question));

  questions.forEach((value, index) => {
    if ((index == 7) || (index == 9)) {
      return;
    }

    if (index == 6) {
      let nextValue = questions[7] || 0;
      value = nextValue > value ? nextValue : value;
    } else if (index == 8) {
      let nextValue = questions[9] || 0;
      value = nextValue > value ? nextValue : value;
    }

    allScore += value;
    
    let scaledValue = getRiskScoringValue(value);

    if (index <= 9) {
      depressionScore += scaledValue;
      realDepressionScore += value;
    }

    if ((index >= 10) && (index <= 11)) {
      gadScore += scaledValue;
      realAnxietyScore += value;
    }

    if ((index >= 12) && (index <= 13)) {
      panicScore += scaledValue;
      realAnxietyScore += value;
    }

    if (index == 14) {
      socialAnxietyScore += scaledValue;
      realAnxietyScore += value;
    }

    if ((index >= 15) && (index <= 18)) {
      ptsdScore += scaledValue;
      realPtsdScore += value;
    }

    if ((index >= 19) && (index <= 21)) {
      ocdScore += scaledValue;
      realOcdSCore += value;
    }

    if ((index >= 22) && (index <= 25)) {
      bipolarScore += scaledValue;
      realBipolarScore += value;
    }
    
    if ((index == 5) || (index > 25)) {
      gatewayScore += getGatewayScoringValue(index, value);
    }

    if (index == 4) {
      if (value > 0) {
        hasSuicidalThoughts = true;
      } else {
        hasSuicidalThoughts = false;
      }

      thoughtsOfSuicideAnswer = value;
    }

    if (index == 25) {
      impairsWorkSchoolAnswer = value;
    }

    if (index == 26) {
      impairsFriendsFamilyAnswer = value;
    }

    if (index == 27) {
      if (value > 0) {
        usedAlcohol = true;
      } else {
        usedAlcohol = false;
      }

      ledToUsingAlcoholAnswer = value;
    }

    if (index == 28) {
      if (value > 0) {
        usedDrug = true;
      } else {
        usedDrug = false;
      }

      ledToUsingDrugAnswer = value
    }
  });

  anxietyScore = gadScore + panicScore + socialAnxietyScore + ptsdScore + ocdScore;
  overallScore = allScore + gatewayScore;

  if (allScore <= 1) {
    allRiskLevel = 'unlikely';
  } else if ((allScore >= 2) && (allScore <= 32)) {
    allRiskLevel = 'low';
  } else if ((allScore >= 33) && (allScore <= 50)) {
    allRiskLevel = 'medium';
  } else if ((allScore >= 51) && (allScore <= 108)) {
    allRiskLevel = 'high';
  }

  if (depressionScore <= 4) {
    depressionRiskLevel = 'unlikely';
  } else if ((depressionScore >= 5) && (depressionScore <= 7)) {
    depressionRiskLevel = 'low';
  } else if ((depressionScore >= 8) && (depressionScore <= 10)) {
    depressionRiskLevel = 'medium';
  } else if (depressionScore > 10) {
    depressionRiskLevel = 'high';
  }

  if (anxietyScore <= 2) {
    anxietyRiskLevel = 'unlikely';
  } else if ((anxietyScore >= 3) && (anxietyScore <= 5)) {
    anxietyRiskLevel = 'low';
  } else if ((anxietyScore >= 6) && (anxietyScore <= 11)) {
    anxietyRiskLevel = 'medium';
  } else if (anxietyScore > 11) {
    anxietyRiskLevel = 'high';
  }

  if (ptsdScore <= 1) {
    ptsdRiskLevel = 'unlikely';
  } else if ((ptsdScore >= 2) && (ptsdScore <= 3)) {
    ptsdRiskLevel = 'low';
  } else if ((ptsdScore >= 4) && (ptsdScore <= 5)) {
    ptsdRiskLevel = 'medium';
  } else if (ptsdScore > 5) {
    ptsdRiskLevel = 'high';
  }

  if (bipolarScore <= 1) {
    bipolarRiskLevel = 'unlikely';
  } else if ((bipolarScore >= 2) && (bipolarScore <= 3)) {
    bipolarRiskLevel = 'low';
  } else if ((bipolarScore >= 4) && (bipolarScore <= 6)) {
    bipolarRiskLevel = 'medium';
  } else if (bipolarScore > 6) {
    bipolarRiskLevel = 'high';
  }

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
      socialAnxietyScore: socialAnxietyScore,
      ptsdScore: ptsdScore
    });

  return {
    allScore,
    overallScore,
    anxietyScore,
    gatewayScore,
    depressionScore,
    gadScore,
    panicScore,
    socialAnxietyScore,
    ptsdScore,
    ocdScore,
    bipolarScore,
    allRiskLevel,
    depressionRiskLevel,
    anxietyRiskLevel,
    ptsdRiskLevel,
    bipolarRiskLevel,
    hasSuicidalThoughts,
    usedAlcohol,
    usedDrug,
    thoughtsOfSuicideAnswer,
    impairsWorkSchoolAnswer,
    impairsFriendsFamilyAnswer,
    ledToUsingAlcoholAnswer,
    ledToUsingDrugAnswer
  };
});

exports.processStripeSubscription = functions.https.onCall(async (data, context) => {
  const stripe = require('stripe')('sk_test_51K09rjAuTlAR8JLMimh1DvJBksnM2A1L6LVeDqQQoeO55f62ocwVsD8nkXbV004WzIrE8LyRYidKNk6lyGSaJqSJ00YRntqU8e');

  let price = 'price_1K09ueAuTlAR8JLMqv6RVsh8'

  if (data.plan == 'monthly') {
    price = 'price_1K09ueAuTlAR8JLMqv6RVsh8'
  } else if (data.plan == 'yearly' || data.plan == 'yearly-30-trial') {
    price = 'price_1K09ueAuTlAR8JLM3JmfvSgj'
  } else if (data.plan == 'yearly-50-off') {
    price = 'price_1K4oHJAuTlAR8JLMPm7MOrsi'
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: price,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 30
    },
    mode: 'subscription',
    success_url: `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: data.cancelUrl,
  });

  return {
    data,
    session
  };
});

exports.getStripeSubscription = functions.https.onCall(async (data, context) => {
  const stripe = require('stripe')('sk_test_51K09rjAuTlAR8JLMimh1DvJBksnM2A1L6LVeDqQQoeO55f62ocwVsD8nkXbV004WzIrE8LyRYidKNk6lyGSaJqSJ00YRntqU8e');
  
  const session = await stripe.checkout.sessions.retrieve(data.session_id);
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  if (session) {
    return {
      session,
      subscription
    };
  }
});