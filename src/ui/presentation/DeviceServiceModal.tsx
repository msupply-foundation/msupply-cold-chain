import React, { FC, ReactNode } from 'react';
import { FullScreenModal, Centered, Row, Column } from '../layouts';
import { NormalText, Header } from './typography';
import { Button } from '../components/buttons';
import { COLOUR } from '../../common/constants';

interface DeviceServiceModalProps {
  isOpen: boolean;
  title: string;
  onPress: () => void;
  Icon: ReactNode;
  body: string;
}

export const DeviceServiceModal: FC<DeviceServiceModalProps> = ({
  isOpen,
  title,
  onPress,
  Icon,
  body,
}) => {
  return (
    <FullScreenModal isOpen={isOpen}>
      <Centered
        style={{
          backgroundColor: COLOUR.DANGER,
          flex: 1,
          width: '100%',
        }}
      >
        <Row flex={1} />
        <Column flex={2} justifyContent="space-between" alignItems="center">
          <Header color={COLOUR.WHITE}>{title}</Header>
          {Icon}
          <NormalText>{body}</NormalText>
          <Button onPress={onPress} text="GO" />
        </Column>
        <Column flex={1} />
      </Centered>
    </FullScreenModal>
  );
};
