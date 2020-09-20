/* eslint-disable react/jsx-curly-brace-presence */
import { connect } from 'react-redux';
import { DetailCumulativeSelector } from '~features';

import { withFormatService } from '../hoc/withFormatService';
import { Row } from '../layouts';
import { NormalText } from '../presentation/typography';
import { LoadAfterInteractions } from './LoadAfterInteractions';

const stateToProps = (state, props) => {
  const coldCumulative = DetailCumulativeSelector.coldCumulative(state, props);
  const hotCumulative = DetailCumulativeSelector.hotCumulative(state, props);
  const isLoading = DetailCumulativeSelector.isLoading(state, props);

  return { coldCumulative, hotCumulative, isLoading };
};

export const SensorDetailCumulativeBreachStatusComponent = ({
  coldCumulative,
  hotCumulative,
  isLoading,
}) => {
  return (
    <LoadAfterInteractions>
      {!isLoading ? (
        <Row>
          {coldCumulative ? <NormalText>{coldCumulative}</NormalText> : null}
          {hotCumulative && coldCumulative ? (
            <NormalText> {'//'} </NormalText>
          ) : (
            <NormalText> </NormalText>
          )}
          {hotCumulative ? <NormalText>{hotCumulative}</NormalText> : null}
        </Row>
      ) : null}
    </LoadAfterInteractions>
  );
};

export const SensorDetailCumulativeBreachStatus = withFormatService(
  connect(stateToProps)(SensorDetailCumulativeBreachStatusComponent)
);
