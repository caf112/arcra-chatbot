import React from 'react';
import styles from './page.module.css';

type SubmitButtonProps = {
  handleSubmit: (event: React.FormEvent) => void;
  isSending: boolean;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ handleSubmit, isSending }) => {
  return (
    <button
      className={styles.submitButton}
      type="submit"
      disabled={isSending}
    >
      送信
    </button>
  );
};

export default SubmitButton;
