import React from 'react';
import '../styles/Home.css';
import Board from '../components/Board';
import { HomeProps } from '../types';

const Home: React.FunctionComponent<HomeProps> = (): JSX.Element => (
  <div className="home">
    <Board />
  </div>
);

export default Home;
