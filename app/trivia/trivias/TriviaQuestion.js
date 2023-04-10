import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import Confetti from 'react-confetti';
import classNames from 'classnames';

import '../styles/question-tpl.css';

const styles = theme => ({
  root: {
    maxWidth: 800,
    flexGrow: 1,
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2),  0 6px 20px 0 rgba(0, 0, 0, 0.19)'
  },
  reviewRoot: {
    maxWidth: '75vw',
    maxHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
    top: '25%',
    left: '30%',
    transform: 'translate(-25%, -25%)',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2),  0 6px 20px 0 rgba(0, 0, 0, 0.19)'
  },
  header: {
    position: 'relative',
    zIndex: 2,
    // height: 70,
    flexGrow: 1,
    minHeight: 80,
    padding: '0 30px',
    borderRadius: '5px 5px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 3px 5px 1px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.common.white,
  },
  title: {
    marginLeft: theme.spacing(2),
    textAlign: 'left',
    maxWidth: 550,
    fontSize: 20,
    fontWeight: 600,
    color: '#0c46c3', // theme.palette.primary.main,
  },
  time_line: {
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#007bff',
  },
  hidden: {
    display: 'none',
  },
  scoreCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4),
    backgroundImage: `linear-gradient(-45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 33%, ${theme.palette.secondary.dark} 100%);`,
    textAlign: 'center',
    borderRadius: theme.rounded.small,
    '& h3': {
      color: theme.palette.common.white
    }
  },

});

const getWindowSize = () => {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
};

function TriviaQuestion(props) {
  const {
    classes,
    questionNo,
    totalQuestions,
    timeLimit,
    hits,
    preview,
    title,
    exitQuiz,
    completeQuiz,
    getQuestion,
    getNextQuestion,
    getPreviousQuestion,
    recordAnswerToQuestion,
  } = props;

  const [refresh, setRefresh] = useState(false);
  const [questionNumber, setQuestionNumber] = React.useState(questionNo);
  const [question, setQuestion] = React.useState(false);
  const [nextQuestion, setNextQuestion] = React.useState(false);
  const [selectedChoice, setSelectedChoice] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(timeLimit);
  const [forfeited, setForfeited] = React.useState(false);
  const [quizEnded, setQuizEnded] = React.useState(false);
  // const [correctAnswers, setCorrectAnswers] = React.useState(hits);

  useEffect(async () => {
    setQuestion(getQuestion(questionNumber));
    setNextQuestion(getNextQuestion(questionNumber));
  }, []);

  const choiceSelected = (choice) => {
    if (forfeited) { return; }

    setSelectedChoice(choice);
  };

  const loadNextQuestion = () => {
    if (selectedChoice) { recordAnswerToQuestion(questionNumber, selectedChoice); }

    if (questionNumber + 1 >= totalQuestions) {
      setRefresh(true);
      return;
    }

    const nextQ = questionNumber + 1;
    setQuestion(nextQuestion);
    setQuestionNumber(nextQ);
    setNextQuestion(getNextQuestion(nextQ));
    setSelectedChoice(false);
    setTimeLeft(timeLimit);
    setRefresh(true);
  };

  const onTimerCompleted = () => {
    if (questionNumber + 1 >= totalQuestions) {
      setRefresh(true);
      return;
    }

    if (!selectedChoice) setForfeited(true);

    loadNextQuestion();
  };

  const endTrivia = () => {
    if (selectedChoice) { recordAnswerToQuestion(questionNumber, selectedChoice); }

    completeQuiz();
    setQuizEnded(true);
  };

  if (quizEnded) {
    let count = 50;
    const success = Math.round((hits / totalQuestions) * 100);
    if (success > 50) count = 150;
    if (success > 70) count = 500;
    if (success > 95) count = 1000;

    const size = getWindowSize();
    return (
      <React.Fragment>
        <Confetti
          numberOfPieces={count}
          width={size.innerWidth}
          height={size.innerHeight}
        />
        <div className={classes.reviewRoot} align="center">
          <div className={'que_section'}>
            <Typography variant="h1" style={{ fontSize: '4rem' }} gutterBottom>
              You Scored
            </Typography>
            <div className={classes.scoreCard}>
              <Typography variant="h1" style={{
                fontSize: '5.5rem', color: 'white', fontWeight: 'bold', margin: 20
              }}>
                {hits} / {totalQuestions}
              </Typography>
            </div>
          </div>
          <footer style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '2rem'
          }}>
            Ready to GO!!
          </footer>
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className={classes.root} align="center" >
        <div className={classes.header}>
          <div className={'circle'}><p>{hits}</p></div>
          <div className={classes.title}>{title}</div>
          <CountdownCircleTimer
            key={questionNumber}
            isPlaying
            duration={timeLeft}
            colors={['#0c46c3']}
            size={64}
            // onUpdate={(remaining) => { console.log('Remaining: ' + remaining)}}
            onComplete={onTimerCompleted}
          >
            {({ remainingTime }) => remainingTime}
          </CountdownCircleTimer>
        </div>
        <div className={classes.time_line}></div>
        <div className={'que_section'}>
          <div className={'que_text'}>
            <span>{(questionNumber + 1) + '. ' + question.question} </span>
          </div>
          <div className={'option_list'}>
            <div
              className={classNames('option', (selectedChoice === question.choice_1) ? 'selected' : '')}
              onClick={() => choiceSelected(question.choice_1)}>
              <span>{question.choice_1}</span>
            </div>
            <div
              className={classNames('option', (selectedChoice === question.choice_2) ? 'selected' : '')}
              onClick={() => choiceSelected(question.choice_2)}>
              <span>{question.choice_2}</span>
            </div>
            {question.choice_3
              && <div
                className={classNames('option', (selectedChoice === question.choice_3) ? 'selected' : '')}
                onClick={() => choiceSelected(question.choice_3)}>
                <span>{question.choice_3}</span>
              </div>}
            {question.choice_4
              && <div
                className={classNames('option', (selectedChoice === question.choice_4) ? 'selected' : '')}
                onClick={() => choiceSelected(question.choice_4)}>
                <span>{question.choice_4}</span>
              </div>}
          </div>
        </div>
        <div className={classes.time_line}></div>

        <footer>
          <div className={'total_que'}>
            <span><p>{questionNumber + 1}</p> of <p>{totalQuestions}</p> Questions</span>
          </div>
          <button className={(questionNumber + 1 === totalQuestions) ? classes.hidden : '' }
            onClick={() => { loadNextQuestion(); }}>
            Next
          </button>
          <button className={questionNumber + 1 === totalQuestions ? '' : classes.hidden}
            onClick={() => { endTrivia(); }}>
            Complete
          </button>
        </footer>
      </div>
    </React.Fragment>
  );
}

TriviaQuestion.propTypes = {
  classes: PropTypes.object.isRequired,
  preview: PropTypes.bool,
  title: PropTypes.string.isRequired,
  questionNo: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  exitQuiz: PropTypes.func.isRequired,
  completeQuiz: PropTypes.func.isRequired,
  getQuestion: PropTypes.func.isRequired,
  getNextQuestion: PropTypes.func.isRequired,
  getPreviousQuestion: PropTypes.func.isRequired,
  recordAnswerToQuestion: PropTypes.func.isRequired,
};

export default withStyles(styles)(TriviaQuestion);
