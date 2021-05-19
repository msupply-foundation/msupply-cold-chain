import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { useFormatter } from '~hooks';
import { RootState } from '../../common/store/store';
import { DetailCumulativeSelector } from '../../features';
import { Row } from '../layouts';
import { NormalText } from '../presentation/typography';
import { LoadAfterInteractions } from './LoadAfterInteractions';

export const SensorDetailCumulativeBreachStatus: FC = () => {
  const formatter = useFormatter();

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
