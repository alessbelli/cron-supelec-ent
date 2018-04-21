# A Google Apps Script connected to Supélec's new ENT


Periodically fetch new grades from the Supelec grade repository, and send an e-mail with them.

A tiny piece of code that uses Google Apps Script to connect a Google Spreadsheet to the website where students at Supelec retrieve their grades when they come out. Thanks to the fact that it runs on Google's servers, it can very easily be set to run every hour, and to send an e-mail to a user of your choice (usually yourself) containing your grades table.

This can easily be ported to other websites, just modify the connection logic (here it uses cookies to store session data and to validate a login request) and the place inside the HTML page that contains relevant data.

Instructions for use:
1) Create a [Google Spreadsheet](https://docs.google.com/spreadsheets/) using your Google Account.
2) Add a script to the page using Tools>Script Editor
3) Edit the script, and paste the code from [Code.gs](https://github.com/alessbelli/cron-supelec-ent/blob/master/Code.gs) in this repository.
4) Change the <Username>, <Password> and <Email> strings to match your credentials.
4) Run the function "createTimeDrivenTriggers".
5) If you haven't saved your script yet, it will prompt you to do so.
6) There may be a warning saying this script is not yet approved by google, say you agree.
7) When Google prompts you, give the authorization to your script to send e-mails, to edit your spreadsheet etc.

8) Enjoy! You can verify that the script is set to run every hour by going to Edit-> Current project triggers.
