import {
  Button, Col, Form, Input, Layout, message, Modal, Popconfirm, Row, Space, Table,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';

const { Column } = Table;
const { Content } = Layout;
const { Search } = Input;

function ScoreboardsPage({ academy }) {
  const axios = useAxios();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState({});
  const [editingScoreboard, setEditingScoreboard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  const requestDataSource = useCallback(async (search = '') => {
    const response = await axios.get('scoreboard', {
      params: {
        academyId: academy.id,
        currentPage: page,
        search,
        perPage: 10,
      },
    });

    setDataSource(response.data);
  }, [axios, page, academy.id]);

  useEffect(() => {
    requestDataSource();
  }, [requestDataSource]);

  function onSearch(value) {
    requestDataSource(value);
  }

  function openCreateOrEditScoreboardModal(scoreboard) {
    setModalVisible(true);

    if (scoreboard) {
      setEditingScoreboard(scoreboard);
      form.setFieldsValue(scoreboard);
    }
  }

  async function onRemove(scoreboard) {
    try {
      await axios.delete(`scoreboard/${scoreboard.id}`);
      message.success('O placar foi desabilitado com sucesso.');
    } catch (error) {
      message.error('Ocorreu um erro ao desabilitar o placar.');
    } finally {
      requestDataSource();
    }
  }

  function handleCancel() {
    setModalVisible(false);
    setEditingScoreboard(null);

    form.resetFields();
  }

  async function createScoreboard(values) {
    try {
      await axios.post('scoreboard/', { ...values, academyId: academy.id });
      message.success('O placar foi criado com sucesso.');

      handleCancel();
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao criar o placar.' } = data;

      message.error(msg);
    } finally {
      requestDataSource();
    }
  }

  async function updateScoreboard(values) {
    try {
      await axios.put(`/scoreboard/${editingScoreboard.id}`, values);
      message.success('O placar foi atualizado com sucesso.');

      handleCancel();
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao atualizar o placar.' } = data;

      message.error(msg);
    } finally {
      requestDataSource();
    }
  }

  function handleOk() {
    form
      .validateFields()
      .then((values) => {
        if (editingScoreboard) { return updateScoreboard(values); }
        return createScoreboard(values);
      });
  }

  function renderModal() {
    return (
      <Modal
        visible={modalVisible}
        title={editingScoreboard ? 'Editar placar' : 'Criar placar'}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Row>
          <Col span={16}>
            <Form size="large" layout="vertical" form={form}>
              <Form.Item
                name="description"
                label="Descrição"
                rules={[{ required: true, message: 'Por favor escolha uma descrição' }]}
              >
                <Input placeholder="Placar quadra 1" />
              </Form.Item>
              <Form.Item
                name="serialNumber"
                label="Identificador único"
                rules={[{ required: true, message: 'Por favor digite o identificador único do placar' }]}
              >
                <Input placeholder="1234" />
              </Form.Item>
              <Form.Item
                name="staticToken"
                label="Token estático"
                rules={[{ required: true, message: 'Por favor digite o token estático do placar' }]}
              >
                <Input placeholder="1234" />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }

  function renderActions(scoreboard) {
    return (
      <Space>
        <a onClick={() => openCreateOrEditScoreboardModal(scoreboard)}>Editar</a>
        <Popconfirm title="Tem certeza?" onConfirm={() => onRemove(scoreboard)}>
          <a>Desabilitar</a>
        </Popconfirm>
      </Space>
    );
  }

  return (
    <Layout style={{ backgroundColor: 'white' }}>
      <Form>
        <Row>
          <Col span={8}>
            <Form.Item>
              <Search onSearch={onSearch} size="large" placeholder="Pesquisar placar" />
            </Form.Item>
          </Col>
          <Col flex="auto" />
          <Col>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                onClick={() => openCreateOrEditScoreboardModal()}
              >
                Cadastrar placar
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Content>
        <Table
          bordered
          loading={!dataSource}
          rowKey="id"
          dataSource={dataSource ? dataSource.data : []}
          rowClassName="cursor"
          pagination={{
            current: page,
            onChange: (x) => setPage(x),
            pageSize: 10,
            total: dataSource && dataSource.pagination ? dataSource.pagination.total : 0,
          }}
        >
          <Column title="Descrição" dataIndex="description" />
          <Column title="Identificador único" dataIndex="serialNumber" />
          <Column title="Token estático" dataIndex="staticToken" />
          <Column title="Ações" key="actions" render={renderActions} />

        </Table>
        {renderModal()}
      </Content>
    </Layout>
  );
}

export default ScoreboardsPage;
