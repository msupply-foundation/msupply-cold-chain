import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/store/store';
import { CumulativeBreachSelector } from '../../features';
import { useFormatter } from '../hooks';
import { Column } from '../layouts';
import { NormalText } from '../presentation/typography';

interface SensorListCumulativeBreachStatus {
  id: string;
}

export const SensorListCumulativeBreachStatus: FC<SensorListCumulativeBreachStatus> = ({ id }) => {
  const formatter = useFormatter();
  const coldCumulative = useSelector((state: RootState) =>
    CumulativeBreachSelector.listColdCumulative(state, { id, formatter })
  );
  const hotCumulative = useSelector((state: RootState) =>
    CumulativeBreachSelector.listHotCumulative(state, { id, formatter })
  );

  return (
    <Column>
      {coldCumulative ? <NormalText>{coldCumulative}</NormalText> : null}
      {hotCumulative ? <NormalText>{hotCumulative}</NormalText> : null}
    </Column>
  );
};
