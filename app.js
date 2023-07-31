const express = require('express');
const app = express();
let cors = require('cors');
const http = require('http');
const fetch = require('isomorphic-fetch');
//Port
const PORT = 8000; /*process.env.PORT ||*/

//middleware
app.use(cors());
app.use(express.json())

app.post('/webhooks', (req, res) => {
  const answers = req.body.form_response;
  let obj = {
    "rF7UxysiiDPr": "child_first_name",
    "ooKo04GqvUlR": "child_last_name",
    "OstRWggx5W6H": "student_email",
    "11Xad7KN2ULX": "student_id",
    "PxOAe9ZyofCO": "dob",
    "t5YXkow8nJY2": "child_age",
    "I5VP2PpEkkYk": "current_grade",
    "wZjAgdzVwpIj": "child_school",
    "OOQW2JUwDLXf": "reporting_program",
    //"lZhzWd0JdJoq": "school_site", // "Which Achieve Summer location would you like to register your child for?"
    "iBFkmqWpgmln": 'gender',
    "ZPQhNsroAsge": 'race',
    "AL7HaTdJtZAl": "native_language",
    "X04ltFaZrtii": "adress",
    "zcXXBy0cRR6J": "city",
    "wl8vcQPtd7jV": "state",
    "km6GBsWJgHTu": "zip",
    "qY9EzOKMLrgx": "country",
    "voqexD9ciH0p": "parent_firstName",
    "QFHkKnU27hXc": "parent_lastName",
    "ihDBLNQKeFCA": "parent_phone",
    "pMhRp9vaEmvd": "parent_email",
    "Djx9jePFOl2h": "emg_cnt_1_firstName",
    "ZCOh2YWu5qc3": 'emg_cnt_1_lastName',
    "CdGRnJnLYHNb": "emg_cnt_1_phone",
    "N8XOpXs5Pc7E": "emg_cnt_1_email",
    "8rTg3vlbhYxw": "emg_cnt_2_firstName",
    "2yPfyqMywmQX": "emg_cnt_2_lastName",
    "4orLRcQjGrH0": "emg_cnt_2_phone",
    "3Ex4IwME82Lu": "emg_cnt_2_email",
    "uDsobwfVNhpi": "emg_cnt_3_firstName",
    "msr3K3hTWO10": "emg_cnt_3_lastName",
    "Bv6OUwa7LSU8": "emg_cnt_3_phone",
    "FgfRITdMKYuX": "emg_cnt_3_email",
    "hAxluqsQ7TIK": "authorized_persons",
    "Eer7uf7V23po": "transportation",
    "1RG41vQpSfLF": "allergies",
    "f8LTnOdkyqeY": "allergyType",
    "PhclS4BxF2uL": "accomodations", 
    // how did you hear about this program not included
    "PRTTy4NBvz3s": "consent_covid",
    "IGjFluSoLqkA": "consent_media",
    "FCwcOWeQrL1k": "consent_program_participation",
    "g36fiI9c8Tor": "disclosure_form"
  }
  let ansObj = {}
  let hbInternalNames = {
    "Female": "Girl",
    "Male": "Boy",
    "Non-binary": "Non-binary",
    'Non-binary/gender non-conforming': "Non-binary/gender non-conforming",
    "Prefer Not To Say": "Prefer-not-to-say",
    'Pick-Up': 'pickup',
    "Walk": "walk",
    "Achieve Saturdays": "Achieve Saturdays",
    "Achieve Music": "Achieve Music",
    "American Indian or Alaska Native": "American Indian",
    "Asian": "Asian",
    "Black or African American": "Black",
    "Native Hawaiian or other Pacific Islander": "Native Hawaiian or other Pacific Islander",
    "White": "White",
    "Hispanic/Latin": "Black/White/Hispanic",
    "Do not wish to answer": "Prefer Not To Say",

  }

  for (let i = 0; i < answers.answers.length; i++) {
    const curr = answers.answers[i]
    if (obj[curr.field.id]) {
      //let labels = ''
      if (curr.type === 'choices') {
        const labels = curr[curr.type].labels.map(label => hbInternalNames[label]);
        if (labels.length === 1) {
          ansObj[obj[curr.field.id]] = labels[0];
        } else {
          ansObj[obj[curr.field.id]] = labels.join(';');
        }
        // ansObj[obj[curr.field.id]] = curr[curr.type]

      }
      if (curr.type === 'choice') {
        //ansObj[obj[curr.field.id]] = curr[curr.type].label
        const value = hbInternalNames[curr[curr.type].label] !== undefined ? hbInternalNames[curr[curr.type].label] : curr[curr.type].other
        ansObj[obj[curr.field.id]] = value !== undefined ? value : curr[curr.type].label;
      }
      else
        ansObj[obj[curr.field.id]] = curr[curr.type]
    }
  }


  // transportation formatted
  let transportation = ansObj["transportation"].labels.map(label => hbInternalNames[label]).join(';')
  ansObj['transportation'] = transportation

  // let reportingProgram = ansObj["reporting_program"].labels.map(label => hbInternalNames[label]).join(';')
  // ansObj["reporting_program"] = reportingProgram

  let race = ansObj["race"].labels.map(label => hbInternalNames[label]).join(';')
  ansObj["race"] = race
  let accomodations = ansObj['accomodations'] === 'No' ? "None" : ansObj["accomodations"]
  ansObj["accomodations"] = accomodations;

  let allergies = ansObj['allergies'] === false ? "None" : ansObj["allergyType"].labels.join(';')
  ansObj["allergies"] = allergies;


  console.log(ansObj)
  const myHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer pat-na1-5baf5e58-b545-4f46-976e-e8bd5c444250"
  };
  const participantBody = JSON.stringify({
    "properties": {
      "authorized_persons_who_can_pick_up_": ansObj.authorized_persons,
      "reporting_program": ansObj.reporting_program.labels.map(label => hbInternalNames[label]).join(';'),
      //"school_site": ansObj.school_site,
      "student_grade_level": ansObj.current_grade,
      "transportation": ansObj.transportation, //have to modify with hb internal name
      "accomodations": ansObj.accomodations,// handle edge case
      "allergies": ansObj.allergies, // handel edge case
      "date_of_birth": ansObj.dob,
      "gender": ansObj.gender, // have to modify with hb internal name
      "studentfirstname": ansObj.child_first_name,
      "studentlastname": ansObj.child_last_name,
      "studentschoolemail": ansObj.student_email,//student email should is required
      "languages_spoken": ansObj.native_language,
      "student_id_number": ansObj.student_id,
      "street_address": ansObj.adress,
      "race_ethnicity": ansObj.race,//have to modify this hubspot internal names
      "type": "student",
      "school_year":"2023-2024",
      "zip_code": ansObj.zip
      // consent not added
    }
  });

  const participantsRequestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: participantBody,
    redirect: 'follow'
  };

  let participantsRecordId = null;
  async function getParticipantsRecordId() {
    try {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/2-15412530", participantsRequestOptions);
      const result = await response.json();
      console.log(result)
      participantsRecordId = result.id;
      await createAssociation();
    } catch (error) {
      console.log('error', error);
    }
  }


  //contact post request
  const contactsBody = JSON.stringify({
    "properties": {
      "firstname": ansObj.parent_firstName,
      "lastname": ansObj.parent_lastName,
      "address": ansObj.adress,
      "city": ansObj.city,
      "email": ansObj.parent_email,
      "phone": ansObj.parent_phone,
      "emg_1_first_name": ansObj.emg_cnt_1_firstName,
      "emg_1_last_name": ansObj.emg_cnt_1_lastName,
      "emg_cntct_1_email": ansObj.emg_cnt_1_email,
      "emg_cntct_1_phone_number": ansObj.emg_cnt_1_phone,
      "emg_cntct_2_first_name": ansObj.emg_cnt_2_firstName,
      "emg_cntct_2_last_name": ansObj.emg_cnt_2_lastName,
      "emg_cntct_2_email": ansObj.emg_cnt_2_email,
      "emg_cntct_2_phone_number": ansObj.emg_cnt_3_phone,
      "emg_cntct_3_first_name": ansObj.emg_cnt_3_firstName,
      "emg_cntct_3_last_name": ansObj.emg_cnt_3_lastName,
      "emg_cntct_3_email": ansObj.emg_cnt_3_email,
      "emg_cntct_3_phone_number": ansObj.emg_cnt_3_phone,
    }
  });
  const contactsRequestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: contactsBody,
    redirect: 'follow'
  };
  let contactRecordId = null;

  async function getContactRecordId() {
    try {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", contactsRequestOptions);
      const result = await response.json();
      //console.log(result)
      contactRecordId = result.id;
      await createAssociation();
    } catch (error) {
      console.log('error', error);
    }
  }

  async function checkContactExists() {
    const contactExistsOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    try {
      const email = ansObj.parent_email.toLowerCase();
      const response = await fetch(` https://api.hubapi.com/contacts/v1/contact/email/${email}/profile`, contactExistsOptions);
      const result = await response.json();
      //console.log(result)
      if (result.vid) {
        // Contact already exists, retrieve the contact record ID
        contactRecordId = result.vid;

        await createAssociation();
      } else {
        // Contact doesn't exist, create a new record
        await getContactRecordId();
      }
    } catch (error) {
      console.log('error', error);
    }
  }


   let companyRecordId = null;
 

  const companyBody = JSON.stringify({
    "properties": {
      "name": ansObj.child_school

    }
  });
  
  const existingCompanyRequestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  
  let compId = null;
  async function checkExistingCompany() {
    try {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/companies?limit=100", existingCompanyRequestOptions);
      const result = await response.json();
      const existingCompanies = result.results;
  
      // Check if any existing company has the same domain
      const isDuplicate = existingCompanies.find(company => company.properties.name === ansObj.child_school);
      //console.log(existingCompanies,{isDuplicate})
      if (isDuplicate) {
       
        const id = isDuplicate.id
        compId = id
        await createCompanyAssociation(id,participantsRecordId);
        //return; // Exit the function to prevent creating a duplicate company
      }
      else {
        await createNewCompany(); // Proceed with creating a new company if no duplicate is found
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  const companyRequestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: companyBody,
    redirect: 'follow'
  };
  
  async function createNewCompany() {
    try {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/companies", companyRequestOptions);
      const result = await response.json();
      //console.log(result);
      companyRecordId = result.id;
      compId = companyRecordId
      await createCompanyAssociation(companyRecordId,participantsRecordId);
      
    } catch (error) {
      console.log('error', error);
    }
  }
  
  //Post Deals
 

  
  
  
  let reportingProgram = ansObj.reporting_program.labels
  async function getdealsRecordId(reportingProgramLabel) {
    // let reportingProgram = ansObj.reportingProgram.labels
    let pipeline = ""
    let dealName = ""
    if(reportingProgramLabel === "Achieve Saturdays") {
      pipeline = 10715564
      dealName = "Achieve Saturdays"
    }
    else{
      dealName = "Achieve Music"
      pipeline = 10707981
    } 

    
    let dealsRecordId = null;
    const dealsBody = JSON.stringify({
      "properties": {
        "dealname": dealName + ' 2023-2024',
        "pipeline": 10715564,
        "dealstage": 31258434,
        "studentschool": ansObj.child_school,
        "student_grade_level": ansObj.current_grade,
        'transportation': ansObj.transportation,
        "reporting_program": ansObj.reporting_program.labels.map(label => hbInternalNames[label]).join(';'),
        "school_year": "2023-2024",
      }
    })
    
    const dealsRequestOptions = {
      method: 'POST',
      headers: myHeaders,   
      body: dealsBody,
      redirect: 'follow'
    };
    try {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/deals", dealsRequestOptions);
      const result = await response.json();
      dealsRecordId = result.id
      console.log({dealsRecordId})
      // participantsRecordId = result.id;
      // await createAssociation();
    } catch (error) {
      console.log('error', error);
    }
    await createDealsCompanyAssociation(compId,dealsRecordId)
  }
  //create association between contacts and participants
  async function createAssociation() {
    // console.log({contactRecordId, participantsRecordId, companyRecordId})
    if (contactRecordId && participantsRecordId) {
      const contacts_participants_requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: {},
        redirect: 'follow'
      };
  
      try {
        const response = await fetch(`https://api.hubapi.com/crm/v4/objects/contacts/${contactRecordId}/associations/default/2-15412530/${participantsRecordId}`, contacts_participants_requestOptions);
        const result = await response.text();
        //console.log(result);
      } catch (error) {
        console.log('error', error);
      }
    }
    // checkExistingCompany()
    // else
    //   console.log({contactRecordId,participantsRecordId})
  }
  
  //association between participant and company
  async function createCompanyAssociation(id,participantsRecordId){
     console.log({participantsRecordId, id})
    if(participantsRecordId && id){
      const company_participants_requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: {},
        redirect: 'follow'
      };
      try {
        const response = await fetch(`https://api.hubapi.com/crm/v4/objects/companies/${id}/associations/default/2-15412530/${participantsRecordId}`, company_participants_requestOptions);
        const result = await response.text();
        //console.log(result);
      } catch (error) {
        console.log('error', error);
      }
      
    }
    // else
    //   console.log({companyRecordId,participantsRecordId})
  }

  async function createDealsCompanyAssociation(compId, dealsRecordId){
    const deal_company_requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: {},
      redirect: 'follow'
    };
    try {
      const response = await fetch(`https://api.hubapi.com/crm/v4/objects/deal/${dealsRecordId}/associations/default/company/${compId}`, deal_company_requestOptions);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.log('error', error);
    }
  }
  async function main() {
    //let reportingProgram = ansObj.reportingProgram.labels
    try {
      // Wait for getParticipantsRecordId() to complete and get the result
      const participantsRecordId = await getParticipantsRecordId();
  
      // Continue with other functions using participantsRecordId
      await checkContactExists(); 
      await checkExistingCompany()
      for(let i = 0; i<reportingProgram.length; i++ ){
        
        //await getdealsRecordId()
        await getdealsRecordId(reportingProgram[i]);
      }
      
  
      
      // Other code here that depends on the result of getParticipantsRecordId()
    } catch (error) {
      // Handle errors here
    }
  }
  
  main();
  /*getParticipantsRecordId()
  //getContactRecordId()
  checkContactExists(); 
  getdealsRecordId()*/
 

  res.send("recieved")
});





const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
});