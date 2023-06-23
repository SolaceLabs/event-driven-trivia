/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import { Divider } from '@material-ui/core';
import TriviaQuestionChooserForm from './TriviaQuestionChooserForm';

const api = new TriviaWrapper();

export default function TriviaQuestionChooser(props) {
  const {
    step,
    onClose,
    category,
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
      <TriviaQuestionChooserForm handleSubmit={(phrase) => searchQuestion(phrase)} />
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
            <FormControlLabel value={option.id} key={option.id} control={<Radio />} label={option.value} />
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
