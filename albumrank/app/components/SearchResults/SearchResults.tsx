'use client';

import { useRef, useEffect } from 'react';
import styles from './SearchResults.module.css';
import Image from 'next/image';
import { SearchResult } from '@util/Types';
import useOnClickOutside from '@util/useOnClickOutside';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  results: SearchResult[];
  setChosenItem: (value: SearchResult) => void;
}

function SearchResults({ isOpen, setIsOpen, results, setChosenItem }: Props){
  const resultsBoxRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(resultsBoxRef, () => setIsOpen(false));

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setChosenItem(result);
  }

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden';
     } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <div className={`${styles.overlay} ${(results.length > 0 && isOpen) ? styles.fadeIn : styles.fadeOut}`} onClick={ () => setIsOpen(false) }>
      <div className={`${styles.container} ${(results.length > 0 && isOpen) ? styles.containeropen : ''}`} onClick={ (e) => e.stopPropagation()} >
        {results.map((result, index) => (
          <div key={index} className={styles.resultItem} onClick={ () => handleResultClick(result) }>
            <Image
              className={ styles.img }
              src={ result.image }
              width={ 100 }
              height={ 100 }
              alt={ `${result.name} album art/photo`}
            ></Image>
            <p>{result.name}</p>
          </div>
        ))}
      </div>
    </div>
    
  );
}

export default SearchResults;