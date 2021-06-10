import React, { FC } from 'react';
import { COLOUR } from '~constants';
import { Row } from '~layouts';
import { useToggle, useCombinedCallback } from '~hooks';
import { NormalText } from '~presentation/typography';
import { Icon } from '~presentation/icons';
import { SettingsTextEditModal } from './SettingsTextEditModal';
import { SettingsItem } from './SettingsItem';
interface SettingsTextInputRowProps {
  label: string;
  subtext?: string;
  onConfirm: ({ inputValue }: { inputValue: string }) => void;
  value?: string;
  editDescription: string;
  validation?: any;
  hideValue?: boolean;
}

export const SettingsTextInputRow: FC<SettingsTextInputRowProps> = ({
  label,
  subtext,
  onConfirm,
  value,
  editDescription,
  validation,
  hideValue,
}) => {
  const [isModalOpen, toggleModal] = useToggle(false);
  const wrappedOnConfirm = useCombinedCallback(onConfirm, toggleModal);

  return (
    <>
      <SettingsItem
        label={label}
        subtext={subtext ?? ''}
        onPress={toggleModal}
        LeftIcon={<Icon.Pencil />}
        RightComponent={
          <Row justifyContent="space-between" alignItems="center">
            <NormalText marginRight={30} color={COLOUR.GREY_ONE}>
              {hideValue ? '' : value ?? ''}
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
          initialValue={value ?? ''}
          validation={validation}
        />
      )}
    </>
  );
};
