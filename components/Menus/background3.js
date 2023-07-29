// BoxComponent.js
import React from 'react';
import styles from './styles.module.css'; // Import the CSS module

const BoxComponent = () => {
  return (
    <div>
      <div className={`${styles.square} ${styles.linkedin}`}>
        <span></span>
        <span></span>
        <span></span>
        <div className={styles.content}>
         
        </div>
      </div>
    </div>
  );
};

export default BoxComponent;