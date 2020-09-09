/* eslint-disable react/jsx-wrap-multilines */
import { Input } from 'react-native-elements';
import { useEffect, useRef, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { t } from '~translations';
import { Column } from '~layouts';

import { SettingsEditModal } from './settings/SettingsEditModal';

export const ExportDataModal = ({ onConfirm, isOpen, onClose }) => {
  const { width } = useWindowDimensions();

  return (
    <Formik
      isInitialValid={false}
      initialValues={{ username: '', comment: '' }}
      validationSchema={Yup.object().shape({
        username: Yup.string().required(t('REQUIRED')).min(1),
        comment: Yup.string(),
      })}
    >
      {({ handleChange, errors, values, isValid }) => {
        const { username, comment } = values;
        const wrappedOnConfirm = useCallback(() => isValid && onConfirm({ username, comment }), [
          username,
          comment,
        ]);
        const usernameRef = useRef();
        const commentRef = useRef();

        useEffect(() => {
          setTimeout(() => usernameRef.current?.focus(), 100);
        }, [usernameRef.current, isOpen]);

        return (
          <SettingsEditModal
            onClose={onClose}
            isOpen={isOpen}
            title="Export data"
            onConfirm={wrappedOnConfirm}
            isDisabled={!isValid}
            Content={
              <Column alignItems="center" flex={1} justifyContent="center">
                <Input
                  ref={ref => {
                    usernameRef.current = ref;
                  }}
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
                  ref={ref => {
                    commentRef.current = ref;
                  }}
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
