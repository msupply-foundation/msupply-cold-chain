import React, { FC } from 'react';
import { View } from 'react-native';

import { t } from '~common/translations';
import { Button } from '~components/buttons';
import { FullScreenModal, LoadingModalLayout, Row } from '~layouts';
import { NormalText } from '~presentation/typography';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  confirmText: string;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  confirmText,
}) => {
  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose}>
      <LoadingModalLayout
        Content={
          <View>
            <NormalText>{confirmText}</NormalText>
          </View>
        }
        LoadingIndicator={
          <Row>
            <Button text={t('CANCEL')} onPress={onClose} />
            <Button text={t('OK')} onPress={onConfirm} />
          </Row>
        }
      />
    </FullScreenModal>
  );
};
