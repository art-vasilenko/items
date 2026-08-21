import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./VirtualList.module.css";

type VirtualListProps<TItem> = {
  items: TItem[];
  estimateItemHeight: number;
  gap?: number;
  overscan?: number;
  className?: string;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  renderItem: (item: TItem, index: number) => ReactNode;
};

const DEFAULT_GAP = 12;
const DEFAULT_OVERSCAN = 4;

export const VirtualList = <TItem,>({
  items,
  estimateItemHeight,
  gap = DEFAULT_GAP,
  overscan = DEFAULT_OVERSCAN,
  className,
  canLoadMore = false,
  isLoadingMore = false,
  onLoadMore,
  renderItem,
}: VirtualListProps<TItem>) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateViewportHeight = () => {
      setViewportHeight(viewport.clientHeight);
    };

    updateViewportHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateViewportHeight);

      return () => {
        window.removeEventListener("resize", updateViewportHeight);
      };
    }

    const observer = new ResizeObserver(updateViewportHeight);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || !canLoadMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const remainingDistance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    if (remainingDistance <= estimateItemHeight * 3) {
      onLoadMore();
    }
  }, [canLoadMore, estimateItemHeight, isLoadingMore, items.length, onLoadMore]);

  const rowHeight = estimateItemHeight + gap;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.max(
    1,
    Math.ceil((viewportHeight || rowHeight) / rowHeight) + overscan * 2,
  );
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const offsetTop = startIndex * rowHeight;
  const totalHeight = Math.max(items.length * rowHeight - gap, 0);

  const visibleItems = useMemo(
    () =>
      items.slice(startIndex, endIndex).map((item, offset) => ({
        item,
        index: startIndex + offset,
      })),
    [endIndex, items, startIndex],
  );

  const handleScroll = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    setScrollTop(viewport.scrollTop);

    if (!canLoadMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const remainingDistance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    if (remainingDistance <= estimateItemHeight * 3) {
      onLoadMore();
    }
  };

  const windowStyle: CSSProperties = {
    transform: `translateY(${offsetTop}px)`,
    display: "grid",
    gap: `${gap}px`,
  };

  return (
    <div
      ref={viewportRef}
      className={className ? `${styles.viewport} ${className}` : styles.viewport}
      onScroll={handleScroll}
    >
      <div className={styles.content} style={{ height: `${totalHeight}px` }}>
        <div className={styles.window} style={windowStyle}>
          {visibleItems.map(({ item, index }) => renderItem(item, index))}
        </div>
      </div>
    </div>
  );
};
