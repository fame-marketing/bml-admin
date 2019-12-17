Nearby Now Automation
---

### About

Nearby Now Automation is a program that is built to listen for and react to webhooks from Nearby Now.
The program is built on node, express, mysql, and handlebars.
When the program receives an event it will attempt to quickly store the data in a temporary MYSQL database table 
and send a success message. 

There will also be a a cron running at a custom interval check for new nearby now events. Each time the cron runs
it will perform the following tasks.


 - When a new event is found in the _temp tables, that data is retrieved, reformatted, and stored into permanent tables. 
 - For each new event, the number of relevant events per city is updated.
 - When a city is found to have received enough reviews/checkins that city will be passed to a page builder class.
 - After a city is created that city is marked as created to prevent creating more of the same page or overwriting the same page
 repeatedly

### Requirements

<a href="https://nodejs.org" target="_blank">Node</a> - (tested on v 10.16.3)

### Installation 

Upload the files to a public facing directory.

For verve make sure to add the following lines to the .bash_profile file in order to have access to the npm and node 
commands form the terminal.

`PATH="$PATH:$HOME/bin:/opt/alt/alt-nodejs10/root/usr/bin"
export PATH`

Replace the existing PATH in the bash_profile with those lines.

Visit 
<a href="https://admin.nearbynow.co/Integration/Webhooks" target="_blank">
admin.nearbynow.co/Integration/Webhooks
</a>
and install the webhooks app for your nearby now account.
From the webhooks settings tab add the secure url. The URL will depend on where you place your
files. If your website is example.com and you place your files in a directory named at the root of your website and call it "webhooks" your 
secure url would be https://example.com/webhooks/webhook

Run `node /.bin/www`

# Environment Variables

#### accountKey
The nearby now account key.
#### dbHost
Database Host
#### dbUser
Database User name
#### dbPass
Database user password
#### dbName
Database name
#### KEYWORDBASE
The phrase to be appended to the city name for SEO Data Creation. This will be used to create the url, 
the page title, the meta description, and the page h1.
#### DESTINATION
The file path relative to the server directory root. The server directory root is the public_html
folder by default.
#### URL 
the clients primary Domain.



## Version History

- 1.0.0  
Project Creation
---
- 1.0.1  

Modified file creation to prevent overwriting existing files.
If a directory is missing when the program goes to create a page, it will
now create the missing directory.

---