import Dropdown from '../Dropdown/Dropdown';

import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';
import { SearchResult } from '@util/Types';
import { notify } from '@/app/util/Notify';

interface Props {
  mode: string;
  setMode: (value: string) => void;
  setSearchResults: (value: SearchResult[]) => void;
  setIsSearchResultsOpen: (value: boolean) => void;
}

function SearchBar({ mode, setMode, setSearchResults, setIsSearchResultsOpen }: Props){
  const [searchTerm, setSearchTerm] = useState<string>('');

  const debounceTime = 200;
  useEffect(() => {
    if(searchTerm.trim() === '') return setSearchResults([]);
    const debounceTimer = setTimeout(() => { searchApi(searchTerm, mode); }, debounceTime);
    return () => { clearTimeout(debounceTimer); }
  }, [searchTerm, mode]);

  async function searchApi(query: string, searchMode: string) {
    try {
      const response = await fetch(`/api/search?type=${searchMode.toLowerCase()}&query=${encodeURIComponent(query)}`);
      if(response.status === 200){
        const data = await response.json();
        console.log(data)
        setSearchResults(data.data);
        setIsSearchResultsOpen(true);
      } else if(response.status === 429){
        notify('error', 'This IP is being rate limited');
      } else if(response.status === 500){
        notify('error', 'Internal server error');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    }
  }

  const options = ['Album', 'Artist'];
  return (
    <div className={ styles.fake }>
      <div className={ styles.container }>
        <Dropdown
          options={options}
          selected={ mode }
          onSelect={ setMode }
        />
        <input
          placeholder='Search...'
          value={ searchTerm }
          onChange={ (e) => setSearchTerm(e.target.value) }
          onClick={ () => setIsSearchResultsOpen(true) }
        />
      </div>
    </div>
  );
}

export default SearchBar;