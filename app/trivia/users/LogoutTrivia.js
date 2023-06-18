import { withStyles } from '@material-ui/core/styles';
import brand from 'enl-api/fireball/brand';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import { LogoutForm } from 'enl-components';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Snackbar from '@material-ui/core/Snackbar';
import styles from '../../components/Forms/user-jss';
import SnackBarWrapper from '../common/SnackBarWrapper';

const api = new TriviaWrapper();

function LogoutTrivia(props) {
  const { classes, history } = props;
  const title = brand.name + ' - Logout';
  const description = brand.desc;
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [openStyle, setOpen] = useState(false);

  if (localStorage.getItem('token') === null) {
    history.push('/app/trivia/dashboard');
    return <div/>;
  }

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  const cancelForm = async (values) => {
    history.goBack();
  };

  const submitForm = async (values) => {
    console.log(`You confirmed logout`); // eslint-disable-line
    const response = await api.logout();
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('id');
      localStorage.removeItem('ts');
      history.push('/login');
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
          <LogoutForm onSubmit={(values) => submitForm(values)} onCancel={() => cancelForm()} />
        </div>
      </div>
    </div>
  );
}

LogoutTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LogoutTrivia);
