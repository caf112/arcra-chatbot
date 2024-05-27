import React from 'react';
import styles from './page.module.css';

type PasswordInputProps = {
  password: string;
  setPassword: (password: string) => void;
};

const PasswordInput: React.FC<PasswordInputProps> = ({ password, setPassword }) => {
  return (
    <input
      className={styles.passwordInput}
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="パスワードを入力"
      aria-label="パスワード"
      autoComplete="new-password"
    />
  );
};

export default PasswordInput;
