import React from 'react';
import { connect } from 'react-redux';
import '../styles/Home.css';
import Board from '../components/Board';
import { HomeProps, RootState } from '../types';

const Home: React.FunctionComponent<HomeProps> = (props: HomeProps): JSX.Element => {
  const { isLoading } = props;

  return (
    <div className="home">
      <Board />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  isLoading: state.general.isLoading,
});

export default connect(mapStateToProps, {})(Home);
