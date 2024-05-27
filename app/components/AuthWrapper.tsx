"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../hooks/useAuth';

const AuthWrapper = ({ children }) => {
  useAuth();

  return <>{children}</>;
};

export default AuthWrapper;
