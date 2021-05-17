import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { SettingsItem } from './SettingsItem';
import { Row } from '../../layouts';
import { SettingsTextEditModal } from './SettingsTextEditModal';
import { useToggle, useCombinedCallback } from '../../hooks';
import { NormalText } from '../../presentation/typography';
import { Icon } from '../../presentation/icons';

interface SettingsTextInputRowProps {
  label: string;
  subtext: string;
  onConfirm: ({ inputValue }: { inputValue: string }) => void;
  value: string;
  editDescription: string;
  validation?: any;
}

export const SettingsTextInputRow: FC<SettingsTextInputRowProps> = ({
  label,
  subtext,
  onConfirm,
  value,
  editDescription,
  validation,
}) => {
  const [isModalOpen, toggleModal] = useToggle(false);
  const wrappedOnConfirm = useCombinedCallback(onConfirm, toggleModal);

  return (
    <>
      <SettingsItem
        label={label}
        subtext={subtext}
        onPress={toggleModal}
        LeftIcon={<Icon.Pencil />}
        RightComponent={
          <Row justifyContent="space-between" alignItems="center">
            <NormalText marginRight={30} color={COLOUR.GREY_ONE}>
              {value}
            </NormalText>
            <Icon.Chevron direction="right" color={COLOUR.GREY_ONE} />
          </Row>
        }
      />
      {isModalOpen && (
        <SettingsTextEditModal
          title={editDescription}
          onConfirm={wrappedOnConfirm}
          onClose={toggleModal}
          isOpen={isModalOpen}
          initialValue={value}
          validation={validation}
        />
      )}
    </>
  );
};
