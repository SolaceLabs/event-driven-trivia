import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { PapperBlock } from 'enl-components';
import { injectIntl } from 'react-intl';
import Snackbar from '@material-ui/core/Snackbar';
import SnackBarWrapper from './common/SnackBarWrapper';
import Categories from './categories/Categories';
import CategoriesShowHelp from './categories/CategoriesShowHelp';
import CategoriesHelp from './categories/CategoriesHelp';

const styles = theme => ({
  snackbar: {
    margin: theme.spacing(1),
  },
  divider: {
    margin: `${theme.spacing(3)}px 0`,
  },
  margin: {
    margin: theme.spacing(1)
  }
});
function Category(props) {
  const { classes, history } = props;
  useEffect(() => {
    if (localStorage.getItem('token') === null) history.push('/login');
  }, []);

  const [refresh, setRefresh] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setShowHelp(false);
    setRefresh(true);
    setOpen(true);
    setRefresh(false);
  });

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const title = 'Categories';
  const description = 'Trivia Question Categories';
  return (
    <div>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
      </Helmet>
      <PapperBlock
        whiteBg
        icon="table_chart"
        title={title}
        desc={description}
        showAction={true}
        actionChildren={<CategoriesShowHelp setShow={setShowHelp} />}
      >
        <div>
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

          {showHelp
            && <CategoriesHelp updateResult={updateResult}/>
          }
          <Categories refresh={refresh}/>
        </div>
      </PapperBlock>
    </div>
  );
}

Category.propTypes = {
  intl: PropTypes.object.isRequired
};

export default withStyles(styles)(injectIntl(Category));
