/**
 *
 * CertificateStepsProcess
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Steps, Modal, Row, Col, Spin, Button } from 'antd';
import ipfsAPI from 'ipfs-api';
import uuid from 'uuid/v1';
import axios from 'axios';
import moment from 'moment';
import ImageCorrect from 'images/1.svg';
import ImageError from 'images/2.svg';
import ImageSteps from 'images/3.svg';
import Anchor from 'grommet/components/Anchor';

const ipfsApi = ipfsAPI('localhost', '5002');

const { Step } = Steps;

const Image = styled.img`
  height: 100%;
  width: 100%;
  padding: 10px;
`;

const LinkContainer = styled.div`
  padding-bottom: 20px;
`;

/**
 * TODO:
 * [X] COMPLETE FORM
 * [X] SIGN PDF
 * [X] UPLOAD PDF TO IPFS
 * [X] TRANSACTION CREATE CERTIFICATE IN BLOCKCHAIN
 * [X] SEND EMAIL USER
 */

const initialState = {
  current: 0,
  signatureStatus: 'wait',
  ipfsStatus: 'wait',
  transactionStatus: 'wait',
  emailStatus: 'wait',
  loading: false,
  status: 'process',
  ipfsHash: '',
};

class CertificateStepsProcess extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  reset = async () => {
    await this.setState(initialState);
  };

  closeModal = () => {
    this.props.onCancel();
    this.reset();
  };

  initProcess = async () => {
    await this.reset();
    await this.setState({
      loading: true,
    });
    try {
      await this.incrementStep();
      const certificateBlob = await this.signDocument();
      await this.incrementStep();
      const ipfsHash = await this.uploadFileToIPFS(certificateBlob);
      await this.incrementStep();
      await this.createDiplomaAsset(ipfsHash);
      await this.incrementStep();
      await this.sendEmail();
      await this.incrementStep();
      await this.setState({
        status: 'finish',
      });
    } catch (error) {
      await this.setState({
        status: 'error',
      });
      console.log(error);
    }
    await this.setState({
      loading: false,
    });
  };

  incrementStep = async () => {
    await this.setState(prevState => ({
      current: prevState.current + 1,
    }));
  };

  wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  signDocument = async () => {
    const { dateIssued, student, program } = this.props;
    this.setState({
      signatureStatus: 'process',
    });
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:4000/api/v1/signature', {
          date: dateIssued,
          student: student.label,
          program: program.label,
        })
        .then(response => {
          const { data } = response;
          const blob = this.base64ToBlob(data.document);
          this.setState({
            signatureStatus: 'finish',
          });
          resolve(blob);
        })
        .catch(err => {
          this.setState({
            signatureStatus: 'error',
          });
          reject(err);
        });
    });
  };

  base64ToBlob = base64str => {
    const buf = new Buffer.from(base64str, 'base64');
    return new Blob([new Uint8Array(buf)]);
  };

  createDiplomaAsset = ipfsHash => {
    const { dateIssued, student, program } = this.props;
    const date = moment(dateIssued, 'DD MMMM YYYY').format();
    this.setState({
      transactionStatus: 'process',
    });
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:3002/api/Diploma', {
          $class: 'org.example.mynetwork.Diploma',
          diplomaId: uuid(),
          ipfsUrl: ipfsHash,
          date,
          valid: true,
          university: 'resource:org.example.mynetwork.University#2880',
          student: `resource:org.example.mynetwork.Student#${student.value}`,
          program: `resource:org.example.mynetwork.Program#${program.value}`,
        })
        .then(response => {
          this.setState({
            transactionStatus: 'finish',
          });
          resolve(response);
        })
        .catch(err => {
          this.setState({
            transactionStatus: 'error',
          });
          reject(err);
        });
    });
  };

  uploadFileToIPFS = async file => {
    this.setState({
      ipfsStatus: 'process',
    });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(reader);
        const buffer = Buffer.from(reader.result);
        ipfsApi
          .add(buffer, {
            progress: prog => console.log(`received: ${prog}`),
          })
          .then(response => {
            const ipfsId = response[0].hash;
            this.setState({
              ipfsStatus: 'finish',
              ipfsHash: ipfsId,
            });
            resolve(ipfsId);
          })
          .catch(err => {
            this.setState({
              ipfsStatus: 'error',
            });
            reject(err);
          });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  sendEmail = () => {
    this.setState({
      emailStatus: 'process',
    });
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:4000/api/v1/communicate', {
          recipient: 'deividsanchez96@hotmail.com',
          message: {
            subject: 'Test Message',
            text: 'Test text',
          },
        })
        .then(response => {
          this.setState({
            emailStatus: 'finish',
          });
          resolve(response);
        })
        .catch(err => {
          this.setState({
            emailStatus: 'error',
          });
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

    const text = status === 'finish' ? 'Finalizar' : 'Crear Certificado';
    const onClickFunction =
      status === 'finish' ? this.closeModal : this.initProcess;

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
      ipfsStatus,
      current,
      transactionStatus,
      emailStatus,
      signatureStatus,
      loading,
      ipfsHash,
      status,
    } = this.state;

    const { visible } = this.props;

    const ipfsLink = `http://localhost:5002/ipfs/${ipfsHash}`;

    const showLink = ipfsHash && status === 'finish';

    return (
      <Modal
        title="Nuevo Certificado"
        centered
        visible={visible}
        onOk={this.initProcess}
        onCancel={this.closeModal}
        maskClosable={false}
        width={800}
        footer={this.renderModalButton()}
      >
        <Row type="flex" justify="center" align="center">
          {showLink && (
            <LinkContainer>
              <Anchor
                label="Ver certificado"
                href={ipfsLink}
                primary
                target="_blank"
              />
            </LinkContainer>
          )}
        </Row>
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
                title="Formulario"
                description="Selección de estudiante, programa y fecha"
              />
              <Step
                status={signatureStatus}
                title="Firma Digital"
                description="Añadir firma digital al PDF"
              />
              <Step
                status={ipfsStatus}
                title="IPFS"
                description="Cargar el certificado al Sistema Interplanetario de Archivos (IPFS)"
              />
              <Step
                status={transactionStatus}
                title="Transacción Blockchain"
                description="Crear el certificado en el Blockchain Hyperledger"
              />
              <Step
                status={emailStatus}
                title="Enviar Correo"
                description="Notificación al estudiante de su certificado"
              />
            </Steps>
          </Col>
        </Row>
      </Modal>
    );
  }
}

CertificateStepsProcess.propTypes = {
  program: PropTypes.object.isRequired,
  student: PropTypes.object.isRequired,
  dateIssued: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.bool.isRequired,
};

export default CertificateStepsProcess;
