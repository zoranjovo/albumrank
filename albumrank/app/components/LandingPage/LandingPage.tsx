import styles from './landingpage.module.css';
import { SearchResult } from '@util/Types';

interface Props {
  chosenItem: SearchResult | null;
}

function LandingPage({ chosenItem }: Props){

  if(!chosenItem){
    return (
      <div className={ styles.container }>
        <div className={ styles.txtContainer }>
          <h1>^</h1>
          <h2>Search to Begin</h2>
        </div>
      </div>
    );
  }
  
}

export default LandingPage;