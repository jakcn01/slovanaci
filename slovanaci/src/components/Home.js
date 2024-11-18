import LastMatch from "./LastMatch";

const Home = () => {
    
    return (
      <div className='players-container'>
        <h1>Slovaňáci</h1>
        <span>
          Jednoduchý web pro zaznamenávání našich výsledků. Příjímám všechny návrhhy na úpravu :)
        </span>
        <LastMatch />
      </div>
    );
  };
  
  export default Home;