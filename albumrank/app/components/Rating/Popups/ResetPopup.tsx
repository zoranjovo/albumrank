'use client'

import Popup from '../../Popup/Popup';
import styles from './popups.module.css';

interface Props {
  resetPopupVisible: boolean;
  setResetPopupVisible: (value: boolean) => void;
  handleReset: () => void;
}

function ResetPopup({ resetPopupVisible, setResetPopupVisible, handleReset }: Props){
  const handleCloseResetPopup = () => { setResetPopupVisible(false); }

  return (
    <Popup isOpen={ resetPopupVisible } onClose={ handleCloseResetPopup }>
      <>
        <p className={ styles.popupTxt }>{`Reset?`}</p>
        <div>
          <button onClick={ handleReset } className={ `${ styles.btn } ${styles.deleteBtn}` }>Reset</button>
          <button onClick={ handleCloseResetPopup } className={ `${ styles.btn } ${styles.cancelBtn}` }>Cancel</button>
        </div>
      </>
    </Popup>
  );
}

export default ResetPopup;