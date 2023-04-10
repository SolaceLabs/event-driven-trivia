import { withStyles } from '@material-ui/core/styles';
import brand from 'enl-api/fireball/brand';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import { ResetForm } from 'enl-components';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Snackbar from '@material-ui/core/Snackbar';
import styles from '../../components/Forms/user-jss';
import SnackBarWrapper from '../common/SnackBarWrapper';

const api = new TriviaWrapper();

function ResetPasswordTrivia(props) {
  const { classes, history } = props;
  useEffect(() => {
    if (localStorage.getItem('token') !== null) history.push('/app/trivia/dashboard');
  }, []);

  const title = brand.name + ' - Reset Password';
  const description = brand.desc;
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [openStyle, setOpen] = useState(false);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  const submitForm = async (values) => {
    console.log(`You submitted:\n\n${values.email}`); // eslint-disable-line
    const response = await api.reset(values);
    if (!response.success) {
      updateResult('error', response.message);
    }
  };

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div className={classes.root}>
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
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
      </Helmet>
      <div className={classes.container}>
        <div className={classes.userFormWrap}>
          <ResetForm onSubmit={(values) => submitForm(values)} />
        </div>
      </div>
    </div>
  );
}

ResetPasswordTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ResetPasswordTrivia);
