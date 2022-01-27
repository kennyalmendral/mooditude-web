const webService = require('./modules/webService');

exports.updateUserM3AssessmentScores = webService.updateUserM3AssessmentScores;
exports.processStripeSubscription = webService.processStripeSubscription;
exports.processStripeSubscriptionOnSignUp = webService.processStripeSubscriptionOnSignUp;
exports.cancelStripeSubscription = webService.cancelStripeSubscription;
exports.renewStripeSubscription = webService.renewStripeSubscription;
exports.getStripeSubscription = webService.getStripeSubscription;
exports.getStripeSubscriptionDirect = webService.getStripeSubscriptionDirect;
exports.getStripePayment = webService.getStripePayment;
exports.getStripeProduct = webService.getStripeProduct;
exports.generatePDFReport = webService.generatePDFReport;
exports.uploadProfilePicture = webService.uploadProfilePicture;
exports.stripeWebhooks = webService.stripeWebhooks;
exports.updateUserCollection = webService.updateUserCollection;
exports.updateUserProfileOnboarding = webService.updateUserProfileOnboarding;