/* eslint-disable react/jsx-wrap-multilines */
import React, { useEffect, useRef, useCallback, FC } from 'react';
import { useDispatch } from 'react-redux';
import { Input } from 'react-native-elements';
import { useWindowDimensions } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { t } from '../../../common/translations';
import { Column } from '../../layouts';

import { SettingsEditModal } from '../settings/SettingsEditModal';

import { ReportAction } from '../../../features/Report';

interface ExportDataModalProps {
  id: string;
  onConfirm: () => void;
  isOpen: boolean;
  onClose: () => void;
  variant: 'export' | 'email';
}

export const ExportDataModal: FC<ExportDataModalProps> = ({
  id,
  onConfirm,
  isOpen = false,
  onClose,
  variant = 'export',
}) => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  const onConfirmModal = useCallback(
    ({ username, comment }) => {
      if (variant === 'export') {
        dispatch(ReportAction.tryCreate(id, username, comment));
      }
      if (variant === 'email') {
        dispatch(ReportAction.tryCreateAndEmail(id, username, comment));
      }
      onConfirm();
    },
    [id, onConfirm, variant]
  );

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
        const wrappedOnConfirm = useCallback(
          () => isValid && onConfirmModal({ username, comment }),
          [username, comment]
        );
        const usernameRef = useRef<Input>(null);
        const commentRef = useRef<Input>(null);

        useEffect(() => {
          setTimeout(() => usernameRef.current?.focus(), 100);
        }, [usernameRef.current, isOpen]);

        return (
          <SettingsEditModal
            onClose={onClose}
            isOpen={isOpen}
            title={variant === 'export' ? 'Export data' : 'Email data'}
            onConfirm={wrappedOnConfirm}
            isDisabled={!isValid}
            Content={
              <Column alignItems="center" flex={1} justifyContent="center">
                <Input
                  ref={usernameRef}
                  value={values.username}
                  label="Username"
                  placeholder="Enter your name"
                  onChangeText={e => {
                    handleChange('username')(e);
                  }}
                  inputContainerStyle={{ width: width * 0.5 }}
                  numberOfLines={1}
                  onSubmitEditing={() => commentRef?.current?.focus()}
                  errorMessage={errors.username}
                />
                <Input
                  ref={commentRef}
                  value={comment}
                  label="Comment"
                  placeholder="Enter a comment"
                  onChangeText={e => {
                    handleChange('comment')(e);
                  }}
                  inputContainerStyle={{ width: width * 0.5 }}
                  numberOfLines={1}
                  onSubmitEditing={() => usernameRef?.current?.focus()}
                />
              </Column>
            }
          />
        );
      }}
    </Formik>
  );
};
