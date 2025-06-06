import React, { useState } from 'react';
import { Platform } from 'react-native';

export default function Tooltip({ label, children }: { label: string, children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <div
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#222',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 13,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
} 