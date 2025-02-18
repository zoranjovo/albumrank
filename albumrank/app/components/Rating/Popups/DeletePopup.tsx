'use client'

import { Item } from '@util/Types'
import Popup from '../../Popup/Popup';
import styles from './popups.module.css';

interface Props {
  deletingItem: Item | null;
  deleteConfirmPopupVisible: boolean;
  setDeleteConfirmPopupVisible: (value: boolean) => void;
  currentItemOrder: Item[];
  setCurrentItemOrder: (value: Item[]) => void;
}


function DeletePopup({ deletingItem, deleteConfirmPopupVisible, setDeleteConfirmPopupVisible, currentItemOrder, setCurrentItemOrder }: Props){

  const handleDelete = () => {
    if(!deletingItem) return;
    const updatedItems = currentItemOrder.filter(item => item.id !== deletingItem.id);
    setCurrentItemOrder(updatedItems);
    handleCloseDeletePopup();
    setTimeout(() => {
      const threshold = 100;
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.body.scrollHeight;
  
      if (bottomPosition - scrollPosition <= threshold) {
        window.scrollTo({
          top: bottomPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };
  const handleCloseDeletePopup = () => { setDeleteConfirmPopupVisible(false); }

  return (
    <Popup isOpen={ deleteConfirmPopupVisible } onClose={ handleCloseDeletePopup }>
      {deletingItem && (
        <>
          <p className={ styles.popupTxt }>{`Delete ${deletingItem.name}?`}</p>
          <div>
            <button onClick={ handleDelete } className={ `${ styles.btn } ${styles.deleteBtn}` }>Delete</button>
            <button onClick={ handleCloseDeletePopup } className={ `${ styles.btn } ${styles.cancelBtn}` }>Cancel</button>
          </div>
        </>
      )}
    </Popup>
  );
}

export default DeletePopup;