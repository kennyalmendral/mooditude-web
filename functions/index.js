const webService = require('./modules/webService');

exports.updateUserM3AssessmentScores = webService.updateUserM3AssessmentScores;
exports.processStripeSubscription = webService.processStripeSubscription;
exports.processStripeSubscriptionOnSignUp = webService.processStripeSubscriptionOnSignUp;
exports.cancelStripeSubscription = webService.cancelStripeSubscription;
exports.renewStripeSubscription = webService.renewStripeSubscription;
exports.getStripeSubscription = webService.getStripeSubscription;
exports.getStripeSubscriptionDirect = webService.getStripeSubscriptionDirect;
exports.getStripePayment = webService.getStripePayment;
exports.generatePDFReport = webService.generatePDFReport;
exports.uploadProfilePicture = webService.uploadProfilePicture;
exports.stripeWebhooks = webService.stripeWebhooks;