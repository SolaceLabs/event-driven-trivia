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
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import classNames from 'classnames';
import SnackBarWrapper from '../common/SnackBarWrapper';
import TriviaQuestion from './TriviaQuestion';

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
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
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
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.secondary.dark,
    backgroundColor: theme.palette.primary.light,
  },
  row: {
    display: 'flex'
  },
  column: {
    flexBasis: '33.33%',
    overflow: 'hidden',
    paddingRight: '0 !important',
    paddingTop: 5,
    marginLeft: 20
  },
  leftAlignedColumn: {
    flex: '50%',
    padding: 10,
    textAlign: 'left',
    borderLeft: `1px dotted ${theme.palette.primary.main}`,
    borderBottom: `1px dotted ${theme.palette.primary.main}`,
    // display: 'flex',
    alignItems: 'center',
  },
  rightAlignedColumn: {
    // flex: '50%',
    width: '33%',
    padding: 10,
    textAlign: 'right',
    // borderRight: `1px dotted ${theme.palette.primary.main}`,
    borderBottom: `1px dotted ${theme.palette.primary.main}`,
    // display: 'flex',
    alignItems: 'center',
  },
  primary: {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
});

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function TriviaPreview(props) {
  const {
    classes,
    data,
    open,
    closeModal
  } = props;

  const [scroll, setScroll] = React.useState('paper');
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [startedPreview, setPreviewStarted] = useState(false);
  const [startedQuiz, setQuizStarted] = useState(false);
  const [refresh, setRefresh] = React.useState(0);

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
    hash: data[13],
    hits: 0,
    answered: false,
    selected: false
  });

  useEffect(async () => {
    console.log(dataState);
  }, []);

  const startPreview = () => {
    setPreviewStarted(true);
    setRefresh((_refresh) => _refresh + 1);
  };

  const startQuiz = () => {
    setPreviewStarted(false);
    setQuizStarted(true);
    setRefresh((_refresh) => _refresh + 1);
  };

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleClose = () => {
    closeModal();
  };

  const exitQuiz = () => {
    closeModal();
  };

  const completeQuiz = () => {
    // record info
  };

  const getQuestion = (qno) => {
    const question = dataState?.questions[qno];
    if (!question) return false;
    return { ...question, answer: undefined };
  };

  const getNextQuestion = (qno) => {
    const question = dataState?.questions[qno + 1];
    if (!question) return false;
    return { ...question, answer: undefined };
  };

  const getPreviousQuestion = (qno) => {
    const question = dataState?.questions[qno - 1];
    if (!question) return false;
    return { ...question, answer: undefined };
  };

  const recordAnswerToQuestion = (qno, answer) => {
    const question = dataState?.questions[qno];
    if (!question) return false;
    question.answered = true;
    question.selected = answer;
    setDataState({ ...dataState, hits: dataState.hits + (answer === question.answer ? 1 : 0) });
    return true;
  };

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
              Preview Trivia
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent dividers={scroll === 'paper'}>
          {!startedPreview
            && <div className={classes.root} align="center" >
              <Grid container alignItems="center" justifyContent="center">
                <Grid item xs={12} sm={10} >
                  <Table className={classNames(classes.table, classes.stripped)}>
                    <TableBody>
                      <TableRow>
                        <TableCell className={classes.rightAlignedColumn}><ListItemText primary="Name"/></TableCell>
                        <TableCell className={classes.leftAlignedColumn}>
                          <Typography variant="subtitle">{dataState.name}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.rightAlignedColumn}><ListItemText primary="Description"/></TableCell>
                        <TableCell className={classes.leftAlignedColumn}>
                          <Typography variant="subtitle">{dataState.description}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.rightAlignedColumn}><ListItemText primary="Audience"/></TableCell>
                        <TableCell className={classes.leftAlignedColumn}>
                          <Typography variant="subtitle">{dataState.audience}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.rightAlignedColumn}><ListItemText primary="Category"/></TableCell>
                        <TableCell className={classes.leftAlignedColumn}>
                          <Typography variant="subtitle">{dataState.category}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.rightAlignedColumn}><ListItemText primary="No. of Questions"/></TableCell>
                        <TableCell className={classes.leftAlignedColumn}>
                          <Typography variant="subtitle">{dataState.no_of_questions}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.rightAlignedColumn}><ListItemText primary="Time Limit (secs)"/></TableCell>
                        <TableCell className={classes.leftAlignedColumn}>
                          <Typography variant="subtitle">{dataState.time_limit}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>

                <Divider/>
                <Grid item xs={12}>
                  <Button onClick={startPreview}>
                    <Paper className={classes.paper}>Start Preview</Paper>
                  </Button>
                </Grid>
              </Grid>
            </div>
          }

          {startedPreview
          && <TriviaQuestion
            preview={true}
            title={dataState.name}
            questionNo={0}
            totalQuestions={dataState.questions.length}
            timeLimit={dataState.time_limit}
            hits={dataState.hits}
            exitQuiz={setOpen}
            completeQuiz={completeQuiz}
            getQuestion={getQuestion}
            getNextQuestion={getNextQuestion}
            getPreviousQuestion={getPreviousQuestion}
            recordAnswerToQuestion={recordAnswerToQuestion}
          />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

TriviaPreview.propTypes = {
  classes: PropTypes.object.isRequired,
  saveQuestions: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default withStyles(styles)(TriviaPreview);
