import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { FormatService } from '../../common/services';
import { RootState } from '../../common/store/store';
import { CumulativeBreachSelector } from '../../features';
import { withFormatService } from '../hoc/withFormatService';
import { Column } from '../layouts';
import { NormalText } from '../presentation/typography';

interface SensorListCumulativeBreachStatus {
  id: string;
  formatter: FormatService;
}

export const SensorListCumulativeBreachStatusComponent: FC<SensorListCumulativeBreachStatus> = props => {
  const coldCumulative = useSelector((state: RootState) =>
    CumulativeBreachSelector.listColdCumulative(state, props)
  );
  const hotCumulative = useSelector((state: RootState) =>
    CumulativeBreachSelector.listHotCumulative(state, props)
  );

  return (
    <Column>
      {coldCumulative ? <NormalText>{coldCumulative}</NormalText> : null}
      {hotCumulative ? <NormalText>{hotCumulative}</NormalText> : null}
    </Column>
  );
};

export const SensorListCumulativeBreachStatus = withFormatService(
  SensorListCumulativeBreachStatusComponent
);
