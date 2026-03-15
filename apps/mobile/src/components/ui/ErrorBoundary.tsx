import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
import { spacing } from '../../design-system/tokens';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text variant="title" color="#A1A1AA" align="center">
            Something went wrong
          </Text>
          <Pressable onPress={this.handleRetry} style={styles.retryButton}>
            <Text variant="body" color="#7C3AED">
              Tap to retry
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['24'],
    gap: spacing['16'],
  },
  retryButton: {
    paddingVertical: spacing['12'],
    paddingHorizontal: spacing['24'],
  },
});
