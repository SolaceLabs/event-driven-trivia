import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { PapperBlock } from 'enl-components';
import Faq from 'react-faq-component';

const styles = theme => ({
  table: {
    '& > div': {
      overflow: 'auto'
    },
    '& table': {
      '& td': {
        wordBreak: 'keep-all'
      },
      [theme.breakpoints.down('md')]: {
        '& td': {
          height: 60,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }
    },
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

const data = {
  title: 'Basics',
  rows: [
    {
      title: 'What is Fireball Trivia?',
      content: '',
    },
    {
      title: 'Nunc maximus, magna at ultricies elementum',
      content:
          'Nunc maximus, magna at ultricies elementum, risus turpis vulputate quam, vitae convallis ex tortor sed dolor.',
    },
    {
      title: 'Curabitur laoreet, mauris vel blandit fringilla',
      content: `Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc, ac sagittis leo elit vel lorem.
      Fusce tempor lacus ut libero posuere viverra. Nunc velit dolor, tincidunt at varius vel, laoreet vel quam.
      Sed dolor urna, lobortis in arcu auctor, tincidunt mattis ante. Vivamus venenatis ultricies nibh in volutpat.
      Cras eu metus quis leo vestibulum feugiat nec sagittis lacus.Mauris vulputate arcu sed massa euismod dignissim. `,
    },
    {
      title: 'What is the package version',
      content: <p>current version is 1.2.1</p>,
    },
  ],
};

const faqStyles = {
  // bgColor: 'white',
  // titleTextColor: 'blue',
  // rowTitleColor: 'blue',
  // rowContentColor: 'grey',
  // arrowColor: "red",
};

const faqConfig = {
  animate: true,
  // arrowIcon: 'V',
  // tabFocus: true
};

function FaqTrivia(props) {
  const { classes } = props;
  const title = 'Frequently Asked Questions';
  return (
    <div className={classes.table}>
      <PapperBlock
        whiteBg
        icon="menu_book"
        title={title}
        // desc={description}
      >
        <div>
          🔥📚🎉 Introducing "Fireball Trivia" - the ultimate event-driven trivia app that sparks your knowledge and ignites your competitive spirit! Immerse yourself in a dynamic and thrilling trivia experience, powered by the cutting-edge Solace PubSub+ Broker and its event-driven constructs. Answer questions in real-time, challenge friends, and explore a diverse range of trivia categories. Join "Fireball Trivia" now and let the fiery trivia adventure begin! Available for free on iOS and Android. 🎉📚🔥
        </div>
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
        <Faq
          data={data}
          styles={faqStyles}
          config={faqConfig}
        />
      </PapperBlock>
    </div>
  );
}

FaqTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(FaqTrivia);
