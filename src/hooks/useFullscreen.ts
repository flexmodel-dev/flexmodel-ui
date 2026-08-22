import {useCallback, useRef, useState} from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggle: () => void;
  enter: () => void;
  exit: () => void;
  ref: React.RefObject<HTMLDivElement | null>;
}

export const useFullscreen = (backgroundColor?: string): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const enter = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;

    // 添加全屏样式类
    element.classList.add('page-fullscreen');

    // 设置背景色
    if (backgroundColor) {
      element.style.backgroundColor = backgroundColor;
    }

    setIsFullscreen(true);
  }, [backgroundColor]);

  const exit = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;

    // 移除全屏样式类
    element.classList.remove('page-fullscreen');
    setIsFullscreen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) {
      exit();
    } else {
      enter();
    }
  }, [isFullscreen, enter, exit]);

  return {
    isFullscreen,
    toggle,
    enter,
    exit,
    ref
  };
};
