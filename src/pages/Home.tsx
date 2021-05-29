import React from 'react';
import '../styles/Home.css';
import Board from '../components/Board';
import { HomeProps } from '../types';
import Controls from '../components/Controls';
import Navbar from '../components/Navbar';

const Home: React.FunctionComponent<HomeProps> = (): JSX.Element => (
  <div className="home">
    <Navbar />
    <div className="content">
      <Board />
      <Controls />
    </div>
  </div>
);

export default Home;
