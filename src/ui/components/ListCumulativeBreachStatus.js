import { connect } from 'react-redux';
import { CumulativeBreachSelector } from '~features';

import { withFormatService } from '../hoc/withFormatService';
import { Column } from '../layouts';
import { NormalText } from '../presentation/typography';

const stateToProps = (state, ownProps) => {
  const coldCumulative = CumulativeBreachSelector.listColdCumulative(state, ownProps);
  const hotCumulative = CumulativeBreachSelector.listHotCumulative(state, ownProps);

  return { coldCumulative, hotCumulative };
};

export const CumulativeBreachStatusComponent = ({ coldCumulative, hotCumulative }) => {
  return (
    <Column>
      {coldCumulative ? <NormalText>{coldCumulative}</NormalText> : null}
      {hotCumulative ? <NormalText>{hotCumulative}</NormalText> : null}
    </Column>
  );
};

export const ListCumulativeBreachStatus = withFormatService(
  connect(stateToProps)(CumulativeBreachStatusComponent)
);
