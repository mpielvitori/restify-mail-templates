## Restify.js sample app to send mails using templates and GForm

### Running the app locally

##### Run local smtp from docker hub image namshi/smtp
docker run -e "GMAIL_USER=example@mail.com" -e "GMAIL_PASSWORD=*********" namshi/smtp

##### Install dependencies
$ node npm install

##### Run node app in debug
$ DEBUG="*" node server.js

##### Invoke sender
http://localhost:8080/send/toemail@email.com/samename
