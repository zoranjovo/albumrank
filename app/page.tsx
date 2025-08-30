'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';
import LandingPage from './components/LandingPage/LandingPage';
import { SearchResult } from '@util/Types';
import Rating from './components/Rating/Rating';
import { ToastContainer } from 'react-toastify';
import { Suspense } from "react";

function Home() {
  const [searchMode, setSearchMode] = useState<string>('Album');
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState<boolean>(false);
  const [searchResultsState, setSearchResultsState] = useState<SearchResult[]>([]);
  const [chosenItem, setChosenItem] = useState<SearchResult | null>(null);

  return (
    <div>
      <SearchBar mode={ searchMode } setMode={ setSearchMode } setSearchResults={ setSearchResultsState } setIsSearchResultsOpen={ setIsSearchResultsOpen }/>
      <SearchResults isOpen={ isSearchResultsOpen } setIsOpen={ setIsSearchResultsOpen } results={ searchResultsState } setChosenItem={ setChosenItem }/>
      <Suspense fallback={<></>}>
        <Rating mode={ searchMode } setMode={ setSearchMode} chosenItem={ chosenItem } setChosenItem={ setChosenItem }/>
      </Suspense>
      <LandingPage chosenItem={ chosenItem }/>
      <ToastContainer/>
    </div>
  );
}

export default Home;
