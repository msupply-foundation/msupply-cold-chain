/* eslint-disable react/jsx-wrap-multilines */
import { COLOUR } from '~constants';

import { SettingsItem } from './SettingsItem';
import { Row } from '../../layouts';
import { SettingsTextEditModal } from './SettingsTextEditModal';

import { useToggle, useCombinedCallback } from '~hooks';
import { NormalText } from '~presentation/typography';
import { Pencil, Chevron } from '~presentation/icons';

export const SettingsTextInputRow = ({
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
        LeftIcon={<Pencil />}
        RightComponent={
          <Row justifyContent="space-between" alignItems="center">
            <NormalText marginRight={30} color={COLOUR.GREY_ONE}>
              {value}
            </NormalText>
            <Chevron direction="right" color={COLOUR.GREY_ONE} />
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
