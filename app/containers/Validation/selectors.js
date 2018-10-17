import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the validation state domain
 */

const selectValidationDomain = state => state.get('validation', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by Validation
 */

const makeSelectValidation = () =>
  createSelector(selectValidationDomain, substate => substate.toJS());

export default makeSelectValidation;
export { selectValidationDomain };
