import React, { useRef, useCallback, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from 'react-native-elements';
import { TextInput } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { t } from '~translations';
import { Column } from '~layouts';
import { ReportAction } from '~features/Report';
import { SmallText } from '~presentation/typography';
import { SettingsEditModal } from '../settings/SettingsEditModal';
import { DetailSelector } from '~features';
import { useFormatter } from '~hooks';
import { COLOUR, STYLE } from '~constants';

interface ExportDataModalProps {
  id: string;
  onConfirm: () => void;
  isOpen: boolean;
  onClose: () => void;
  variant: 'export' | 'email' | '';
}

export const ExportDataModal: FC<ExportDataModalProps> = ({
  id,
  onConfirm,
  isOpen = false,
  onClose,
  variant = 'export',
}) => {
  const formatter = useFormatter();
  const dispatch = useDispatch();
  const { from, to } = useSelector(DetailSelector.fromTo);

  const onConfirmModal = useCallback(
    ({ username, comment }) => {
      if (variant === 'export') {
        dispatch(ReportAction.tryCreate(id, username, comment, from, to));
      }
      if (variant === 'email') {
        dispatch(ReportAction.tryCreateAndEmail(id, username, comment, from, to));
      }
      onConfirm();
    },
    [dispatch, id, onConfirm, variant, from, to]
  );

  const usernameRef = useRef<TextInput | null>(null);
  const commentRef = useRef<TextInput | null>(null);

  return (
    <Formik
      // TODO: Fix onSubmit is required for typescript
      onSubmit={() => {}}
      isInitialValid={false}
      initialValues={{ username: '', comment: '' }}
      validationSchema={Yup.object().shape({
        username: Yup.string().required(t('REQUIRED')).min(1),
        comment: Yup.string(),
      })}
    >
      {({ handleChange, errors, values, isValid }) => {
        const { username, comment } = values;
        const wrappedOnConfirm = () => isValid && onConfirmModal({ username, comment });

        return (
          <SettingsEditModal
            onClose={onClose}
            isOpen={isOpen}
            title={`${t('CREATING_REPORT_TITLE')}:\n ${formatter.dateRange(from, to)}`}
            onConfirm={wrappedOnConfirm}
            isDisabled={!isValid}
            Content={
              <Column alignItems="center" flex={1} justifyContent="center">
                <Input
                  ref={usernameRef}
                  value={values.username}
                  label={t('USERNAME')}
                  placeholder={t('ENTER_YOUR_USERNAME')}
                  onChangeText={e => {
                    handleChange('username')(e);
                  }}
                  inputContainerStyle={{ width: STYLE.WIDTH.DIVIDER_NEARLY_FULL }}
                  numberOfLines={1}
                  onSubmitEditing={() => commentRef?.current?.focus()}
                  errorMessage={errors.username}
                />
                <Input
                  ref={commentRef}
                  value={comment}
                  label={t('COMMENT')}
                  placeholder={t('ENTER_A_COMMENT')}
                  onChangeText={e => {
                    handleChange('comment')(e);
                  }}
                  inputContainerStyle={{ width: STYLE.WIDTH.DIVIDER_NEARLY_FULL }}
                  numberOfLines={1}
                  onSubmitEditing={() => usernameRef?.current?.focus()}
                />
                <SmallText color={COLOUR.SECONDARY}>{t('MAX_RECORDS')}</SmallText>
              </Column>
            }
          />
        );
      }}
    </Formik>
  );
};
