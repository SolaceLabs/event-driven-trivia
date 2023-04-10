import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Field, reduxForm, change } from 'redux-form';
import Snackbar from '@material-ui/core/Snackbar';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import FormLabel from '@material-ui/core/FormLabel';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import {
  TextFieldRedux,
  SelectRedux
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
});

function QuestionsForm(props) {
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
    category: data ? data[1] : '',
    question: data ? data[2] : '',
    choice_1: data ? data[3] : '',
    choice_2: data ? data[4] : '',
    choice_3: data ? data[5] : '',
    choice_4: data ? data[6] : '',
    answer: data ? data[7] : '',
    selected: data ? 'choice_' + (data.findIndex(value => value === data[7]) - 2) : ''
  };

  init(initData);

  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    const response = await api.getCategories();
    if (!response.success) {
      updateResult('error', response.message);
      setCategories([]);
      return;
    }
    setCategories(response.data);
    console.log('Categories', response.data);
  }, []);

  const handleChangeOther = event => {
    const selection = event.target.value;
    if (currentValues[selection] === '') {
      updateResult('error', 'Empty choice cannot be selected');
      return;
    }

    props.dispatch(change('reduxFormDemo', 'selected', event.target.value));
    props.dispatch(change('reduxFormDemo', 'answer', currentValues[selection]));
  };

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
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
          <form onSubmit={handleSubmit}>
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
              <FormControl className={classes.field}>
                <InputLabel htmlFor="category">Category</InputLabel>
                <Field
                  name="category"
                  component={SelectRedux}
                  placeholder="Category"
                  fullWidth={true}
                >
                  {categories.map((category) => <MenuItem value={category.name}>{category.name}</MenuItem>)}
                </Field>
              </FormControl>
            </div>
            <div>
              <Field
                name="question"
                component={TextFieldRedux}
                placeholder="Question"
                label="Question"
                validate={required}
                required
                multiline={trueBool}
                minrows={4}
                className={classes.field}
              />
            </div>
            <div className={classes.field}>
              <FormLabel component="label">Choice 1</FormLabel>
              <div className={classes.inlineWrap}>
                <Radio
                  checked={props.currentValues.selected === 'choice_1'}
                  onChange={(e) => handleChangeOther(e)}
                  value={'choice_1'}
                  name="r3"
                />
                <Field
                  name="choice_1"
                  component={TextFieldRedux}
                  placeholder="Choice 1"
                  label="Choice 1"
                  validate={required}
                  required
                  className={classes.field}
                />
              </div>
            </div>
            <div className={classes.field}>
              <FormLabel component="label">Choice 2</FormLabel>
              <div className={classes.inlineWrap}>
                <Radio
                  checked={props.currentValues.selected === 'choice_2'}
                  onChange={(e) => handleChangeOther(e)}
                  value={'choice_2'}
                  name="r4"
                />
                <Field
                  name="choice_2"
                  component={TextFieldRedux}
                  placeholder="Choice 2"
                  label="Choice 2"
                  validate={required}
                  required
                  className={classes.field}
                />
              </div>
            </div>
            <div className={classes.field}>
              <FormLabel component="label">Choice 3</FormLabel>
              <div className={classes.inlineWrap}>
                <Radio
                  checked={props.currentValues.selected === 'choice_3'}
                  onChange={(e) => handleChangeOther(e)}
                  value={'choice_3'}
                  name="r5"
                />
                <Field
                  name="choice_3"
                  component={TextFieldRedux}
                  placeholder="Choice 3"
                  label="Choice 3"
                  className={classes.field}
                />
              </div>
            </div>
            <div className={classes.field}>
              <FormLabel component="label">Choice 4</FormLabel>
              <div className={classes.inlineWrap}>
                <Radio
                  checked={props.currentValues.selected === 'choice_4'}
                  onChange={(e) => handleChangeOther(e)}
                  value={'choice_4'}
                  name="r6"
                />
                <Field
                  name="choice_4"
                  component={TextFieldRedux}
                  placeholder="Choice 4"
                  label="Choice 4"
                  className={classes.field}
                />
              </div>
            </div>
            <div>
              <Field
                name="answer"
                component={TextFieldRedux}
                type="hidden"
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <Field
                name="selected"
                component={TextFieldRedux}
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

QuestionsForm.propTypes = {
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
  form: 'reduxFormDemo',
  enableReinitialize: true,
})(QuestionsForm);

const FormInit = connect(
  state => {
    const initialValues = state?.initval?.formValues;
    const currentValues = {
      id: state?.form?.reduxFormDemo?.values?.id,
      category: state?.form?.reduxFormDemo?.values?.category,
      question: state?.form?.reduxFormDemo?.values?.question,
      choice_1: state?.form?.reduxFormDemo?.values?.choice_1,
      choice_2: state?.form?.reduxFormDemo?.values?.choice_2,
      choice_3: state?.form?.reduxFormDemo?.values?.choice_3,
      choice_4: state?.form?.reduxFormDemo?.values?.choice_4,
      answer: state?.form?.reduxFormDemo?.values?.answer,
      selected: state?.form?.reduxFormDemo?.values?.selected,
    };
    return {
      initialValues,
      currentValues
    };
  },
  mapDispatchToProps,
)(ReduxFormMapped);

export default withStyles(styles)(FormInit);
