import React, { FC } from 'react';
import QRScanner from 'react-native-qrcode-scanner';
import { IconButton } from '~components/buttons';
import { FullScreenModal, Row } from '~layouts';
import { Icon } from '~presentation/icons';

export const QRCodeScanner: FC<{
  isActive: boolean;
  onClose: () => void;
  onResult: (code: string) => void;
}> = ({ isActive, onClose, onResult }) => {
  return (
    <FullScreenModal isOpen={isActive}>
      <Row justifyContent="center" alignItems="center" flex={1} style={{ flexDirection: 'column' }}>
        <Row justifyContent="flex-end" flex={0} style={{ width: '100%' }}>
          <IconButton Icon={<Icon.Close />} onPress={onClose} />
        </Row>
        <QRScanner onRead={e => onResult(e.data)} />
      </Row>
    </FullScreenModal>
  );
};
