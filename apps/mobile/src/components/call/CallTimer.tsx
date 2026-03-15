import React, { useEffect, useState } from 'react';
import { useTheme } from '../../design-system';
import { Text } from '../ui';

interface CallTimerProps {
  connectedAt: number | null;
}

export function CallTimer({ connectedAt }: CallTimerProps) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!connectedAt) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [connectedAt]);

  if (!connectedAt) return null;

  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0');
  const ss = (elapsed % 60).toString().padStart(2, '0');

  return (
    <Text variant="mono" color={colors.accentSuccess} align="center">
      {mm}:{ss}
    </Text>
  );
}
