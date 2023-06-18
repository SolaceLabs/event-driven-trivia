const guideSteps = [
  {
    title: 'Welcome to Fireball Trivia',
    text: 'Fireball Trivia is a Event-driven Trivia Game implemented using Solace PubSub+',
  },
  {
    title: 'Key Terminology',
    text:
    `<b>Question</b>: A quiz style question with multiple answers (a minimum of 2 and upto 4) prompting the player to choose the right one <br/>
    <b>Category</b>: A label for identifying a group of questions on a shared context/theme<br/>
    <b>Trivia</b>: A Trivia is a collection of questions that can be presented as a sequence of questions to the participants.<br/>`
  },
  {
    title: 'Trivia Manager',
    text: 'A fullstack webapp where you can create and manage questions, categories and trivias with custom settings.'
  },
  {
    title: 'Trivia Controller',
    text: 'A single-page webapp where the trivia owner can launch and start a trivia, invite participants and monitor trivia.'
  },
  {
    title: 'Trivia Game',
    text: 'A single-page webapp where the trivia participants can participate and respond to questions of a trivia.'
  },
  {
    title: 'Controller Widgets',
    text:
    `The Trivia Controller app offers real-time widgets presenting the progress and outcome of the Trivia<br/>
    <b>Chatter</b>: A real-time chat facility that allows trivia participants and the controller to engage in in-trivia chat<br/>
    <b>Performance</b>: A real-time performance indicator around the correct and incorrect responses on questions<br/>
    <b>Leaderboard</b>: A real-time leaderboard indicating participant performance based on the score<br/>
    <b>Activity</b>: A real-time graph plotting the events generated during the trivia session<br/>
    <b>Events Published</b>: A real-time statistics on published events by logical grouping during the trivia session<br/>
    <b>Events Received</b>: A real-time statistics on received events by logical grouping during the trivia session<br/>`
  },
  {
    title: 'Game Widgets',
    text:
    `The Trivia Game app offers real-time widgets presenting the participant's progress and outcome of the Trivia<br/>
    <b>Chatter</b>: A real-time chat facility that allows trivia participants and the controller to engage in in-trivia chat<br/>
    <b>Scorecard</b>: A real-time performance indicator on participant's correct and incorrect responses on questions<br/>
    <b>Leaderboard</b>: A real-time leaderboard indicating participant performance based on the score<br/>
    <b>Activity</b>: A real-time graph plotting the events generated during the trivia session<br/>`
  },
];

export default guideSteps;
