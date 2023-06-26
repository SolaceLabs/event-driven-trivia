/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import classNames from 'classnames';
import { Divider } from '@material-ui/core';
import TriviaQuestionChooserForm from './TriviaQuestionChooserForm';
// import '../styles/question-tpl.css';

const api = new TriviaWrapper();

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
  choiceSelected: {
    padding: 5,
    backgroundColor: '#009191',
    color: '#fff'
  },
  choiceNormal: {
    backgroundColor: 'auto'
  },
  search: {
    margin: 5,
  },
  que_text: {
    textAlign: 'left',
    fontSize: '1em !important',
    fontWeight: '600  !important',
  },
  choiceMargin: {
    margin: 10
  }
});

function TriviaQuestionChooser(props) {
  const {
    step,
    onClose,
    category,
    classes,
    ...other
  } = props;
  const [options, setOptions] = React.useState([]);
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const radioGroupRef = React.useRef(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose(step, null);
  };

  const handleOk = () => {
    const q = options.find(el => el.id === value);
    onClose(step, q.question);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const searchQuestion = async (phrase) => {
    console.log('Searched for phrase', phrase);
    const response = await api.searchQuestions(phrase);
    if (response.success) {
      options.splice(0, options.length);
      response.questions.forEach(question => {
        options.push({ id: question._id, value: question.question, question });
      });
      setOptions(options);
      // eslint-disable-next-line no-shadow
      setRefresh((refresh) => refresh + 1);
    } else {
      console.log('error', response.message);
    }
  };

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth={true}
      maxWidth={'md'}
      TransitionProps={{
        onEntering: handleEntering
      }}
      aria-labelledby="confirmation-dialog-title"
      open={open}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">Select Question</DialogTitle>
      <div class={classes.search}>
        <TriviaQuestionChooserForm handleSubmit={(phrase) => searchQuestion(phrase)} />
      </div>
      <Divider/>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="ringtone"
          name="ringtone"
          value={value}
          onChange={handleChange}
        >
          {options.map((option) => (
            <div id={option.id} className={classes.choiceMargin}>
              <FormControlLabel value={option.id}
                key={option.id} control={<Radio />} label={<span className={classes.que_text}>{option.value}</span>} />
              <section>
                <div className={classNames(classes.choiceMargin, classes.option_list)}>
                  <div className={option.question.choice_1 === option.question.answer ? classes.choiceSelected : classes.choiceNormal}>
                    <span>{option.question.choice_1}</span>
                  </div>
                  {option.question.choice_2
                      && <div className={option.question.choice_2 === option.question.answer ? classes.choiceSelected : classes.choiceNormal}
                      ><span>{option.question.choice_2}</span>
                      </div>}
                  {option.question.choice_3
                      && <div className={option.question.choice_3 === option.question.answer ? classes.choiceSelected : classes.choiceNormald_3}>
                        <span>{option.question.choice_3}</span>
                      </div>}
                  {option.question.choice_4
                      && <div className={option.question.choice_4 === option.question.answer ? classes.choiceSelected : classes.choiceNormal}>
                        <span>{option.question.choice_4}</span>
                      </div>}
                </div>
              </section>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

TriviaQuestionChooser.propTypes = {
  onClose: PropTypes.func.isRequired,
  step: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
};

export default withStyles(styles)(TriviaQuestionChooser);
