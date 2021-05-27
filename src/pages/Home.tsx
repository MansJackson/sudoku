import React from 'react';
import '../styles/Home.css';
import Board from '../components/Board';
import { HomeProps } from '../types';
import Controls from '../components/Controls';
import Settings from '../components/Settings';

const Home: React.FunctionComponent<HomeProps> = (): JSX.Element => (
  <div className="home">
    <div className="settings">
      <Settings />
    </div>
    <div className="content">
      <Board />
      <Controls />
    </div>
  </div>
);

export default Home;
