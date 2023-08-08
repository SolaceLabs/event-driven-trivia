/* eslint-disable no-path-concat */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { PapperBlock } from 'enl-components';
import Faq from 'react-faq-component';
import ReactPlayer from 'react-player';
import aboutCategoryVideo from 'enl-images/recordings/about-category.mp4';
import aboutQuestionVideo from 'enl-images/recordings/about-question.mp4';
import aboutTriviaVideo from 'enl-images/recordings/about-trivia.mp4';
import createTriviaVideo from 'enl-images/recordings/create-trivia.mp4';
import cloneTriviaVideo from 'enl-images/recordings/clone-trivia.mp4';
import startTriviaVideo from 'enl-images/recordings/start-trivia.mp4';
import runTriviaVideo from 'enl-images/recordings/run-trivia.mp4';

const styles = theme => ({
  table: {
    '& > div': {
      overflow: 'auto'
    },
    '& table': {
      '& td': {
        wordBreak: 'keep-all'
      },
      [theme.breakpoints.down('md')]: {
        '& td': {
          height: 60,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }
    },
  },
  container: {
    position: 'relative',
  },
  videoThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    transition: 'opacity 400ms ease 0ms',
  },
  tiny: {
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    transition: 'visibility 0ms ease 400ms',
  },
  snackbar: {
    margin: theme.spacing(1),
  },
  divider: {
    margin: `${theme.spacing(3)}px 0`,
  },
  margin: {
    margin: theme.spacing(1)
  },
  introText: {
    margin: '3em'
  },
  faqQuestion: {
    marginLeft: '1em',
    color: '#00838f'
  },
  faqText: {
    margin: '2em'
  },
  videContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tab4: {
    tabSize: 8,
  }
});

const faqStyles = {
  // bgColor: 'white',
  // titleTextColor: 'blue',
  // rowTitleColor: 'blue',
  // rowContentColor: 'grey',
  // arrowColor: "red",
};

const faqConfig = {
  animate: true,
  // arrowIcon: 'V',
  // tabFocus: true
};

function FaqTrivia(props) {
  const { classes } = props;
  const title = 'Frequently Asked Questions';
  const basicConstructs = {
    title: 'Fireball Trivia Constructs',
    rows: [
      {
        title:
        <div className={classes.faqQuestion}>What is Fireball Trivia?</div>,
        content:
        <div className={classes.faqText}>
          Fireball Trivia is a multi-trivia, multiplayer Trivia application that lets you create, manage and launch Trivia engaging participants in real-time. <br/><br/>
          The basic constructs are Category, Question and Trivia. A Trivia is built by selecting a set of questions from a category with runtime parameters like time to respond for each question, optional winner collection settings and scheduling for an automatic launch.<br/><br/>
        </div>
      }, {
        title:
        <div className={classes.faqQuestion}>What is a Trivia Category?</div>,
        content:
        <div className={classes.faqText}>
          In Fireball Trivia, a question need to be associated with a category - a way to collect related questions on a topic as a group for reference and management. <br/><br/>
          A Category can be renamed or deleted (soft-delete)<br/><br/>
          <div className={classes.videContainer}>
            <h1>About Category</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={aboutCategoryVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      }, {
        title:
        <div className={classes.faqQuestion}>What is a Trivia Question?</div>,
        content:
        <div className={classes.faqText}>
          In Fireball Trivia, questions are the critical user interaction point. A Question consists of a <i>Category</i> that it belongs to (picked from the existing list of Categories), a <i>question text</i> and upto <i>four choices</i> to choose from along with a marked <i>correct answer</i>. Currently, only a single-choice mode is supported.<br/><br/>
          It is a best practice to check and make sure that a question does not exist, before creating a new one.<br/><br/>
          A Question can be modified or deleted (soft-delete)<br/><br/>
          <div className={classes.videContainer}>
            <h1>About Question</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={aboutQuestionVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      }, {
        title:
        <div className={classes.faqQuestion}>What is a Trivia?</div>,
        content:
        <div className={classes.faqText}>
          In Fireball Trivia, a Trivia captures the essence of the game with a set of questions and provides links and QR Codes to launch the game and controller applications.<br/><br/>
          It is a best practice to check and make sure that a question does not exist, before creating a new one.<br/><br/>
          A Trivia can be modified or deleted (soft-delete)<br/><br/>
          <div className={classes.videContainer}>
            <h1>About Trivia</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={aboutTriviaVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      }
    ],
  };

  const manageTrivia = {
    title: 'Manage Trivia',
    rows: [
      {
        title:
        <div className={classes.faqQuestion}>How to create a new Trivia?</div>,
        content:
        <div className={classes.faqText}>
          A Trivia can be created by specifying standard trivia configuration parameters, followed by population of questions from the desired category available for use in the Trivia Portal.<br/><br/>
          <div className={classes.videContainer}>
            <h1>Create Trivia</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={createTriviaVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      }, {
        title:
        <div className={classes.faqQuestion}>How to create a new Trivia by Clone option?</div>,
        content:
        <div className={classes.faqText}>
          An existing Trivia, either yours or from the shared list of Trivias can be cloned to create a new Trivia under your ownership. You will be able to set new configuration parameters (modify) on the Trivia including changing category, questions etc.,<br/><br/>
          When you clone a Trivia, all the run-time metrics if found will be reset so that you start with a brand new, ready to launch Trivia.<br/><br/>
          <div className={classes.videContainer}>
            <h1>Clone Trivia</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={cloneTriviaVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      }, {
        title:
        <div className={classes.faqQuestion}>How to start a Trivia?</div>,
        content:
        <div className={classes.faqText}>
          Launching or starting a Trivia game involves <br/>
          a) Launching the Trivia Controller for the chosen Trivia and<br/>
          b) Sharing the Trivia Game URL (or QR Code) with participants to launch the Trivia Game<br/><br/>
          Once the participants are set on the Trivia Game page, via the Controller you can start the game. This will run through the flow of allowing participants to join the game, broadcast questions in a timely manner, collecting responses for each questions and aggregating game metrics (both game level and user level metrics).<br/><br/>
          During the entire flow, the interaction between the Trivia Console (this app), Trivia Controller and the Trivia Game components utilize event-driven communication using Solace PubSub+ Broker.
          <div className={classes.videContainer}>
            <h1>Launch Trivia</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={startTriviaVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      },
    ],
  };

  const sampleRun = {
    title: 'Sample Trivia Run',
    rows: [
      {
        title:
        <div className={classes.faqQuestion}>How does the Controller and Game apps interact (or) What happens when you start a Trivia?</div>,
        content:
        <div className={classes.faqText}>
          As the Trivia owner, you can launch the Trivia Controller app and share the Trivia Game launch URL/QR code with the participants. Via the controller, you would be able to invite the participants who are waiting on the Trivia Game page to join the game, when ready you can start the game. That's pretty much it!<br/><br/>
          At this point, the game execution goes on an auto-pilot mode. The Controller would follow the process of<br/>
          ⇒ Send out invitation to the participants<br/>
          <span className={classes.tab4}/>⇐ Collect join confirmation from the participants and update participant count (broadcast the same as well)<br/>
          ⇒ Send an count-down start to participants<br/>
          ⇒ Start sending questions to the participants, exactly at the set time-limit/2 interval<br/>
          ⇒ Continue to send questions till all the questions are broadcast<br/>
          <span className={classes.tab4}/>⇐ As the participants make a selection on each of the questions, collect the responses and update the game and user-level metrics<br/>
          <span className={classes.tab4}/>⇒ Broadcast metrics to participants<br/>
          ⇒ When all questions are shared, send a game end event<br/>
          ⇒ Share metrics and ranking to each user<br/>
          ⇒ If collect winner option is set, send an event to trigger winner detail collection<br/>
          ⇒ Facilitate in-trivia chat, on-demand scorecard and leaderboard refresh requests<br/>
          <br/><br/>
          <div className={classes.videContainer}>
            <h1>Sample Trivia Run</h1>
            <div className={classes.container}>
              <ReactPlayer
                url={runTriviaVideo}
                playing={false}
                controls={true}
                loop={false}
                muted={true}
                playsinline={true}
              />
            </div>
          </div>
        </div>
      }
    ],
  };
  return (
    <div className={classes.table}>
      <PapperBlock
        whiteBg
        icon="menu_book"
        title={title}
        // desc={description}
      >
        <div className={classes.introText}>
          🔥📚🎉 Introducing "Fireball Trivia" - the ultimate event-driven trivia app that sparks your knowledge and ignites your competitive spirit! Immerse yourself in a dynamic and thrilling trivia experience, powered by the cutting-edge Solace PubSub+ Broker and its event-driven constructs. Answer questions in real-time, challenge participants, and explore a diverse range of trivia categories. Join "Fireball Trivia" and launch trivias now and let the fiery trivia adventure begin! Available as web and mobile-web applications. 🎉📚🔥
        </div>
        <Faq
          data={basicConstructs}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={manageTrivia}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={sampleRun}
          styles={faqStyles}
          config={faqConfig}
        />
      </PapperBlock>
    </div>
  );
}

FaqTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(FaqTrivia);
