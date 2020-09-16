import { Column } from '../layouts';
import { LargeText, SmallText } from './typography';

export const DateAndTime = ({ time, date }) => {
  return (
    <Column>
      <LargeText>{time}</LargeText>
      <SmallText style={{ alignSelf: 'flex-end' }}>{date}</SmallText>
    </Column>
  );
};
