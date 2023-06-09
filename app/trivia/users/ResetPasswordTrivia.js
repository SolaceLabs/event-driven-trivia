import { withStyles } from '@material-ui/core/styles';
import brand from 'enl-api/fireball/brand';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import { ResetPasswordForm } from 'enl-components';
import classNames from 'classnames';
import Type from 'enl-styles/Typography.scss';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Snackbar from '@material-ui/core/Snackbar';
import styles from '../../components/Forms/user-jss';
import SnackBarWrapper from '../common/SnackBarWrapper';

const api = new TriviaWrapper();

function ResetPasswordTrivia(props) {
  const { classes, history } = props;
  const title = brand.name + ' - Reset Password';
  const description = brand.desc;
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [openStyle, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    const searchParams = new URLSearchParams(document.location.search);
    const _email = searchParams.get('email');
    setEmail(_email);
    const _token = searchParams.get('token');
    setToken(_token);
    const response = await api.resetPassword({ email: _email, token: _token });
    if (!response.success) {
      updateResult('error', response.message);
    }
  }, []);

  const submitForm = async (values) => {
    console.log(`You submitted:\n\n${email}`); // eslint-disable-line
    const response = await api.resetPassword({ ...values, email, token });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
      setTimeout(() => {
        history.push('/login');
      }, 3000);
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
          <ResetPasswordForm email={email} onSubmit={(values) => submitForm(values)} />
        </div>
      </div>
    </div>
  );
}

ResetPasswordTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ResetPasswordTrivia);
