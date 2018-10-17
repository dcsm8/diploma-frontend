/**
 *
 * Validation
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import styled from 'styled-components';

import ImageValidation from 'images/4.svg';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import { Upload, Button } from 'antd';
import ValidateStepsProcess from 'components/ValidateStepsProcess';

import makeSelectValidation from './selectors';
import reducer from './reducer';
import saga from './saga';

const Image = styled.img`
  height: 100%;
  width: 100%;
  padding-right: 20px;
`;

const TextContainer = styled.div`
  padding-left: 20px;
`;

export class Validation extends React.PureComponent {
  state = {
    file: null,
    modalVisible: false,
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  handleFileUpload = file => {
    this.setState({ file });
    this.openModal();
    return false;
  };

  render() {
    const { modalVisible, file } = this.state;

    const uploadProps = {
      beforeUpload: this.handleFileUpload,
      accept: 'application/pdf',
    };

    return (
      <div>
        <Helmet>
          <title>Validation</title>
          <meta name="description" content="Description of Validation" />
        </Helmet>
        <ValidateStepsProcess
          visible={modalVisible}
          onCancel={this.closeModal}
          file={file}
        />
        <Split>
          <Box full justify="center" align="center" pad="medium">
            <TextContainer>
              <h1>Solución Blockchain para certificados académicos</h1>
              <h2>Facultad Tecnológica - UDFJC</h2>
              <Upload {...uploadProps}>
                <Button size="large" type="upload">
                  Validar Certificado
                </Button>
              </Upload>
            </TextContainer>
          </Box>
          <Box full justify="center" align="center" pad="medium">
            <Image src={ImageValidation} alt="Image Process" />
          </Box>
        </Split>
      </div>
    );
  }
}

Validation.propTypes = {};

const mapStateToProps = createStructuredSelector({
  validation: makeSelectValidation(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'validation', reducer });
const withSaga = injectSaga({ key: 'validation', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Validation);
