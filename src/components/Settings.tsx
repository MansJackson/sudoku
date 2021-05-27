import { FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import { dispatchA } from '../redux/actions';
import {
  SettingsProps,
  RootState,
  UPDATE_SETTINGS,
  CLEAR_ERRORS,
  UPDATE_ERRORS,
} from '../types';

const Settings = (props: SettingsProps): JSX.Element => {
  const {
    settings: {
      highlightErrors,
      markRestricted,
      removePencilMarks,
    },
    dispatch,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(UPDATE_SETTINGS, { [e.target.name]: e.target.checked });
    if (e.target.name === 'highlightErrors') {
      dispatch(e.target.checked ? UPDATE_ERRORS : CLEAR_ERRORS, {});
    }
  };

  return (
    <div>
      <FormGroup row>
        <FormControlLabel
          control={(
            <Switch
              checked={highlightErrors}
              onChange={handleChange}
              name="highlightErrors"
              color="primary"
            />
          )}
          label="Highlight Errors"
        />
        <FormControlLabel
          control={(
            <Switch
              checked={markRestricted}
              onChange={handleChange}
              name="markRestricted"
              color="primary"
            />
          )}
          label="Mark Restricted Cells"
        />
        <FormControlLabel
          control={(
            <Switch
              checked={removePencilMarks}
              onChange={handleChange}
              name="removePencilMarks"
              color="primary"
            />
          )}
          label="Remove Pencil Marks"
        />
      </FormGroup>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  settings: state.general.settings,
});

export default connect(mapStateToProps, {
  dispatch: dispatchA,
})(Settings);
