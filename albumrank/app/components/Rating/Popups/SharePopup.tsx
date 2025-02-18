'use client'

import Popup from '../../Popup/Popup';
import styles from './popups.module.css';

interface Props {
  sharePopupVisible: boolean;
  setSharePopupVisible: (value: boolean) => void;
  shareName: string;
  setShareName: (value: string) => void;
  shareURL: string;
  setShareURL: (value: string) => void;
}


function SharePopup({ sharePopupVisible, setSharePopupVisible, shareName, setShareName, shareURL, setShareURL }: Props){

  const handleCloseSharePopup = () => {
    setSharePopupVisible(false);
  }

  const handleCopyPress = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareURL)
        .then(() => handleCloseSharePopup())
        .catch(err => {
          console.error('Error copying to clipboard:', err);
        });
    } else {
      //fallback for older devices
      const textArea = document.createElement("textarea");
      textArea.value = shareURL;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
  
      try {
        const successful = document.execCommand('copy');
        if (successful) handleCloseSharePopup();
        else throw new Error('copy failed');
      } catch (err) {
        console.error('unable to copy', err);
      }
  
      document.body.removeChild(textArea);
    }
  };
  
  

  return (
    <Popup isOpen={ sharePopupVisible } onClose={ handleCloseSharePopup }>
      <>
        <p className={ styles.popupTxt }>Share</p>
        <div className={ styles.shareContainer }>
          <input
            placeholder='Your Name (Optional)'
            value={ shareName }
            onChange={ (e) => setShareName(e.target.value) }
          ></input>
          <textarea
            value={ shareURL }
            onChange={ (e) => setShareURL(e.target.value) }
          ></textarea>
          <div>
            <button onClick={ handleCopyPress } className={ `${ styles.btn } ${styles.copyBtn}` }>Copy</button>
            <button onClick={ handleCloseSharePopup } className={ `${ styles.btn } ${styles.cancelBtn}` }>Cancel</button>
          </div>
        </div>
        
      </>
    </Popup>
  );
}

export default SharePopup;