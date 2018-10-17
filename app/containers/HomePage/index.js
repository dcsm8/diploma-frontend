/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Form from 'grommet/components/Form';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Footer from 'grommet/components/Footer';
import FormField from 'grommet/components/FormField';
import SearchInput from 'grommet/components/SearchInput';
import DateTime from 'grommet/components/DateTime';
import styled from 'styled-components';
import axios from 'axios';
import moment from 'moment';

import { Button } from 'antd';

import CertificateStepsProcess from 'components/CertificateStepsProcess';
import Section from 'grommet/components/Section';

import 'moment/locale/es';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer';

const Viewer = styled(PDFViewer)`
  flex: 1;
`;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  section: {
    margin: 10,
    padding: 10,
    flex: 1,
    textAlign: 'center',
  },
  image: {
    height: 250,
    width: 250,
  },
  text: {
    fontFamily: 'Oswald',
    fontSize: 25,
  },
  title: {
    fontFamily: 'Oswald',
    fontSize: 50,
  },
});

Font.register(
  `https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf`,
  {
    family: 'Oswald',
  },
);

export default class HomePage extends React.PureComponent {
  state = {
    studentList: [],
    programList: [],
    student: '',
    program: '',
    dateIssued: '',
    modalVisible: false,
  };

  componentDidMount() {
    this.prepareStudentData();
    this.prepareProgramData();
  }

  prepareStudentData = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/Student');
      const studentList = response.data.map(
        ({ studentId, firstName, lastName }) => ({
          label: `${firstName} ${lastName}`,
          value: studentId,
        }),
      );
      this.setState({
        studentList,
      });
    } catch (error) {
      console.log(error);
    }
  };

  prepareProgramData = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/Program');
      const programList = response.data.map(({ programId, title }) => ({
        label: title,
        value: programId,
      }));
      this.setState({
        programList,
      });
    } catch (error) {
      console.log(error);
    }
  };

  onStudentSelect = ({ suggestion }) => {
    this.setState({ student: suggestion });
  };

  onProgramSelect = ({ suggestion }) => {
    this.setState({ program: suggestion });
  };

  onDateChange = formattedDate => {
    const date = moment(formattedDate, 'DD MMMM YYYY');
    const now = moment();

    if (date <= now) {
      this.setState({ dateIssued: formattedDate });
    }
  };

  openModal = e => {
    e.preventDefault();
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  render() {
    const {
      studentList,
      programList,
      student,
      program,
      dateIssued,
      certificateBlob,
      startProcess,
      modalVisible,
    } = this.state;

    const certificate = (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.section}>
            <Text style={styles.title}>Certificado de logro</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>
              {student.label || '<Nombre del Estudiante>'}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>
              {program.label || '<Nombre del Programa>'}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>
              {dateIssued || '<Fecha de Emisión>'}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>FACULTAD TECNOLÓGICA</Text>
            <Text style={styles.text}>
              UNIVERSIDAD DISTRITAL FRANCISCO JOSÉ DE CALDAS
            </Text>
          </View>
        </Page>
      </Document>
    );

    return (
      <div>
        <Section pad="medium">
          <CertificateStepsProcess
            certificateBlob={certificateBlob}
            program={program}
            student={student}
            dateIssued={dateIssued}
            startProcess={startProcess}
            visible={modalVisible}
            onCancel={this.closeModal}
          />
        </Section>

        <Split>
          <Box justify="center" align="center" pad="medium">
            <Form>
              <Header>
                <Heading>Crear Certificado</Heading>
              </Header>
              <FormField label="Estudiante">
                <SearchInput
                  placeHolder="Buscar"
                  suggestions={studentList}
                  onSelect={this.onStudentSelect}
                  value={student || '<Nombre del Estudiante>'}
                />
              </FormField>
              <FormField label="Programa">
                <SearchInput
                  placeHolder="Buscar"
                  suggestions={programList}
                  onSelect={this.onProgramSelect}
                  value={program || '<Nombre del Programa>'}
                />
              </FormField>
              <FormField label="Fecha emisión del certificado">
                <DateTime
                  id="id"
                  name="name"
                  format="DD MMMM YYYY"
                  onChange={this.onDateChange}
                  value={dateIssued || '<Fecha de Emisión>'}
                />
              </FormField>
              <Footer pad={{ vertical: 'medium' }}>
                <Button
                  size="large"
                  onClick={this.openModal}
                  disabled={!(program && dateIssued && student)}
                >
                  Enviar
                </Button>
              </Footer>
            </Form>
          </Box>
          <Box full pad="medium">
            <Viewer>{certificate}</Viewer>
          </Box>
        </Split>
      </div>
    );
  }
}
