/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import ValidationPage from 'containers/Validation/Loadable';
import StudentPage from 'containers/Student/Loadable';
import Container from 'grommet/components/App';
import Header from 'components/Header';

export default function App() {
  return (
    <Container>
      <Header />
      <Switch>
        <Route exact path="/" component={ValidationPage} />
        <Route exact path="/certificate" component={HomePage} />
        <Route exact path="/student" component={StudentPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Container>
  );
}
