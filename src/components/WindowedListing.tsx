import { useEffect, useState, memo, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FiGrid } from 'react-icons/fi';
import { Transition, TransitionGroup } from 'react-transition-group';
import { transparentize } from 'polished';

import { ID } from '~/types/data';
import FixedButton from '~/components/FixedButton';
import AutoWidth from '~/components/AutoWidth';

type Item = {
  id: ID;
  name: string;
  disabled?: boolean;
};

interface FScreenListingProps {
  numberOfRecentItems?: number;
  listName: string;
  items: Item[];
  onItemClick?: (data?: any) => void;
  onItemDelete?: (data?: any) => void;
  onItemDownload?: (data?: any) => void;
  onItemValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedItemId?: ID | null;
  icon?: React.ReactNode;
  extraOptions?: {
    onFileChange?: (
      ref: React.RefObject<HTMLInputElement>,
      e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    value: string;
    onClick?: () => void;
    color?: 'add' | 'delete';
    icon?: React.ReactNode;
    discrete?: boolean;
    testId?: string;
  }[];
  rightIcon?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

interface Position {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface TransformProps {
  recentItems: Item[];
  allItems: Item[];
  selectedItemId?: ID | null;
  getRecent?: boolean;
  numberOfRecentItems?: number;
}

const getTransformedItems = ({
  recentItems: rawRecentItems,
  allItems,
  selectedItemId,
  getRecent,
  numberOfRecentItems = 3,
}: TransformProps): Item[] => {
  if (!rawRecentItems.length)
    return getRecent ? allItems.slice(0, numberOfRecentItems) : allItems;
  const recentItems = rawRecentItems
    .map(({ id }) => allItems.find((item) => item.id === id))
    .filter((x) => !!x) as Item[];
  const itemsNotInRecent = allItems.filter((x) => !recentItems.find((y) => y.id === x.id));
  if (!selectedItemId || recentItems.find(({ id }) => id === selectedItemId)) {
    const recentItemsWithMissing = [...recentItems, ...itemsNotInRecent];
    return getRecent
      ? recentItemsWithMissing.slice(0, numberOfRecentItems)
      : recentItemsWithMissing;
  }
  const selectedItem = allItems.find((x) => x.id === selectedItemId);
  const newItems = [
    selectedItem,
    ...recentItems,
    ...itemsNotInRecent.filter((x) => x.id !== selectedItemId),
  ].filter((x) => !!x) as Item[];
  return getRecent ? newItems.slice(0, numberOfRecentItems) : newItems;
};

const FScreenListing: FC<FScreenListingProps> = memo(
  ({
    numberOfRecentItems = 3,
    listName,
    items,
    onItemClick,
    onItemDelete,
    onItemDownload,
    onItemValueChange,
    selectedItemId,
    icon,
    extraOptions,
    rightIcon,
    as,
    className,
    ...rest
  }) => {
    const [fullScreen, setFullScreen] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [positionInFullScreen, setPositionInFullScreen] = useState<Position>({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
    const wrapperRef = useRef<HTMLDivElement>(null);

    const initialState = useRef(
      getTransformedItems({
        numberOfRecentItems,
        recentItems: [],
        allItems: items,
        selectedItemId,
        getRecent: true,
      })
    );

    const [previousSelected, setPreviousSelected] = useState<Item[]>(initialState.current);

    const closeFullScreen = () => {
      if (!fullScreen || leaving) return;
      setLeaving(true);
      setTimeout(() => {
        setLeaving(false);
        setFullScreen(false);
      }, 300);
    };

    useEffect(closeFullScreen, [selectedItemId]);

    const updatePositionInFullScreen = () => {
      if (!wrapperRef.current) return;
      const { top, left, right, bottom } = wrapperRef.current.getBoundingClientRect();
      const newPosition: Position = {};
      if (top > bottom) newPosition.bottom = bottom;
      else newPosition.top = top;
      if (left > right) newPosition.right = right;
      else newPosition.left = left;
      setPositionInFullScreen(newPosition);
    };

    useEffect(() => {
      updatePositionInFullScreen();
      window.addEventListener('resize', updatePositionInFullScreen);
      return () => window.removeEventListener('resize', updatePositionInFullScreen);
    }, [wrapperRef]);

    useEffect(() => {
      setPreviousSelected(
        getTransformedItems({
          numberOfRecentItems,
          recentItems: previousSelected,
          allItems: items,
          selectedItemId,
          getRecent: true,
        })
      );
    }, [items, selectedItemId]);

    const itemsToIterate =
      fullScreen && !leaving
        ? getTransformedItems({
            numberOfRecentItems,
            recentItems: previousSelected,
            allItems: items,
            selectedItemId,
            getRecent: false,
          })
        : previousSelected;

    const extraOptionsToIterate =
      extraOptions &&
      (fullScreen && !leaving ? extraOptions : extraOptions.filter((x) => !x.discrete));

    return (
      <Wrapper
        ref={wrapperRef}
        className={className}
        leaving={leaving}
        fullScreen={fullScreen}
        onClick={closeFullScreen}
        positionInFullScreen={positionInFullScreen}
        {...rest}
      >
        <TransitionGroup component={null}>
          {itemsToIterate.map(({ id, name, disabled }) => (
            <Transition appear key={id} timeout={300} classNames="item">
              {(state) => (
                <AutoWidth state={state} key={id}>
                  <StyledFixedBtn
                    data={id}
                    selected={selectedItemId === id}
                    onClick={() => onItemClick && onItemClick(id)}
                    value={name}
                    onValueChange={onItemValueChange}
                    onDownload={onItemDownload}
                    onDelete={onItemDelete}
                    icon={icon}
                    disabled={disabled}
                  />
                </AutoWidth>
              )}
            </Transition>
          ))}
        </TransitionGroup>
        {extraOptionsToIterate &&
          extraOptionsToIterate.map(({ value, icon, onClick, color, onFileChange, testId }) => (
            <StyledFixedBtn
              key={value}
              value={value}
              onClick={onClick}
              color={color}
              icon={icon}
              onFileChange={onFileChange}
              data-testid={testId}
            />
          ))}
        {(!fullScreen || leaving) &&
          (items.length > numberOfRecentItems || numberOfRecentItems === 0) && (
            <FixedButton
              icon={<FiGrid />}
              value={`See${numberOfRecentItems !== 0 ? ` all ${items.length}` : ''}  ${listName}`}
              onClick={() => setFullScreen(true)}
              color="add"
            />
          )}
      </Wrapper>
    );
  }
);

export default FScreenListing;

const StyledFixedBtn = styled(FixedButton)`
  margin: 0 4px;
  /* &:first-of-type {
    margin-left: 0;
  } */
  &.item-enter {
    opacity: 0;
  }
  &.item-enter-active {
    opacity: 1;
    transition: opacity ${({ theme }) => theme.transitions.superSlow}ms ease-in;
  }
  &.item-exit {
    opacity: 1;
  }
  &.item-exit-active {
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.superSlow}ms ease-in;
  }
`;

interface WrapperProps {
  leaving: boolean;
  fullScreen: boolean;
  positionInFullScreen: Position;
}

const padding =
  (position: keyof Position) =>
  ({ fullScreen, leaving, positionInFullScreen }: WrapperProps) => {
    if (!fullScreen && !leaving) return 0;
    const positions = {
      top: positionInFullScreen.top ? positionInFullScreen.top + 'px' : 0,
      right: positionInFullScreen.right ? positionInFullScreen.right + 'px' : leaving ? 0 : '40vw',
      bottom: positionInFullScreen.bottom ? positionInFullScreen.bottom + 'px' : 0,
      left: positionInFullScreen.left ? positionInFullScreen.left + 'px' : leaving ? 0 : '40vw',
    };
    return positions[position];
  };

const justifyContent = ({ fullScreen, leaving, positionInFullScreen }: WrapperProps) => {
  if (fullScreen && !leaving) return positionInFullScreen.left ? 'flex-start' : 'flex-end';
  return 'flex-start';
};
const alignContent = ({ fullScreen, leaving, positionInFullScreen }: WrapperProps) => {
  if (fullScreen && !leaving) return positionInFullScreen.top ? 'flex-start' : 'flex-end';
  return 'flex-start';
};

const Wrapper = styled.div<WrapperProps>`
  position: ${({ fullScreen }) => (fullScreen ? 'fixed' : 'static')};
  flex-wrap: wrap;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  /* color: #424242; */
  transition: backdrop-filter ${({ theme }) => theme.transitions.normal}ms ease-out, background ${({ theme }) => theme.transitions.normal}ms ease-out;
  align-items: flex-start;
  background: ${({ fullScreen, leaving, theme }) =>
    fullScreen && !leaving ? theme.colors.blurBg : transparentize(1, theme.colors.blurBg)};
  z-index: ${({ fullScreen, leaving }) => (fullScreen ? 20 : 19)};
  padding-top: ${padding('top')};
  padding-right: ${padding('right')};
  padding-bottom: ${padding('bottom')};
  padding-left: ${padding('left')};
  justify-content: ${justifyContent};
  align-content: ${alignContent};
  backdrop-filter: ${({ fullScreen, leaving }) =>
    fullScreen && !leaving ? 'blur(35px) saturate(200%)' : 'unset'};
  pointer-events: ${({ fullScreen, leaving }) =>
    fullScreen && !leaving ? 'all' : 'none'} !important;
  * {
    pointer-events: all;
  }
`;
