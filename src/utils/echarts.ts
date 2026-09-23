import * as echarts from 'echarts/core';
import {CustomChart, LineChart} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

echarts.use([CustomChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export default echarts;
