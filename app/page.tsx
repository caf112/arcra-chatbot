"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from './PasswordInput';
import SubmitButton from './SubmitButton';
import styles from './page.module.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const correctPassword = process.env.NEXT_PUBLIC_CORRECT_PASSWORD;

    if (password === correctPassword) {
      localStorage.setItem('isAuthenticated', 'true'); // ログイン状態を保存
      router.push('/take/basic-chat');
    } else {
      setError('パスワードが間違っています。');
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.title}>ログイン</div>
      <form className={styles.container} onSubmit={handlePasswordSubmit}>
        <div className={styles.hidden}>
          <label htmlFor="username">ユーザーネーム</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザーネームを入力"
            aria-label="ユーザーネーム"
            autoComplete="username"
          />
        </div>
        <PasswordInput password={password} setPassword={setPassword} />
        <SubmitButton handleSubmit={handlePasswordSubmit} isSending={false} />
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </main>
  );
};

export default Home;
