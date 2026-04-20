import { CSSProperties, RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

export type DropdownPlacementSide = "top" | "bottom" | "left" | "right";
export type DropdownPlacementAlign = "start" | "center" | "end";
export type DropdownPositionStrategy = "absolute" | "fixed";

interface UseDropdownPositionOptions {
  isOpen: boolean;
  preferredSide?: DropdownPlacementSide;
  align?: DropdownPlacementAlign;
  offset?: number;
  viewportPadding?: number;
  strategy?: DropdownPositionStrategy;
}

interface DropdownPlacement {
  side: DropdownPlacementSide;
  align: DropdownPlacementAlign;
}

interface UseDropdownPositionResult {
  anchorRef: RefObject<HTMLDivElement | null>;
  dropdownRef: RefObject<HTMLDivElement | null>;
  dropdownStyle: CSSProperties;
  isPositionReady: boolean;
  placement: DropdownPlacement;
  updatePosition: () => void;
}

function clamp(value: number, min: number, max: number) {
  if (min > max) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function useDropdownPosition({
  isOpen,
  preferredSide = "bottom",
  align = "start",
  offset = 8,
  viewportPadding = 16,
  strategy = "absolute",
}: UseDropdownPositionOptions): UseDropdownPositionResult {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
    visibility: "hidden",
  });
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [placement, setPlacement] = useState<DropdownPlacement>({
    side: preferredSide,
    align,
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const dropdown = dropdownRef.current;

    if (!isOpen || !anchor || !dropdown) {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.scrollHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isVertical = preferredSide === "top" || preferredSide === "bottom";

    let nextSide = preferredSide;
    let availableHeight = viewportHeight - viewportPadding * 2;
    let topViewport = anchorRect.bottom + offset;
    let leftViewport = anchorRect.left;

    if (isVertical) {
      const spaceBelow = viewportHeight - anchorRect.bottom - viewportPadding - offset;
      const spaceAbove = anchorRect.top - viewportPadding - offset;

      if (preferredSide === "bottom") {
        nextSide =
          dropdownHeight > spaceBelow && spaceAbove > spaceBelow ? "top" : "bottom";
      } else {
        nextSide =
          dropdownHeight > spaceAbove && spaceBelow > spaceAbove ? "bottom" : "top";
      }

      availableHeight = Math.max(
        0,
        nextSide === "bottom" ? spaceBelow : spaceAbove,
      );

      const renderedHeight = Math.min(dropdownHeight, availableHeight);

      if (align === "center") {
        leftViewport = anchorRect.left + anchorRect.width / 2 - dropdownWidth / 2;
      } else if (align === "end") {
        leftViewport = anchorRect.right - dropdownWidth;
      } else {
        leftViewport = anchorRect.left;
      }

      leftViewport = clamp(
        leftViewport,
        viewportPadding,
        viewportWidth - dropdownWidth - viewportPadding,
      );

      topViewport =
        nextSide === "bottom"
          ? anchorRect.bottom + offset
          : anchorRect.top - offset - renderedHeight;

      topViewport = clamp(
        topViewport,
        viewportPadding,
        viewportHeight - renderedHeight - viewportPadding,
      );
    } else {
      const spaceRight = viewportWidth - anchorRect.right - viewportPadding - offset;
      const spaceLeft = anchorRect.left - viewportPadding - offset;

      if (preferredSide === "right") {
        nextSide =
          dropdownWidth > spaceRight && spaceLeft > spaceRight ? "left" : "right";
      } else {
        nextSide =
          dropdownWidth > spaceLeft && spaceRight > spaceLeft ? "right" : "left";
      }

      availableHeight = Math.max(0, viewportHeight - viewportPadding * 2);
      const renderedHeight = Math.min(dropdownHeight, availableHeight);

      if (align === "center") {
        topViewport = anchorRect.top + anchorRect.height / 2 - renderedHeight / 2;
      } else if (align === "end") {
        topViewport = anchorRect.bottom - renderedHeight;
      } else {
        topViewport = anchorRect.top;
      }

      topViewport = clamp(
        topViewport,
        viewportPadding,
        viewportHeight - renderedHeight - viewportPadding,
      );

      leftViewport =
        nextSide === "right"
          ? anchorRect.right + offset
          : anchorRect.left - offset - dropdownWidth;

      leftViewport = clamp(
        leftViewport,
        viewportPadding,
        viewportWidth - dropdownWidth - viewportPadding,
      );
    }

    setPlacement({
      side: nextSide,
      align,
    });
    setDropdownStyle({
      position: strategy,
      top:
        strategy === "fixed"
          ? `${topViewport}px`
          : `${topViewport - anchorRect.top}px`,
      left:
        strategy === "fixed"
          ? `${leftViewport}px`
          : `${leftViewport - anchorRect.left}px`,
      maxHeight: `${Math.max(0, Math.floor(availableHeight))}px`,
      overflowY: "auto",
      visibility: "visible",
    });
    setIsPositionReady(true);
  }, [align, isOpen, offset, preferredSide, strategy, viewportPadding]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement({
        side: preferredSide,
        align,
      });
      setDropdownStyle({
        visibility: "hidden",
      });
      setIsPositionReady(false);
      return;
    }

    setDropdownStyle({
      visibility: "hidden",
    });
    setIsPositionReady(false);
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, isOpen, preferredSide, updatePosition]);

  return {
    anchorRef,
    dropdownRef,
    dropdownStyle,
    isPositionReady,
    placement,
    updatePosition,
  };
}
