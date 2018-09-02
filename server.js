'use strict';

// [START server]
var restify = require('restify');
var nodemailer = require('nodemailer');
//Start SMTP server -> namshi/smtp with docker
var transporter = nodemailer.createTransport({direct:true, host:"172.17.0.2",debug:true});
var emailTemplates = require('email-templates');
var path = require('path');
var templatesDir = path.resolve(__dirname, '.', 'templates');

var server = restify.createServer({
  name: 'appengine-restify',
  version: '1.0.0'
});
// [END server]

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

// [START index]
server.get('/', function (req, res) {
  res.send('App para el envío de email');
});
// [END index]

// [START server_start]
server.listen(process.env.PORT || 8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
// [END server_start]


server.get('/send/:email/:socio', function (req, res, next) {
  console.log('sending mail to '+req.params.email+' socio '+req.params.socio);
  //sendSimpleMail(req, res);
  sendMail(req, res,
  	function (successCallback, error) {
	    if (error) {
          console.error(error);
	        res.send('Error al enviar email '+error);
	    }
	    else {
			res.send('Se envio un email a '+req.params.email);
	    }
		return next();
	}
  );
});

/**
* Send email by POST request
*/
server.post('/observaciones', function (req, res) {
  console.log('sending response to '+req.params.email+' socio '+req.params.socio);
  sendMail(req, res,
  	function (successCallback, error) {
	    if (error) {
	        res.send('Error al enviar email '+error);
	    }
	    else {
			res.send('Las observaciones fueron enviadas a '+req.params.email);
	    }
		return next();
	}
  );
});

/**
* Send using email-templates
*/
function sendMail(req, res, callback){
	emailTemplates(templatesDir, function(err, template) {

	  if (err) {
        console.error('Error: '+err);
        callback(null, 'Error: '+err);
	  } else {

		var locals = {
	      email: req.params.email,
	      from: 'example@mail.com',
	      subject: 'Detalles de consumo',
	      url: 'http://localhost:8080',
	      socio: req.params.socio,
	      gform: 'https://docs.google.com/forms/d/1uj1wZI-X9ZyMs4Zoelw9QVS8ACezeu1q6fCIEyLNvHo/formResponse',
	      gformlink: 'https://docs.google.com/forms/d/1uj1wZI-X9ZyMs4Zoelw9QVS8ACezeu1q6fCIEyLNvHo/viewform'
	    };

	    // Send a single email
	    template('newsletter', locals, function(err, html, text) {
	      if (err) {
	        console.error('Template error'+err);
	        callback(null, 'Template error: '+err);
	      } else {
	        transporter.sendMail({
	          from: locals.from,
	          to: locals.email,
	          subject: locals.subject,
	          generateTextFromHTML: true,
	          html: html,
	          text: text
	        }, function(err, responseStatus) {
	          if (err) {
		        console.error('Sending error '+err);
		        callback(null, 'Sending error: '+err);
	          } else {
		        callback('Success');
	          }
	        });
	      }
	    });
	  }

	});
};

/**
* Send simple email
*/
function sendSimpleMail(req, res) {
	//Sending mail
	transporter.sendMail({
	  from: 'example@from.com',
	  to: 'to@gmail.com',
	  subject: 'Detalles de consumo',
	  generateTextFromHTML: true,
	  html: '<style>body {font-family: Arial,Helvetica,sans-serif;font-size: 22px;margin-top: 0px;min-height: 100%;background: #000;}</style>Nombre y apellido: <b>Martin Pielvitori</b><br>'
	}, function(error, response){
		if (error){
			console.error('Error al enviar email '+error);
			res.send('Error al enviar email '+error);
		}
		else {
			console.log('Success');
			res.send('Se envio un email a '+req.params.email);
		}
  		return next();
	});
};
