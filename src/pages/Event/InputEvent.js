import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, InputNumber, message } from 'antd';
import { SelectEventContext } from '../../Status_Context';
import moment from 'moment';

const InputEvent = () => {
  const [form] = Form.useForm();
  const { setSelectEqEvent } = useContext(SelectEventContext);
  const navigate = useNavigate();

  const onFinish = (values) => {
    // 格式化日期时间
    const formattedDateTime = values.dateTime.format('YYYY-MM-DD HH:mm:ss');
    
    // 构建地震数据对象
    const earthquakeData = {
      O_TIME: formattedDateTime,
      EPI_LAT: values.latitude.toString(),
      EPI_LON: values.longitude.toString(),
      EPI_DEPTH: values.depth,
      M: values.magnitude.toString(),
      LOCATION_C: values.location,
      NEW_DID: `MANUAL${Date.now()}` // 生成手动输入的唯一ID
    };

    // 使用Context更新全局状态
    setSelectEqEvent(earthquakeData);
    
    message.success('地震信息已保存，正在跳转到震情通报');
    navigate('/Reporting');
    
    // 重置表单
    form.resetFields();
    form.setFieldsValue({
      dateTime: moment(),
      depth: 10,
    });
  };

  return (
    <div style={styles.container}>
      <h3>手动输入地震信息</h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          dateTime: moment(),
          depth: 10,
        }}
        style={styles.form}
      >
        <Form.Item
          name="dateTime"
          label="发震时刻"
          rules={[{ required: true, message: '请选择发震时刻' }]}
        >
          <DatePicker 
            showTime 
            format="YYYY-MM-DD HH:mm:ss" 
            style={{ width: '100%' }}
            placeholder="选择发震时刻"
          />
        </Form.Item>

        <Form.Item
          name="magnitude"
          label="震级(M)"
          rules={[{ required: true, message: '请输入震级' }]}
        >
          <InputNumber 
            min={0} 
            max={10} 
            step={0.1} 
            style={{ width: '100%' }}
            placeholder="例如：5.2"
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="震中位置"
          rules={[{ required: true, message: '请输入震中位置' }]}
        >
          <Input placeholder="例如：四川省宜宾市珙县" />
        </Form.Item>

        <Form.Item
          name="longitude"
          label="经度(°)"
          rules={[{ required: true, message: '请输入经度' }]}
        >
          <InputNumber 
            min={0} 
            max={180} 
            step={0.01} 
            style={{ width: '100%' }}
            placeholder="例如：104.85"
          />
        </Form.Item>

        <Form.Item
          name="latitude"
          label="纬度(°)"
          rules={[{ required: true, message: '请输入纬度' }]}
        >
          <InputNumber 
            min={0} 
            max={90} 
            step={0.01} 
            style={{ width: '100%' }}
            placeholder="例如：28.15"
          />
        </Form.Item>

        <Form.Item
          name="depth"
          label="震源深度(km)"
          rules={[{ required: true, message: '请输入震源深度' }]}
        >
          <InputNumber 
            min={0} 
            max={1000} 
            style={{ width: '100%' }}
            placeholder="例如：10"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit"
            style={styles.submitButton}
          >
           确认生成报告
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

// 样式
const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  form: {
    marginTop: '20px',
  },
  submitButton: {
    width: '100%',
    height: '40px',
    fontSize: '16px',
  },
};

export default InputEvent;
