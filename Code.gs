function createTimeDrivenTriggers() {
  // Trigger every hour.
  ScriptApp.newTrigger('retrieveNewGrades')
      .timeBased()
      .everyHours(1)
      .create();
}

function retrieveNewGrades() {
  var response, responseContent, responseHeaders, cookie, options, path, grades, table, rows, row, cols, col, sheet, countNotEmpty, newCountNotEmpty, text;
  
  // Replace with your own credentials
  const myUsername = '<Username';
  const myPassword = '<Password>';
  const myEmail = '<Email>';
  
  // Fetch login page, set cookie and record hidden csrf field
  response = UrlFetchApp.fetch('https://ent-reloaded.supelec.fr/login');
  responseContent = response.getContentText("UTF-8");
  cookie = response.getAllHeaders()['Set-Cookie'].split(";")[0];
  path ='body/div[2]/div/div[1]/div/form/fieldset/fieldset/input[3]';
  const _csrf_token = getDataFromXpath(path, responseContent).getAttribute('value').getValue();
  
  const loginData = {
   '_username': myUsername,
   '_password': myPassword,
   '_csrf_token': _csrf_token,
    'login': 'Connexion'
  };
  options = {
    'method' : 'post',
    'headers': {
      'Cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin':'https://ent-reloaded.supelec.fr',
      'Referer': 'https://ent-reloaded.supelec.fr/login'
    },
    'followRedirects':false,
    'payload' : loginData
 };

  // Handle login 
  response = UrlFetchApp.fetch('https://ent-reloaded.supelec.fr/login_check',options);
  responseHeaders = response.getAllHeaders();
  
  responseContent = response.getContentText("UTF-8");
  cookie = responseHeaders['Set-Cookie'][0].split(";")[0]; //The website sets twice the same cookie
  options = {
    'headers':{ 'Cookie':cookie }
  };
  const resultsPage = UrlFetchApp.fetch('https://ent-reloaded.supelec.fr/scolarite/resultats-courants',options).getContentText("UTF-8");

  // Logout since that allows website to destroy our session cookie, otherwise we fill them with useless unfinished session cookies
  UrlFetchApp.fetch('https://ent-reloaded.supelec.fr/logout',options)
  
  sheet = SpreadsheetApp.getActiveSheet();
  countNotEmpty = sheet.getRange('F2').getValue(); // for check if any change in the sum of all non-empty relevant cells
  sheet.getRange('F2').setFormula("=COUNTA(A:D)"); // Add in the formula in case it wasn't there
  
  // These two tables contain all relevant grades
  [2,3].forEach(function(tableIndex){
    path = '/html/body/div[4]/div/div[2]/table['+ tableIndex+']';
    table = getDataFromXpath(path, resultsPage);
    rows = table.getElement('tbody').getElements('tr');
    grades = rows.map(function(row) {
      cols = row.getElements('td');
      return cols.map(function(col){
        if (col.getElement('strong')) { // handle grades that are shown in bold
          value = col.getElement('strong').getText();
        } else {
          value = col.getText();
        }
        return value;
      });
    });
    //write down the grades tables on top of each other. This could be made more flexible to accomodate for more grades.
    sheet.getRange(1+ (tableIndex-2) * 10,1,grades.length, grades[0].length).setValues(grades);
  });

  // Send mail with tables, if any new grade has appeared
  text = getDataFromXpath('/html/body/div[4]/div/div[2]', resultsPage);
  newCountNotEmpty = sheet.getRange('F2').getValue();
  
  if (countNotEmpty !== newCountNotEmpty) {  
    MailApp.sendEmail({ to: myEmail, subject: "New Grades are out!", htmlBody: text.toXmlString()});
    Logger.log("Mail sent")
  }
}

// Useful function to get an HTML element from its XPath, credits to @vs4vijay at https://coderwall.com/p/cq63og/extract-data-from-xpath-via-google-apps-script
function getDataFromXpath(path, responseText) {
  var xmlDoc = Xml.parse(responseText, true);

  // Replacing tbody tag because app script doesnt understand.
  path = path.replace("/html/","").replace("/tbody","","g");
  var tags = path.split("/");
  var element = xmlDoc.getElement();
  for(var i in tags) { 
    var tag = tags[i];
     var index = tag.indexOf("[");
     if(index != -1) {
       var val = parseInt(tag[index+1]);
       tag = tag.substring(0,index);
       element = element.getElements(tag)[val-1];
     } else {
       element = element.getElement(tag);
    }
  }
  return element;
}
