import { createTheme, withStyles } from '@material-ui/core/styles';
import ThemePallete from 'enl-api/palette/themePalette';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import styles from '../styles/fluidChart-jss';
import { data1 } from './sampleData';

const theme = createTheme(ThemePallete.magentaTheme);
const color = ({
  primary: theme.palette.primary.main,
  primaryDark: theme.palette.primary.dark,
  secondary: theme.palette.secondary.main,
  secondaryDark: theme.palette.secondary.dark,
});

function ScoreChart(props) {
  const { classes } = props;
  return (
    <div className={classes.chartFluid} style={{ marginTop: 10 }}>
      <ResponsiveContainer width="90%" height={350}>
        <BarChart
          // width={800}
          // height={450}
          data={data1}
          margin={{
            top: 5,
            // right: 30,
            left: -30,
            // bottom: 5
          }}
        >
          <defs>
            <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
              <stop offset="100%" stopColor={'#0c46c3'} stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <XAxis dataKey="question" tickLine={false} />
          <YAxis axisLine={false} tickSize={2} tickLine={false} tick={{ stroke: 'none' }} />
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <CartesianAxis vertical={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="correct" fillOpacity="1" fill="url(#colorCorrect)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

ScoreChart.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ScoreChart);
