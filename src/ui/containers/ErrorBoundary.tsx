import React from 'react';
import Bugsnag from '@bugsnag/react-native';
import { t } from '~common/translations';
import { FatalError } from '~components/modal/FatalError';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    Bugsnag.start();
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error): void {
    Bugsnag.notify(error);
    this.setState({ hasError: true });
  }

  render(): React.ReactNode {
    const { children } = this.props;

    const { hasError } = this.state;

    if (!hasError) return children;

    return <FatalError errorMessage={t('ERROR_MESSAGE')} />;
  }
}
