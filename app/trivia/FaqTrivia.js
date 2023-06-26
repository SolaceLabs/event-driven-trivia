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
  title: 'FAQ (How it works)',
  rows: [
    {
      title: 'Lorem ipsum dolor sit amet,',
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sed tempor sem. Aenean vel turpis feugiat,
        ultricies metus at, consequat velit. Curabitur est nibh, varius in tellus nec, mattis pulvinar metus.
        In maximus cursus lorem, nec laoreet velit eleifend vel. Ut aliquet mauris tortor, sed egestas libero interdum vitae.
        Fusce sed commodo purus, at tempus turpis.`,
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
