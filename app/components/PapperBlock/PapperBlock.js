import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import styles from './papperStyle-jss';

function PapperBlock(props) {
  const {
    classes,
    title,
    desc,
    children,
    whiteBg,
    noMargin,
    colorMode,
    overflowX,
    overflowY,
    icon,
    showAction,
    actionChildren
  } = props;

  const color = mode => {
    switch (mode) {
      case 'light':
        return classes.colorLight;
      case 'dark':
        return classes.colorDark;
      default:
        return classes.none;
    }
  };

  return (
    <Paper
      className={
        classNames(
          classes.root,
          noMargin && classes.noMargin,
          color(colorMode)
        )
      }
      elevation={0}
    >
      {(icon || title || desc)
      && <div className={classes.descBlock}>
        {icon
        && <span className={classes.iconTitle}>
          <Icon>{icon}</Icon>
        </span>}
        {(title || desc)
        && <div className={classes.titleText}>
          {title
          && <Typography variant="h6" component="h2" className={classes.title}>
            {title}
          </Typography>}
          {desc
          && <Typography component="p" className={classes.description}>
            {desc}
          </Typography>}
        </div>}
        {actionChildren ? <span>{actionChildren}</span> : <span/>}
      </div>}
      <section className={classNames(classes.content, whiteBg && classes.whiteBg, overflowX && classes.overflowX, overflowY && classes.overflowY)}>
        {children}
      </section>
    </Paper>
  );
}

// PapperBlock.propTypes = {
//   classes: PropTypes.object.isOptional,
//   title: PropTypes.string.isOptional,
//   desc: PropTypes.string.isOptional,
//   icon: PropTypes.string.isOptional,
//   children: PropTypes.node.isOptional,
//   whiteBg: PropTypes.bool.isOptional,
//   colorMode: PropTypes.string.isOptional,
//   noMargin: PropTypes.bool.isOptional,
//   overflowX: PropTypes.bool.isOptional,
//   showAction: PropTypes.bool.isOptional,
//   actionChildren: PropTypes.node.isOptional
// };

// PapperBlock.defaultProps = {
//   whiteBg: false,
//   noMargin: false,
//   colorMode: 'none',
//   overflowX: false,
//   desc: false,
//   title: false,
//   // icon: 'flag',
// };

export default withStyles(styles)(PapperBlock);
