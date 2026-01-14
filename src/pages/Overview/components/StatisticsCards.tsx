import React from "react";
import {Card, Col, Row, theme} from "antd";
import {ApiOutlined, ClockCircleOutlined, DatabaseOutlined, NodeIndexOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";

// 滚动容器样式
const scrollContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  overflowY: 'hidden',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
  WebkitOverflowScrolling: 'touch',
};

// 指标容器样式
const metricsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'nowrap',
  minWidth: 'fit-content',
  paddingRight: '4px',
};

// 单个指标项样式
const metricItemStyle: React.CSSProperties = {
  textAlign: 'center',
  minWidth: '45px',
  flexShrink: 0,
};


// 统计数据接口
interface Statistics {
  customApiCount: number;
  requestCount: number;
  dataSourceCount: number;
  modelCount: number;
  flowDefCount: number;
  flowExecCount: number;
  triggerTotalCount: number;
  jobSuccessCount: number;
  jobFailureCount: number;
}

// 统计卡片组接口
interface StatisticsCardsProps {
  stats: Statistics;
}

// 通用卡片组件
const StatCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}> = ({ title, icon, color, children }) => {
  return (
    <Card
      hoverable
      styles={{
        body: {
          padding: '20px',
          overflow: 'hidden',
        }
      }}
    >

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '100%',
        position: 'relative',
        zIndex: 1,
        minWidth: 0,
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* 图标 */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: `${color}`,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}>
          {icon}
        </div>

        {/* 内容区域 */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '4px',
          overflow: 'hidden'
        }}>
          {/* 标题 */}
          <div style={{
            fontSize: '16px',
            color: 'var(--ant-color-text-secondary)',
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </div>

          {/* 内容 */}
          {children}
        </div>
      </div>
    </Card>
  );
};

// API信息卡片组件
const ApiInfoCard: React.FC<{ stats: Statistics; color: string }> = ({ stats, color }) => {
  const { t } = useTranslation();

  return (
    <StatCard
      title={t("api")}
      icon={<ApiOutlined style={{ fontSize: '24px', color: '#ffffff' }} />}
      color={color}
    >
      <div className="stat-card-scroll-container" style={scrollContainerStyle}>
        <div style={metricsContainerStyle}>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("api")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-text)' }}>
              {stats.customApiCount}
            </div>
          </div>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("request_count")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-text)' }}>
              {stats.requestCount}
            </div>
          </div>
        </div>
      </div>
    </StatCard>
  );
};

// 服务编排卡片组件
const FlowOrchestrationCard: React.FC<{ stats: Statistics; color: string }> = ({ stats, color }) => {
  const { t } = useTranslation();

  return (
    <StatCard
      title={t("flow")}
      icon={<NodeIndexOutlined style={{ fontSize: '24px', color: '#ffffff' }} />}
      color={color}
    >
      <div className="stat-card-scroll-container" style={scrollContainerStyle}>
        <div style={metricsContainerStyle}>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("flow_count")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-text)' }}>
              {stats.flowDefCount}
            </div>
          </div>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("exec_count")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-success)' }}>
              {stats.flowExecCount}
            </div>
          </div>
        </div>
      </div>
    </StatCard>
  );
};

// 任务调度卡片组件
const TaskSchedulingCard: React.FC<{ stats: Statistics; color: string }> = ({ stats, color }) => {
  const { t } = useTranslation();

  return (
    <StatCard
      title={t("schedule")}
      icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#ffffff' }} />}
      color={color}
    >
      <div className="stat-card-scroll-container" style={scrollContainerStyle}>
        <div style={metricsContainerStyle}>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("trigger_count")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-text)' }}>
              {stats.triggerTotalCount}
            </div>
          </div>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("exec_success")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-success)' }}>
              {stats.jobSuccessCount}
            </div>
          </div>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("exec_failure")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-error)' }}>
              {stats.jobFailureCount}
            </div>
          </div>
        </div>
      </div>
    </StatCard>
  );
};

// 数据卡片组件
const DataCard: React.FC<{ stats: Statistics; color: string }> = ({ stats, color }) => {
  const { t } = useTranslation();

  return (
    <StatCard
      title={t("data")}
      icon={<DatabaseOutlined style={{ fontSize: '24px', color: '#ffffff' }} />}
      color={color}
    >
      <div className="stat-card-scroll-container" style={scrollContainerStyle}>
        <div style={metricsContainerStyle}>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("datasource")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-text)' }}>
              {stats.dataSourceCount}
            </div>
          </div>
          <div style={metricItemStyle}>
            <div style={{ fontSize: '10px', color: 'var(--ant-color-text-secondary)', marginBottom: '1px' }}>
              {t("model_count")}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ant-color-text)' }}>
              {stats.modelCount}
            </div>
          </div>
        </div>
      </div>
    </StatCard>
  );
};

// 统计卡片组组件
const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  const { token } = theme.useToken();

  return (
    <>
      <style>
        {`
          .stat-card-scroll-container {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
          .stat-card-scroll-container::-webkit-scrollbar {
            height: 6px;
          }
          .stat-card-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .stat-card-scroll-container::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }
          .stat-card-scroll-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
          }
          .statistics-cards-row .ant-col {
            display: flex;
          }
          .statistics-cards-row .ant-col > .ant-card {
            flex: 1;
            width: 100%;
          }
        `}
      </style>
      <Row gutter={[8, 8]} className="statistics-cards-row" style={{ marginBottom: '8px'}}>
        <Col xs={24} sm={12} lg={6}>
          <ApiInfoCard
            stats={stats}
            color={token.colorPrimary}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard
            stats={stats}
            color={token.colorSuccess}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <FlowOrchestrationCard
            stats={stats}
            color="#8B5CF6"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <TaskSchedulingCard
            stats={stats}
            color="#EC4899"
          />
        </Col>

      </Row>
    </>
  );
};

export default StatisticsCards;
