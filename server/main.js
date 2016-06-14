import { Meteor } from 'meteor/meteor';
import bodyParser from 'body-parser';
import moment from 'moment';

capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

Picker.route( '/nomsbot', function(params, request, response, next) {
  // console.log('request: ', request.body);

  const { team_id: teamId, 
          team_domain: teamDomain, 
          user_name: userName, 
          response_url: url, 
          text, 
          token } = request.body;

  const atIndex = text.indexOf(' @ ');
  const placeName = capitalizeFirstLetter(text.substring(0, atIndex).trim());
  const planTime = text.substring(atIndex + 3, text.length);

  const validateTime = planTime.toString().replace(/[^\d:-]/g, '');

  const now = moment();
  const noon = now.clone().hour(12).minute(0).second(0);
  const isAfterNoon = now.isAfter(noon);

  let formattedTime = new moment(validateTime, 'h:mm');

  const currentHour = now.hour();

  const enteredForAfterNoon = validateTime >= 1 && validateTime <= currentHour;

  console.log(enteredForAfterNoon); 

  if (isAfterNoon || !isAfterNoon && enteredForAfterNoon) {
    formattedTime = moment(formattedTime).add(12, 'hours').format('h:mma');
  } else {
    formattedTime = moment(formattedTime).format('h:mma')
  }

  response.setHeader( 'Content-Type', 'application/json' );
  response.statusCode = 200;  

  Meteor.call('plans.createBotPlan', (err, success) => {
    if (err) {
      response.end('Error Creating Plan... try again?');
    } else {
      response.end(`Your Noms plan has been created! ${placeName}, today at ${formattedTime}`);
    }
  });
});

Meteor.methods({
  'plans.createBotPlan' () {
    return true;
  },
});