import dynamic from 'next/dynamic';
import React from 'react';

export function withNoSSR<T extends {}>(Component: React.ComponentType<T>) {
  return dynamic(() => Promise.resolve(Component), { ssr: false });
}
