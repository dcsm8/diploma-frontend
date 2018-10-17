import { fromJS } from 'immutable';
import validationReducer from '../reducer';

describe('validationReducer', () => {
  it('returns the initial state', () => {
    expect(validationReducer(undefined, {})).toEqual(fromJS({}));
  });
});
