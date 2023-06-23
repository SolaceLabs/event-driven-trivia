/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import Paper from '@material-ui/core/Paper';
import MomentUtils from '@date-io/moment';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

const utils = new MomentUtils();
const api = new TriviaWrapper();

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '75vw',
    maxHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
    top: '25%',
    left: '30%',
    transform: 'translate(-25%, -25%)',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2),  0 6px 20px 0 rgba(0, 0, 0, 0.19)'
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function TriviaAdminQR(props) {
  const { data, open, close } = props;
  const classes = useStyles();

  const [qrCode, setQRCode] = React.useState(data[14]);
  const [adminCode, setAdminCode] = React.useState(false);
  const [controllerUrl, setControllerUrl] = React.useState(false);

  useEffect(async () => {
    let location = window.location.href;
    location = location.substring(0, location.indexOf('/app/trivia')) + '/controller.html?code=' + data[13];
    setControllerUrl(location);

    const response = await api.getTriviaAdminQRCode({ url: location, id: data[0] });
    if (!response.success) {
      console.log('error', response.message);
      return;
    }
    console.log('QR Code', response.data);
    setQRCode(response.data);
    setAdminCode(response.adminCode);
  }, []);

  const handleClose = () => {
    close();
  };

  return (
    <div>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Trivia Admin QR Code
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent dividers={scroll === 'paper'}>
          <Grid container alignItems="center" display="flex" justifyContent="center" direction="column" spacing={4}>
            <Grid item xs={12} sm={12}>
              <a target="_blank" href={controllerUrl}>{controllerUrl}</a>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography className={classes.title}>
                Magic Phrase: <b>{adminCode}</b>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <img src={qrCode} alt="" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12}>
              <a href={qrCode} download="QRCode">
                <button type="button">Download</button>
              </a>
            </Grid>
          </Grid>
        </DialogContent>

        {/* <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >

            <Grid item xs={4} md={6}>
              <img src={qrCode} alt="" />
              <a href={qrCode} download="QRCode">
                <button type="button">Download</button>
              </a>
            </Grid>

          </Grid>  */}

        {/* <div className={classes.root}>
            <Grid item xs={6} sm={4}>
              <img src={qrCode} alt="" />
              <a href={qrCode} download="QRCode">
                <button type="button">Download</button>
              </a>
            </Grid>
          </div> */}
        <Divider className={classes.divider} />
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

TriviaAdminQR.propTypes = {
  close: PropTypes.func.isRequired,
  open: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};
