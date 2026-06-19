import {useCallback, useLayoutEffect, useRef, useState} from 'react';

/**
 * 自适应计算 Antd Table 的 scroll.y 值，让表格 body 内部滚动填满父容器剩余空间。
 *
 * 原理：通过 ResizeObserver 监听容器尺寸变化，动态计算并设置 Table 的 scroll.y，
 * 使表格在 body 内部滚动而非撑开外层容器导致整体滚动。
 *
 * 用法：
 * ```tsx
 * const { containerRef, scrollY } = useTableScrollHeight();
 *
 * return (
 *   <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
 *     <div style={{ flexShrink: 0 }}>搜索栏等固定内容</div>
 *     <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
 *       <Table scroll={{ y: scrollY }} ... />
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useTableScrollHeight() {
  const containerRef = useRef<HTMLDivElement>(null);
  // 初始设为 1 触发 Table 分离 header/body，便于后续测量表头高度
  const [scrollY, setScrollY] = useState<number>(1);

  const calc = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const wrapper = container.querySelector<HTMLElement>('.ant-table-wrapper');
    if (!wrapper) return;

    const body = wrapper.querySelector<HTMLElement>('.ant-table-body');
    if (!body) return;

    // wrapper 中除 body 外的固定开销（header、pagination、footer、spin 嵌套层等）
    // 用 wrapper.offsetHeight - body.offsetHeight 自动扣除所有非 body 元素的高度
    const wrapperOverhead = wrapper.offsetHeight - body.offsetHeight;
    const containerH = container.clientHeight;

    const y = containerH - wrapperOverhead;
    if (y > 0) {
      setScrollY(prev => prev === y ? prev : y);
    }
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 首次同步计算，避免闪烁
    calc();

    // 监听容器及表格 wrapper 尺寸变化
    // 观察 wrapper 是为了捕获分页器渲染、数据加载等内部结构变化
    const observer = new ResizeObserver(() => calc());
    observer.observe(container);
    const wrapper = container.querySelector<HTMLElement>('.ant-table-wrapper');
    if (wrapper) {
      observer.observe(wrapper);
    }

    return () => observer.disconnect();
  }, [calc]);

  return { containerRef, scrollY };
}
