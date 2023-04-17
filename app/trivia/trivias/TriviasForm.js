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
import { CheckBox } from '@material-ui/icons';
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
    marginBottom: 20
  },
  fieldBasic: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10
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

const countNames = {
  0: '-- Select --',
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten'
};

const countWinners = {
  0: '-- Select --',
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
};

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
    no_of_questions: data ? data[11] : 0,
    time_limit: data[12] ? data[12] : 30,
    hash: data[13] ? data[13] : '',
    deleted: data ? (data[14] ? data[14] : false) : false,
    collect_winners: data ? (data[15] ? data[15] : false) : false,
    no_of_winners: data ? data[16] : 0,
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
    setCategories(response.data);
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
      props.dispatch(change('reduxTriviaForm', 'status', 'NEW'));
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
    } else {
      props.dispatch(change('reduxTriviaForm', 'collect_winners', collectWinnersCount));
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
            <div>
              <FormControl className={classes.field}>
                <InputLabel htmlFor="time_limit">Time Limit</InputLabel>
                <Slider
                  name="time_limit"
                  defaultValue={timeLimit}
                  getAriaValueText={valueText}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="on"
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
                  name="category"
                  component={SelectRedux}
                  placeholder="Category"
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
                  name="no_of_questions"
                  component={SelectRedux}
                  placeholder="No. of Questions"
                  fullWidth={true}
                >
                  {Object.entries(countNames).map((el) => <MenuItem value={el[0]}>{el[1]}</MenuItem>)}
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
                    name="no_of_winners"
                    component={SelectRedux}
                    placeholder="No. of Winners"
                    fullWidth={true}
                    disabled={!currentValues.collect_winners}
                  >
                    {Object.entries(countWinners).map((el) => <MenuItem value={el[0]}>{el[1]}</MenuItem>)}
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
                    disabled={!currentValues.scheduled}
                  />
                </MuiPickersUtilsProvider>
              </div>
            </div>

            <div>
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
