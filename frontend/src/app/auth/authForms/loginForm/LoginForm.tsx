'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Form, Button } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '../../../../../axiosConfig';
import './loginForm.css';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const [form] = Form.useForm<LoginForm>();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const onFinishHandler = async (values: LoginForm) => {
    setIsSubmitting(true);

    try {
      await api.post(`/auth/login`, values);
      router.push('/');
    } catch (error: any) {
      const errorText: string = error.response.data.error || 'Something went wrong.. Try again later!';
      setErrorText(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='login_form_container'>
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        ITransition-Course-Project
      </Title>
      <div className='login_form'>
        <Title level={1} style={{ margin: '0px 0px 20px 0px' }}>
          Login
        </Title>
        {errorText ? (
          <Title level={5} style={{ color: 'red' }}>
            {errorText}
          </Title>
        ) : null}
        <Form
          form={form}
          style={{ width: '100%' }}
          onFinish={onFinishHandler}
          onValuesChange={() => {
            if (errorText) {
              setErrorText('');
            }
          }}
        >
          <Form.Item name='email' rules={[{ required: true, message: '', type: 'email' }]}>
            <InputField placeHolder='Email*' />
          </Form.Item>
          <Form.Item name='password' rules={[{ required: true, message: '' }]}>
            <InputField placeHolder='Password*' type='password' minLength={1} maxLength={40} />
          </Form.Item>
          <Form.Item>
            <Button
              className='login_form_submit_button'
              htmlType='submit'
              type='primary'
              style={{ width: '100%', height: '35px' }}
              loading={isSubmitting}
              disabled={!!errorText}
            >
              Log in
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              className='login_form_google_button'
              icon={<FcGoogle style={{ fontSize: '24px' }} />}
              onClick={() => (window.location.href = 'http://localhost:9000/auth/google')}
            >
              Continue with Google
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              className='login_form_github_button'
              icon={<FaGithub style={{ fontSize: '24px' }} />}
              onClick={() => (window.location.href = 'http://localhost:9000/auth/github')}
            >
              Continue with GitHub
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type='primary' href='/' iconPosition='start' icon={<ArrowLeftOutlined />}>
              Back Home
            </Button>
          </Form.Item>

          <Text>
            Don’t have an account?{' '}
            <Link style={{ textDecoration: 'underline' }} href='/auth/register'>
              Sign up
            </Link>
          </Text>
        </Form>
      </div>
    </div>
  );
};
