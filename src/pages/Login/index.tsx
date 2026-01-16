import React, {useCallback, useEffect, useMemo} from 'react';
import {Alert, Button, Card, Dropdown, Form, Input, Switch, theme, Typography} from 'antd';
import type {MenuProps} from 'antd';
import {GlobalOutlined, LockOutlined, MoonOutlined, SunOutlined, UserOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import {useAuth} from '@/store/authStore';
import {useLocale, useTheme} from '@/store/appStore';
import {useLocation, useNavigate} from 'react-router-dom';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import {applyDarkMode, setDarkModeToStorage} from '@/utils/darkMode';
import ParticleBackground from '@/components/common/ParticleBackground';

const {Title, Text} = Typography;

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const {t} = useTranslation();
  const {token} = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<LoginFormData>();

  const {
    isAuthenticated,
    isLoading,
    error,
    login,
    clearError
  } = useAuth();

  const {isDark, toggleDarkMode: toggleDarkModeStore} = useTheme();
  const {setLocale: setLocaleStore, currentLang} = useLocale();
  const {i18n} = useTranslation();

  // 如果已经登录，重定向到目标页面或首页
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, {replace: true});
    }
  }, [isAuthenticated, navigate, location]);

  // 清除错误信息
  useEffect(() => {
    clearError();
  }, [clearError]);

  // 主题切换处理
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDark;
    applyDarkMode(newDarkMode);
    setDarkModeToStorage(newDarkMode);
    toggleDarkModeStore();
  }, [isDark, toggleDarkModeStore]);

  // 语言切换处理
  const changeLocale = useCallback((localeValue: typeof zhCN | typeof enUS) => {
    const lang = localeValue === zhCN ? 'zh' : 'en';
    setLocaleStore(localeValue, lang);
    i18n.changeLanguage(lang);
    if (lang === 'zh') {
      dayjs.locale("zh-cn");
    } else {
      dayjs.locale("en");
    }
  }, [setLocaleStore, i18n]);

  // 语言菜单
  const localeMenuItems: MenuProps["items"] = useMemo(() => [
    {
      key: "zh",
      label: t("chinese"),
      onClick: () => changeLocale(zhCN),
    },
    {
      key: "en",
      label: t("english"),
      onClick: () => changeLocale(enUS),
    },
  ], [changeLocale, t]);

  // 当前语言显示文本
  const currentLocaleText = useMemo(() =>
      currentLang === 'zh' ? t("chinese") : t("english"),
    [currentLang, t]
  );

  const handleSubmit = async (values: LoginFormData) => {
    const success = await login(values.username, values.password);
    if (success) {
      // 登录成功后的处理在useEffect中完成
    }
  };

  const handleDemoLogin = async () => {
    const success = await login('admin', 'admin123');
    if (success) {
      // 登录成功后的处理在useEffect中完成
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${token.colorBorderBg} 0%, ${token.colorBgContainer} 100%)`,
      padding: token.padding,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 粒子背景 */}
      <ParticleBackground particleCount={160} speed={0.6}/>

      {/* 右上角主题和语言切换 */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        display: 'flex',
        alignItems: 'center',
        gap: token.marginSM,
        zIndex: 10
      }}>
        <Switch
          checked={isDark}
          onChange={toggleDarkMode}
          checkedChildren={<SunOutlined/>}
          unCheckedChildren={<MoonOutlined/>}
        />
        <Dropdown
          menu={{items: localeMenuItems}}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button size="small" icon={<GlobalOutlined/>}>
            {currentLocaleText}
          </Button>
        </Dropdown>
      </div>

      {/* Logo和标题 - 在Card外面 */}
      <div style={{textAlign: 'center', marginBottom: token.marginLG * 2}}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          gap: token.marginMD
        }}>
          <img
            src={`${import.meta.env.BASE_URL}/logo.png`}
            alt="logo"
            style={{
              width: 64,
              height: 64,
              borderRadius: token.borderRadius,
              boxShadow: token.boxShadowTertiary
            }}
          />
          <div style={{textAlign: 'left'}}>
            <Title level={1} style={{margin: 0, color: token.colorText, fontSize: token.fontSizeXL * 1.5}}>
              Flexmodel
            </Title>
            <Text type="secondary" style={{fontSize: token.fontSize, color: token.colorTextSecondary}}>
              {t('login_subtitle')}
            </Text>
          </div>
        </div>
      </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: token.boxShadowTertiary,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`
        }}
        styles={
          {
            body: {
              padding: token.paddingLG * 2
            }
          }
        }
      >
        {/* 错误提示 */}
        {error && (
          <Alert
            title={t(error)}
            type="error"
            showIcon
            style={{marginBottom: token.marginLG}}
          />
        )}

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          disabled={isLoading}
          style={{
            marginBottom: 0
          }}
        >
          <Form.Item
            name="username"
            rules={[
              {required: true, message: t('input_valid_msg', {name: t('username')})}
            ]}
            style={{
              marginBottom: token.marginLG
            }}
          >
            <Input
              prefix={<UserOutlined style={{color: token.colorTextSecondary}}/>}
              placeholder={t('login_username_placeholder')}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {required: true, message: t('input_valid_msg', {name: t('password')})}
            ]}
            style={{
              marginBottom: token.marginLG * 1.5
            }}
          >
            <Input.Password
              prefix={<LockOutlined style={{color: token.colorTextSecondary}}/>}
              placeholder={t('login_password_placeholder')}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            style={{
              marginBottom: 0
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                width: '100%',
                height: 36,
                fontSize: token.fontSizeLG
              }}
            >
              {isLoading ? t('login_loading') : t('login_button')}
            </Button>
          </Form.Item>
        </Form>

        {/* 演示账号提示 */}
        <div style={{textAlign: 'center', marginTop: token.marginLG}}>
          <Text type="secondary" style={{fontSize: token.fontSizeSM}}>
            {t('demo_credentials')}
          </Text>
          <br/>
          <Button
            type="link"
            size="small"
            onClick={handleDemoLogin}
            style={{padding: 0, height: 'auto'}}
          >
            {t('demo_login_button')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
