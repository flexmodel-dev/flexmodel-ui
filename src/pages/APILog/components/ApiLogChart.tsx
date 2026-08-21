import React from "react";
import {theme} from "antd";
import ReactECharts from "echarts-for-react";
import echarts from '@/utils/echarts';

interface ApiLogChartProps {
  chartData: {
    xAxis: string[];
    series: number[];
  };
  height?: string | number;
  width?: string | number;
}

const ApiLogChart: React.FC<ApiLogChartProps> = ({
                                                   chartData,
                                                   height = '200px',
                                                   width = '100%'
}) => {
  const {token} = theme.useToken();
  const getChartOption = () => ({
    tooltip: {
      trigger: "axis",
      backgroundColor: token.colorBgElevated,
      borderColor: token.colorBorder,
      borderWidth: 1,
      textStyle: {
        color: token.colorText
      }
    },
    grid: {
      top: "15%",
      left: "3%",
      right: "3%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData.xAxis,
      axisLabel: {
        formatter: function (value: string) {
          const date = new Date(value);
          return `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date
              .getDate()
              .toString()
              .padStart(2, "0")} ${date
                .getHours()
                .toString()
                .padStart(2, "0")}:${date
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;
        },
      },
    },
    yAxis: {
      splitNumber: 2,
      type: "value",
    },
    series: [
      {
        name: "Total requests",
        type: "line",
        stack: "Total",
        data: chartData.series,
        smooth: true,
        lineStyle: {
          width: 3,
          color: token.colorPrimary
        },
        itemStyle: {
          color: token.colorPrimary,
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(0, 117, 222, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(0, 117, 222, 0.05)'
              }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: token.colorPrimary,
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 117, 222, 0.5)'
          }
        }
      },
    ],
  });

  return (
    <div style={{ height, width }}>
      <ReactECharts
        echarts={echarts}
        option={getChartOption()}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default ApiLogChart;
