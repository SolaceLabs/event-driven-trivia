/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import green from '@material-ui/core/colors/green';
import classNames from 'classnames';

function getSteps(count, current_questions, current_step) {
  let questions = [];
  for (let i = 1; i <= count; i++) {
    if (current_step === i - 1) questions = questions.concat([{ label: 'Question ' + i }]);
    else questions = questions.concat([{ label: 'Question ' + i, showQuestion: (current_questions && current_questions[i - 1]) }]);
  }
  return questions;
}

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  paper: {
    padding: 10
  },
  center: {
    textAlign: 'center'
  },
  left: {
    textAlign: 'left'
  },
  right: {
    textAlign: 'right'
  },
  middle: {
    verticalAlign: 'middle',
  },
  stepLabel: {
    cursor: 'pointer'
  },
  question_text: {
    padding: 5,
    paddingLeft: 0,
    fontSize: 16,
    fontWeight: 600
  },
  choiceSelected: {
    padding: 5,
    backgroundColor: '#009191',
    color: '#fff'
  },
  choiceNormal: {
    backgroundColor: 'auto'
  }

});

const shuffleArr = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [array[i], array[rand]] = [array[rand], array[i]];
  }
};

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const api = new TriviaWrapper();

function TriviaQuestionsStepper(props) {
  const {
    classes,
    category,
    questions,
    no_of_questions,
    mode,
    updateQuestions,
    updateResult,
  } = props;

  const [currentQuestions, setCurrentQuestions] = React.useState(questions);
  const [currentNoOfQuestions, setCurrentNoOfQuestions] = React.useState(no_of_questions);
  const [activeStep, setActiveStep] = React.useState(0);
  const [currentMode, setSelectionMode] = React.useState(mode);
  const [refresh, setRefresh] = React.useState(0);
  const steps = getSteps(no_of_questions, currentQuestions, activeStep);

  useEffect(async () => {
    console.log(no_of_questions, questions);
    if (no_of_questions && no_of_questions !== questions.length) {
      const params = new URLSearchParams();
      params.append('category', category);
      params.append('count', no_of_questions);
      const response = await api.getRandomQuestions(params);
      if (!response.success) {
        updateResult('error', response.message);
        setCurrentQuestions([]);
        updateQuestions(currentNoOfQuestions, currentQuestions, currentMode);
        return;
      }
      console.log('Questions', response.data);
      setCurrentQuestions(response.data);
      updateQuestions(response.data.length, response.data, currentMode);
    }
  }, [no_of_questions]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleShuffleChoices = () => {
    const question = currentQuestions[activeStep];
    const choices = [];
    let x; let
      y;
    if (question.choice_1) choices.push('choice_1');
    if (question.choice_2) choices.push('choice_2');
    if (question.choice_3) choices.push('choice_3');
    if (question.choice_4) choices.push('choice_4');
    shuffleArr(choices);
    const shuffledChoices = choices.map(choice => question[choice]);
    for (let i = 0; i < shuffledChoices.length; i++) { question['choice_' + (i + 1)] = shuffledChoices[i]; }

    setCurrentQuestions(currentQuestions);
    setActiveStep(activeStep);
    // eslint-disable-next-line no-shadow
    setRefresh((refresh) => refresh + 1);
  };

  const handleRandomizeQuestions = async () => {
    const params = new URLSearchParams();
    params.append('category', category);
    params.append('count', no_of_questions);
    const response = await api.getRandomQuestions(params);
    if (!response.success) {
      updateResult('error', response.message);
      setCurrentQuestions([]);
      updateQuestions(currentNoOfQuestions, currentQuestions, currentMode);
      return;
    }
    console.log('Questions', response.data);
    setCurrentQuestions(response.data);
    updateQuestions(response.data.length, response.data, currentMode);
    setActiveStep(0);
  };

  const handleShuffleQuestions = async () => {
    currentQuestions.sort(() => Math.random() - 0.5);
    setCurrentQuestions(currentQuestions);
    setActiveStep(activeStep);
    // eslint-disable-next-line no-shadow
    setRefresh((refresh) => refresh + 1);
  };

  const getStepContent = (step) => {
    if (!currentQuestions || !currentQuestions[step]) { return 'Hmm...'; }
    const question = currentQuestions[step];
    // return question.question;

    const selected_1 = question.choice_1 === question.answer ? classes.choiceSelected : classes.choiceNormal;
    const selected_2 = question.choice_2 === question.answer ? classes.choiceSelected : classes.choiceNormal;
    const selected_3 = question.choice_3 === question.answer ? classes.choiceSelected : classes.choiceNormal;
    const selected_4 = question.choice_4 === question.answer ? classes.choiceSelected : classes.choiceNormal;

    return (
      <section>
        <div className="que_text">
          <span>{question.question}</span>
        </div>
        <div className="option_list">
          <div className={selected_1}><span>{question.choice_1}</span></div>
          {question.choice_2
              && <div className={selected_2}><span>{question.choice_2}</span></div>}
          {question.choice_3
              && <div className={selected_3}><span>{question.choice_3}</span></div>}
          {question.choice_4
              && <div className={selected_4}><span>{question.choice_4}</span></div>}
        </div>
      </section>

    );
  };

  return (
    <div className={classes.root}>
      <Stepper nonLinear activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel className={classes.stepLabel} onClick={(e) => { setActiveStep(index); }} >
              {step.label}
              {step.showQuestion && <div className={classes.question_text}>{currentQuestions[index].question}</div>}
            </StepLabel>
            <StepContent>
              {getStepContent(index)}
              <div className={classes.actionsContainer}>
                <div>
                  {currentMode === 'SELECTIVE'
                    && <Button
                      // onClick={handleChooseQuestion} XX_DO_XX
                      className={classes.button}
                    >
                      CHOOSE QUESTION
                    </Button>
                  }
                  <Button
                    onClick={handleShuffleChoices}
                    className={classes.button}
                  >
                    SHUFFLE CHOICES
                  </Button>
                  <Button
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      <Paper square elevation={0} className={classes.resetContainer}>
        {steps.length > 0
          && <div><Typography>All steps completed, you're set!</Typography><br/></div>}

        {(currentMode === 'RANDOM' && steps.length > 0)
          && <div>
            <Typography>To randomize questions click on shuffle steps button</Typography>
            <Button onClick={handleRandomizeQuestions} className={classes.button} variant="contained" color="primary" >
              RANDOMIZE QUESTIONS
            </Button>
          </div>}
        {(steps.length > 0)
          && <div>
            <Typography>To shuffle questions click on shuffle questions button</Typography>
            <Button onClick={handleShuffleQuestions} className={classes.button} variant="contained" color="primary" >
              SHUFFLE QUESTIONS
            </Button>
          </div>}
      </Paper>
    </div>
  );
}

TriviaQuestionsStepper.propTypes = {
  questions: PropTypes.array.isRequired,
  no_of_questions: PropTypes.number.isRequired,
  updateQuestions: PropTypes.func.isRequired,
  updateResult: PropTypes.func.isRequired
};

export default withStyles(styles)(TriviaQuestionsStepper);
