import moment from 'moment';

import { Column } from '../layouts';
import { LargeText, SmallText } from './typography';

export const DateAndTime = ({ date = moment() }) => {
  const formattedDate = date.format('DD MMMM');
  const formattedTime = date.format('HH:mm');

  return (
    <Column>
      <LargeText>{formattedTime}</LargeText>
      <SmallText style={{ alignSelf: 'flex-end' }}>{formattedDate}</SmallText>
    </Column>
  );
};
