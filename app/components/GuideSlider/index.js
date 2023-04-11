import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import guideData from 'enl-api/fireball/guideData';
import styles from './guide-jss';

const maxStepsSwipe = guideData.length;

const Transition = React.forwardRef(function Transition(props, ref) { // eslint-disable-line
  return <Slide direction="up" ref={ref} {...props} />;
});

function GuideSlider(props) {
  const {
    classes,
    theme,
    openGuide,
    closeGuide
  } = props;
  const [activeStepSwipe, setActiveStepSwipe] = useState(0);

  const handleNextSwipe = () => {
    setActiveStepSwipe(activeStepSwipe + 1);
  };

  const handleBackSwipe = () => {
    setActiveStepSwipe(activeStepSwipe - 1);
  };

  const handleStepChangeSwipe = newActiveStepSwipe => {
    setActiveStepSwipe(newActiveStepSwipe);
  };

  const handleClose = () => {
    // setActiveStepSwipe(0);
    closeGuide();
  };

  return (
    <Dialog
      TransitionComponent={Transition}
      keepMounted
      open={openGuide}
      onClose={closeGuide}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={classes.root}
    >
      <DialogContent className={classes.rootContent}>
        <article className={classes.text}>
          <Typography variant="h6">{guideData[activeStepSwipe].title}</Typography>
          <Typography dangerouslySetInnerHTML={{
            __html: guideData[activeStepSwipe].text
          }}></Typography>
        </article>
        <MobileStepper
          variant="progress"
          steps={maxStepsSwipe}
          position="static"
          activeStep={activeStepSwipe}
          className={classes.mobileStepper}
          nextButton={
            activeStepSwipe === maxStepsSwipe - 1 ? (
              <Button size="small" color="primary" onClick={handleClose}>
                Done
                {/* {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />} */}
              </Button>
            ) : (
              <Button size="small" onClick={handleNextSwipe}>
                Next
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            )
          }
          backButton={(
            <Button size="small" onClick={handleBackSwipe} disabled={activeStepSwipe === 0}>
              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              Back
            </Button>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}

GuideSlider.propTypes = {
  openGuide: PropTypes.bool.isRequired,
  closeGuide: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(GuideSlider);
