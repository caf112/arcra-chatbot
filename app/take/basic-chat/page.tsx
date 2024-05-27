"use client";

import React from "react";
import styles from "./page.module.css"; // use simple styles for demonstration purposes
import Chat from "../../components/chat";
import Sidebar from "../../components/sidebar"; 

const Home = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Sidebar />
        <Chat />
      </div>
    </main>
  );
};

export default Home;
