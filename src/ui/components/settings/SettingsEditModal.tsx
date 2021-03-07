/* eslint-disable react/jsx-wrap-multilines */
import React, { FC, ReactNode } from 'react';
import { t } from '../../../common/translations';
import { COLOUR } from '../../../common/constants';

import { SettingsEditModalLayout, SettingsEditButtonGroup } from '../../layouts';
import { NormalText } from '../../presentation/typography';
import { SettingsEditButton } from '../buttons';

interface SettingsEditModalProps {
  title: string;
  Content: ReactNode;
  onConfirm: () => void;
  isDisabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsEditModal: FC<SettingsEditModalProps> = ({
  title,
  Content,
  onConfirm,
  isDisabled,
  isOpen,
  onClose,
}) => {
  return (
    <SettingsEditModalLayout
      Title={<NormalText colour={COLOUR.GREY_ONE}>{title}</NormalText>}
      Content={Content}
      ButtonGroup={
        <SettingsEditButtonGroup>
          <SettingsEditButton text="OK" onPress={onConfirm} isDisabled={isDisabled} />
          <SettingsEditButton text={t('CANCEL')} onPress={onClose} />
        </SettingsEditButtonGroup>
      }
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
