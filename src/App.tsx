import React, { useState } from 'react';
import { useApiData } from './state/ApiDataContext';
import './App.css';
import logo from './logo.svg';
import Loader from './assets/Loader.svg';


const App = () => {
  const { apiData, loading } = useApiData();
  const [searchTerm, setSearchTerm] = useState('');

  const findMatches = (wordToMatch: string | RegExp) => {
    return apiData.characters.filter((character) => {
      const regex = typeof wordToMatch === 'string' ? new RegExp(wordToMatch, 'gi') : wordToMatch;
      const speciesName = character.species.length > 0 ? character.species.map(speciesUrl => getSpeciesName([speciesUrl])).join(', ') : 'Human';
      return (
        character.name.match(regex) ||
        getPlanetName(character.homeworld).match(regex) ||
        speciesName.match(regex) ||
        (wordToMatch === 'Human' && character.species.length === 0)
      );
    });
  }
  
  const getPlanetName = (planetUrl: string) => {
    const planetId = planetUrl.split('/').slice(-2, -1)[0];
    const numberPlanets = Number(planetId) - 1
    return apiData.planets[numberPlanets] ? apiData.planets[numberPlanets].name : '';
  }

  const getSpeciesName = (speciesUrls: string[]) => {
    if (speciesUrls.length === 0) {
      return 'Human';
    }
  
    return speciesUrls.map(speciesUrl => {
      const speciesId = speciesUrl.split('/').slice(-2, -1)[0];
      const numberSpecies = Number(speciesId) - 1;
      return apiData.species[numberSpecies] ? apiData.species[numberSpecies].name : 'Human';
    }).join(', ');
  }
  
  const displayMatches = () => {
    const matchedCharacters = findMatches(searchTerm);
    if (matchedCharacters.length === 0) {
      return <li>No results found</li>;
    }
    // have to have a fallback for when the species array is empty as it always is for 'Human'
    return matchedCharacters.map((character, index) => (
      <li key={index} className="characterListItem">
        <span className="name">{character.name}</span>
        <span className="homeworld">{getPlanetName(character.homeworld)}</span>
        <span className="species">
          {character.species.length > 0
            ? character.species.map(speciesUrl => getSpeciesName([speciesUrl])).join(', ')
            : 'Human'}
        </span>
      </li>
    ));
  }
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }

  console.log('apiData', apiData);
  console.log('loading', loading);
  
  return (
    <div className="App">
      {loading ? (
        <div className="loaderContainer">
          <img src={Loader} className="loaderWheel" alt="loader" />
        </div>
        ) : (
      <form className="searchForm">
        <input
          type="text"
          className="search"
          placeholder="Search by name, homeworld, or species"
          onChange={handleSearch}
        />
        
          <ul className="suggestions">
            {displayMatches()}
          </ul>
      </form>
      )}
    </div>
  );
}

export default App;
