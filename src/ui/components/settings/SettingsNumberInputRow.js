/* eslint-disable react/jsx-wrap-multilines */
import { COLOUR } from '~constants';
import { useToggle } from '~hooks';

import { Row } from '~layouts';
import { NormalText } from '~presentation/typography';
import { Pencil, Chevron } from '~presentation/icons';

import { SettingsItem } from './SettingsItem';
import { SettingsNumberInputModal } from './SettingsNumberInputModal';

export const SettingsNumberInputRow = ({
  label,
  subtext,
  onConfirm,
  initialValue,
  editDescription,
  maximumValue,
  minimumValue,
  step,
  metric,
}) => {
  const [isModalOpen, toggleModal] = useToggle(false);

  return (
    <>
      <SettingsItem
        label={label}
        subtext={subtext}
        onPress={toggleModal}
        LeftIcon={<Pencil />}
        RightComponent={
          <Row justifyContent="space-between" alignItems="center">
            <NormalText marginRight={30} colour={COLOUR.GREY_ONE}>
              {initialValue}
            </NormalText>
            <Chevron direction="right" colour={COLOUR.GREY_ONE} />
          </Row>
        }
      />
      {isModalOpen && (
        <SettingsNumberInputModal
          title={editDescription}
          onConfirm={onConfirm}
          onClose={toggleModal}
          isOpen={isModalOpen}
          initialValue={initialValue}
          maximumValue={maximumValue}
          minimumValue={minimumValue}
          step={step}
          metric={metric}
        />
      )}
    </>
  );
};
