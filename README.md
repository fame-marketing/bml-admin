Nearby Now Automation
---

### About

Nearby Now Automation is a program that is built to listen for and react to webhooks from Nearby Now.
The program is built on node, express, mysql, and handlebars.
When the program receives an event it will attempt to quickly store the data in a temporary MYSQL database table 
and send a success message. 

There will also be a cron running to check for new nearby now events. Each time the cron runs
it will perform the following tasks.


 - When a new event is found in the nn_events_temp table, that data is retrieved, reformatted, and stored into permanent tables. 
 - For each new event, the number of relevant events per city is updated.
 - When a city is found to have received enough reviews/checkins that city will be passed to a page builder class.
 - After a city page is created that city is marked as created to prevent page duplication or overwriting.
 - The new page is added to a sitemap at the site root called service-areas-sitemap.xml

### Requirements

<a href="https://nodejs.org" target="_blank">Node</a> - (tested on v 10.16.3 up to 12.18.3)


### Installation 

For shared hosting make sure to add the following lines to the .bash_profile file in order to have access to the npm and node 
commands form the terminal.(this will be a huge speed boost during setup)

`PATH="$PATH:$HOME/bin:/opt/alt/alt-nodejs10/root/usr/bin"
export PATH`

Replace the existing PATH in the bash_profile with those lines.

#####Setup the node application in cpanel
from the clients cPanel account, navigate to the Setup Node.js App program and create a new application.
- Node.js Version - Any available option within the requirements above.
- Application mode - Production
- Application root - webhook
- Application URL - nn-admin
- Application startup file - bin/www.js
- Passenger log file - *do not change*

Upload all the files that are in the same directory as this README to a directory named "webhook" OUTSIDE of the server root.

#####You must now setup the Database
copy the .env.sample file and rename it to .env

Use the environment variables information below to fill in the fields of the .env file according to the client.
you will need to have the database created already, here you are just storing the connection information for the 
existing, empty database. You may use the cpanel MySQL Databases program to create the database. 

Once the node application is setup, and the database is ready, run npm install from the webhook directory
where you uploaded the application files. This can be done from the cPanel Setup node.js App program, or from the 
terminal using a ssh connection. Using SSH is the recommended method as it will be faster... much faster. this is,
if you can set up a ssh connection relatively quickly. Otherwise, the time spent setting up the connection, compared
to the extra time spent waiting for cpanel to run the operation may be more in favor of just running the operation 
from cpanel. I am not your dad, you need to make that decision on your own, you are an adult now. stop expecting this
documentation to hold your hand through every step of every process.

Once npm install is complete, we will initialize the database. Navigate to the node.js App in cPanel and open up our nearby now
application. There should now be an option to "Run JS script." selecting this will open a dialog box with 2 options. From this dialog
you should only ever use the init script. the run script will automatically be handled by cpanel and is only there
in case the run command needs to be done from SSH or in a non cPanel environment. Now select the init script run it to
setup the database tables.

You can now visit https://yourdomain.com/nn-admin to see the program running!

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
the clients primary Domain. Should include the protocol(ie. https://youneedfame.com). 
If no protocol is given https will be assumed which could cause issues if you are not using an ssl.

### Testing

I recommend sending a test response or 2 before pointing nearby now to the application.
Use Postman(https://www.postman.com/) to send some sample data to https://[yourdomain.com]/nn-admin/webhook. For information on how to format
the data as it will be sent from nearby now see http://servicepros.nearbynow.co/plugins/api-integration/webhooks/

###Launching

Visit 
<a href="https://admin.nearbynow.co/Integration/Webhooks" target="_blank">
admin.nearbynow.co/Integration/Webhooks
</a>
and install the webhooks app for your nearby now account.
From the webhooks settings tab add the secure url. The URL will be https://[yourdomain.com]/nn-admin/webhook


## Version History

- 1.0.0  
Project Creation
---
- 1.0.1  

Modified file creation to prevent overwriting existing files.
If a directory is missing when the program goes to create a page, it will
now create the missing directory.

---
- 1.1.0

Added an Admin interface to allow better management of the application. Added new DB tables
to help manage the increase functionality.

---
