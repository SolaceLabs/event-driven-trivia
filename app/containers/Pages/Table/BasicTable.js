import React from 'react';
import { Helmet } from 'react-helmet';
import brand from 'enl-api/fireball/brand';
import { PapperBlock, EmptyData } from 'enl-components';
import StrippedTable from './StrippedTable';

function BasicTable() {
  const title = brand.name + ' - Table';
  const description = brand.desc;
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
      <PapperBlock title="Table" whiteBg icon="table_chart" desc="UI Table when no data to be shown">
        <div>
          <StrippedTable />
        </div>
      </PapperBlock>
      <PapperBlock title="Empty Table" whiteBg icon="table_chart" desc="They (allegedly) aid usability in reading tabular data by offering the user a coloured means of separating and differentiating rows from one another">
        <div>
          <EmptyData />
        </div>
      </PapperBlock>
    </div>
  );
}

export default BasicTable;
