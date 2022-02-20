const config = require('../config/config.json');
const functions = require('firebase-functions');

const admin = require('firebase-admin');

var serviceAccount = require('../config/mooditudetesting-firebase-adminsdk-8rj5u-80e3e017b1.json');

admin.initializeApp({
  databaseURL: config.firebase.databaseURL,
  storageBucket: config.firebase.storageBucket,
  credential: admin.credential.cert(serviceAccount)
});

const fs = require('fs');
const stream = require('stream');
const path = require('path');

const PDFDocument = require('pdfkit');

const stripe = require('stripe')(config.stripe.secretKey);

const needle = require('needle');

const { v4: uuidv4 } = require('uuid');

const fns = require('date-fns');

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

exports.addSubscriptionData = functions.https.onCall(async (data, context) => {
  functions.logger.log(data);

  const userId = data.userId;
  const platform = data.platform;
  const productId = data.productId;
  const expiryDate = data.expiryDate;
  const trialDurationInDays = data.trialDurationInDays;
  const duration = data.duration;
  const transactionId = data.transactionId;
  const transactionDate = data.transactionDate;
  const paymentProcessor = data.paymentProcessor;
  const trialExpiryDate = data.trialExpiryDate;

  let grantObj = {};

  if (platform != '') {
    grantObj['platform'] = platform;
  }

  if (productId != '') {
    grantObj['productId'] = productId;
  }

  if (expiryDate) {
    grantObj['expiryDate'] = admin.firestore.Timestamp.fromDate(new Date(expiryDate));
  }

  if (parseInt(trialDurationInDays) > 0) {
    grantObj['trialDurationInDays'] = trialDurationInDays;
  }

  if (paymentProcessor != '') {
    grantObj['paymentProcessor'] = paymentProcessor;
  }

  if (duration != '') {
    grantObj['duration'] = duration;
  }

  if (transactionId != '') {
    grantObj['transactionId'] = transactionId;
  }
  
  if (transactionDate) {
    grantObj['transactionDate'] = admin.firestore.Timestamp.fromDate(new Date(transactionDate));
  }

  if (trialExpiryDate) {
    grantObj['trialExpiryDate'] = admin.firestore.Timestamp.fromDate(new Date(trialExpiryDate));
  }

  grantObj['grantType'] = 'Purchase';
  grantObj['licenseType'] = 'Premium';
  grantObj['productType'] = 'Subscription';

  await admin
    .firestore()
    .collection('Subscribers')
    .doc(userId)
    .set({
      grant: grantObj
    });

  return {
    updated: true
  };
});

exports.processStripeSubscription = functions.https.onCall(async (data, context) => {
  let price = config.stripe.plan.monthly;

  if (data.referrer != null && data.referrer == 'm3') {
    if ((data.type == 'subscription') && (data.duration == 3)) {
      price = config.stripe.plan.everyThreeMonthsM3; // every 3 months
    } else if (data.type == 'payment') {
      price = config.stripe.plan.oneTimeM3; // one-time
    }
  } else {
    if ((data.type == 'subscription') && (data.duration == 1)) {
      price = config.stripe.plan.monthly; // monthly
    } else if ((data.type == 'subscription') && (data.duration == 3)) {
      price = config.stripe.plan.everyThreeMonths; // every 3 months
    } else if ((data.type == 'subscription') && (data.duration == 12)) {
      price = config.stripe.plan.yearly; // yearly
    } else if (data.type == 'payment') {
      price = config.stripe.plan.oneTime; // one-time
    }
  }

  let successUrl;
  let cancelUrl;

  if ((data.userId != null) && (data.scoreId != null)) {
    successUrl = `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&type=${data.type}&duration=${data.duration}&payment_success=true&user=${data.userId}&score=${data.scoreId}`;
    cancelUrl = `${data.cancelUrl}?checkout_cancelled=true&price=${price}&user=${data.userId}&score=${data.scoreId}`;
  } else {
    successUrl = `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&type=${data.type}&duration=${data.duration}&payment_success=true`;
    cancelUrl = `${data.cancelUrl}?checkout_cancelled=true&price=${price}`;
  }

  if (data.signUp != null && data.signUp == true) {
    successUrl += `&signup=true`;
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
    cancel_url: cancelUrl
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
  let assessment;
  let userProfile;

  await admin
    .firestore()
    .collection('M3Assessment')
    .doc(data.userId)
    .collection('scores')
    .doc(data.assessmentId)
    .get()
    .then(doc => {
      assessment = doc.data();
    });

  functions.logger.log(assessment);

  await admin
    .database()
    .ref()
    .child('users')
    .child(data.userId)
    .get()
    .then(snapshot => {
      userProfile = snapshot.val();
    });

  functions.logger.log(userProfile);

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

  const downloadTokens = uuidv4();

  functions.logger.log(downloadTokens);

  const file = admin
    .storage()
    .bucket()
    .file(`reports/${data.userId}/${assessment.id}.pdf`);

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
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: downloadTokens,
        }
      }
    });

    writeStream.on('finish', () => resolve());
    writeStream.on('error', (e) => reject(e));
    
    doc.pipe(writeStream);

    // Start Page 1
    doc
      .image('images/cover-bg.png', 0, 0, {
        cover: [doc.page.width, doc.page.height]
      });

    doc
      .image('images/m3logo.png', doc.x, doc.y + 40, {
        width: 42,
        height: 42
      });

    doc.fillColor('#000000');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .fontSize(25)
      .text('Mental Health Assessment Report', doc.x, doc.y + 90, {
        width: 260
      });

    doc.fillColor('#000000', 0.4);

    doc
      .moveDown(6)
      .fontSize(10)
      .text('BROUGHT TO YOU BY');
    
    doc.moveDown(0.5);

    doc.fillColor('#000000', 1);

    doc
      .image('images/mooditude-logo.png', doc.x, doc.y, {
        width: 42,
        height: 42
      });

    doc
      .font('fonts/CircularStd-Black.ttf')
      .fontSize(17)
      .text('MOODITUDE', doc.x + 52, doc.y - 40);

    doc.fillColor('#4F4F4F');

    doc
      .moveDown()
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(11)
      .text('A Happier You', doc.x, doc.y - 22);

    doc.addPage();
    // End Page 1
    
    // Start Page 2
    doc
      .rect(0, 0, 3508, 6)
      .fillAndStroke('#F8E71C')
      .stroke();

    doc
      .moveDown(14)
      .fillColor('#000000')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(14)
      .text(`This M3 Mental Health Assessment Report is prepared for ${userProfile.name}`, {
        align: 'center'
      });

    doc
      .moveDown(0.5)
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8)
      .text(`Dated: ${new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`, {
        align: 'center'
      });
    
    doc.addPage();
    // End Page 2

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

    doc
      .image('images/m3logo.png', (doc.page.width - 64), 26, {
        width: 34,
        height: 34,
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

    // Start Page 3
    doc.fillColor('#072B4F');
    doc.fontSize(13);
    
    doc
      .moveDown(3.2)
      .text(new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }));

    doc.fontSize(13);
    doc.font('fonts/CircularStd-Bold.ttf');

    doc
      .moveDown(0.3)
      .text('M3 Mental Well-being Score');

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
      .text(userProfile.name, col2LeftPos, colTop, { width: colWidth * 2 });

    let age;

    if (userProfile.ageGroup == 1) age = '< 18';
    else if (userProfile.ageGroup == 2) age = '18 — 24';
    else if (userProfile.ageGroup == 3) age = '25 — 39';
    else if (userProfile.ageGroup == 4) age = '40 — 59';
    else if (userProfile.ageGroup == 5) age = '> 60';

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

    if (userProfile.gender == 1) gender = 'Male';
    else if (userProfile.gender == 2) gender = 'Female';
    else if (userProfile.gender == 3) gender = 'Transgender';
    else if (userProfile.gender == 4) gender = 'Non-binary';
    else if (userProfile.gender == 5) gender = 'Other';

    doc
      .fillColor('#072B4F')
      .text(gender, col2LeftPos, colTop + 27, { width: colWidth * 2 });

    let allRiskLevel;
    let allRiskLevelShortDescription;
    let riskLevelFillColor;

    if (assessment.allScore <= 1) {
      allRiskLevel = 'unlikely';
    } else if ((assessment.allScore >= 2) && (assessment.allScore <= 32)) {
      allRiskLevel = 'low';
    } else if ((assessment.allScore >= 33) && (assessment.allScore <= 50)) {
      allRiskLevel = 'medium';
    } else if ((assessment.allScore >= 51) && (assessment.allScore <= 108)) {
      allRiskLevel = 'high';
    }

    if (allRiskLevel == 'unlikely') {
      riskLevelFillColor = '#5AA240';
      allRiskLevelShortDescription = `Score of ${assessment.allScore} shows that it is unlikely you are suffering from a mental health condition at this time.`;
    } else if (allRiskLevel == 'low') {
      riskLevelFillColor = '#22A1D1';
      allRiskLevelShortDescription = `Score of ${assessment.allScore} suggests that you have a low risk of a mental health condition.`;
    } else if (allRiskLevel == 'medium') {
      riskLevelFillColor = '#F9982C';
      allRiskLevelShortDescription = `Score of ${assessment.allScore} suggests that you have a medium risk of a mental health condition.`;
    } else if (allRiskLevel == 'high') {
      riskLevelFillColor = '#EB5757';
      allRiskLevelShortDescription = `Score of ${assessment.allScore} suggests that you have a high risk of a mental health condition.`;
    }

    colWidth = 160;
    col1LeftPos = doc.x;
    col2LeftPos = col1LeftPos + 20;

    doc
      .moveTo(col1LeftPos - 40, colTop + 104)
      .circle(col1LeftPos - 40, colTop + 104, 30)
      .lineWidth(3)
      .fillOpacity(1)
      .fillAndStroke(riskLevelFillColor, '#F8E71C');

    let allScoreMarginLeft;

    if (assessment.allScore > 9) {
      allScoreMarginLeft = col1LeftPos - 54;
    } else if (assessment.allScore == 0) {
      allScoreMarginLeft = col1LeftPos - 48;
    } else {
      allScoreMarginLeft = col1LeftPos - 44;
    }

    if ((assessment.allScore > 9) && (assessment.allScore < 20)) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, col1LeftPos - 50, colTop + 88);
    } else if (assessment.allScore > 99) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, col1LeftPos - 60, colTop + 88);
    } else if (assessment.allScore == 0) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, col1LeftPos - 48, colTop + 88);
    } else {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, (40 / 2) + parseInt(doc.widthOfString(assessment.allScore.toString())), colTop + 88);
    }

    doc
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(18)
      .text((allRiskLevel.charAt(0).toUpperCase() + allRiskLevel.slice(1)) + ' Risk', col2LeftPos, colTop + 72, { width: colWidth })
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

    if (allRiskLevel == 'unlikely') {
      allRiskLevelDesciption = `Your score of ${assessment.allScore} is below the level usually found for individuals already known to be suffering from a mood or anxiety disorder. Despite this low score, it is still important to refer to the information and recommendations below concerning your risk for each of the four conditions described.`;
    } else if (allRiskLevel == 'low') {
      allRiskLevelDesciption = `Your score of ${assessment.allScore} is in the lower range as compared to individuals already known to be suffering from a mood or anxiety disorder. Despite this relatively low score, your symptoms may be impacting your life, livelihood, and general well-being.`;
    } else if (allRiskLevel == 'medium') {
      allRiskLevelDesciption = `Your score of ${assessment.allScore} is in the mid-range as compared to individuals already known to be suffering from a mood or anxiety disorder. This is a significant finding, as it suggests that your symptoms are probably impacting your life and general well-being.`;
    } else if (allRiskLevel == 'high') {
      allRiskLevelDesciption = `Your score of ${assessment.allScore} is in the high range as compared to individuals already known to be suffering from a mood or anxiety disorder. This is cause for real concern, as it suggests that your symptoms are impacting your life and general health.`;
    }

    doc
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Your responses have been analyzed and compared to the responses of other individuals with and without mood and anxiety disorders.`, defaultMarginLeft, doc.y + 65);

    doc
      .moveDown()
      .text(allRiskLevelDesciption, defaultMarginLeft, doc.y);
    
    doc
      .moveDown()
      .text(`Read carefully the information and recommendations below concerning your risk of each of the four conditions described.`, defaultMarginLeft, doc.y);
    // End Page 3

    doc.addPage()

    // Start Page 4
    // Start Header 4
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

    doc
      .image('images/m3logo.png', (doc.page.width - 64), 26, {
        width: 34,
        height: 34,
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
    // End Header 4

    doc
      .image('images/warning.png', doc.x, doc.y + 20, {
        // width: 26,
        height: 21,
        valign: 'bottom'
      });

    doc
      .moveDown(4.5)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('Symptoms Risks');

    let depressionRiskLevel;
    let depressionRiskLevelText;
    let depressionRiskLevelColor;

    if (assessment.depressionScore <= 4) {
      depressionRiskLevel = 'unlikely';
    } else if ((assessment.depressionScore >= 5) && (assessment.depressionScore <= 7)) {
      depressionRiskLevel = 'low';
    } else if ((assessment.depressionScore >= 8) && (assessment.depressionScore <= 10)) {
      depressionRiskLevel = 'medium';
    } else if (assessment.depressionScore > 10) {
      depressionRiskLevel = 'high';
    }

    if (depressionRiskLevel == 'unlikely') {
      depressionRiskLevelText = `This low score means you have few symptoms of depression at this time.`;
      depressionRiskLevelColor = '#5BA23F';
    } else if (depressionRiskLevel == 'low') {
      depressionRiskLevelText = `People scoring in this range on the depression scale tend to have a 1 in 3 chance of suffering from depression.`;
      depressionRiskLevelColor = '#22A1D1';
    } else if (depressionRiskLevel == 'medium') {
      depressionRiskLevelText = `People scoring in this range on the depression scale tend to have a 2 in 3 chance of suffering from depression.`;
      depressionRiskLevelColor = '#F9982C';
    } else if (depressionRiskLevel == 'high') {
      depressionRiskLevelText = `People scoring in this range on the depression scale typically have a 90% chance of suffering from depression.`;
      depressionRiskLevelColor = '#EB5757';
    }

    doc
      .moveTo(defaultMarginLeft + 5, doc.y + 25)
      .circle(defaultMarginLeft + 5, doc.y + 25, 4)
      .fillOpacity(1)
      .fillAndStroke(depressionRiskLevelColor, depressionRiskLevelColor);

    doc
      .moveDown(1)
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(11)
      .text('Depression', defaultMarginLeft + 20, doc.y);
    
    doc
      .moveDown(0)
      .fillColor(depressionRiskLevelColor)
      .fontSize(9)
      .text(`${depressionRiskLevel.charAt(0).toUpperCase() + depressionRiskLevel.slice(1)} Risk`, defaultMarginLeft + 20);
    
    doc
      .moveDown(0.9)
      .fillColor('#072B4F')
      .text(depressionRiskLevelText, defaultMarginLeft + 20);
    
    let anxietyScore = assessment.gadScore + assessment.panicScore + assessment.socialAnxietyScore + assessment.ptsdScore + assessment.ocdScore;
    
    let anxietyRiskLevel;
    let anxietyRiskLevelText;
    let anxietyRiskLevelColor;

    if (anxietyScore <= 2) {
      anxietyRiskLevel = 'unlikely';
    } else if ((anxietyScore >= 3) && (anxietyScore <= 5)) {
      anxietyRiskLevel = 'low';
    } else if ((anxietyScore >= 6) && (anxietyScore <= 11)) {
      anxietyRiskLevel = 'medium';
    } else if (anxietyScore > 11) {
      anxietyRiskLevel = 'high';
    }

    if (anxietyRiskLevel == 'unlikely') {
      anxietyRiskLevelText = `This low score means you do not have symptoms of an anxiety disorder at this time.`;
      anxietyRiskLevelColor = '#5BA23F';
    } else if (anxietyRiskLevel == 'low') {
      anxietyRiskLevelText = `People scoring in this range on the anxiety scale tend to have a 1 in 3 chance of suffering from an anxiety disorder.`;
      anxietyRiskLevelColor = '#22A1D1';
    } else if (anxietyRiskLevel == 'medium') {
      anxietyRiskLevelText = `People scoring in this range on the anxiety scale tend to have about a 50% chance of suffering from an anxiety disorder.`;
      anxietyRiskLevelColor = '#F9982C';
    } else if (anxietyRiskLevel == 'high') {
      anxietyRiskLevelText = `People scoring in this range on the anxiety scale tend to have a 90% chance of suffering from an anxiety disorder.`;
      anxietyRiskLevelColor = '#EB5757';
    }

    doc
      .moveDown(1.6)
      .fontSize(11)
      .text('Anxiety', defaultMarginLeft + 20);

    doc
      .moveTo(defaultMarginLeft + 5, doc.y - 6.5)
      .circle(defaultMarginLeft + 5, doc.y - 6.5, 4)
      .fillOpacity(1)
      .fillAndStroke(anxietyRiskLevelColor, anxietyRiskLevelColor);

    doc
      .moveDown(0)
      .fillColor(anxietyRiskLevelColor)
      .fontSize(9)
      .text(`${anxietyRiskLevel.charAt(0).toUpperCase() + anxietyRiskLevel.slice(1)} Risk`, defaultMarginLeft + 20);
    
    doc
      .moveDown(0.9)
      .fillColor('#072B4F')
      .text(anxietyRiskLevelText, defaultMarginLeft + 20);
    
    let ptsdRiskLevel;
    let ptsdRiskLevelText;
    let ptsdRiskLevelColor;

    if (assessment.ptsdScore <= 1) {
      ptsdRiskLevel = 'unlikely';
    } else if ((assessment.ptsdScore >= 2) && (assessment.ptsdScore <= 3)) {
      ptsdRiskLevel = 'low';
    } else if ((assessment.ptsdScore >= 4) && (assessment.ptsdScore <= 5)) {
      ptsdRiskLevel = 'medium';
    } else if (assessment.ptsdScore > 5) {
      ptsdRiskLevel = 'high';
    }

    if (ptsdRiskLevel == 'unlikely') {
      ptsdRiskLevelText = `This low score means you do not have symptoms of posttraumatic stress disorder (PTSD) at this time.`;
      ptsdRiskLevelColor = '#5BA23F';
    } else if (ptsdRiskLevel == 'low') {
      ptsdRiskLevelText = `Many individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 8, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)`;
      ptsdRiskLevelColor = '#22A1D1';
    } else if (ptsdRiskLevel == 'medium') {
      ptsdRiskLevelText = `Most individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 5, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)`;
      ptsdRiskLevelColor = '#F9982C';
    } else if (ptsdRiskLevel == 'high') {
      ptsdRiskLevelText = `Most individuals who have posttraumatic stress disorder (PTSD) respond to the PTSD scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, the likelihood that you have PTSD is about 1 in 3, though there is a high likelihood of another underlying mood or anxiety condition. Further assessment may help clarify these results. (Naturally, if you are aware of having experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)`;
      ptsdRiskLevelColor = '#EB5757';
    }

    doc
      .moveDown(1.6)
      .fontSize(11)
      .text('PTSD', defaultMarginLeft + 20);
    
    doc
      .moveTo(defaultMarginLeft + 5, doc.y - 6.5)
      .circle(defaultMarginLeft + 5, doc.y - 6.5, 4)
      .fillOpacity(1)
      .fillAndStroke(ptsdRiskLevelColor, ptsdRiskLevelColor);

    doc
      .moveDown(0)
      .fillColor(ptsdRiskLevelColor)
      .fontSize(9)
      .text(`${ptsdRiskLevel.charAt(0).toUpperCase() + ptsdRiskLevel.slice(1)} Risk`, defaultMarginLeft + 20);
    
    doc
      .moveDown(0.9)
      .fillColor('#072B4F')
      .text(ptsdRiskLevelText, defaultMarginLeft + 20);

    let bipolarRiskLevel;
    let bipolarRiskLevelText;
    let bipolarRiskLevelColor;

    if (assessment.bipolarScore <= 1) {
      bipolarRiskLevel = 'unlikely';
    } else if ((assessment.bipolarScore >= 2) && (assessment.bipolarScore <= 3)) {
      bipolarRiskLevel = 'low';
    } else if ((assessment.bipolarScore >= 4) && (assessment.bipolarScore <= 6)) {
      bipolarRiskLevel = 'medium';
    } else if (assessment.bipolarScore > 6) {
      bipolarRiskLevel = 'high';
    }

    if (bipolarRiskLevel == 'unlikely') {
      bipolarRiskLevelText = `This low score means you do not have symptoms of bipolar disorder at this time.`;
      bipolarRiskLevelColor = '#5BA23F';
    } else if (bipolarRiskLevel == 'low') {
      bipolarRiskLevelText = `People scoring in this range of the bipolar scale tend to have a 1 in 9 chance of having bipolar disorder. Nonetheless, more than a third of people in this range have some type of mood or anxiety condition. Further assessment may help clarify these results.`;
      bipolarRiskLevelColor = '#22A1D1';
    } else if (bipolarRiskLevel == 'medium') {
      bipolarRiskLevelText = `People scoring in this range of the bipolar scale tend to have a 1 in 3 chance of having bipolar disorder, or possible another mood or anxiety condition. Further assessment may help clarify these results.`;
      bipolarRiskLevelColor = '#F9982C';
    } else if (bipolarRiskLevel == 'high') {
      bipolarRiskLevelText = `People scoring in this range of the bipolar scale tend to have a 50% likelihood of having bipolar disorder. Though the score is high, there is a high false positive rate, so further assessment may help clarify these results.`;
      bipolarRiskLevelColor = '#EB5757';
    }

    doc
      .moveDown(1.6)
      .fontSize(11)
      .text('Bipolar Disorder', defaultMarginLeft + 20);

    doc
      .moveTo(defaultMarginLeft + 5, doc.y - 6.5)
      .circle(defaultMarginLeft + 5, doc.y - 6.5, 4)
      .fillOpacity(1)
      .fillAndStroke(bipolarRiskLevelColor, bipolarRiskLevelColor);

    doc
      .moveDown(0)
      .fillColor(bipolarRiskLevelColor)
      .fontSize(9)
      .text(`${bipolarRiskLevel.charAt(0).toUpperCase() + bipolarRiskLevel.slice(1)} Risk`, defaultMarginLeft + 20);
    
    doc
      .moveDown(0.9)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(bipolarRiskLevelText);
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

    doc
      .image('images/m3logo.png', (doc.page.width - 64), 26, {
        width: 34,
        height: 34,
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

    let hasSuicidalThoughts = false;
    let usedDrug = false;
    let usedAlcohol = false;

    let thoughtsOfSuicideAnswer = 0;
    let impairsWorkSchoolAnswer = 0;
    let impairsFriendsFamilyAnswer = 0;
    let ledToUsingAlcoholAnswer = 0;
    let ledToUsingDrugAnswer = 0;

    const questions = assessment.rawData.split(',').map(question => parseInt(question));

    questions.forEach((value, index) => {
      if ((index == 7) || (index == 9)) {
        return;
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

        ledToUsingDrugAnswer = value;
      }
    });

    doc
      .image('images/recommended-actions.png', doc.x, doc.y + 23, {
        height: 18,
        valign: 'bottom'
      });

    doc
      .moveDown(4.7)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('Recommendations', doc.x, doc.y);

    doc.fontSize(9);

    if (hasSuicidalThoughts) {
      doc
        .moveDown(1.5)
        .rect(doc.x + 60, doc.y, 240, 103)
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
        .moveDown(1);
    }

    if (usedDrug && usedAlcohol) {
      doc
        .moveDown(1.5)
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

    if (usedDrug && !usedAlcohol) {
      doc
        .moveDown(1.5)
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

    if (usedAlcohol && !usedDrug) {
      doc
        .moveDown(1.5)
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

    doc
      .image('images/m3logo.png', (doc.page.width - 64), 26, {
        width: 34,
        height: 34,
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
      .text('Scores');

    doc
      .moveTo(col1LeftPos - 40, colTop)
      .circle(col1LeftPos - 40, colTop, 30)
      .lineWidth(3)
      .fillOpacity(1)
      .fillAndStroke(riskLevelFillColor, '#F8E71C');

    if (assessment.allScore > 9) {
      allScoreMarginLeft = col1LeftPos - 54;
    } else if (assessment.allScore == 0) {
      allScoreMarginLeft = col1LeftPos - 48;
    } else {
      allScoreMarginLeft = col1LeftPos - 44;
    }

    if ((assessment.allScore > 9) && (assessment.allScore < 20)) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, col1LeftPos - 50, colTop - 15);
    } else if (assessment.allScore > 99) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, col1LeftPos - 60, colTop - 15);
    } else if (assessment.allScore == 0) {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, col1LeftPos - 48, colTop - 15);
    } else {
      doc
        .fillColor('#fff')
        .fontSize(24)
        .font('fonts/CircularStd-Medium.ttf')
        .text(assessment.allScore, (40 / 2) + parseInt(doc.widthOfString(assessment.allScore.toString())), colTop - 15);
    }

    if (allRiskLevel == 'unlikely') {
      allRiskLevelShortDescription = `Score of ${assessment.allScore} shows that it is unlikely you are suffering from a mental health condition at this time.`;
    } else if (allRiskLevel == 'low') {
      allRiskLevelShortDescription = `Score of ${assessment.allScore} suggests that you have a low risk of a mental health condition.`;
    } else if (allRiskLevel == 'medium') {
      allRiskLevelShortDescription = `Score of ${assessment.allScore} suggests that you have a medium risk of a mental health condition.`;
    } else if (allRiskLevel == 'high') {
      allRiskLevelShortDescription = `Score of ${assessment.allScore} suggests that you have a high risk of a mental health condition.`;
    }

    doc
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .fontSize(18)
      .text((allRiskLevel.charAt(0).toUpperCase() + allRiskLevel.slice(1)) + ' Risk', col2LeftPos, colTop - 30, { width: colWidth })
      .fillColor('#516B84')
      .fontSize(10)
      .font('fonts/CircularStd-Medium.ttf')
      .text(allRiskLevelShortDescription, col2LeftPos, colTop, { width: colWidth });

    doc
      .image('images/scale.png', doc.x, doc.y + 10, {
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
        assessment.depressionScore, 
        assessment.depressionScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Depression Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(depressionRiskLevel.charAt(0).toUpperCase() + depressionRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);

    doc.moveDown(2);

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
        anxietyScore, 
        anxietyScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Anxiety Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(anxietyRiskLevel.charAt(0).toUpperCase() + anxietyRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);
  
    doc.moveDown(2);

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
        assessment.ptsdScore, 
        assessment.ptsdScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('PTSD Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(ptsdRiskLevel.charAt(0).toUpperCase() + ptsdRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);

    doc.moveDown(2);

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
        assessment.bipolarScore, 
        assessment.bipolarScore > 9 ? defaultMarginLeft + 4 : defaultMarginLeft + 6, 
        doc.y - 11
      );
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Bipolar Risk', defaultMarginLeft + 28, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(bipolarRiskLevel.charAt(0).toUpperCase() + bipolarRiskLevel.slice(1), defaultMarginLeft + 178, doc.y - 11);

    doc
      .roundedRect(defaultMarginLeft, doc.page.height - 180, doc.page.width - 60, 130, 12)
      .fill('#F3F4F6');

    doc
      .moveDown(1.8)
      .fontSize(11)
      .fillColor('#072B4F')
      .font('fonts/CircularStd-Bold.ttf')
      .text('Functional Impairments', defaultMarginLeft + 20, doc.y + 15);
    
    doc.moveDown(1.5);

    let thoughtsOfSuicideAnswerColor;
    let thoughtsOfSuicideAnswerText;

    if (thoughtsOfSuicideAnswer == 0) {
      thoughtsOfSuicideAnswerColor = '#5BA23F';
      thoughtsOfSuicideAnswerText = 'None';
    } else if (thoughtsOfSuicideAnswer == 1) {
      thoughtsOfSuicideAnswerColor = '#5BA23F';
      thoughtsOfSuicideAnswerText = 'Rarely';
    } else if (thoughtsOfSuicideAnswer == 2) {
      thoughtsOfSuicideAnswerColor = '#22A1D1';
      thoughtsOfSuicideAnswerText = 'Sometimes';
    } else if (thoughtsOfSuicideAnswer == 3) {
      thoughtsOfSuicideAnswerColor = '#F9982C';
      thoughtsOfSuicideAnswerText = 'Often';
    } else if (thoughtsOfSuicideAnswer == 4) {
      thoughtsOfSuicideAnswerColor = '#EB5757';
      thoughtsOfSuicideAnswerText = 'Most of the time';
    } else if (thoughtsOfSuicideAnswer == 5) {
      thoughtsOfSuicideAnswerColor = '#EB5757';
      thoughtsOfSuicideAnswerText = 'Most of the time';
    }

    doc.font('fonts/CircularStd-Medium.ttf');

    doc
      .moveTo(defaultMarginLeft + 30, doc.y - 5)
      .circle(defaultMarginLeft + 30, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(thoughtsOfSuicideAnswerColor, thoughtsOfSuicideAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Thoughts of suicide', defaultMarginLeft + 48, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(thoughtsOfSuicideAnswerText, defaultMarginLeft + 198, doc.y - 11);
    
    doc.moveDown(1.4);

    let impairsWorkSchoolAnswerColor;
    let impairsWorkSchoolAnswerText;

    if (impairsWorkSchoolAnswer == 0) {
      impairsWorkSchoolAnswerColor = '#5BA23F';
      impairsWorkSchoolAnswerText = 'None';
    } else if (impairsWorkSchoolAnswer == 1) {
      impairsWorkSchoolAnswerColor = '#5BA23F';
      impairsWorkSchoolAnswerText = 'Rarely';
    } else if (impairsWorkSchoolAnswer == 2) {
      impairsWorkSchoolAnswerColor = '#22A1D1';
      impairsWorkSchoolAnswerText = 'Sometimes';
    } else if (impairsWorkSchoolAnswer == 3) {
      impairsWorkSchoolAnswerColor = '#F9982C';
      impairsWorkSchoolAnswerText = 'Often';
    } else if (impairsWorkSchoolAnswer == 4) {
      impairsWorkSchoolAnswerColor = '#EB5757';
      impairsWorkSchoolAnswerText = 'Most of the time';
    } else if (impairsWorkSchoolAnswer == 5) {
      impairsWorkSchoolAnswerColor = '#EB5757';
      impairsWorkSchoolAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 30, doc.y - 5)
      .circle(defaultMarginLeft + 30, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(impairsWorkSchoolAnswerColor, impairsWorkSchoolAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Impairs work/school', defaultMarginLeft + 48, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(impairsWorkSchoolAnswerText, defaultMarginLeft + 198, doc.y - 11);
    
    doc.moveDown(1.4);

    let impairsFriendsFamilyAnswerColor;
    let impairsFriendsFamilyAnswerText;

    if (impairsFriendsFamilyAnswer == 0) {
      impairsFriendsFamilyAnswerColor = '#5BA23F';
      impairsFriendsFamilyAnswerText = 'None';
    } else if (impairsFriendsFamilyAnswer == 1) {
      impairsFriendsFamilyAnswerColor = '#5BA23F';
      impairsFriendsFamilyAnswerText = 'Rarely';
    } else if (impairsFriendsFamilyAnswer == 2) {
      impairsFriendsFamilyAnswerColor = '#22A1D1';
      impairsFriendsFamilyAnswerText = 'Sometimes';
    } else if (impairsFriendsFamilyAnswer == 3) {
      impairsFriendsFamilyAnswerColor = '#F9982C';
      impairsFriendsFamilyAnswerText = 'Often';
    } else if (impairsFriendsFamilyAnswer == 4) {
      impairsFriendsFamilyAnswerColor = '#EB5757';
      impairsFriendsFamilyAnswerText = 'Most of the time';
    } else if (impairsFriendsFamilyAnswer == 5) {
      impairsFriendsFamilyAnswerColor = '#EB5757';
      impairsFriendsFamilyAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 30, doc.y - 5)
      .circle(defaultMarginLeft + 30, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(impairsFriendsFamilyAnswerColor, impairsFriendsFamilyAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Impairs friends/family', defaultMarginLeft + 48, doc.y - 11);

    doc
      .fillColor('#516B84') 
      .text(impairsFriendsFamilyAnswerText, defaultMarginLeft + 198, doc.y - 11);

    doc.moveDown(1.4);

    let ledToUsingAlcoholAnswerColor;
    let ledToUsingAlcoholAnswerText;

    if (ledToUsingAlcoholAnswer == 0) {
      ledToUsingAlcoholAnswerColor = '#5BA23F';
      ledToUsingAlcoholAnswerText = 'None';
    } else if (ledToUsingAlcoholAnswer == 1) {
      ledToUsingAlcoholAnswerColor = '#5BA23F';
      ledToUsingAlcoholAnswerText = 'Rarely';
    } else if (ledToUsingAlcoholAnswer == 2) {
      ledToUsingAlcoholAnswerColor = '#22A1D1';
      ledToUsingAlcoholAnswerText = 'Sometimes';
    } else if (ledToUsingAlcoholAnswer == 3) {
      ledToUsingAlcoholAnswerColor = '#F9982C';
      ledToUsingAlcoholAnswerText = 'Often';
    } else if (ledToUsingAlcoholAnswer == 4) {
      ledToUsingAlcoholAnswerColor = '#EB5757';
      ledToUsingAlcoholAnswerText = 'Most of the time';
    } else if (ledToUsingAlcoholAnswer == 5) {
      ledToUsingAlcoholAnswerColor = '#EB5757';
      ledToUsingAlcoholAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 30, doc.y - 5)
      .circle(defaultMarginLeft + 30, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(ledToUsingAlcoholAnswerColor, ledToUsingAlcoholAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Led to using alcohol', defaultMarginLeft + 48, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(ledToUsingAlcoholAnswerText, defaultMarginLeft + 198, doc.y - 11);

    doc.moveDown(1.4);

    let ledToUsingDrugAnswerColor;
    let ledToUsingDrugAnswerText;

    if (ledToUsingDrugAnswer == 0) {
      ledToUsingDrugAnswerColor = '#5BA23F';
      ledToUsingDrugAnswerText = 'None';
    } else if (ledToUsingDrugAnswer == 1) {
      ledToUsingDrugAnswerColor = '#5BA23F';
      ledToUsingDrugAnswerText = 'Rarely';
    } else if (ledToUsingDrugAnswer == 2) {
      ledToUsingDrugAnswerColor = '#22A1D1';
      ledToUsingDrugAnswerText = 'Sometimes';
    } else if (ledToUsingDrugAnswer == 3) {
      ledToUsingDrugAnswerColor = '#F9982C';
      ledToUsingDrugAnswerText = 'Often';
    } else if (ledToUsingDrugAnswer == 4) {
      ledToUsingDrugAnswerColor = '#EB5757';
      ledToUsingDrugAnswerText = 'Most of the time';
    } else if (ledToUsingDrugAnswer == 5) {
      ledToUsingDrugAnswerColor = '#EB5757';
      ledToUsingDrugAnswerText = 'Most of the time';
    }

    doc
      .moveTo(defaultMarginLeft + 30, doc.y - 5)
      .circle(defaultMarginLeft + 30, doc.y - 5, 2)
      .fillOpacity(1)
      .fillAndStroke(ledToUsingDrugAnswerColor, ledToUsingDrugAnswerColor);
    
    doc
      .fontSize(9)
      .fillColor('#072B4F')
      .text('Led to using drugs', defaultMarginLeft + 48, doc.y - 11);

    doc
      .fillColor('#516B84')
      .text(ledToUsingDrugAnswerText, defaultMarginLeft + 198, doc.y - 11);
    // End Page 6

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

    doc
      .image('images/m3logo.png', (doc.page.width - 64), 26, {
        width: 34,
        height: 34,
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
      .moveDown(2)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('Your Responses');

    let mostOfTheTimeAnswerCount = assessment.rawData.split(',').filter(x => x == 4).length;
    let mostOfTheTimeAnswerQuestions = [];

    if (mostOfTheTimeAnswerCount > 0) {
      assessment.rawData.split(',').forEach((value, index) => {
        if (value == 4) {
          mostOfTheTimeAnswerQuestions.push(index);
        }
      })
    }

    doc
      .moveDown(1)
      .fontSize(9)
      .text(`Most of the time (${mostOfTheTimeAnswerCount})`);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (mostOfTheTimeAnswerQuestions.length > 0) {
      mostOfTheTimeAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    let noneAnswerCount = assessment.rawData.split(',').filter(x => x == 0).length;
    let noneAnswerQuestions = [];

    if (noneAnswerCount > 0) {
      assessment.rawData.split(',').forEach((value, index) => {
        if (value == 0) {
          noneAnswerQuestions.push(index);
        }
      })
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`None (${noneAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (noneAnswerQuestions.length > 0) {
      noneAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    let oftenAnswerCount = assessment.rawData.split(',').filter(x => x == 3).length;
    let oftenAnswerQuestions = [];

    if (oftenAnswerCount > 0) {
      assessment.rawData.split(',').forEach((value, index) => {
        if (value == 3) {
          oftenAnswerQuestions.push(index);
        }
      })
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Often (${oftenAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (oftenAnswerQuestions.length > 0) {
      oftenAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    let sometimesAnswerCount = assessment.rawData.split(',').filter(x => x == 2).length;
    let sometimesAnswerQuestions = [];

    if (sometimesAnswerCount > 0) {
      assessment.rawData.split(',').forEach((value, index) => {
        if (value == 2) {
          sometimesAnswerQuestions.push(index);
        }
      })
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Sometimes (${sometimesAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (sometimesAnswerQuestions.length > 0) {
      sometimesAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    let rarelyAnswerCount = assessment.rawData.split(',').filter(x => x == 1).length;
    let rarelyAnswerQuestions = [];

    if (rarelyAnswerCount > 0) {
      assessment.rawData.split(',').forEach((value, index) => {
        if (value == 1) {
          rarelyAnswerQuestions.push(index);
        }
      })
    }

    doc
      .moveDown(1.5)
      .fillColor('#072B4F')
      .fontSize(9)
      .text(`Rarely (${rarelyAnswerCount})`, defaultMarginLeft);

    doc
      .fillColor('#516B84')
      .font('fonts/CircularStd-Medium.ttf')
      .fontSize(8);

    if (rarelyAnswerQuestions.length > 0) {
      rarelyAnswerQuestions.map(question => {
        doc
          .moveDown(0.3)
          .text(getQuestion(parseInt(question)), defaultMarginLeft + 13);
      });
    }

    doc.addPage()
    // End Page 7

    // Start Page 8
    // Start Header 8
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

    doc
      .image('images/m3logo.png', doc.x + 158, 26, {
        width: 34,
        height: 34,
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
    // End Header 8
    
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
    // End Page 8

    // Start Footer
    let pages = doc.bufferedPageRange();

    for (let i = 1; i < pages.count; i++) {
      doc.switchToPage(i);

      let oldBottomMargin = doc.page.margins.bottom;

      doc.page.margins.bottom = 0;

      doc
        .fillColor('#072B4F')
        .fontSize(8)
        .text(
          `Page ${(i + 1) - 1} of ${pages.count - 1}`,
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

  const assessmentUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(file.metadata.bucket)}/o/${encodeURIComponent(file.metadata.name)}?alt=media&token=${downloadTokens}`;

  const axios = require('axios').create({
    baseURL: 'https://firebasedynamiclinks.googleapis.com/v1',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const dynamicLink = await axios.post(`/shortLinks?key=${config.firebase.webApiKey}`, {
    dynamicLinkInfo: {
      domainUriPrefix: config.firebase.dynamicLinkSubDomain,
      link: assessmentUrl,
      androidInfo: {
        androidPackageName: 'com.health.mental.mooditude'
      },
      iosInfo: {
        iosBundleId: 'id1450661800'
      }
    },
    suffix: {
      option: 'SHORT'
    }
  });
  
  return {
    url: dynamicLink.data.shortLink
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

exports.applyReportCredit = functions.https.onCall(async (data, context) => {
  functions.logger.log(data)

  const usersRef = admin
    .database()
    .ref(`users/${data.user}`);

  const snapshot = await usersRef.once('value');
  
  if (snapshot.val().assessmentCredit) {
    let assessmentCreditPurchasedDate = snapshot.val().assessmentCredit.purchasedDate;

    functions.logger.log(assessmentCreditPurchasedDate);

    await admin
      .firestore()
      .collection('M3Assessment')
      .doc(data.user)
      .collection('scores')
      .doc(data.score)
      .update({
        purchasedDate: admin.firestore.Timestamp.fromDate(new Date(snapshot.val().assessmentCredit.purchasedDate)),
        invoiceId: snapshot.val().assessmentCredit.invoiceId
      });

    await admin
      .database()
      .ref()
      .child('users')
      .child(data.user)
      .child('assessmentCredit')
      .remove();
    
    return {
      status: true,
      purchasedDate: admin.firestore.Timestamp.fromDate(new Date(assessmentCreditPurchasedDate)).toMillis()
    };
  } else {
    return {
      status: false,
      purchasedDate: null
    };
  }
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

exports.addUserToSendGrid = functions.database.ref('/users/{userId}').onCreate(async (snapshot, context) => {
  const userId = context.params.userId;
  const userProfile = snapshot.val();

  if (userProfile) {
    functions.logger.log(userId);
    functions.logger.log(userProfile);

    if (
      userProfile.email.includes('demo') || 
      userProfile.email.includes('test') || 
      userProfile.email.includes('demouser') || 
      userProfile.email.includes('testuser')
    ) {
      return false;
    } else {
      const axios = require('axios').create({
        baseURL: 'https://api.sendgrid.com/v3',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        }
      });

      const customFields = {};

      if (userProfile.userId) {
        customFields['e5_T'] = userProfile.userId;
      }

      if (userProfile.memberSince) {
        customFields['e2_D'] = fns.format(new Date(userProfile.memberSince), 'MM/dd/yyyy');
      }

      if (userProfile.userStatus) {
        customFields['e4_T'] = userProfile.userStatus;
      }

      if (userProfile.statusValidTill) {
        if (userProfile.userStatus == 'free') {
          customFields['e6_D'] = fns.format(new Date('1000-01-01'), 'MM/dd/yyyy');
        } else if (userProfile.userStatus == 'in-trial') {
          customFields['e6_D'] = userProfile.trialExpiryDate;
        } else if (
          userProfile.userStatus == 'paid' || 
          userProfile.userStatus == 'canceled' || 
          userProfile.userStatus == 'expired'
        ) {
          customFields['e6_D'] = userProfile.expiryDate;
        }
      }

      if (userProfile.assessmentScore == null) {
        customFields['e7_N'] = -1;
      } else {
        customFields['e7_N'] = userProfile.assessmentScore;
      }

      if (userProfile.assessmentDate == null) {
        customFields['e8_D'] = fns.format(new Date('1000-01-01'), 'MM/dd/yyyy');
      } else {
        customFields['e8_D'] = userProfile.assessmentDate;
      }

      if (userProfile.nextAssessmentDate) {
        customFields['e9_D'] = userProfile.nextAssessmentDate;
      }

      if (userProfile.lastSeen) {
        customFields['e10_D'] = fns.format(new Date(userProfile.memberSince), 'MM/dd/yyyy');
      }

      if (userProfile.platform) {
        customFields['e11_T'] = userProfile.platform;
      }

      functions.logger.log(userProfile.name.split(' '));
      functions.logger.log(customFields);
    
      const contact = await axios.put('/marketing/contacts', {
        'list_ids': ['a47e7a33-0643-42d8-b8cf-3b79e7b322d3'],
        'contacts': [
          {
            'email': userProfile.email,
            'first_name': userProfile.name.split(' ')[0],
            'last_name': userProfile.name.split(' ')[1],
            'custom_fields': customFields
          }
        ]
      });

      functions.logger.log(contact.data);

      return true;
    }
  }
});

exports.updateSendGridContactFields = functions.database.ref('/users/{userId}').onUpdate(async (change, context) => {
  const userId = context.params.userId;
  const userProfile = change.after.val();

  functions.logger.log(JSON.stringify(userProfile));

  if (userProfile) {
    if (
      userProfile.email.includes('demo') || 
      userProfile.email.includes('test') || 
      userProfile.email.includes('demouser') || 
      userProfile.email.includes('testuser')
    ) {
      return null;
    } else {
      const axios = require('axios').create({
        baseURL: 'https://api.sendgrid.com/v3',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        }
      });

      const customFields = {};

      if (userProfile.userId) {
        customFields['e5_T'] = userProfile.userId;
      }

      if (userProfile.memberSince) {
        customFields['e2_D'] = fns.format(new Date(userProfile.memberSince), 'MM/dd/yyyy');
      }

      if (userProfile.userStatus) {
        customFields['e4_T'] = userProfile.userStatus;
      }

      if (userProfile.statusValidTill) {
        if (userProfile.userStatus == 'free') {
          customFields['e6_D'] = fns.format(new Date('1000-01-01'), 'MM/dd/yyyy');
        } else if (userProfile.userStatus == 'in-trial') {
          customFields['e6_D'] = userProfile.trialExpiryDate;
        } else if (
          userProfile.userStatus == 'paid' || 
          userProfile.userStatus == 'canceled' || 
          userProfile.userStatus == 'expired'
        ) {
          customFields['e6_D'] = userProfile.expiryDate;
        }
      }

      if (userProfile.assessmentScore == null) {
        customFields['e7_N'] = -1;
      } else {
        customFields['e7_N'] = userProfile.assessmentScore;
      }

      if (userProfile.nextAssessmentDate) {
        customFields['e9_D'] = fns.format(new Date(userProfile.nextAssessmentDate), 'MM/dd/yyyy');
      }

      if (userProfile.assessmentDate == null) {
        customFields['e8_D'] = fns.format(new Date('1000-01-01'), 'MM/dd/yyyy');
      } else {
        customFields['e8_D'] = fns.format(new Date(userProfile.assessmentDate), 'MM/dd/yyyy');

        let days;

        if (userProfile.assessmentScore <= 1) {
          days = 90;
        } else if ((userProfile.assessmentScore >= 2) && (userProfile.assessmentScore <= 32)) {
          days = 30;
        } else if ((userProfile.assessmentScore >= 33) && (userProfile.assessmentScore <= 50)) {
          days = 20;
        } else if ((userProfile.assessmentScore >= 51) && (userProfile.assessmentScore <= 108)) {
          days = 10;
        }

        customFields['e9_D'] = fns.format(new Date(fns.addDays(new Date(), days).getTime()), 'MM/dd/yyyy');
      }

      if (userProfile.lastSeen) {
        customFields['e10_D'] = fns.format(new Date(userProfile.lastSeen), 'MM/dd/yyyy');
      }

      if (userProfile.platform) {
        customFields['e11_T'] = userProfile.platform;
      }

      functions.logger.log(userProfile.name.split(' '));
      functions.logger.log(customFields);
    
      const contact = await axios.put('/marketing/contacts', {
        'list_ids': ['a47e7a33-0643-42d8-b8cf-3b79e7b322d3'],
        'contacts': [
          {
            'email': userProfile.email,
            'first_name': userProfile.name.split(' ')[0],
            'last_name': userProfile.name.split(' ')[1],
            'custom_fields': customFields
          }
        ]
      });

      functions.logger.log(contact.data);

      return true;
    }
  }
});