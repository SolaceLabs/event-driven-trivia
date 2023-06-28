import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';
import InputAdornment from '@material-ui/core/InputAdornment';

const styles = theme => ({
  searchCategory: {
    display: 'block',
    marginBottom: 10,
    '& > div': {
      width: '100%',
      border: 'none',
      // borderRadius: 6,
      // boxShadow: theme.shadows[2],
      background: theme.palette.background.paper,
      // '&:after': {
      //   borderRadius: 6
      // }
    },
    '& input': {
      fontSize: 28,
      color: theme.palette.text.primary,
      padding: theme.spacing(2),
      // borderRadius: 2,
      [theme.breakpoints.down('md')]: {
        fontSize: 18,
      }
    },
    '& p': {
      fontSize: 11,
      color: theme.palette.text.secondary,
      padding: 4,
      [theme.breakpoints.up('sm')]: {
        textAlign: 'left',
      },
    }
  },
  hint: {
    opacity: 0.6,
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
});

function TriviaQuestionChooserForm(props) {
  const { classes, handleSubmit } = props;
  const [title, setTitle] = useState('');

  const clearInput = () => setTitle('');
  const handleChange = (event) => setTitle(event.target.value);
  const handleKeyUp = (event) => {
    if (event.keyCode === 27) clearInput();
  };
  const handleSubmitForm = (event) => {
    event.preventDefault();
    const titleString = title.trim();
    if (titleString.length) handleSubmit(titleString);
    clearInput();
  };

  return (
    <form onSubmit={handleSubmitForm} noValidate>
      <FormControl fullWidth className={classes.searchCategory}>
        <Input
          autoComplete="off"
          maxLength="64"
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder={'Type words or phrases in your question and enter to submit...'}
          type="text"
          value={title}
        />
      </FormControl>
    </form>
  );
}

TriviaQuestionChooserForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(TriviaQuestionChooserForm);
