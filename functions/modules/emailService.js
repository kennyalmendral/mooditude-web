const ff = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config/config.json')
const needle = require('needle');


const mailjetOptions = {
    "json": true,
    "username": config.mailJet.apiKey,
    "password": config.mailJet.apiSecret
}


exports.therapistRequest = ff.firestore.document('TherapistRequest/{userId}/Requests/{requestId}').onCreate(async (snap, context) => {


    try {

        const user = await admin.auth().getUser(context.params.userId)
        
        const data = snap.data()
       
        const requestData = {
            "Messages":[
              {
                "From": {
                  "Email": "mooditude@pyntail.com",
                  "Name": "Mooditude"
                },
                "To": [
                  {
                    "Email": "kamran@pyntail.com",
                    "Name": "Kamran"
                  },
                //   {
                //     "Email": "faizan.xavia@gmail.com",
                //     "Name": "Faizan"
                //   },
                  {
                      "Email": "scheduling@ehomegroup.com",
                      "Name": "EHome"
                  }
                ],
                "TemplateID": 2817730,
                "TemplateLanguage": true,
                "Subject": `Mooditude — Therapist Request (${data.requestId})`,
                "Variables": 
                {
                    "requestId": data.requestId,
                    "patientName": data.requestInfo.name,
                    "patientAge": data.requestInfo.ageGroup,
                    "m3Score": data.requestInfo.assessmentScore,
                    "patientPhone": data.requestInfo.phone.toString(),
                    "patientEmail": user.email,
                    "preferrdContactMethod": data.requestInfo.bestMethodToContact,
                    "addressState": data.requestInfo.state,
                    "m3Link": data.requestInfo.assessmentLink,
                    "paymentMethod": data.requestInfo.paymentMethod,
                    "patientVeteranStatus": data.requestInfo.veteranStatus
                }
              }
            ]
          }

        ff.logger.log(`Posting: ${JSON.stringify(requestData)}`)
        const url = `https://api.mailjet.com/v3.1/send`
        let resp = await needle('post', url, requestData, mailjetOptions)

         ff.logger.info(resp.body) 
       

        return null
    }
    catch (err) {
        ff.logger.error(err)
        return null
    }

    
})


exports.addUser = ff.firestore.document('Users/{userId}').onCreate(async (snap, context) => {


    try {

        const user = await admin.auth().getUser(snap.id)
        const email = user.email

        if (!email) {
            ff.logger.warn("User email not found. Exiting the function...")
            return null // no email
        }

        if(email.startsWith('test') || email.startsWith('support') || email.startsWith('hello')) {
            return null // don't want test emails
        }

        const data = snap.data()
        const name = data["name"] || ""
        const goal = data["topGoal"]
        const firstname = name.split(" ")[0]

        const requestData = {
            "Email": email,
            "Name": name,
            "Action": "addnoforce",
            "Properties": {
                "firstname": firstname,
                "group": "free",
                "topgoal": goal,
                "signedon": new Date(),
                "userid": user.uid
            }
        }

        ff.logger.log(`Posting: ${JSON.stringify(requestData)}`)
        const url = `https://api.mailjet.com/v3/REST/contactslist/${config.mailJetLists.appSignup}/managecontact`
        let resp = await needle('post', url, requestData, mailjetOptions)

        
        // succesfully added user to MailJet
        const mailJetUserId = resp.body.Data[0].ContactID
        
        if (mailJetUserId) {  // Store mailjet user id in User's profile for future reference.
            let writeResults = await admin.database().ref(`users/${snap.id}`).update({ 
                email: email, 
                mailJetUserId: mailJetUserId
            })
        }

        return null
    }
    catch (err) {
        ff.logger.error(err)
        return null
    }

    
})


exports.updateUserProperties = ff.database.ref('users/{userId}').onUpdate(async (change, context)=>{

    if(!change.before.exists){
        return null // first time create
    }
    
    const beforeData = change.before.val()
    const afterData = change.after.val()

    if(!afterData.mailJetUserId){
        ff.logger.info(`MailJetUserId doesn't exists for user: ${context.params.userId}. Exiting..`)
        return null
    }


    if(!beforeData.mailJetUserId){
        return null // this is the call when we set the userId
    }

    ff.logger.log(`Updating properties for: ${afterData.mailJetUserId}`)
    ff.logger.log(`Updated UserObject: ${JSON.stringify(afterData)}`)

    let propertiesToUpdate = []

    if (afterData.name){
        propertiesToUpdate.push({
            "Name": "name",
            "Value": afterData.name
        })

        let firstName = afterData.name.split(" ")[0] 
        propertiesToUpdate.push({
            "Name": "firstName",
            "Value": firstName
        })
    }

    propertiesToUpdate.push({            
        "Name": "grantawardee",
        "Value": afterData.grantAwardee        
    })

    if(afterData.deleted){
        propertiesToUpdate.push({            
            "Name": "deleted",
            "Value": afterData.deleted        
        })
    }


    if(afterData.paymentStatus){
        propertiesToUpdate.push({
            "Name": "paymentStatus",
            "Value": afterData.paymentStatus
        })
    }

    // We are setting this value only once. Because  we want to trigger just one set of welcome emails.
    if(!beforeData.topGoal && afterData.topGoal){
        propertiesToUpdate.push({
            "Name": "topGoal",
            "Value": afterData.topGoal
        })
    }

    ff.logger.log(`Properties to update: ${JSON.stringify(propertiesToUpdate)}`)

    if (propertiesToUpdate.length === 0){
        return null // nothing to update
    }

    const url = `https://api.mailjet.com/v3/REST/contactdata/${afterData.mailJetUserId}`
    const requestData = {
        "Data": propertiesToUpdate
    }
        
    const resp = await needle("put", url, requestData, mailjetOptions)
    ff.logger.log(JSON.stringify(resp.body))

    return null

})



exports.updateProperty = function updateProperty(mailJetUserId, propertyName, propertyValue) {
    const url = `https://api.mailjet.com/v3/REST/contactdata/${mailJetUserId}`
        const requestData = {
            "Data": [
                {
                    "Name": propertyName,
                    "Value": propertyValue
                }
            ]
        }


        return needle("put", url, requestData, mailjetOptions)
}


exports.addUserToList = function addToList(listId, contactId, contactEmail) {


    if(!listId){
        throw new Error('Missing List Id')
    } 

    if(contactEmail){
        if (contactEmail.startsWith("test")){
            return null
        }
    }

    let requestData = {
        "IsUnsubscribed":"false",
        "ListID":listId,
      }


      if (contactId){
          requestData.ContactID = contactId
      } else if (contactEmail){
          requestData.ContactAlt = contactEmail
      } else {
          throw new Error('ContactId or ContactEmail is needed')
      }


    ff.logger.log(`RequestData: ${JSON.stringify(requestData)}`);

    const url = "https://api.mailjet.com/v3/REST/listrecipient"

    return needle("post", url, requestData, mailjetOptions)
    
}



exports.delete = function deleteUser(contactId){
    url = `https://api.mailjet.com/v4/contacts/${contactId}`
    return needle('delete', url, mailjetOptions)
}