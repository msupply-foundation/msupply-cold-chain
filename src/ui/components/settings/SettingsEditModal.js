/* eslint-disable react/jsx-wrap-multilines */

import { t } from '~translations';
import { COLOUR } from '~constants';

import { SettingsEditModalLayout, SettingsEditButtonGroup } from '~layouts';
import { NormalText } from '~presentation/typography';
import { SettingsEditButton } from '~components/buttons';

export const SettingsEditModal = ({ title, Content, onConfirm, isDisabled, isOpen, onClose }) => {
  return (
    <SettingsEditModalLayout
      Title={<NormalText colour={COLOUR.GREY_ONE}>{title}</NormalText>}
      Content={Content}
      ButtonGroup={
        <SettingsEditButtonGroup>
          <SettingsEditButton text={t('OK')} onPress={onConfirm} isDisabled={isDisabled} />
          <SettingsEditButton text={t('CANCEL')} onPress={onClose} />
        </SettingsEditButtonGroup>
      }
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
