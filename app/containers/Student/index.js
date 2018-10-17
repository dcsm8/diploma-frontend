/**
 *
 * Student
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';

import ImageValidation from 'images/5.svg';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import FormField from 'grommet/components/FormField';
import TextInput from 'grommet/components/TextInput';
import Form from 'grommet/components/Form';
import Footer from 'grommet/components/Footer';
import Button from 'grommet/components/Button';
import StudentStepsProcess from 'components/StudentStepsProcess';
import styled from 'styled-components';

const Image = styled.img`
  height: 100%;
  width: 100%;
  padding-right: 20px;
`;

/* eslint-disable react/prefer-stateless-function */
export class Student extends React.PureComponent {
  state = {
    modalVisible: false,
    firstName: '',
    lastName: '',
    email: '',
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({
      modalVisible: false,
      firstName: '',
      lastName: '',
      email: '',
    });
  };

  onInputChange = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  onSubmit = e => {
    e.preventDefault();

    this.openModal();
  };

  render() {
    const { modalVisible, firstName, lastName, email } = this.state;

    return (
      <div>
        <StudentStepsProcess
          visible={modalVisible}
          onCancel={this.closeModal}
          email={email}
          firstName={firstName}
          lastName={lastName}
        />
        <Helmet>
          <title>Student</title>
          <meta name="description" content="Description of Student" />
        </Helmet>
        <Split>
          <Box full justify="center" align="center" pad="medium">
            <h1>Invitar estudiante</h1>
            <Form>
              <FormField label="Nombres">
                <TextInput
                  id="firstName"
                  name="firstName"
                  onDOMChange={this.onInputChange}
                  value={firstName}
                />
              </FormField>
              <FormField label="Apellidos">
                <TextInput
                  id="lastName"
                  name="lastName"
                  onDOMChange={this.onInputChange}
                  value={lastName}
                />
              </FormField>
              <FormField label="Correo">
                <TextInput
                  id="email"
                  name="email"
                  onDOMChange={this.onInputChange}
                  value={email}
                />
              </FormField>
              <Footer pad="medium">
                <Button label="Enviar" type="submit" onClick={this.onSubmit} />
              </Footer>
            </Form>
          </Box>
          <Box full justify="center" align="center" pad="medium">
            <Image src={ImageValidation} alt="Image Process" />
          </Box>
        </Split>
      </div>
    );
  }
}

Student.propTypes = {};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(Student);
