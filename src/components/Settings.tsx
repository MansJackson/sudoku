import { FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import '../styles/Settings.css';
import { dispatchA } from '../redux/actions';
import {
  SettingsProps,
  RootState,
  UPDATE_SETTINGS,
} from '../lib/types';

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
  };

  return (
    <div className="settings">
      <FormGroup row>
        <FormControlLabel
          control={(
            <Switch
              size="small"
              checked={highlightErrors}
              onChange={handleChange}
              name="highlightErrors"
              color="primary"
            />
          )}
          className="switch_label"
          color="primary"
          label="Highlight Errors"
        />
        <FormControlLabel
          control={(
            <Switch
              size="small"
              checked={markRestricted}
              onChange={handleChange}
              name="markRestricted"
              color="primary"
            />
          )}
          className="switch_label"
          color="primary"
          label="Mark Restricted Cells"
        />
        <FormControlLabel
          control={(
            <Switch
              size="small"
              checked={removePencilMarks}
              onChange={handleChange}
              name="removePencilMarks"
              color="primary"
            />
          )}
          className="switch_label"
          color="primary"
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
