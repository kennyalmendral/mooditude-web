const functions = require('firebase-functions');
const admin = require('firebase-admin');

const fs = require('fs');

const PDFDocument = require('pdfkit');

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

  let price = 'price_1K09ueAuTlAR8JLMqv6RVsh8';

  if (data.plan == 'monthly') {
    price = 'price_1K09ueAuTlAR8JLMqv6RVsh8';
  } else if (data.plan == 'yearly') {
    price = 'price_1K09ueAuTlAR8JLM3JmfvSgj';
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
    success_url: `${data.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&code_type=${data.codeType}&discount=${couponCode}&duration=${data.duration}`,
    cancel_url: data.cancelUrl,
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

  console.log(stripeData)

  const session = await stripe.checkout.sessions.create(stripeData);

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

exports.generatePDFReport = functions.https.onCall(async (data, context) => {
  const doc = new PDFDocument({
    size: 'A5',
    bufferPages: true,
  });

  const file = admin
    .storage()
    .bucket()
    .file(`reports/${data.userId}/${data.scoreId}.pdf`);

  await new Promise((resolve, reject) => {
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
      .image('mooditude-logo.png', 72, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveUp(0.7)
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
    } else {
      allScoreMarginLeft = col1LeftPos - 44;
    }

    doc
      .fillColor('#fff')
      .fontSize(24)
      .font('fonts/CircularStd-Medium.ttf')
      .text(data.assessmentScores.allScore, allScoreMarginLeft, colTop + 88);

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
      .image('scale.png', doc.x, doc.y + 15, {
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
      .image('mooditude-logo.png', 72, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveUp(0.7)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 2

    doc
      .image('warning.png', doc.x, doc.y + 20, {
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
      .image(`${data.depressionRiskLevel}-risk.png`, doc.x, doc.y + 3, {
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
      .image(`${data.anxietyRiskLevel}-risk.png`, doc.x, doc.y + 3, {
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
      .image(`${data.ptsdRiskLevel}-risk.png`, doc.x, doc.y + 3, {
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
      .image(`${data.bipolarRiskLevel}-risk.png`, doc.x, doc.y + 3, {
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
      .image('mooditude-logo.png', 72, 26, {
        width: 32,
        height: 32,
        valign: 'bottom'
      });

    doc.fillColor('#072B4F');

    doc
      .font('fonts/CircularStd-Black.ttf')
      .moveUp(0.7)
      .fontSize(10)
      .text('MOODITUDE');
    
    doc
      .font('fonts/CircularStd-Medium.ttf')
      .moveDown(0)
      .fontSize(7)
      .text('A Happier You!');
    // End Header 3

    doc
      .image('recommended-actions.png', doc.x, doc.y + 23, {
        // width: 26,
        height: 26,
        valign: 'bottom'
      });

    doc
      .moveDown(5)
      .fontSize(14)
      .font('fonts/CircularStd-Bold.ttf')
      .text('RecommendedActions', doc.x + 40, doc.y - 25, { width: 100 });

    doc
      .moveDown(1)
      .fontSize(9)
      .font('fonts/CircularStd-Medium.ttf');

    if (data.allRiskLevel == 'unlikely') {
      doc
        .text(`Your responses suggest that you are not suffering from a significant mood or anxiety disorder at the present time. However, before closing the book on this matter there are a few points you should consider.`, doc.x - 40)
        .moveDown()
        .text(`A small percentage of individuals with mood or anxiety disorders fail to be picked up by the assessment. Therefore, if you find yourself experiencing troubling mood or anxiety-related symptoms then you should certainly present your concerns to your primary care practitioner or perhaps to a mental health clinician.`)
        .moveDown()
        .text(`A tendency to underestimate the effects of your symptoms on friendships, home, or work-life may have resulted in an “all is well” report when perhaps this is not strictly true. Call it “denial,” not wishing to complain, or simply trying to “tough it out,” underreporting trouble could backfire and cause you more distress in the future. Avoid the pitfall of assuming that the way you feel “is to be expected considering my circumstances.” While bad feelings are naturally the result of difficult and stressful life situations, mood and anxiety disorders are real medical conditions that may be triggered by such stresses. When they do arise, these conditions make it more difficult to cope with the problems confronting you, and so it is always in your best interest to get them evaluated.`)
        .moveDown()
        .text(`Milder or subclinical varieties of mood and anxiety occasionally develop into more serious conditions. In such instances, symptoms may be less severe but nonetheless distracting or annoying, slowing you down or making things more stressful than they should be. If you feel this may apply to you, you should consider raising the issue with your physician and sharing your responses to these questions.`)
        .moveDown()
        .text(`Mood and anxiety disorders typically come in episodes. Therefore, even if you are feeling fine now, it is in your best interest to revisit this checklist every 6 months or so. Naturally, if at any point you find yourself experiencing some of the symptoms described in the assessment, please return and repeat the checklist at your first opportunity.`)
        .moveDown()
        .text(`Mooditude has over 800 minutes of self-care activities. Make a habit of practicing one of them for just 10 minutes per day. This will help you maintain your mental well-being.`);
    } else if (data.allRiskLevel == 'low') {
      doc
        .text(`Your low overall score means that your symptoms are somewhat milder than average. However, mild symptoms still may have a negative effect on your well-being and, when left untreated, can grow worse with time. You may possibly benefit from contacting your physician or a mental health care provider to begin a discussion of your responses to these questions. It is important for you to share these results with your physician.`, doc.x - 40)
        .moveDown()
        .text(`Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.`);
    } else if (data.allRiskLevel == 'medium') {
      doc
        .text(`Your overall score suggests that you would benefit from contacting your physician or a mental health care provider to begin a discussion of your responses to these questions.  It is important for you to share these results with your physician.`, doc.x - 40)
        .moveDown()
        .text(`Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.`);
    } else if (data.allRiskLevel == 'high') {
      doc
        .text(`Your overall score suggests that you would benefit from contacting your physician or a mental health care provider as soon as possible to begin a discussion of your responses to these questions.  It is important for you to share these results with your physician.`, doc.x - 40)
        .moveDown()
        .text(`Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.`);
    }

    if (data.hasSuicidalThoughts) {
      doc
        .moveDown(1.5)
        .rect(doc.x + 20, doc.y, 240, 105)
        .fill('#FFFFAA');

      doc
        .font('fonts/CircularStd-Bold.ttf')
        .fillColor('#EB5757')
        .moveDown()
        .text(`Your response to a question related to suicidal thoughts raises a red flag.`, defaultMarginLeft + 40, doc.y, {
          width: 200,
          align: 'center'
        })
        .fillColor('#072B4F')
        .moveDown()
        .text(`Are you in crisis?`, defaultMarginLeft + 40, doc.y, {
          width: 200,
          align: 'center'
        })
        .moveDown()
        .text(`Please call National Suicide Prevention Lifeline or proceed directly to an emergency room.`, defaultMarginLeft + 40, doc.y, {
          width: 200,
          align: 'center'
        });
    }

    if (data.usedDrug) {
      doc
        .font('fonts/CircularStd-Medium.ttf')
        .moveDown(2.2)
        .text(`Your responses indicated that you have occasionally used non-prescribed drugs to manage some of the symptoms.`, defaultMarginLeft)
        .moveDown()
        .text(`Self-medication for such symptoms, even when this appears to be effective, is likely to make such symptoms worse over the long term. We strongly urge you to share the responses to these questions with your physician and to begin an honest discussion about your drug use patterns.`, defaultMarginLeft)
        .moveDown()
        .text(`It is likely that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.`, defaultMarginLeft);
    }

    if (data.usedAlcohol) {
      doc
        .font('fonts/CircularStd-Medium.ttf')
        .moveDown()
        .text(`Your responses suggest that you have occasionally used alcohol to manage some of the symptoms.`, defaultMarginLeft)
        .moveDown()
        .text(`Self-medication for such symptoms, even when this appears to be effective, often will make such symptoms worse over the long term. We strongly urge you to share your assessment results with your physician and to begin an honest discussion about your alcohol use patterns.`, defaultMarginLeft)
        .moveDown()
        .text(`It is virtually certain that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.`, defaultMarginLeft);
    }
    // End Page 3

    // Start Footer
    let pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      let oldBottomMargin = doc.page.margins.bottom;

      doc.page.margins.bottom = 0;

      doc
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