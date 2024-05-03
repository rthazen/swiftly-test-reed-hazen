export interface ApiData {
    characters: Character[];
    planets: Planet[];
    species: Species[];
  }
  
export interface Character {
    name: string;
    homeworld: string;
    species: string[];
  }
  
export interface Planet {
    name: string;
  }
  
export interface Species {
    name: string;
  }