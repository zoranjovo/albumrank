'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import styles from './popup.module.css';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Popup = ({ isOpen, onClose, children }: PopupProps) => {
  const [visible, setVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if(isOpen){
      setVisible(true);
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if(!isOpen && isAnimating){
      setVisible(false);
      setIsAnimating(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.fadeIn : styles.fadeOut}`} onClick={onClose}>
      <div
        className={`${styles.popup} ${isOpen ? styles.slideIn : styles.slideOut}`}
        onAnimationEnd={handleAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
