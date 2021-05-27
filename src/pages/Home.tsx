import React from 'react';
import '../styles/Home.css';
import Board from '../components/Board';
import { HomeProps } from '../types';
import Controls from '../components/Controls';

const Home: React.FunctionComponent<HomeProps> = (): JSX.Element => (
  <div className="home">
    <Board />
    <Controls />
  </div>
);

export default Home;
