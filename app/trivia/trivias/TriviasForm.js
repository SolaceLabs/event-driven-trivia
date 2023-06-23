/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Field, reduxForm, change } from 'redux-form';
import Snackbar from '@material-ui/core/Snackbar';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import SharedIcon from '@material-ui/icons/FolderShared';
import MenuItem from '@material-ui/core/MenuItem';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import {
  TextFieldRedux,
  SwitchRedux,
  SelectRedux,
} from 'enl-components/Forms/ReduxFormMUI';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import { initAction, clearAction } from 'enl-redux/actions/reduxFormActions';
import SnackBarWrapper from '../common/SnackBarWrapper';

const api = new TriviaWrapper();

// validation functions
const required = value => (value == null ? 'Required' : undefined);

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 30
  },
  field: {
    width: '100%',
    // marginBottom: 20
  },
  fieldBasic: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10
  },
  buttonBasic: {
    // marginBottom: 20,
    marginTop: 10
  },
  stepperBasic: {
    marginBottom: 20,
    marginTop: 40
  },
  inlineWrap: {
    display: 'flex',
    flexDirection: 'row'
  },
  buttonInit: {
    margin: theme.spacing(4),
    textAlign: 'center'
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
  picker: {
    margin: `${theme.spacing(3)}px 5px`,
  },
});

const itemQuestions = [
  { _id: 1, name: 'One' },
  { _id: 2, name: 'Two' },
  { _id: 3, name: 'Three' },
  { _id: 4, name: 'Four' },
  { _id: 5, name: 'Five' },
  { _id: 6, name: 'Six' },
  { _id: 7, name: 'Seven' },
  { _id: 8, name: 'Eight' },
  { _id: 9, name: 'Nine' },
  { _id: 10, name: 'Ten' },
  { _id: 11, name: 'Eleven' },
  { _id: 12, name: 'Twelve' },
];
const itemWinners = [
  { _id: 1, name: 'One' },
  { _id: 2, name: 'Two' },
  { _id: 3, name: 'Three' },
  { _id: 4, name: 'Four' },
  { _id: 5, name: 'Five' }
];
function TriviasForm(props) {
  const {
    classes,
    handleSubmit,
    pristine,
    reset,
    submitting,
    data,
    init,
    clear,
    currentValues
  } = props;

  const trueBool = true;
  const initData = {
    id: data ? data[0] : '',
    name: data ? data[1] : '',
    description: data ? data[2] : '',
    audience: data ? data[3] : '',
    category: data ? data[4] : '',
    questions: data ? data[5] : [],
    scheduled: data ? (data[6] ? data[6] : false) : false,
    start_at: data ? data[7] : '',
    close_at: data ? data[8] : '',
    status: data ? data[9] : 'NEW',
    mode: data ? data[10] : 'RANDOM',
    no_of_questions: data ? data[11] : '',
    time_limit: data[12] ? data[12] : 15,
    hash: data[13] ? data[13] : '',
    deleted: data ? (data[14] ? data[14] : false) : false,
    collect_winners: data ? (data[15] ? data[15] : false) : false,
    no_of_winners: data ? data[16] : '',
  };

  init(initData);

  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [scheduled, setScheduled] = useState(initData.scheduled);
  const [startDate, setSelectedStartDate] = useState(initData.start_at ? initData.start_at : new Date());
  const [closeDate, setSelectedCloseDate] = useState(initData.close_at ? initData.close_at : new Date());
  const [collectWinners, setCollectWinners] = useState(initData.collect_winners);
  const [collectWinnersCount, setCollectWinnersCount] = useState(initData.no_of_winners ? initData.no_of_winners : 3);
  const [countQuestions, setCountQuestions] = useState([]);
  const [countWinners, setCountWinners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [timeLimit, setTimeLimit] = useState(initData.time_limit);
  const [hash, setHash] = useState(initData.hash);

  const marks = [];
  marks.push({ value: 15, label: '15s' });
  marks.push({ value: 30, label: '30s' });
  marks.push({ value: 60, label: '60s' });
  marks.push({ value: 90, label: '90s' });

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    const params = new URLSearchParams();
    params.append('show_deleted', false);
    const response = await api.getCategories(params);
    if (!response.success) {
      updateResult('error', response.message);
      setCategories([]);
      return;
    }
    // setCategories([{ _id: 0, name: '-- I opt for manual Category/Question creation --' }].concat(response.data));
    setCategories(response.data);
    setCountWinners(itemWinners);
    setCountWinners(itemQuestions);
    console.log('Categories', response.data);
    props.dispatch(change('reduxTriviaForm', 'hash', hash));
  }, []);

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const setScheduledStart = (date) => {
    const utils = new MomentUtils();
    setSelectedStartDate(date);
    const closeAt = utils.addDays(date, 1);
    setSelectedCloseDate(closeAt);

    props.dispatch(change('reduxTriviaForm', 'start_at', date));
    props.dispatch(change('reduxTriviaForm', 'close_at', closeAt));
  };

  const setScheduledClose = (date) => {
    setSelectedCloseDate(date);
    props.dispatch(change('reduxTriviaForm', 'close_at', date));
  };

  const handleScheduledChange = () => {
    // eslint-disable-next-line no-shadow
    setScheduled(scheduled => !scheduled);
    if (scheduled) {
      props.dispatch(change('reduxTriviaForm', 'start_at', ''));
      props.dispatch(change('reduxTriviaForm', 'close_at', ''));
      props.dispatch(change('reduxTriviaForm', 'status', 'SUBMITTED'));
    } else {
      props.dispatch(change('reduxTriviaForm', 'start_at', startDate));
      props.dispatch(change('reduxTriviaForm', 'close_at', closeDate));
      props.dispatch(change('reduxTriviaForm', 'status', 'SCHEDULED'));
    }
  };

  const handleCollectWinnersChange = () => {
    // eslint-disable-next-line no-shadow
    setCollectWinners(collectWinners => !collectWinners);
    if (collectWinners) {
      props.dispatch(change('reduxTriviaForm', 'collect_winners', 0));
      props.dispatch(change('reduxTriviaForm', 'no_of_winners', ''));
    } else {
      props.dispatch(change('reduxTriviaForm', 'collect_winners', collectWinnersCount));
      props.dispatch(change('reduxTriviaForm', 'no_of_winners', '3'));
    }
  };

  const valueText = (value) => `${value} Seconds`;

  const handleTimeLimitChange = (event, newValue) => {
    console.log(newValue);
    props.dispatch(change('reduxTriviaForm', 'time_limit', newValue));
  };

  const validatedSubmit = (values) => {
    if (values.no_of_questions !== initData.no_of_questions || values.category !== initData.category) {
      values.questions = [];
      values.status = 'NEW';
    }

    if (!values.scheduled) {
      values.start_at = null;
      values.close_at = null;
    }

    props.onSubmit(values);
  };

  return (
    <Grid container spacing={3} alignItems="flex-start" direction="row" justifyContent="center">
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
      <Grid item xs={12} md={6}>
        <Paper className={classes.root}>
          <form onSubmit={handleSubmit(validatedSubmit)}>
            <div>
              <Field
                name="id"
                component={TextFieldRedux}
                validate={required}
                type="hidden"
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <Field
                name="name"
                component={TextFieldRedux}
                placeholder="Name"
                label="Name"
                validate={required}
                required
                className={classes.field}
              />
            </div>
            <div>
              <Field
                name="description"
                component={TextFieldRedux}
                placeholder="Description"
                label="Description"
                validate={required}
                required
                multiline={trueBool}
                minrows={4}
                className={classes.field}
              />
            </div>
            <div>
              <FormControl className={classes.field}>
                <InputLabel htmlFor="audience">Audience</InputLabel>
                <Field
                  name="audience"
                  component={SelectRedux}
                  placeholder="Audience"
                  label="Audience"
                  required
                  validate={required}
                  fullWidth={true}
                >
                  <MenuItem value={'General'}>General</MenuItem>
                  <MenuItem value={'Conference'}>Conference</MenuItem>
                  <MenuItem value={'Meetup'}>Meetup</MenuItem>
                  <MenuItem value={'Workshop'}>Workshop</MenuItem>
                  <MenuItem value={'Test'}>Test</MenuItem>
                </Field>
              </FormControl>
            </div>
            <div className={classes.stepperBasic}>
              <FormControl className={classes.field}>
                <InputLabel htmlFor="time_limit">Time Limit</InputLabel>
                <Slider
                  name="time_limit"
                  defaultValue={timeLimit}
                  getAriaValueText={valueText}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="on"
                  required
                  step={5}
                  min={5}
                  max={90}
                  marks
                  onChange={handleTimeLimitChange}
                />
              </FormControl>
            </div>
            <div>
              <FormControl className={classes.field}>
                <InputLabel htmlFor="category">Category</InputLabel>
                <Field
                  id="category"
                  name="category"
                  component={SelectRedux}
                  placeholder="Category"
                  required
                  fullWidth={true}
                >
                  {categories.map((category) => <MenuItem key={category._id} value={category.name}>{category.name}</MenuItem>)}
                </Field>
              </FormControl>
            </div>

            <div>
              <FormControl className={classes.field}>
                <InputLabel htmlFor="no_of_questions">No. of Questions</InputLabel>
                <Field
                  id="no_of_questions"
                  name="no_of_questions"
                  component={SelectRedux}
                  placeholder="No. of Questions"
                  required
                  fullWidth={true}
                >
                  {itemQuestions.map((count) => <MenuItem key={count._id} value={count._id}>{count.name}</MenuItem>)}
                </Field>
              </FormControl>
            </div>

            <div className={classes.fieldBasic}>
              <FormControlLabel
                control={<Field name="collect_winners" onChange={handleCollectWinnersChange} component={SwitchRedux} />}
                label="Collect Winner Details" />
              <div className={classes.inlineWrap}>
                <FormControl className={classes.field}>
                  <InputLabel htmlFor="no_of_winners">No. of Winners</InputLabel>
                  <Field
                    id="no_of_winners"
                    name="no_of_winners"
                    component={SelectRedux}
                    placeholder="No. of Winners"
                    fullWidth={true}
                    disabled={!currentValues.collect_winners}
                  >
                    {itemWinners.map((count) => <MenuItem key={count._id} value={count._id}>{count.name}</MenuItem>)}
                  </Field>
                </FormControl>
              </div>
            </div>

            <div className={classes.fieldBasic}>
              <FormControlLabel
                control={<Field name="scheduled" onChange={handleScheduledChange} component={SwitchRedux} />}
                label="Schedule Trivia" />
              <div className={classes.inlineWrap}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <DateTimePicker
                    name="start_time_picker"
                    value={startDate}
                    disablePast
                    onChange={setScheduledStart}
                    label="Start at"
                    style={{ width: '50%', paddingRight: 10 }}
                    validate={required}
                    required
                    disabled={!currentValues.scheduled}
                  />
                </MuiPickersUtilsProvider>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <DateTimePicker
                    name="close_time_picker"
                    value={closeDate}
                    disablePast
                    onChange={setScheduledClose}
                    label="Close at"
                    style={{ width: '50%' }}
                    validate={required}
                    required
                    disabled={!currentValues.scheduled}
                  />
                </MuiPickersUtilsProvider>
              </div>
            </div>

            <div className={classes.buttonBasic}>
              <Field
                name="status"
                component={TextFieldRedux}
                validate={required}
                type="hidden"
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <Button variant="contained" color="secondary" type="submit" disabled={submitting}>
                  Submit
              </Button>
              <Button
                type="button"
                disabled={pristine || submitting}
                onClick={reset}
              >
                  Reset
              </Button>
            </div>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

TriviasForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  init: bindActionCreators(initAction, dispatch),
  clear: () => dispatch(clearAction),
});

const ReduxFormMapped = reduxForm({
  form: 'reduxTriviaForm',
  enableReinitialize: true,
})(TriviasForm);

const FormInit = connect(
  state => {
    const initialValues = state?.initval?.formValues;
    const currentValues = {
      id: state?.form?.reduxTriviaForm?.values?.id,
      name: state?.form?.reduxTriviaForm?.values?.name,
      description: state?.form?.reduxTriviaForm?.values?.description,
      audience: state?.form?.reduxTriviaForm?.values?.audience,
      category: state?.form?.reduxTriviaForm?.values?.category,
      questions: state?.form?.reduxTriviaForm?.values?.questions,
      no_of_questions: state?.form?.reduxTriviaForm?.values?.no_of_questions,
      scheduled: state?.form?.reduxTriviaForm?.values?.scheduled,
      start_at: state?.form?.reduxTriviaForm?.values?.start_at,
      close_at: state?.form?.reduxTriviaForm?.values?.close_at,
      status: state?.form?.reduxTriviaForm?.values?.status,
      mode: state?.form?.reduxTriviaForm?.values?.mode,
      collect_winners: state?.form?.reduxTriviaForm?.values?.collect_winners,
      no_of_winners: state?.form?.reduxTriviaForm?.values?.no_of_winners,
    };

    return {
      initialValues,
      currentValues
    };
  },
  mapDispatchToProps,
)(ReduxFormMapped);

export default withStyles(styles)(FormInit);
