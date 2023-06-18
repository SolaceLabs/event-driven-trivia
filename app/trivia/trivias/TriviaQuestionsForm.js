/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import ListItemText from '@material-ui/core/ListItemText';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import classNames from 'classnames';
import SnackBarWrapper from '../common/SnackBarWrapper';
import TriviaQuestionsStepper from './TriviaQuestionsStepper';

import '../styles/question-tpl.css';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
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
  formControl: {
    minWidth: 190,
  },
  divider: {
    display: 'block',
    margin: `${theme.spacing(3)}px 0`,
  },
  sliderControl: {
    width: '90%',
    height: theme.spacing(3),
    marginTop: 35,
  }

});

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function TriviaQuestionsForm(props) {
  const {
    classes,
    saveQuestions,
    data,
    open,
    closeModal
  } = props;

  const [scroll, setScroll] = React.useState('paper');
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [timeLimit, setTimeLimit] = React.useState(30);
  const [valueRange, setValueRange] = React.useState([10, 90]);

  const [dataState, setDataState] = useState({
    id: data[0],
    name: data[1],
    description: data[2],
    audience: data[3],
    category: data[4],
    questions: data[5],
    scheduled: data[6],
    start_at: data[7],
    close_at: data[8],
    status: data[9],
    mode: data[10],
    no_of_questions: data[11],
    time_limit: data[12],
  });

  const countNames = {
    0: '-- Select --',
    // 1: 'One',
    // 2: 'Two',
    3: 'Three',
    4: 'Four',
    5: 'Five',
    6: 'Six',
    7: 'Seven',
    8: 'Eight',
    9: 'Nine',
    10: 'Ten'
  };

  const marks = [];
  marks.push({ value: 15, label: '15s' });
  marks.push({ value: 30, label: '30s' });
  marks.push({ value: 60, label: '60s' });
  marks.push({ value: 90, label: '90s' });

  useEffect(async () => {
    console.log(dataState);
  }, []);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = () => {
    console.log(dataState);
    let msg;
    if (dataState.no_of_questions === 0) {
      msg = 'Complete the question selection';
    } else if (dataState.no_of_questions && (!dataState.questions || dataState.questions.length < dataState.no_of_questions)) {
      msg = 'Missing question(s)';
    } else if (!dataState.mode) {
      msg = 'Invalid question selection mode';
    }
    if (msg) {
      updateResult('error', msg);
      return;
    }

    dataState.questions.splice(dataState.no_of_questions);
    saveQuestions(dataState);
    closeModal();
  };

  const updateQuestions = (no_of_questions, questions, mode) => {
    setDataState({
      ...dataState,
      no_of_questions,
      questions,
      mode
    });
  };

  const handleClose = () => {
    closeModal();
  };

  const handleNoOfQuestionsChange = event => {
    console.log(event.target.name, event.target.value);
    setDataState({
      ...dataState,
      no_of_questions: event.target.value
    });
  };

  const handleQuestionsMode = (event, newMode) => {
    console.log(newMode);
    setDataState({
      ...dataState,
      mode: newMode
    });
  };

  const handleTimeLimitChange = (event, newValue) => {
    console.log(newValue);
    setDataState({
      ...dataState,
      time_limit: newValue
    });
  };

  const valueText = (value) => `${value} Seconds`;

  return (
    <div>
      <Dialog fullScreen open={open} onClose={handleClose}
        TransitionComponent={Transition}
        scroll={scroll} >
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={openStyle}
          autoHideDuration={6000}
          onClose={() => handleCloseStyle()}
        >
          <SnackBarWrapper
            onClose={() => handleCloseStyle()}
            variant={variant}
            message={message}
            className={classes.margin}
          />
        </Snackbar>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Build Trivia
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent dividers={scroll === 'paper'}>
          <Grid container alignItems="flex-start" direction="row" spacing={2}>
            <Grid item xs={6} sm={4}>
              <Paper className={classes.paper}>
                <ListItemText
                  primary="Title"
                  secondary={dataState.name} />
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Paper className={classes.paper}>
                <ListItemText
                  primary="Audience"
                  secondary={dataState.audience} />
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Paper className={classes.paper}>
                <ListItemText
                  primary="Category"
                  secondary={dataState.category} />
              </Paper>
            </Grid>
          </Grid><br/>

          <Paper className={classNames(classes.paper, classes.middle)}>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={8}>
                <ListItemText className={classes.left} primary="No. of Questions" secondary="How many questions you want in the trivia?" />
              </Grid>
              <Grid className={classes.middle} item sm={6} xs={8}>
                <FormControl className={classes.field}>
                  <InputLabel htmlFor="no_of_questions">No. of Questions</InputLabel>
                  <Select
                    placeholder="No. of Questions"
                    value={dataState.no_of_questions}
                    onChange={handleNoOfQuestionsChange}
                    className={classes.formControl}
                    inputProps={{
                      name: 'no_of_questions',
                      id: 'no_of_questions',
                    }}
                  >
                    <MenuItem value={0}>{countNames[0]}</MenuItem>
                    {/* <MenuItem value={1}>{countNames[1]}</MenuItem>
                    <MenuItem value={2}>{countNames[2]}</MenuItem> */}
                    <MenuItem value={3}>{countNames[3]}</MenuItem>
                    <MenuItem value={4}>{countNames[4]}</MenuItem>
                    <MenuItem value={5}>{countNames[5]}</MenuItem>
                    <MenuItem value={6}>{countNames[6]}</MenuItem>
                    <MenuItem value={7}>{countNames[7]}</MenuItem>
                    <MenuItem value={8}>{countNames[8]}</MenuItem>
                    <MenuItem value={9}>{countNames[9]}</MenuItem>
                    <MenuItem value={10}>{countNames[10]}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={8}>
                <ListItemText className={classes.left} primary="Time Limit (seconds)" secondary="How much time you want to give for each question?" />
              </Grid>
              <Grid className={classes.middle} item sm={6} xs={8}>
                <FormControl className={classes.sliderControl}>
                  <Slider
                    value={dataState.time_limit}
                    defaultValue={30}
                    getAriaValueText={valueText}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="on"
                    step={5}
                    min={15}
                    max={90}
                    marks
                    onChange={handleTimeLimitChange}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={8}>
                <ListItemText className={classes.left} primary="Mode of Generation" secondary="Choose how you want to build questions?" />
              </Grid>
              <Grid className={classes.middle} item sm={6} xs={8}>
                <ToggleButtonGroup value={dataState.mode} exclusive disabled onChange={handleQuestionsMode}>
                  <ToggleButton value="RANDOM">
                    RANDOM
                  </ToggleButton>
                  <ToggleButton value="SELECTIVE" disabled>
                    SELECTIVE
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>
          <Divider className={classes.divider} />
          <Paper className={classNames(classes.paper, classes.middle)}>
            <Grid container spacing={3}>
              <TriviaQuestionsStepper
                category={dataState.category}
                no_of_questions={dataState.no_of_questions}
                questions={dataState.questions}
                mode={dataState.mode}
                updateQuestions={updateQuestions}
                updateResult={updateResult}
              />
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

TriviaQuestionsForm.propTypes = {
  classes: PropTypes.object.isRequired,
  saveQuestions: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default withStyles(styles)(TriviaQuestionsForm);
