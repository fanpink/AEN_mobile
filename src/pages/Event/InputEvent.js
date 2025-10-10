import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, InputNumber, message } from 'antd';
import { SelectEventContext } from '../../Status_Context';
import moment from 'moment';

const InputEvent = () => {
  const [form] = Form.useForm();
  const { setSelectEqEvent } = useContext(SelectEventContext);
  const navigate = useNavigate();
  const [rawInfo, setRawInfo] = useState('');

  // 解析“据中国地震台网正式测定...”样式文本，提取时间、地点、经纬度、震级、深度
  const parseEarthquakeInfo = (text) => {
    if (!text || typeof text !== 'string') return null;

    // 时间：2025年10月09日13时17分38秒
    const timeMatch = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时(\d{1,2})分(\d{1,2})秒/);
    let dateTimeStr = null;
    if (timeMatch) {
      const [, y, mo, d, h, mi, s] = timeMatch;
      const pad = (n) => n.toString().padStart(2, '0');
      dateTimeStr = `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(s)}`;
    }

    // 地点：在四川甘孜州新龙县（...）发生
    let location = null;
    const locMatch = text.match(/在(.+?)（/);
    if (locMatch) {
      location = locMatch[1].trim();
    } else {
      // 兜底：尝试“在XXX发生”
      const loc2 = text.match(/在(.+?)发生/);
      if (loc2) location = loc2[1].trim();
    }

    // 纬度：北纬/南纬 xx.xx 度
    let latitude = null;
    const latMatch = text.match(/(北纬|南纬)\s*([0-9.]+)度/);
    if (latMatch) {
      const sign = latMatch[1] === '南纬' ? -1 : 1;
      latitude = sign * parseFloat(latMatch[2]);
    }

    // 经度：东经/西经 xx.xx 度
    let longitude = null;
    const lonMatch = text.match(/(东经|西经)\s*([0-9.]+)度/);
    if (lonMatch) {
      const sign = lonMatch[1] === '西经' ? -1 : 1;
      longitude = sign * parseFloat(lonMatch[2]);
    }

    // 震级：发生5.4级地震 或 震级5.4级
    let magnitude = null;
    const magMatch = text.match(/发生\s*([0-9.]+)\s*级地震|震级\s*([0-9.]+)\s*级/);
    if (magMatch) {
      magnitude = parseFloat(magMatch[1] || magMatch[2]);
    }

    // 深度：震源深度10公里
    let depth = null;
    const depthMatch = text.match(/震源深度\s*([0-9.]+)\s*公里/);
    if (depthMatch) {
      depth = parseFloat(depthMatch[1]);
    }

    if (!dateTimeStr && !location && latitude === null && longitude === null && magnitude === null && depth === null) {
      return null;
    }
    return { dateTimeStr, location, latitude, longitude, magnitude, depth };
  };

  const handleAutoFill = () => {
    const parsed = parseEarthquakeInfo(rawInfo);
    if (!parsed) {
      message.error('无法从文本中提取有效的震情信息，请检查格式');
      return;
    }
    const { dateTimeStr, location, latitude, longitude, magnitude, depth } = parsed;

    const fields = {};
    if (dateTimeStr) fields.dateTime = moment(dateTimeStr, 'YYYY-MM-DD HH:mm:ss');
    if (typeof magnitude === 'number') fields.magnitude = magnitude;
    if (location) fields.location = location;
    if (typeof longitude === 'number') fields.longitude = Math.abs(longitude); // 表单为正值，方向通过文本体现
    if (typeof latitude === 'number') fields.latitude = Math.abs(latitude);
    if (typeof depth === 'number') fields.depth = depth;

    form.setFieldsValue(fields);
    message.success('已从文本提取并填充表单');
  };

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
      {/* 文本解析与自动填充 */}
      <div style={styles.autoFillBox}>
        <div style={styles.autoFillHeader}>粘贴震情信息并自动填充</div>
        <Input.TextArea
          rows={6}
          value={rawInfo}
          onChange={(e) => setRawInfo(e.target.value)}
          placeholder="粘贴诸如：据中国地震台网正式测定：2025年10月09日13时17分38秒在四川甘孜州新龙县（北纬30.84度、东经99.86度）发生5.4级地震，震源深度10公里。"
        />
        <div style={styles.autoFillActions}>
          <Button onClick={handleAutoFill}>自动提取并填充</Button>
        </div>
      </div>
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
  autoFillBox: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#fafafa',
  },
  autoFillHeader: {
    marginBottom: '8px',
    fontWeight: 600,
  },
  autoFillActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px',
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
