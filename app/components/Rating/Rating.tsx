'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Rating.module.css';
import { SearchResult, Item } from '@util/Types'
import Image from 'next/image';
import { X } from 'lucide-react';
import SpotifyLogo from './spotify.svg'
import { useSearchParams } from 'next/navigation';
import { notify } from '@util/Notify';

import DeletePopup from './Popups/DeletePopup';
import ResetPopup from './Popups/ResetPopup';
import SharePopup from './Popups/SharePopup';

interface Props {
  mode: string;
  setMode: (value: string) => void;
  chosenItem: SearchResult | null;
  setChosenItem: (value: SearchResult) => void;
}

function Rating({ mode, setMode, chosenItem, setChosenItem }: Props){
  const [includeSingles, setIncludeSingles] = useState<boolean>(false);
  const [showRanking, setShowRanking] = useState<boolean>(true);
  const [currentItemOrder, setCurrentItemOrder] = useState<Item[]>([]);
  const [initialItemOrder, setInitialItemOrder] = useState<Item[]>([]);

  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [deleteConfirmPopupVisible, setDeleteConfirmPopupVisible] = useState<boolean>(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const [resetPopupVisible, setResetPopupVisible] = useState<boolean>(false);

  const [itemRedirectType, setItemRedirectType] = useState<string>('track');

  const [sharePopupVisible, setSharePopupVisible] = useState<boolean>(false);
  const [shareName, setShareName] = useState<string>('');
  const [shareURL, setShareURL] = useState<string>('');
  const [skipFirstUpdate, setSkipFirstUpdate] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if(currentItemOrder){ setShareURL(encodeURL()); }
  }, [shareName, currentItemOrder, includeSingles, chosenItem, mode]);
  

  useEffect(() => {
  const query = searchParams.get('s') || '';
  if(query){
    const loadData = async () => {
      try {
        setLoading(true);
        const decodedState = atob(query);
        const parsedState = JSON.parse(decodedState);
        const modes = ['Artist', 'Album'];
        
        setMode(modes[parsedState[0]]);
        setIncludeSingles(parsedState[2]);
        setSkipFirstUpdate(true);
        
        const payload = await searchApi(modes[parsedState[0]], parsedState[1]);
        const chosenItemInsert = {
          id: parsedState[1],
          name: payload.info.name,
          image: payload.info.img,
          releaseDate: "",
          type: ""
        }
        setChosenItem(chosenItemInsert);
        setInitialItemOrder(payload.items);

        const orderIndices = parsedState[3];
        const indicesArray = orderIndices.split(',').map(Number);
        const reorderedItems = indicesArray.map((index: number) => payload.items[index]);
        setCurrentItemOrder(reorderedItems);

        if(parsedState[4]){ setShareName(parsedState[4]); }
        setLoading(false);
      } catch(error) {
        console.log('Error decoding URL state:', error);
        notify('error', 'Broken URL, will not load list.');
        setLoading(false);
        const url = new URL(window.location.href);
        url.searchParams.delete('s');
        window.history.replaceState({}, document.title, url.toString());
      }
    };
    loadData();
  }
}, []);

  
  useEffect(() => {
    if(mode === 'Album') setItemRedirectType('track');
    if(mode === 'Artist') setItemRedirectType('album');
    setShareName('');
  }, [mode]);
  
  useEffect(() => {
    const fetchAPI= async () => {
      if(chosenItem){
        const data = await searchApi(mode, chosenItem.id);
        setCurrentItemOrder(data.items);
        setInitialItemOrder(data.items);
      }
      setShareName('');
    }
    if(skipFirstUpdate){
      setSkipFirstUpdate(false);
    } else {
      fetchAPI();
    }
  }, [chosenItem]);


  async function searchApi(mode: string, id: string) {
    try {
      const response = await fetch(`/api/getitems?type=${mode.toLowerCase()}&id=${id}`);
      if(response.status === 200){
        const data = await response.json();
        return data.payload;
      } else if(response.status === 429){
        notify('error', 'This IP is being rate limited');
      }
      
    } catch(error) {
      console.error('Error fetching search results:', error);
      return [];
    }
  }


  const touchStartY = useRef(0);
  const draggedElement = useRef<any>(null);

  const handleDragStart = (item: Item) => { setDraggedItem(item); }
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(targetId);
  };
  const handleDrop = (targetId: string) => {
    if(!draggedItem) return;
    reorderItems(targetId);
  };

  const handleTouchStart = (e: any, item: any) => {
    touchStartY.current = e.touches[0].clientY;
    draggedElement.current = e.currentTarget;
    setDraggedItem(item);
    
    if (draggedElement.current) {
      draggedElement.current.style.opacity = '0.5';
      draggedElement.current.style.transform = 'scale(1.02)';
    }
  };

  const handleTouchMove = (e: any) => {
    if (!draggedElement.current) return;

    e.preventDefault();
    
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    const droppableElement = elements.find(el => 
      el.classList.contains(styles.item) && el !== draggedElement.current
    );

    if (droppableElement) {
      const targetId = droppableElement.getAttribute('data-id');
      setDragOverId(targetId);
    }
  };

  const handleTouchEnd = (e: any) => {
    if (!draggedElement.current) return;

    draggedElement.current.style.opacity = '1';
    draggedElement.current.style.transform = 'none';

    const touch = e.changedTouches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const droppableElement = elements.find(el => 
      el.classList.contains(styles.item) && el !== draggedElement.current
    );

    if (droppableElement) {
      const targetId = droppableElement.getAttribute('data-id');
      reorderItems(targetId);
    }

    setDraggedItem(null);
    setDragOverId(null);
    draggedElement.current = null;
  };

  const reorderItems = (targetId: any) => {
    const newOrder = [...currentItemOrder];
    const draggedIndex = newOrder.findIndex(item => item.id === draggedItem?.id);
    const targetIndex = newOrder.findIndex(item => item.id === targetId);
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setCurrentItemOrder(newOrder);
  };


  const handleOpenDeletePopup = (item: Item) => {
    setDeleteConfirmPopupVisible(true);
    setDeletingItem(item);
  }

  const handleReset = () => {
    setCurrentItemOrder(initialItemOrder);
    setResetPopupVisible(false);
    setShareName('');
  }

  const openSharePopup = () => {
    setShareName('');
    setSharePopupVisible(true);
  }

  

  const encodeURL = () => {
    const compressBoolean = (b: boolean): number => +b;
    const compressOrder = (order: Item[], initialOrder: Item[]): string => { return order.map(item => initialOrder.findIndex(originalItem => originalItem.id === item.id)).toString() };
    const modeMap: Record<string, number> = { Artist: 0, Album: 1 };

    const stateToEncode = [
      modeMap[mode],
      chosenItem?.id,
      compressBoolean(includeSingles),
      compressOrder(currentItemOrder, initialItemOrder),
      shareName,
    ];
  
    const stateJSON = JSON.stringify(stateToEncode);
    const base64EncodedState = btoa(stateJSON);
    return `${window.location.origin}?s=${base64EncodedState}`;
  };
  

  return (
    <div className={ styles.container }>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <p className={ styles.loading }>...</p>
        </div>
      )}
      {chosenItem && (
        <>
          <div className={ styles.header }>
            <Image
              className={ styles.img }
              src={ chosenItem.image }
              width={ 100 }
              height={ 100 }
              alt={ `${chosenItem.name} album art/photo`}
            ></Image>
            <p>{ chosenItem.name }</p>
            <a className={ styles.spotifyLogoContainer } href={ `https://open.spotify.com/${mode.toLowerCase()}/${chosenItem.id}` } target='_blank' rel='noopener noreferrer'>
              <Image src={ SpotifyLogo } alt="Spotify Logo" />
            </a>
          </div>
          <div className={styles.itemsContainer}>
            {currentItemOrder === initialItemOrder && (<p>Drag to reorder</p>)}
            {shareName && (<p>{`${shareName}'s Ranking`}</p>)}
            {currentItemOrder && currentItemOrder.map((item, index) => {
              if(!item) return;
              if(!includeSingles && item.type !== 'album' && mode == 'Artist'){ return null; }
              return (
                <div className={styles.itemContainer} key={item.id}>
            {showRanking && (
              <p className={styles[`number${index + 1}`]}>{index + 1}</p>
            )}
            <div
              className={`${styles.item} ${
                draggedItem?.id === item.id ? styles.dragging : ''
              } ${dragOverId === item.id ? styles.dragOver : ''}`}
              draggable
              data-id={item.id}
              onDragStart={() => handleDragStart(item)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={() => {
                setDraggedItem(null);
                setDragOverId(null);
              }}
              onDrop={() => handleDrop(item.id)}
              onTouchStart={(e) => handleTouchStart(e, item)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <Image
                className={styles.img}
                src={item.image}
                width={100}
                height={100}
                alt={`${item.name} album art/photo`}
                draggable="false"
              />
              <div>
                <p>{item.name}</p>
                <h2>{item.releaseDate}</h2>
              </div>
              <a
                className={styles.spotifyLogoContainer}
                href={`https://open.spotify.com/${itemRedirectType}/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src={SpotifyLogo} alt="Spotify Logo" />
              </a>
              <X
                className={styles.deleteIcon}
                onClick={() => handleOpenDeletePopup(item)}
                size={20}
              />
            </div>
          </div>
                
              )
            })}

            <div className={ styles.bottom }>
              {mode === 'Artist' && currentItemOrder.some(item => item && item.type === 'single') && (
                <div className={ styles.checkbox }>
                  <label htmlFor="includeSingles">
                    <input
                      type="checkbox"
                      id="includeSingles"
                      checked={ includeSingles }
                      onChange={ () => setIncludeSingles(!includeSingles) }
                    />
                    Include Singles
                  </label>
                </div>
              )}
              <div className={ styles.checkbox }>
                <label htmlFor="showRanking">
                  <input
                    type="checkbox"
                    id="showRanking"
                    checked={ showRanking }
                    onChange={ () => setShowRanking(!showRanking) }
                  />
                  Show Ranking
                </label>
              </div>
              <button onClick={ () => setResetPopupVisible(true) } className={ styles.deleteBtn }>Reset</button>
              <button onClick={ openSharePopup } className={ styles.copyBtn }>Share</button>
            </div>

          </div>
        </>
      )}



      <DeletePopup 
        deletingItem={ deletingItem }
        deleteConfirmPopupVisible={ deleteConfirmPopupVisible } 
        setDeleteConfirmPopupVisible={ setDeleteConfirmPopupVisible }
        currentItemOrder={ currentItemOrder }
        setCurrentItemOrder={ setCurrentItemOrder }
      />

      <ResetPopup
        resetPopupVisible={ resetPopupVisible }
        setResetPopupVisible={ setResetPopupVisible }
        handleReset={ handleReset }
      />

      <SharePopup
        sharePopupVisible={ sharePopupVisible }
        setSharePopupVisible={ setSharePopupVisible }
        shareName={ shareName }
        setShareName={ setShareName }
        shareURL={ shareURL }
        setShareURL={ setShareURL }
      />
      
    </div>
  );
}

export default Rating;