/**
 *
 * CertificateStepsProcess
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Steps, Modal, Row, Col, Spin, Button } from 'antd';
import axios from 'axios';
import ImageCorrect from 'images/1.svg';
import ImageError from 'images/2.svg';
import ImageSteps from 'images/3.svg';

const { Step } = Steps;

const Image = styled.img`
  height: 100%;
  width: 100%;
  padding: 10px;
`;

/**
 * TODO:
 * [] INSERTAR ESTUDIANTE
 * [] EXPEDIR IDENTIDAD
 * [] ENVIAR CORREO
 */

const initialState = {
  current: 0,
  loading: false,
  status: 'process',
  studentStatus: 'wait',
  identityStatus: 'wait',
  emailStatus: 'wait',
};

class ValidateStepsProcess extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  reset = async () => {
    await this.setState(initialState);
  };

  closeModal = () => {
    this.props.onCancel();
    this.reset();
  };

  initProcess = async () => {
    await this.reset();
    await this.setState({ loading: true });
    try {
      const student = await this.createStudentParticipant();
      await this.incrementStep();

      const card = await this.issueIdentity(student);
      const base64File = await this.base64Encode(card);
      await this.incrementStep();

      await this.sendInvitation(base64File, student);

      await this.setState({ status: 'finish' });
    } catch (error) {
      await this.setState({ status: 'error' });
      console.log(error);
    }
    await this.setState({ loading: false });
  };

  base64Encode = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsBinaryString(file);

      reader.onload = () => {
        resolve(btoa(reader.result));
      };
      reader.onerror = () => {
        reject(new Error('there are some problems'));
      };
    });

  incrementStep = async () => {
    await this.setState(prevState => ({ current: prevState.current + 1 }));
  };

  wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  createStudentParticipant = () => {
    this.setState({ studentStatus: 'process' });
    const { firstName, lastName, email } = this.props;
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:3002/api/Student', {
          $class: 'org.example.mynetwork.Student',
          studentId: email,
          firstName,
          lastName,
          email,
        })
        .then(response => {
          this.setState({ studentStatus: 'finish' });
          resolve(response.data);
        })
        .catch(err => {
          this.setState({ studentStatus: 'error' });
          reject(err);
        });
    });
  };

  issueIdentity = student => {
    this.setState({ identityStatus: 'process' });
    return new Promise((resolve, reject) => {
      axios
        .post(
          'http://localhost:3002/api/system/identities/issue',
          {
            participant: `org.example.mynetwork.Student#${student.studentId}`,
            userID: student.studentId,
            options: {},
          },
          {
            responseType: 'blob',
          },
        )
        .then(response => {
          this.setState({ identityStatus: 'finish' });
          resolve(response.data);
        })
        .catch(err => {
          this.setState({ identityStatus: 'error' });
          reject(err);
        });
    });
  };

  sendInvitation = (base64File, student) => {
    this.setState({ emailStatus: 'process' });
    const { studentId, email, firstName, lastName } = student;
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:4000/api/v1/invitation', {
          recipient: email,
          message: {
            subject: 'Invitacion Certificados académicos en el Blockchain',
            text: `${firstName} ${lastName}, adjuntamos el archivo que te permitira ingresar al blockchain y consultar tus certificados académicos`,
          },
          card: base64File,
          studentId,
        })
        .then(response => {
          this.setState({ emailStatus: 'finish' });
          resolve(response.data);
        })
        .catch(err => {
          this.setState({ emailStatus: 'error' });
          reject(err);
        });
    });
  };

  renderImageStatus = () => {
    const { status } = this.state;
    let imageSrc;

    switch (status) {
      case 'process':
        imageSrc = ImageSteps;
        break;
      case 'finish':
        imageSrc = ImageCorrect;
        break;
      default:
        imageSrc = ImageError;
    }

    return <Image src={imageSrc} alt="Image Process" />;
  };

  renderModalButton = () => {
    const { loading, status } = this.state;

    const text = status !== 'process' ? 'Finalizar' : 'Iniciar proceso';
    const onClickFunction =
      status !== 'process' ? this.closeModal : this.initProcess;

    return [
      <Button
        key="submit"
        type="primary"
        loading={loading}
        onClick={onClickFunction}
      >
        {text}
      </Button>,
    ];
  };

  render() {
    const {
      current,
      loading,
      studentStatus,
      identityStatus,
      emailStatus,
    } = this.state;

    const { visible } = this.props;

    return (
      <Modal
        title="Invitación estudiante"
        centered
        visible={visible}
        maskClosable={false}
        width={800}
        footer={this.renderModalButton()}
        onCancel={this.closeModal}
      >
        <Row type="flex" justify="center" align="middle">
          <Col
            span={12}
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'center',
            }}
          >
            {!loading ? this.renderImageStatus() : <Spin size="large" />}
          </Col>
          <Col span={12}>
            <Steps current={current} direction="vertical">
              <Step
                status={studentStatus}
                title="Crear Estudiante en el blockchain"
                description="Un estudiante es un participante del blockchain"
              />
              <Step
                status={identityStatus}
                title="Expedir una nueva identidad"
                description="Una identidad le permite a un usuario interactuar con el blockchain"
              />
              <Step
                status={emailStatus}
                title="Enviar correo al estudiante"
                description="Se envia correo con un adjunto al correo del estudiante"
              />
            </Steps>
          </Col>
        </Row>
      </Modal>
    );
  }
}

ValidateStepsProcess.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default ValidateStepsProcess;
