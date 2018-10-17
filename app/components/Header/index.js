/**
 *
 * Header
 *
 */

import React from 'react';
import HeaderBase from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import ActionsBase from 'grommet/components/icons/base/Actions';
import styled from 'styled-components';

const HeaderMenu = styled(HeaderBase)`
  background-color: #552eff;
  color: white;
  padding: 0 2rem;
`;

const Actions = styled(ActionsBase)`
  fill: #fff;
  stroke: #fff;

  &:hover {
    fill: #fff;
    stroke: #fff;
  }
`;

function Header() {
  return (
    <HeaderMenu float={false} fixed={false}>
      <Title>Certificados Universidad Distrital</Title>
      <Box flex justify="end" direction="row" responsive={false}>
        <Menu icon={<Actions />} dropAlign={{ right: 'right' }}>
          <Anchor href="#" className="active">
            First
          </Anchor>
          <Anchor href="#">Second</Anchor>
          <Anchor href="#">Third</Anchor>
        </Menu>
      </Box>
    </HeaderMenu>
  );
}

Header.propTypes = {};

export default Header;
