/**
 *
 * CertificateStepsProcess
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Steps,
  Modal,
  Row,
  Col,
  Spin,
  Button
} from 'antd';
import ipfsAPI from 'ipfs-api';
import axios from 'axios';
import ImageCorrect from 'images/1.svg';
import ImageError from 'images/2.svg';
import ImageSteps from 'images/3.svg';

const ipfsApi = ipfsAPI('localhost', '5002');

const {
  Step
} = Steps;

const Image = styled.img`
  height: 100%;
  width: 100%;
  padding: 10px;
`;

/**
 * TODO:
 * [] CALCULAR HASH LOCAL
 * [] OBTENER HASH BLOCKCHAIN
 * [] COMPARAR HASH LOCAL Y BLOCKCHAIN
 * [] VERIFICAR FIRMA DIGITAL UDFJC
 * [] VERIFICAR QUE CERTIFICADO NO HA SIDO REVOCADO
 */

const initialState = {
  current: 0,
  loading: false,
  status: 'process',
  ipfsHash: '',
  localStatus: 'wait',
  remoteStatus: 'wait',
  validationStatus: 'wait',
  certificateStatus: 'wait',
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
    const {
      file
    } = this.props;
    await this.setState({
      loading: true
    });
    try {
      await this.calculateLocalHash(file);
      await this.incrementStep();

      const certificate = await this.requestRemoteHash();
      await this.incrementStep();

      await this.verifySignature();
      await this.incrementStep();

      await this.verityStatus(certificate);
      await this.incrementStep();

      await this.setState({
        status: 'finish'
      });
    } catch (error) {
      await this.setState({
        status: 'error'
      });
      console.log(error);
    }
    await this.setState({
      loading: false
    });
  };

  incrementStep = async () => {
    await this.setState(prevState => ({
      current: prevState.current + 1
    }));
  };

  wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  calculateLocalHash = file => {
    this.setState({
      localStatus: 'process'
    });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const buffer = Buffer.from(reader.result);
        ipfsApi
          .add(buffer, {
            progress: prog => console.log(`received: ${prog}`)
          })
          .then(response => {
            const ipfsId = response[0].hash;
            console.log(ipfsId);
            this.setState({
              localStatus: 'finish',
              ipfsHash: ipfsId
            });
            resolve(ipfsId);
          })
          .catch(err => {
            this.setState({
              localStatus: 'error'
            });
            reject(err);
          });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  requestRemoteHash = () => {
    this.setState({
      remoteStatus: 'process'
    });
    return new Promise((resolve, reject) => {
      axios
        .get('http://localhost:3002/api/queries/selectDiplomaByHash', {
          params: {
            ipfsUrl: this.state.ipfsHash,
          },
        })
        .then(response => {
          if (response.data.length > 0) {
            this.setState({
              remoteStatus: 'finish'
            });
            resolve(response.data[0]);
          } else {
            this.setState({
              remoteStatus: 'error'
            });
            reject(new Error('Hash not found in blockchain'));
          }
        })
        .catch(err => {
          this.setState({
            remoteStatus: 'error'
          });
          reject(err);
        });
    });
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

  verifySignature = async () => {
    const {
      file
    } = this.props;
    const base64File = await this.base64Encode(file);
    this.setState({
      validationStatus: 'process'
    });
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:4000/api/v1/signature/validate', {
          file: base64File,
        })
        .then(response => {
          const {
            data
          } = response;
          if (data.valid) {
            this.setState({
              validationStatus: 'finish'
            });
            resolve();
          } else {
            this.setState({
              validationStatus: 'error'
            });
            reject(new Error('The signature is not valid'));
          }
        })
        .catch(err => {
          this.setState({
            validationStatus: 'error'
          });
          reject(err);
        });
    });
  };

  verityStatus = certificate => {
    this.setState({
      certificateStatus: 'process'
    });
    return new Promise((resolve, reject) => {
      if (certificate.valid) {
        this.setState({
          certificateStatus: 'finish'
        });
        resolve();
      } else {
        this.setState({
          certificateStatus: 'error'
        });
        reject();
      }
    });
  };

  renderImageStatus = () => {
    const {
      status
    } = this.state;
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

    return <Image src={
      imageSrc
    }
      alt="Image Process" />;
  };

  renderModalButton = () => {
    const {
      loading,
      status
    } = this.state;

    const text = status !== 'process' ? 'Finalizar' : 'Iniciar proceso';
    const onClickFunction =
      status !== 'process' ? this.closeModal : this.initProcess;

    return [<Button
      key="submit"
      type="primary"
      loading={
        loading
      }
      onClick={
        onClickFunction
      } > {
        text
      } </Button>,
    ];
  };

  render() {
    const {
      current,
      loading,
      status,
      localStatus,
      remoteStatus,
      validationStatus,
      certificateStatus,
    } = this.state;

    const {
      visible
    } = this.props;

    return (<Modal title="Validación de Certificado"
      centered visible={
        visible
      }
      maskClosable={
        false
      }
      width={
        800
      }
      footer={
        this.renderModalButton()
      }
      onCancel={
        this.closeModal
      }>
      <Row type="flex"
        justify="center"
        align="center" > {
          status === 'finish' && < h1 > Certificado Válido </h1>}
      </Row>
      <Row type="flex"
        justify="center"
        align="center" > {
          status === 'error' && <h1> Certificado Inválido </h1>} </Row>
      <Row type="flex"
        justify="center"
        align="middle" >
        <Col
          span={
            12
          }
          style={
            {
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'center',
            }
          }> {!loading ? this.renderImageStatus() : <Spin size="large" />
          } </Col>
        <Col span={
          12
        }>
          <Steps current={
            current
          }
            direction="vertical" >
            <Step
              status={
                localStatus
              }
              title="Calcular hash local"
              description="Obtener el hash del documento en el IPFS" />
            <Step
              status={
                remoteStatus
              }
              title="Comparar hash hocal y hash blockchain"
              description="Buscar que exista algún activo con ese hash en el blockchain" />
            <Step
              status={
                validationStatus
              }
              title="Verificar firma digital UDFJC"
              description="Verificar que el archivo no ha sido modificado y tiene la firma digital de la Universidad" />
            <Step
              status={
                certificateStatus
              }
              title="Verificar certificado revocado"
              description="Verificar que el certificado no haya sido revocado por la Universidad" /
            >
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
  file: PropTypes.instanceOf(Blob),
};

export default ValidateStepsProcess;
