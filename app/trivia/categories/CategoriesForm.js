import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Field, reduxForm, change } from 'redux-form';
import Snackbar from '@material-ui/core/Snackbar';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import FormLabel from '@material-ui/core/FormLabel';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import {
  TextFieldRedux,
  CheckboxRedux
} from 'enl-components/Forms/ReduxFormMUI';
import { initAction, clearAction } from 'enl-redux/actions/reduxFormActions';
import SnackBarWrapper from '../common/SnackBarWrapper';

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

function CategoriesForm(props) {
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
  };

  init(initData);

  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');

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
                // placeholder="Id"
                // label="Id"
                validate={required}
                type="hidden"
                // className={classes.field}
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

CategoriesForm.propTypes = {
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
})(CategoriesForm);

const FormInit = connect(
  state => {
    const initialValues = state.initval.formValues;
    const currentValues = {
      id: state?.form?.reduxFormDemo?.values?.id,
      name: state?.form?.reduxFormDemo?.values?.name,
      description: state?.form?.reduxFormDemo?.values?.description,
    };
    return {
      initialValues,
      currentValues
    };
  },
  mapDispatchToProps,
)(ReduxFormMapped);

export default withStyles(styles)(FormInit);
