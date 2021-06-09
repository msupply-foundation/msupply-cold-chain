import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormatter, useOnMount } from '~hooks';
import { RootState } from '~store';
import { DetailCumulativeAction, DetailCumulativeSelector } from '~features';
import { Row } from '~layouts';
import { NormalText } from '~presentation/typography';

export const SensorDetailCumulativeBreachStatus: FC = () => {
  const formatter = useFormatter();
  const dispatch = useDispatch();

  const coldCumulative = useSelector((state: RootState) =>
    DetailCumulativeSelector.coldCumulative(state, { formatter })
  );
  const hotCumulative = useSelector((state: RootState) =>
    DetailCumulativeSelector.hotCumulative(state, { formatter })
  );

  const separator = '//';

  const init = () => dispatch(DetailCumulativeAction.init());

  useOnMount([init]);

  return (
    <Row>
      {coldCumulative ? <NormalText>{coldCumulative}</NormalText> : null}
      {hotCumulative && coldCumulative ? (
        <NormalText>{separator}</NormalText>
      ) : (
        <NormalText> </NormalText>
      )}
      {hotCumulative ? <NormalText>{hotCumulative}</NormalText> : null}
    </Row>
  );
};
