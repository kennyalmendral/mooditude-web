const config = require('../config/config.json');
const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const fs = require('fs');
const stream = require('stream');
const path = require('path');

const PDFDocument = require('pdfkit');

const stripe = require('stripe')(config.stripe.secretKey);

const needle = require('needle');

const mailjetOptions = {
  'json': true,
  'username': config.mailJet.apiKey,
  'password': config.mailJet.apiSecret
};

exports.updateUserM3AssessmentScores = functions.https.onCall(async (data, context) => {
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

  admin
    .firestore()
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

exports.updateSubscriptionData = functions.https.onCall(async (data, context) => {
  const userId = data.userId;
  const platform = data.platform;
  const productId = data.productId;
  const expiryDate = data.expiryDate;
  const trialDurationInDays = data.trialDurationInDays;
  const duration = data.duration;
  const transactionId = data.transactionId;
  const transactionDate = data.transactionDate;

  let grantObj = {};

  if (platform != '') {
    grantObj[`grant.platform`] = platform;
  }

  if (productId != '') {
    grantObj[`grant.productId`] = productId;
  }

  if (expiryDate != '') {
    grantObj[`grant.expiryDate`] = expiryDate;
  }

  if (parseInt(trialDurationInDays) > 0) {
    grantObj[`grant.trialDurationInDays`] = trialDurationInDays;
  }

  if (duration > 0) {
    grantObj[`grant.duration`] = duration;
  }

  if (transactionId != '') {
    grantObj[`grant.transactionId`] = transactionId;
  }
  
  if (transactionDate != '') {
    grantObj[`grant.transactionDate`] = transactionDate;
  }

  await admin
    .firestore()
    .collection('Subscribers')
    .doc(userId)
    .update(grantObj);

  return {
    updated: true
  };
});

exports.processStripeSubscription = functions.https.onCall(async (data, context) => {
  let price = config.stripe.plan.monthly;

  if (data.plan == 'monthly') {
    price = config.stripe.plan.monthly;
  } else if (data.plan == 'yearly') {
    price = config.stripe.plan.yearly;
  }

  let couponCode = null;

  if (data.message != null) {
    if (data.message == '10% OFF') {
      couponCode = 'TEST10';
    } else if (data.message == '80% OFF') {
      couponCode = 'TEST80';
    } else if (data.message == '50% OFF') {
      couponCode = 'TEST50';
    }
  }

  let stripeData = {
    line_items: [
      {
        price: price,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer_email: data.customerEmail,
    success_url: `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&type=${data.type}&code_type=${data.codeType}&discount=${couponCode}&duration=${data.duration}`,
    cancel_url: `${data.cancelUrl}?checkout_cancelled=true`,
  };

  if (data.codeType == 'discount') {
    if (data.message != null) {
      stripeData.discounts = [
        {coupon: couponCode}
      ];
    }
  }

  if (data.codeType == 'trial') {
    if (data.duration != null) {
      stripeData.subscription_data = {
        trial_period_days: data.duration
      };
    }
  }

  const session = await stripe.checkout.sessions.create(stripeData);

  return {
    data,
    session
  };
});

exports.processStripeSubscriptionOnSignUp = functions.https.onCall(async (data, context) => {
  let price = config.stripe.plan.monthly;

  if ((data.type == 'subscription') && (data.duration == '1')) {
    price = config.stripe.plan.monthly; // monthly
  } else if ((data.type == 'subscription') && (data.duration == '3')) {
    price = config.stripe.plan.everyThreeMonths; // every 3 months
  } else if ((data.type == 'subscription') && (data.duration == null)) {
    price = config.stripe.plan.yearly; // yearly
  } else if (data.type == 'payment') {
    price = config.stripe.plan.oneTime; // one-time
  }

  let successUrl;

  if ((data.userId != null) && (data.scoreId != null)) {
    successUrl = `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&type=${data.type}&duration=${data.duration}&payment_success=true&user=${data.userId}&score=${data.scoreId}`;
  } else {
    successUrl = `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&type=${data.type}&duration=${data.duration}&payment_success=true`;
  }

  let stripeData = {
    line_items: [
      {
        price: price,
        quantity: 1,
      },
    ],
    mode: data.mode == 'subscription' ? 'subscription' : 'payment',
    customer_email: data.customerEmail,
    success_url: successUrl,
    cancel_url: `${data.cancelUrl}?checkout_cancelled=true&price=${price}`,
  };

  const session = await stripe.checkout.sessions.create(stripeData);

  return {
    data,
    session
  };
});

exports.cancelStripeSubscription = functions.https.onCall(async (data, context) => {
  const response = await stripe.subscriptions.update(data.subscriptionId, {
    cancel_at_period_end: true
  });

  return {
    response
  };
});

exports.renewStripeSubscription = functions.https.onCall(async (data, context) => {
  const subscription = await stripe.subscriptions.retrieve(data.subscriptionId);

  const response = await stripe.subscriptions.update(data.subscriptionId, {
    cancel_at_period_end: false,
    items: [{
      id: subscription.items.data[0].id,
      price: subscription.plan.id
    }]
  });

  return {
    response
  };
});

exports.getStripeSubscription = functions.https.onCall(async (data, context) => {  
  const session = await stripe.checkout.sessions.retrieve(data.session_id);
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  if (session) {
    return {
      session,
      subscription
    };
  }
});

exports.getStripeSubscriptionDirect = functions.https.onCall(async (data, context) => {  
  const subscription = await stripe.subscriptions.retrieve(data.subscriptionId);

  if (subscription) {
    return {
      subscription
    };
  }
});

exports.getStripePayment = functions.https.onCall(async (data, context) => {
  const session = await stripe.checkout.sessions.retrieve(data.session_id);
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

  if (session) {
    return {
      session,
      paymentIntent
    };
  }
});

exports.getStripeProduct = functions.https.onCall(async (data, context) => {
  const productPrice = await stripe.prices.retrieve(data.price);
  const product = await stripe.products.retrieve(productPrice.product);
  
  if (productPrice) {
    return {
      product,
      productPrice
    };
  }
});

exports.generatePDFReport = functions.https.onCall(async (data, context) => {
  functions.logger.log(data.assessmentScores);
  
  const doc = new PDFDocument({
    size: 'A5',
    margins: {
      top: 60,
      bottom: 60,
      left: 30,
      right: 30
    },
    bufferPages: true,
  });

  const file = admin
    .storage()
    .bucket()
    .file(`reports/${data.userId}/${data.scoreId}.pdf`);

  await new Promise((resolve, reject) => {
    const getQuestion = (index) => {
      switch (index) {
        case 0:
          return "Feel sad/unhappy";
        case 1:
          return "Can't concentrate/focus";
        case 2:
          return "Nothing gives pleasure";
        case 3:
          return "Tired, no energy";
        case 4:
          return "Suicidal thoughts";
        case 5:
          return "Difficulty sleeping";
        case 6:
          return "Sleeping too much";
        case 7:
          return "Decreased appetite";
        case 8:
          return "Increased appetite";
        case 9:
          return "Tense anxious can't sit";
        case 10:
          return "Worried or fearful";
        case 11:
          return "Anxiety/panic attacks";
        case 12:
          return "Worried about dying/losing control";
        case 13:
          return "Nervous in social situations";
        case 14:
          return "Nightmares, flashbacks";
        case 15:
          return "Jumpy, startled easily";
        case 16:
          return "Avoid places";
        case 17:
          return "Dull, numb, or detached";
        case 18:
          return "Can't get thoughts out";
        case 19:
          return "Must repeat rituals";
        case 20:
          return "Need to check/recheck things";
        case 21:
          return "More energy than usual";
        case 22:
          return "Irritable angry";
        case 23:
          return "Excited revved high";
        case 24:
          return "Needed less sleep";
        case 25:
          return "Interferes with work/school";
        case 26:
          return "Affects friends/family relationships";
        case 27:
          return "Has led to alcohol to get by";
        case 28:
          return "Has led to using drugs";
      }
    }

    const writeStream = file.createWriteStream({
      resumable: false,
      contentType: 'application/pdf',
    });

    writeStream.on('finish', () => resolve());
    writeStream.on('error', (e) => reject(e));
    
    doc.pipe(writeStream);

    // Start Header 1
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .image('images/mooditude-logo.png', doc.x, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveDown(0.1)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 2

    // Start Page 1
    doc.fillColor('#072B4F');
    doc.fontSize(10);
    
    doc
      .moveDown(3.2)
      .text(data.assessmentDate);

    doc.fontSize(14);
    doc.font('fonts/CircularStd-Bold.ttf');

    doc
      .moveDown(0.3)
      .text('Mental Well-being Score');

    doc.fontSize(10);
    doc.font('fonts/CircularStd-Medium.ttf');

    doc.moveDown(1);

    let defaultMarginLeft = doc.x;
    let defaultMarginTop = doc.y;

    let col1LeftPos = doc.x;
    let colTop = doc.y;
    let colWidth = 30;
    let col2LeftPos = colWidth + col1LeftPos + 40;

    doc
      .fillColor('#516B84')
      .text('Name:', col1LeftPos, colTop, { width: colWidth + 30 });

    doc
      .fillColor('#072B4F')
      .text(data.userProfile.name, col2LeftPos, colTop, { width: colWidth * 2 });

    let age;

    if (data.userProfile.ageGroup == 1) age = '< 18';
    else if (data.userProfile.ageGroup == 2) age = '18 — 24';
    else if (data.userProfile.ageGroup == 3) age = '25 — 39';
    else if (data.userProfile.ageGroup == 4) age = '40 — 59';
    else if (data.userProfile.ageGroup == 5) age = '> 60';

    doc
      .moveDown(0.5)
      .fillColor('#516B84')
      .text('Age Group:', col1LeftPos, colTop + 13, { width: colWidth + 30 });

    doc
      .fillColor('#072B4F')
      .text(age, col2LeftPos, colTop + 13, { width: colWidth * 2 });

    doc
      .moveDown(0.5)
      .fillColor('#516B84')
      .text('Gender:', col1LeftPos, colTop + 27, { width: colWidth + 30 });

    let gender;

    if (data.userProfile.gender == 1) gender = 'Male';
    else if (data.userProfile.gender == 2) gender = 'Female';
    else if (data.userProfile.gender == 3) gender = 'Transgender';
    else if (data.userProfile.gender == 4) gender = 'Non-binary';
    else if (data.userProfile.gender == 5) gender = 'Other';

    doc
      .fillColor('#072B4F')
      .text(gender, col2LeftPos, colTop + 27, { width: colWidth * 2 });

    colWidth = 160;
    col1LeftPos = doc.x;
    col2LeftPos = col1LeftPos + 20;

    doc
      .moveTo(col1LeftPos - 40, colTop + 104)
      .circle(col1LeftPos - 40, colTop + 104, 30)
      .lineWidth(3)
      .fillOpacity(1)
      .fillAndStroke('#EB5757', '#F8E71C');

    let allScoreMarginLeft;

    if (data.assessmentScores.allScore > 9) {
      allScoreMarginLeft = col1LeftPos - 54;
    } else if (data.assessmentScores.allScore == 0) {
      allScoreMarginLeft = col1LeftPos - 48;
    } else {
      allScoreMarginLeft = col1LeftPos - 44;
    }

    if ((data.assessmentScores.allScore > 9) && (data.assessmentScores.allScore < 20)) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, col1LeftPos - 50, colTop + 88);
    } else if (data.assessmentScores.allScore > 99) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, col1LeftPos - 60, colTop + 88);
    } else if (data.assessmentScores.allScore == 0) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, col1LeftPos - 48, colTop + 88);
    } else {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, (40 / 2) + parseInt(doc.widthOfString(data.assessmentScores.allScore.toString())), colTop + 88);
    }

    let allRiskLevelShortDescription;

    if (data.allRiskLevel == 'unlikely') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} shows that it is unlikely you are suffering from a mental health condition at this time.`;
    } else if (data.allRiskLevel == 'low') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} suggests that you have a low risk of a mental health condition.`;
    } else if (data.allRiskLevel == 'medium') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} suggests that you have a medium risk of a mental health condition.`;
    } else if (data.allRiskLevel == 'high') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} suggests that you have a high risk of a mental health condition.`;
    }

    doc
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(18)
      .text((data.allRiskLevel.charAt(0).toUpperCase() + data.allRiskLevel.slice(1)) + ' Risk', col2LeftPos, colTop + 72, { width: colWidth })
      .fillColor('#516B84')
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .text(allRiskLevelShortDescription, col2LeftPos, colTop + 102, { width: colWidth });

    doc
      .image('images/scale.png', doc.x, doc.y + 15, {
        width: 150,
        valign: 'bottom'
      });

    let allRiskLevelDesciption;

    if (data.allRiskLevel == 'unlikely') {
      allRiskLevelDesciption = `Your score is below the level usually found for individuals already known to be suffering from a mood or anxiety disorder. Despite this low score, it is still important to refer to the information and recommendations below concerning your risk for each of the four conditions described.`;
    } else if (data.allRiskLevel == 'low') {
      allRiskLevelDesciption = `Your score is in the lower range as compared to individuals already known to be suffering from a mood or anxiety disorder. Despite this relatively low score, your symptoms may be impacting your life, livelihood, and general well-being. Read closely the information and recommendations below concerning your risk of each of the four conditions described.`;
    } else if (data.allRiskLevel == 'medium') {
      allRiskLevelDesciption = `Your score is in the mid-range as compared to individuals already known to be suffering from a mood or anxiety disorder. This is a significant finding, as it suggests that your symptoms are probably impacting your life and general well-being. Read carefully the information and recommendations below concerning your risk of each of the four conditions described.`;
    } else if (data.allRiskLevel == 'high') {
      allRiskLevelDesciption = `Your score is in the high range as compared to individuals already known to be suffering from a mood or anxiety disorder. This is cause for real concern, as it suggests that your symptoms are impacting your life and general health. Read carefully the information and recommendations below concerning your risk of each of the four conditions described.`;
    }

    doc
      .fillColor('#072B4F')
      .fontSize(9)
      .text(allRiskLevelDesciption, defaultMarginLeft, doc.y + 75);
    // End Page 1

    doc.addPage()

    // Start Page 2
    // Start Header 2
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .image('images/mooditude-logo.png', doc.x, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveDown(0.1)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 2

    doc
      .image('images/warning.png', doc.x, doc.y + 20, {
        // width: 26,
        height: 21,
        valign: 'bottom'
      });

    doc
      .moveDown(5)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('Disorder Risks');

    let depressionRiskLevelText;

    if (data.depressionRiskLevel == 'unlikely') {
      depressionRiskLevelText = `This low score means you have few symptoms of depression at this time.`;
    } else if (data.depressionRiskLevel == 'low') {
      depressionRiskLevelText = `People scoring in this range on the depression scale tend to have a 1 in 3 chance of suffering from depression.`;
    } else if (data.depressionRiskLevel == 'medium') {
      depressionRiskLevelText = `People scoring in this range on the depression scale tend to have a 2 in 3 chance of suffering from depression.`;
    } else if (data.depressionRiskLevel == 'high') {
      depressionRiskLevelText = `People scoring in this range on the depression scale typically have a 90% chance of suffering from depression.`;
    }

    doc
      .moveDown(1)
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(11)
      .text(`Depression — ${data.depressionRiskLevel.charAt(0).toUpperCase() + data.depressionRiskLevel.slice(1)} Risk`);

    doc
      .image(`images/${data.depressionRiskLevel}-risk.png`, doc.x, doc.y + 3, {
        // width: 227,
        height: 3,
        valign: 'bottom'
      });
    
    doc
      .moveDown(0.9)
      .fontSize(9)
      .text(depressionRiskLevelText);

    let anxietyRiskLevelText;

    if (data.anxietyRiskLevel == 'unlikely') {
      anxietyRiskLevelText = `This low score means you do not have symptoms of an anxiety disorder at this time.`;
    } else if (data.anxietyRiskLevel == 'low') {
      anxietyRiskLevelText = `People scoring in this range on the anxiety scale tend to have a 1 in 3 chance of suffering from an anxiety disorder.`;
    } else if (data.anxietyRiskLevel == 'medium') {
      anxietyRiskLevelText = `People scoring in this range on the anxiety scale tend to have about a 50% chance of suffering from an anxiety disorder.`;
    } else if (data.anxietyRiskLevel == 'high') {
      anxietyRiskLevelText = `People scoring in this range on the anxiety scale tend to have a 90% chance of suffering from an anxiety disorder.`;
    }

    doc
      .moveDown(1.6)
      .fontSize(11)
      .text(`Anxiety — ${data.anxietyRiskLevel.charAt(0).toUpperCase() + data.anxietyRiskLevel.slice(1)} Risk`);

    doc
      .image(`images/${data.anxietyRiskLevel}-risk.png`, doc.x, doc.y + 3, {
        height: 3,
        valign: 'bottom'
      });
    
    doc
      .moveDown(0.9)
      .fontSize(9)
      .text(anxietyRiskLevelText);
    
    let ptsdRiskLevelText;

    if (data.ptsdRiskLevel == 'unlikely') {
      ptsdRiskLevelText = `This low score means you do not have symptoms of posttraumatic stress disorder (PTSD) at this time.`;
    } else if (data.ptsdRiskLevel == 'low') {
      ptsdRiskLevelText = `Many individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 8, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)`;
    } else if (data.ptsdRiskLevel == 'medium') {
      ptsdRiskLevelText = `Most individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 5, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)`;
    } else if (data.ptsdRiskLevel == 'high') {
      ptsdRiskLevelText = `Most individuals who have posttraumatic stress disorder (PTSD) respond to the PTSD scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, the likelihood that you have PTSD is about 1 in 3, though there is a high likelihood of another underlying mood or anxiety condition. Further assessment may help clarify these results. (Naturally, if you are aware of having experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)`;
    }

    doc
      .moveDown(1.6)
      .fontSize(11)
      .text(`PTSD — ${data.ptsdRiskLevel.charAt(0).toUpperCase() + data.ptsdRiskLevel.slice(1)} Risk`);

    doc
      .image(`images/${data.ptsdRiskLevel}-risk.png`, doc.x, doc.y + 3, {
        height: 3,
        valign: 'bottom'
      });
    
    doc
      .moveDown(0.9)
      .fontSize(9)
      .text(ptsdRiskLevelText);

    let bipolarRiskLevelText;

    if (data.bipolarRiskLevel == 'unlikely') {
      bipolarRiskLevelText = `This low score means you do not have symptoms of bipolar disorder at this time.`;
    } else if (data.bipolarRiskLevel == 'low') {
      bipolarRiskLevelText = `People scoring in this range of the bipolar scale tend to have a 1 in 9 chance of having bipolar disorder. Nonetheless, more than a third of people in this range have some type of mood or anxiety condition. Further assessment may help clarify these results.`;
    } else if (data.bipolarRiskLevel == 'medium') {
      bipolarRiskLevelText = `People scoring in this range of the bipolar scale tend to have a 1 in 3 chance of having bipolar disorder, or possible another mood or anxiety condition. Further assessment may help clarify these results.`;
    } else if (data.bipolarRiskLevel == 'high') {
      bipolarRiskLevelText = `People scoring in this range of the bipolar scale tend to have a 50% likelihood of having bipolar disorder. Though the score is high, there is a high false positive rate, so further assessment may help clarify these results.`;
    }

    doc
      .moveDown(1.6)
      .fontSize(11)
      .text(`Bipolar Disorder — ${data.bipolarRiskLevel.charAt(0).toUpperCase() + data.bipolarRiskLevel.slice(1)} Risk`);

    doc
      .image(`images/${data.bipolarRiskLevel}-risk.png`, doc.x, doc.y + 3, {
        height: 3,
        valign: 'bottom'
      });
    
    doc
      .moveDown(0.9)
      .fontSize(9)
      .text(bipolarRiskLevelText);
    // End Page 2

    doc.addPage()

    // Start Page 3
    // Start Header 3
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .image('images/mooditude-logo.png', doc.x, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveDown(0.1)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 3

    // doc
    //   .image('images/recommended-actions.png', doc.x, doc.y + 23, {
    //     // width: 28,
    //     height: 28,
    //     valign: 'bottom'
    //   });

    // doc
    //   .moveDown(5)
    //   .fontSize(14)
    //   .font('fonts/CircularStd-Bold.ttf')
    //   .text('RecommendedActions', doc.x + 40, doc.y - 25, { width: 100 });

    // doc
    //   .moveDown(1)
    //   .fontSize(9)
    //   .font('fonts/CircularStd-Medium.ttf');

    // if (data.allRiskLevel == 'unlikely') {
    //   doc
    //     .text(`Your responses suggest that you are not suffering from a significant mood or anxiety disorder at the present time. However, before closing the book on this matter there are a few points you should consider.`, doc.x - 40)
    //     .moveDown()
    //     .text(`A small percentage of individuals with mood or anxiety disorders fail to be picked up by the assessment. Therefore, if you find yourself experiencing troubling mood or anxiety-related symptoms then you should certainly present your concerns to your primary care practitioner or perhaps to a mental health clinician.`)
    //     .moveDown()
    //     .text(`A tendency to underestimate the effects of your symptoms on friendships, home, or work-life may have resulted in an “all is well” report when perhaps this is not strictly true. Call it “denial,” not wishing to complain, or simply trying to “tough it out,” underreporting trouble could backfire and cause you more distress in the future. Avoid the pitfall of assuming that the way you feel “is to be expected considering my circumstances.” While bad feelings are naturally the result of difficult and stressful life situations, mood and anxiety disorders are real medical conditions that may be triggered by such stresses. When they do arise, these conditions make it more difficult to cope with the problems confronting you, and so it is always in your best interest to get them evaluated.`)
    //     .moveDown()
    //     .text(`Milder or subclinical varieties of mood and anxiety occasionally develop into more serious conditions. In such instances, symptoms may be less severe but nonetheless distracting or annoying, slowing you down or making things more stressful than they should be. If you feel this may apply to you, you should consider raising the issue with your physician and sharing your responses to these questions.`)
    //     .moveDown()
    //     .text(`Mood and anxiety disorders typically come in episodes. Therefore, even if you are feeling fine now, it is in your best interest to revisit this checklist every 6 months or so. Naturally, if at any point you find yourself experiencing some of the symptoms described in the assessment, please return and repeat the checklist at your first opportunity.`)
    //     .moveDown()
    //     .text(`Mooditude has over 800 minutes of self-care activities. Make a habit of practicing one of them for just 10 minutes per day. This will help you maintain your mental well-being.`);
    // } else if (data.allRiskLevel == 'low') {
    //   doc
    //     .text(`Your low overall score means that your symptoms are somewhat milder than average. However, mild symptoms still may have a negative effect on your well-being and, when left untreated, can grow worse with time. You may possibly benefit from contacting your physician or a mental health care provider to begin a discussion of your responses to these questions. It is important for you to share these results with your physician.`, doc.x - 40)
    //     .moveDown()
    //     .text(`Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.`);
    // } else if (data.allRiskLevel == 'medium') {
    //   doc
    //     .text(`Your overall score suggests that you would benefit from contacting your physician or a mental health care provider to begin a discussion of your responses to these questions.  It is important for you to share these results with your physician.`, doc.x - 40)
    //     .moveDown()
    //     .text(`Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.`);
    // } else if (data.allRiskLevel == 'high') {
    //   doc
    //     .text(`Your overall score suggests that you would benefit from contacting your physician or a mental health care provider as soon as possible to begin a discussion of your responses to these questions.  It is important for you to share these results with your physician.`, doc.x - 40)
    //     .moveDown()
    //     .text(`Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.`);
    // }

    if (data.hasSuicidalThoughts) {
      doc
        .moveDown(1.5)
        .rect(doc.x + 60, doc.y, 240, 80)
        .fill('#FFFFAA');

      doc
        .font('fonts/CircularStd-Bold.ttf')
        .fillColor('#EB5757')
        .moveDown()
        .text(`Your response to a question related to suicidal thoughts raises a red flag.`, defaultMarginLeft + 80, doc.y, {
          width: 200,
          align: 'center'
        })
        .fillColor('#072B4F')
        .moveDown()
        .text(`Are you in crisis?`, defaultMarginLeft + 80, doc.y, {
          width: 200,
          align: 'center'
        })
        .moveDown()
        .text(`Please call National Suicide Prevention Lifeline or proceed directly to an emergency room.`, defaultMarginLeft + 80, doc.y, {
          width: 200,
          align: 'center'
        })
        .moveDown(2.5);
    }

    if (data.usedDrug && data.usedAlcohol) {
      doc
        .font('fonts/CircularStd-Medium.ttf')
        .fontSize(11)
        .text(`Substance Abuse`, defaultMarginLeft)
        .moveDown()
        .fontSize(9)
        .text(`Your responses indicated that you have occasionally used alcohol and non-prescribed drugs to manage some of the symptoms.`, defaultMarginLeft)
        .moveDown()
        .text(`Self-medication for such symptoms, even when this appears to be effective, often will make such symptoms worse over the long term. We strongly urge you to share your responses to these questions with your physician and to begin an honest discussion about your alcohol and drug use patterns.`, defaultMarginLeft)
        .moveDown()
        .text(`It is likely that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.`, defaultMarginLeft);
    }

    if (data.usedDrug && !data.usedAlcohol) {
      doc
        .font('fonts/CircularStd-Medium.ttf')
        .fontSize(11)
        .text(`Drug Abuse`, defaultMarginLeft)
        .moveDown()
        .fontSize(9)
        .text(`Your responses indicated that you have occasionally used non-prescribed drugs to manage some of the symptoms.`, defaultMarginLeft)
        .moveDown()
        .text(`Self-medication for such symptoms, even when this appears to be effective, is likely to make such symptoms worse over the long term. We strongly urge you to share the responses to these questions with your physician and to begin an honest discussion about your drug use patterns.`, defaultMarginLeft)
        .moveDown()
        .text(`It is likely that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.`, defaultMarginLeft);
    }

    if (data.usedAlcohol && !data.usedDrug) {
      doc
        .font('fonts/CircularStd-Medium.ttf')
        .fontSize(11)
        .text(`Alcohol Abuse`, defaultMarginLeft)
        .moveDown()
        .fontSize(9)
        .text(`Your responses suggest that you have occasionally used alcohol to manage some of the symptoms.`, defaultMarginLeft)
        .moveDown()
        .text(`Self-medication for such symptoms, even when this appears to be effective, often will make such symptoms worse over the long term. We strongly urge you to share your assessment results with your physician and to begin an honest discussion about your alcohol use patterns.`, defaultMarginLeft)
        .moveDown()
        .text(`It is virtually certain that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.`, defaultMarginLeft);
    }
    // End Page 3

    // doc.addPage()

    // Start Page 4
    // Start Header 4 
    // doc
    //   .rect(0, 0, 3508, 6)
    //   .fillAndStroke('#F8E71C')
    //   .stroke();

    // doc
    //   .image('images/mooditude-logo.png', doc.x, 26, {
    //     width: 32,
    //     height: 32,
    //     valign: 'bottom'
    //   });

    // doc.fillColor('#072B4F');

    // doc
    //   .font('fonts/CircularStd-Black.ttf')
    //   .moveDown(0.1)
    //   .fontSize(10)
    //   .text('MOODITUDE');
    
    // doc
    //   .font('fonts/CircularStd-Medium.ttf')
    //   .moveDown(0)
    //   .fontSize(7)
    //   .text('A Happier You!');
    // End Header 4

    doc
      .moveDown(1.5)
      .fillColor('#516B84')
      .fontSize(11)
      .font('fonts/CircularStd-Medium.ttf')
      .text('Disclaimer', defaultMarginLeft);

    doc
      .moveDown()
      .fontSize(9)
      .text(`Mooditude is not engaged in rendering medical or other professional services, and the use of the assessment is not intended to create and does not create any medical or other professional services relationship.`, defaultMarginLeft)
      .moveDown()
      .text(`Use of this assessment is not an adequate substitute for obtaining medical or other professional advice, diagnosis, or treatment from a qualified licensed health care provider.`, defaultMarginLeft)
      .moveDown()
      .text(`This assessment is not intended for anyone under eighteen (18) years of age and is provided "as is" without any warranties of any kind, either express or implied, and Mooditude disclaims all warranties, including liability for indirect or consequential damages.`, defaultMarginLeft);
    // End Page 4

    doc.addPage()

    // Start Page 5
    // Start Header 5
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .image('images/mooditude-logo.png', doc.x, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveDown(0.1)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 5

    doc
      .moveDown(2)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('Scores');

    doc
      .moveTo(col1LeftPos - 40, colTop + 20)
      .circle(col1LeftPos - 40, colTop + 20, 30)
      .lineWidth(3)
      .fillOpacity(1)
      .fillAndStroke('#EB5757', '#F8E71C');

    if (data.assessmentScores.allScore > 9) {
      allScoreMarginLeft = col1LeftPos - 54;
    } else if (data.assessmentScores.allScore == 0) {
      allScoreMarginLeft = col1LeftPos - 48;
    } else {
      allScoreMarginLeft = col1LeftPos - 44;
    }

    if ((data.assessmentScores.allScore > 9) && (data.assessmentScores.allScore < 20)) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, col1LeftPos - 50, colTop + 4);
    } else if (data.assessmentScores.allScore > 99) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, col1LeftPos - 60, colTop + 4);
    } else if (data.assessmentScores.allScore == 0) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, col1LeftPos - 48, colTop + 4);
    } else {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(data.assessmentScores.allScore, (40 / 2) + parseInt(doc.widthOfString(data.assessmentScores.allScore.toString())), colTop + 4);
    }

    if (data.allRiskLevel == 'unlikely') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} shows that it is unlikely you are suffering from a mental health condition at this time.`;
    } else if (data.allRiskLevel == 'low') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} suggests that you have a low risk of a mental health condition.`;
    } else if (data.allRiskLevel == 'medium') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} suggests that you have a medium risk of a mental health condition.`;
    } else if (data.allRiskLevel == 'high') {
      allRiskLevelShortDescription = `Score of ${data.assessmentScores.allScore} suggests that you have a high risk of a mental health condition.`;
    }

    doc
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(18)
      .text((data.allRiskLevel.charAt(0).toUpperCase() + data.allRiskLevel.slice(1)) + ' Risk', col2LeftPos, colTop - 10, { width: colWidth })
      .fillColor('#516B84')
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .text(allRiskLevelShortDescription, col2LeftPos, colTop + 20, { width: colWidth });

    doc
      .image('images/scale.png', doc.x, doc.y + 15, {
        width: 150,
        valign: 'bottom'
      });

    doc
      .moveDown(4)
      .fontSize(11)
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .text('Diagnosis Risks', defaultMarginLeft);
    
    doc.moveDown(2);

    let depressionRiskLevelColor;

    if (data.depressionRiskLevel == 'unlikely') {
      depressionRiskLevelColor = '#5BA23F';
    } else if (data.depressionRiskLevel == 'low') {
      depressionRiskLevelColor = '#22A1D1';
    } else if (data.depressionRiskLevel == 'medium') {
      depressionRiskLevelColor = '#F9982C';
    } else if (data.depressionRiskLevel == 'high') {
      depressionRiskLevelColor = '#EB5757';
    }

    doc
      .moveTo(defaultMarginLeft + 9, doc.y - 4)
      .circle(defaultMarginLeft + 9, doc.y - 4, 8)
      .fillOpacity(1)
      .fillAndStroke(depressionRiskLevelColor, depressionRiskLevelColor);

    doc
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .fillColor('#ffffff')
      .text(
        data.assessmentScores.depressionScore, 
        data.assessmentScores.depressionScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Depression Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(data.depressionRiskLevel.charAt(0).toUpperCase() + data.depressionRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);

    doc.moveDown(2);

    let anxietyRiskLevelColor;

    if (data.anxietyRiskLevel == 'unlikely') {
      anxietyRiskLevelColor = '#5BA23F';
    } else if (data.anxietyRiskLevel == 'low') {
      anxietyRiskLevelColor = '#22A1D1';
    } else if (data.anxietyRiskLevel == 'medium') {
      anxietyRiskLevelColor = '#F9982C';
    } else if (data.anxietyRiskLevel == 'high') {
      anxietyRiskLevelColor = '#EB5757';
    }

    doc
      .moveTo(defaultMarginLeft + 9, doc.y - 4)
      .circle(defaultMarginLeft + 9, doc.y - 4, 8)
      .fillOpacity(1)
      .fillAndStroke(anxietyRiskLevelColor, anxietyRiskLevelColor);

    doc
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .fillColor('#ffffff')
      .text(
        data.anxietyRiskScore, 
        data.anxietyRiskScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Anxiety Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(data.anxietyRiskLevel.charAt(0).toUpperCase() + data.anxietyRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);
  
    doc.moveDown(2);

    let ptsdRiskLevelColor;

    if (data.ptsdRiskLevel == 'unlikely') {
      ptsdRiskLevelColor = '#5BA23F';
    } else if (data.ptsdRiskLevel == 'low') {
      ptsdRiskLevelColor = '#22A1D1';
    } else if (data.ptsdRiskLevel == 'medium') {
      ptsdRiskLevelColor = '#F9982C';
    } else if (data.ptsdRiskLevel == 'high') {
      ptsdRiskLevelColor = '#EB5757';
    }

    doc
      .moveTo(defaultMarginLeft + 9, doc.y - 4)
      .circle(defaultMarginLeft + 9, doc.y - 4, 8)
      .fillOpacity(1)
      .fillAndStroke(ptsdRiskLevelColor, ptsdRiskLevelColor);

    doc
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .fillColor('#ffffff')
      .text(
        data.ptsdRiskScore, 
        data.ptsdRiskScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('PTSD Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(data.ptsdRiskLevel.charAt(0).toUpperCase() + data.ptsdRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);

    doc.moveDown(2);

    let bipolarRiskLevelColor;

    if (data.bipolarRiskLevel == 'unlikely') {
      bipolarRiskLevelColor = '#5BA23F';
    } else if (data.bipolarRiskLevel == 'low') {
      bipolarRiskLevelColor = '#22A1D1';
    } else if (data.bipolarRiskLevel == 'medium') {
      bipolarRiskLevelColor = '#F9982C';
    } else if (data.bipolarRiskLevel == 'high') {
      bipolarRiskLevelColor = '#EB5757';
    }

    doc
      .moveTo(defaultMarginLeft + 9, doc.y - 4)
      .circle(defaultMarginLeft + 9, doc.y - 4, 8)
      .fillOpacity(1)
      .fillAndStroke(bipolarRiskLevelColor, bipolarRiskLevelColor);

    doc
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .fillColor('#ffffff')
      .text(
        data.bipolarRiskScore, 
        data.bipolarRiskScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Bipolar Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(data.bipolarRiskLevel.charAt(0).toUpperCase() + data.bipolarRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);

    doc
      .moveDown(1.8)
      .fontSize(11)
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .text('Functional Impairments', defaultMarginLeft);
    
    doc.moveDown(1.5);

    let thoughtsOfSuicideAnswerColor;
    let thoughtsOfSuicideAnswerText;

    if (data.thoughtsOfSuicideAnswer == 0) {
      thoughtsOfSuicideAnswerColor = '#5BA23F';
      thoughtsOfSuicideAnswerText = 'None';
    } else if (data.thoughtsOfSuicideAnswer == 1) {
      thoughtsOfSuicideAnswerColor = '#5BA23F';
      thoughtsOfSuicideAnswerText = 'Rarely';
    } else if (data.thoughtsOfSuicideAnswer == 2) {
      thoughtsOfSuicideAnswerColor = '#22A1D1';
      thoughtsOfSuicideAnswerText = 'Sometimes';
    } else if (data.thoughtsOfSuicideAnswer == 3) {
      thoughtsOfSuicideAnswerColor = '#F9982C';
      thoughtsOfSuicideAnswerText = 'Often';
    } else if (data.thoughtsOfSuicideAnswer == 4) {
      thoughtsOfSuicideAnswerColor = '#EB5757';
      thoughtsOfSuicideAnswerText = 'Most of the time';
    } else if (data.thoughtsOfSuicideAnswer == 5) {
      thoughtsOfSuicideAnswerColor = '#EB5757';
      thoughtsOfSuicideAnswerText = 'Most of the time';
    }

    doc.font('fonts/CircularStd-Medium.ttf');

    doc
      .moveTo(defaultMarginLeft + 10, doc.y - 5)
      .circle(defaultMarginLeft + 10, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(thoughtsOfSuicideAnswerColor, thoughtsOfSuicideAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Thoughts of suicide', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(thoughtsOfSuicideAnswerText, defaultMarginLeft + 178, doc.y - 11);
    
    doc.moveDown(1.4);

    let impairsWorkSchoolAnswerColor;
    let impairsWorkSchoolAnswerText;

    if (data.impairsWorkSchoolAnswer == 0) {
      impairsWorkSchoolAnswerColor = '#5BA23F';
      impairsWorkSchoolAnswerText = 'None';
    } else if (data.impairsWorkSchoolAnswer == 1) {
      impairsWorkSchoolAnswerColor = '#5BA23F';
      impairsWorkSchoolAnswerText = 'Rarely';
    } else if (data.impairsWorkSchoolAnswer == 2) {
      impairsWorkSchoolAnswerColor = '#22A1D1';
      impairsWorkSchoolAnswerText = 'Sometimes';
    } else if (data.impairsWorkSchoolAnswer == 3) {
      impairsWorkSchoolAnswerColor = '#F9982C';
      impairsWorkSchoolAnswerText = 'Often';
    } else if (data.impairsWorkSchoolAnswer == 4) {
      impairsWorkSchoolAnswerColor = '#EB5757';
      impairsWorkSchoolAnswerText = 'Most of the time';
    } else if (data.impairsWorkSchoolAnswer == 5) {
      impairsWorkSchoolAnswerColor = '#EB5757';
      impairsWorkSchoolAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 10, doc.y - 5)
      .circle(defaultMarginLeft + 10, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(impairsWorkSchoolAnswerColor, impairsWorkSchoolAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Impairs work/school', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(impairsWorkSchoolAnswerText, defaultMarginLeft + 178, doc.y - 11);
    
    doc.moveDown(1.4);

    let impairsFriendsFamilyAnswerColor;
    let impairsFriendsFamilyAnswerText;

    if (data.impairsFriendsFamilyAnswer == 0) {
      impairsFriendsFamilyAnswerColor = '#5BA23F';
      impairsFriendsFamilyAnswerText = 'None';
    } else if (data.impairsFriendsFamilyAnswer == 1) {
      impairsFriendsFamilyAnswerColor = '#5BA23F';
      impairsFriendsFamilyAnswerText = 'Rarely';
    } else if (data.impairsFriendsFamilyAnswer == 2) {
      impairsFriendsFamilyAnswerColor = '#22A1D1';
      impairsFriendsFamilyAnswerText = 'Sometimes';
    } else if (data.impairsFriendsFamilyAnswer == 3) {
      impairsFriendsFamilyAnswerColor = '#F9982C';
      impairsFriendsFamilyAnswerText = 'Often';
    } else if (data.impairsFriendsFamilyAnswer == 4) {
      impairsFriendsFamilyAnswerColor = '#EB5757';
      impairsFriendsFamilyAnswerText = 'Most of the time';
    } else if (data.impairsFriendsFamilyAnswer == 5) {
      impairsFriendsFamilyAnswerColor = '#EB5757';
      impairsFriendsFamilyAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 10, doc.y - 5)
      .circle(defaultMarginLeft + 10, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(impairsFriendsFamilyAnswerColor, impairsFriendsFamilyAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Impairs friends/family', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(impairsFriendsFamilyAnswerText, defaultMarginLeft + 178, doc.y - 11);

    doc.moveDown(1.4);

    let ledToUsingAlcoholAnswerColor;
    let ledToUsingAlcoholAnswerText;

    if (data.ledToUsingAlcoholAnswer == 0) {
      ledToUsingAlcoholAnswerColor = '#5BA23F';
      ledToUsingAlcoholAnswerText = 'None';
    } else if (data.ledToUsingAlcoholAnswer == 1) {
      ledToUsingAlcoholAnswerColor = '#5BA23F';
      ledToUsingAlcoholAnswerText = 'Rarely';
    } else if (data.ledToUsingAlcoholAnswer == 2) {
      ledToUsingAlcoholAnswerColor = '#22A1D1';
      ledToUsingAlcoholAnswerText = 'Sometimes';
    } else if (data.ledToUsingAlcoholAnswer == 3) {
      ledToUsingAlcoholAnswerColor = '#F9982C';
      ledToUsingAlcoholAnswerText = 'Often';
    } else if (data.ledToUsingAlcoholAnswer == 4) {
      ledToUsingAlcoholAnswerColor = '#EB5757';
      ledToUsingAlcoholAnswerText = 'Most of the time';
    } else if (data.ledToUsingAlcoholAnswer == 5) {
      ledToUsingAlcoholAnswerColor = '#EB5757';
      ledToUsingAlcoholAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 10, doc.y - 5)
      .circle(defaultMarginLeft + 10, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(ledToUsingAlcoholAnswerColor, ledToUsingAlcoholAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Led to using alcohol', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(ledToUsingAlcoholAnswerText, defaultMarginLeft + 178, doc.y - 11);

    doc.moveDown(1.4);

    let ledToUsingDrugAnswerColor;
    let ledToUsingDrugAnswerText;

    if (data.ledToUsingDrugAnswer == 0) {
      ledToUsingDrugAnswerColor = '#5BA23F';
      ledToUsingDrugAnswerText = 'None';
    } else if (data.ledToUsingDrugAnswer == 1) {
      ledToUsingDrugAnswerColor = '#5BA23F';
      ledToUsingDrugAnswerText = 'Rarely';
    } else if (data.ledToUsingDrugAnswer == 2) {
      ledToUsingDrugAnswerColor = '#22A1D1';
      ledToUsingDrugAnswerText = 'Sometimes';
    } else if (data.ledToUsingDrugAnswer == 3) {
      ledToUsingDrugAnswerColor = '#F9982C';
      ledToUsingDrugAnswerText = 'Often';
    } else if (data.ledToUsingDrugAnswer == 4) {
      ledToUsingDrugAnswerColor = '#EB5757';
      ledToUsingDrugAnswerText = 'Most of the time';
    } else if (data.ledToUsingDrugAnswer == 5) {
      ledToUsingDrugAnswerColor = '#EB5757';
      ledToUsingDrugAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 10, doc.y - 5)
      .circle(defaultMarginLeft + 10, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(ledToUsingDrugAnswerColor, ledToUsingDrugAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Led to using drugs', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(ledToUsingDrugAnswerText, defaultMarginLeft + 178, doc.y - 11);
    // End Page 5

    doc.addPage()

    // Start Page 6
    // Start Header 6
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .image('images/mooditude-logo.png', doc.x, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveDown(0.1)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 6

    doc
      .moveDown(2)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('Questions');

    doc
      .moveDown(1)
      .fontSize(9)
      .text(`Most of the time (${data.mostOfTheTimeAnswerCount})`);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (data.mostOfTheTimeAnswerQuestions.length > 0) {
      data.mostOfTheTimeAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`None (${data.noneAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (data.noneAnswerQuestions.length > 0) {
      data.noneAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Often (${data.oftenAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (data.oftenAnswerQuestions.length > 0) {
      data.oftenAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Sometimes (${data.sometimesAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (data.sometimesAnswerQuestions.length > 0) {
      data.sometimesAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Rarely (${data.rarelyAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (data.rarelyAnswerQuestions.length > 0) {
      data.rarelyAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    doc.addPage()

    // Start Page 7
    // Start Header 7
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .image('images/mooditude-logo.png', doc.x, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveDown(0.1)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 7
    
    doc
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(9)
      .text(`Feel Happier with Mooditude — Programs designed by clinical psychologists and data-science experts.`, defaultMarginLeft, defaultMarginTop - 70, { width: 130 });

    doc
      .moveDown(1.1)
      .fontSize(8)
      .font('fonts/CircularStd-Medium.ttf')
      .text(`https://mooditude.app`)
      .link(doc.x, doc.y, 100, 5, `https://mooditude.app`);

    doc
      .moveDown(0)
      .text(`hello@mooditude.app`)
      .link(doc.x, doc.y, 100, 5, `mailto:hello@mooditude.app`);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(11)
      .text(`Science Behind the Assessment`, defaultMarginLeft + 160, defaultMarginTop - 70);
    
    doc
      .moveDown(0.8)
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8)
      .text(`This assessment — M3 Checklist — is a  3-minute mental health symptom assessment tool designed by experts from the National Institute for Mental Health, Boston University, Columbia University, and Weill Cornell Medicine, and validated by researchers from the University of North Carolina, and published in the Annals of Family Medicine in 2010.`, defaultMarginLeft + 160);
    
    doc
      .moveDown(1.1)
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8)
      .text(`This assessment — M3 Checklist — is a  3-minute mental health symptom assessment tool designed by experts from the National Institute for Mental Health, Boston University, Columbia University, and Weill Cornell Medicine, and validated by researchers from the University of North Carolina, and published in the Annals of Family Medicine in 2010.`, defaultMarginLeft + 160);
    
    doc
      .moveDown(1.1)
      .text(`It efficiently measures the pulse of your mental well-being, by combining common symptom areas — depression, bipolar, anxiety, and posttraumatic stress disorders — with substance use and functional impairments to produce a set of mental health vital signs that can be tracked over time to measure progress.`, defaultMarginLeft + 160);

    doc
      .moveDown(1.1)
      .text(`REFERENCE:\nTitle: Feasibility and Diagnostic Validity of the M-3 Checklist: A Brief, Self-Rated Screen for Depressive, Bipolar, Anxiety, and Post-Traumatic Stress Disorders in Primary Care`, defaultMarginLeft + 160);
    
    doc
      .moveDown(1.1)
      .text(`Journal: Annals of Family Medicine\nAuthors: Bradley N. Gaynes, MD, MPH; Joanne DeVeaugh-Geiss, MA, LPA; Sam Weir, MD; Hongbin Gu, PhD; Cora MacPherson, PhD; Herbert C. Schulberg, PhD, MSHyg; Larry Culpepper, MD, MPH; and David R. Rubinow, MD.`, defaultMarginLeft + 160);
    
    doc
      .moveDown(1.1)
      .fillColor('#1CA566')
      .text(`https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2834723/`, defaultMarginLeft + 160)
      .link(doc.x, doc.y, 160, 20, `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2834723/`);

    doc
      .moveDown(1.1)
      .image('images/m3info.png', defaultMarginLeft + 160, doc.y, {
        // width: 139,
        height: 36,
        align: 'right'
      });
    
    doc
      .fillColor('#516B84');
    // End Page 7

    // Start Footer
    let pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      let oldBottomMargin = doc.page.margins.bottom;

      doc.page.margins.bottom = 0;

      doc
        .fillColor('#072B4F')
        .fontSize(8)
        .text(
          `Page ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin / 2),
          { align: 'right' }
        );
      
      doc.page.margins.bottom = oldBottomMargin;
    }
    // End Footer

    doc.on('pageAdded', () => {
      doc.y = doc.page.margins.top
    });

    doc.end();
  });

  const url = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 24 * 60 * 60 * 1000,
  });
    
  return {
    url
  };
});

exports.uploadProfilePicture = functions.https.onCall(async (data, context) => {
  let bufferStream = new stream.PassThrough();

  bufferStream.end(Buffer.from(data.image, 'base64'));

  let fileExt = path.parse(data.name).ext;

  let bucket = admin.storage().bucket();
  let file = bucket.file(`Profile/Images/${data.user}${fileExt}`);

  bufferStream.pipe(file.createWriteStream({
    metadata: {
      contentType: data.type
    }
  }))
  .on('error', error => {
    reject(`Error while uploading picture ${JSON.stringify(error)}`);

    return {
      error
    };
  })
  .on('finish', (file) => {
    console.log("Image successfully uploaded: ", JSON.stringify(file));

    return {
      url: `${config.firebase.userProfilePictureDir}/${data.user}${fileExt}`
    };
  });

  return {
    file: file.id
  };
});

exports.stripeWebhooks = functions.https.onRequest((req, res) => {
  let reqBody = req.body;

  if (reqBody) {
    const axios = require('axios').create({
      baseURL: 'https://api.revenuecat.com/v1',
      headers: {
        'X-Platform': 'stripe', 
        'Authorization': `Bearer ${config.revenueCat.publicApiKey}`
      }
    });

    let responseData;
    let errorData;
    let reqDataObj = reqBody.data.object;
    let event = reqBody.type;
    let userId = reqDataObj.customer;
    let paymentStatus = reqDataObj.status;
    
    switch (event) {
      case 'invoice.payment_succeeded':
        responseData = reqBody.data;

        axios.post('/receipts', {
          app_user_id: userId,
          fetch_token: reqDataObj.subscription,
          attributes: {
            '$stripeCustomerId': {
              value: userId
            },
            'payment_status': {
              value: paymentStatus
            },
            "$displayName": {
              value: reqDataObj.customer_name
            },
            "$email": {
              value: reqDataObj.customer_email
            }
          }
        }).then(response => {
          responseData = response;
        }).catch(error => {
          errorData = error;
        });

        admin.auth()
          .getUserByEmail(reqDataObj.customer_email)
          .then(response => {
            let userId = response.uid;
          
            admin.database()
              .ref()
              .child('users')
              .child(userId)
              .once('value')
              .then(snapshot => {
                const snapshotValue = snapshot.val()

                if (snapshotValue != null) {
                  const url = `https://api.mailjet.com/v3/REST/contactdata/${snapshotValue.mailJetUserId}`;

                  const requestData = {
                    'Data': [
                      {
                        'Name': 'paymentstatus',
                        'Value': snapshotValue.paymentStatus
                      }
                    ]
                  };

                  needle('put', url, requestData, mailjetOptions);
                }
              })
              .catch(error => {
                functions.logger.error(error);
              });
          })
          .catch(err => {
            functions.logger.error(err);
          });
        break;
      case 'payment_intent.succeeded':
        responseData = reqBody.data;

        axios.post('/receipts', {
          app_user_id: userId,
          fetch_token: reqDataObj.id,
          attributes: {
            '$stripeCustomerId': {
              value: userId
            },
            'payment_status': {
              value: paymentStatus
            },
            "$displayName": {
              value: reqDataObj.charges.data[0].billing_details.name
            },
            "$email": {
              value: reqDataObj.charges.data[0].billing_details.email
            }
          }
        }).then(response => {
          responseData = response;
        }).catch(error => {
          errorData = error;
        });

        admin.auth()
          .getUserByEmail(reqDataObj.charges.data[0].billing_details.email)
          .then(response => {
            let userId = response.uid;
          
            admin.database()
              .ref()
              .child('users')
              .child(userId)
              .once('value')
              .then(snapshot => {
                const snapshotValue = snapshot.val()

                if (snapshotValue != null) {
                  const url = `https://api.mailjet.com/v3/REST/contactdata/${snapshotValue.mailJetUserId}`;

                  const requestData = {
                    'Data': [
                      {
                        'Name': 'paymentstatus',
                        'Value': snapshotValue.paymentStatus
                      }
                    ]
                  };

                  needle('put', url, requestData, mailjetOptions);
                }
              })
              .catch(error => {
                functions.logger.error(error);
              });
          })
          .catch(err => {
            functions.logger.error(err);
          });
        break;
      case 'invoice.payment_failed':
      case 'payment_intent.canceled':
      // case 'payment_intent.created':
      case 'payment_intent.payment_failed':
      case 'payment_intent.processing':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        axios.post(`/subscribers/${userId}/attributes`, {
          app_user_id: userId,
          attributes: {
            'payment_status': {
              value: paymentStatus
            }
          }
        }).then(response => {
          responseData = response;

          admin.auth()
            .getUserByEmail(reqDataObj.customer_email)
            .then(response => {
              let userId = response.uid;
            
              admin.database()
                .ref()
                .child('users')
                .child(userId)
                .once('value')
                .then(snapshot => {
                  const snapshotValue = snapshot.val()

                  if (snapshotValue != null) {
                    const url = `https://api.mailjet.com/v3/REST/contactdata/${snapshotValue.mailJetUserId}`;

                    const requestData = {
                      'Data': [
                        {
                          'Name': 'paymentstatus',
                          'Value': snapshotValue.paymentStatus
                        }
                      ]
                    };

                    needle('put', url, requestData, mailjetOptions);
                  }
                })
                .catch(error => {
                  functions.logger.error(error);
                });
            })
            .catch(err => {
              functions.logger.error(err);
            });
        }).catch(error => {
          errorData = error;
        });
        break;
      default:
        break;
    }

    res.status(200).json(responseData);
  } else {
    res.status(400).json(errorData);
  }
});

exports.applyReportCredit = functions.https.onCall((data, context) => {
  functions.logger.log(data)

  admin
    .database()
    .ref()
    .child('users')
    .child(data.user)
    .get()
    .then(snapshot => {
      if (snapshot.val() != null) {
        if (snapshot.val().assessmentCredit) {
          let assessmentCredit = snapshot.val().assessmentCredit

          functions.logger.log(assessmentCredit)

          admin
            .firestore()
            .collection('M3Assessment')
            .doc(data.user)
            .collection('scores')
            .doc(data.score)
            .update({
              purchasedDate: assessmentCredit.purchasedDate,
              stripeInvoiceId: assessmentCredit.stripeInvoiceId
            })
            .then(() => {
              functions.logger.log(assessmentCredit.purchasedDate)
              functions.logger.log(assessmentCredit.stripeInvoiceId)

              admin
                .database()
                .ref()
                .child('users')
                .child(data.user)
                .child('assessmentCredit')
                .remove()
                .then(() => {
                  return true;
                })
                .catch(error => {
                  return false;
                });
            })
            .catch(error => {
              return false;
            });
        }
      }
    })
    .catch(error => {
      return false;
    });

    return true;
});

exports.updateUserProfileOnboarding = functions.https.onCall(async (data, context) => {
  await admin
    .database()
    .ref()
    .child('users')
    .child(data.userId)
    .update({
      ageGroup: data.ageGroup,
      gender: data.gender,
      topGoal: data.topGoal,
      topChallenges: data.topChallenges,
      goingToTherapy: data.goingToTherapy,
      knowCbt: data.knowCbt,
      committedToSelfhelp: data.committedToSelfhelp,
      committedToSelfHelpScale: data.committedToSelfHelpScale,
      onboardingStep: data.onboardingStep
    });

  await admin
    .database()
    .ref()
    .child('userCollection')
    .child('MakePromise')
    .update({
      [data.userId]: data.makePromiseReason,
    });
  
  await admin
    .database()
    .ref()
    .child('userCollection')
    .child('TopGoal')
    .update({
      [data.userId]: data.topGoalOtherReason
    });

  return {
    updated: true
  };
});