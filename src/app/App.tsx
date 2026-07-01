import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { BankProvider } from './context/BankContext';

export default function App() {
  return (
    <BankProvider>
      <RouterProvider router={router} />
    </BankProvider>
  );
}
