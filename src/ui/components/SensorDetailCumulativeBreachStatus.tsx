import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { FormatService } from '../../common/services';
import { RootState } from '../../common/store/store';
import { DetailCumulativeSelector } from '../../features';

import { withFormatService } from '../hoc/withFormatService';
import { Row } from '../layouts';
import { NormalText } from '../presentation/typography';
import { LoadAfterInteractions } from './LoadAfterInteractions';

interface SensorDetailCumulativeBreachStatus {
  formatter: FormatService;
}

export const SensorDetailCumulativeBreachStatusComponent: FC<SensorDetailCumulativeBreachStatus> = ({
  formatter,
}) => {
  const coldCumulative = useSelector((state: RootState) =>
    DetailCumulativeSelector.coldCumulative(state, { formatter })
  );
  const hotCumulative = useSelector((state: RootState) =>
    DetailCumulativeSelector.hotCumulative(state, { formatter })
  );
  const isLoading = useSelector((state: RootState) => DetailCumulativeSelector.isLoading(state));

  const separator = '//';

  return (
    <LoadAfterInteractions>
      {!isLoading ? (
        <Row>
          {coldCumulative ? <NormalText>{coldCumulative}</NormalText> : null}
          {hotCumulative && coldCumulative ? (
            <NormalText>{separator}</NormalText>
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
  SensorDetailCumulativeBreachStatusComponent
);
