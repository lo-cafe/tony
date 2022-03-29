import { useEffect, useState, memo, useRef } from 'react';
import styled, { css } from 'styled-components';
import { FiGrid } from 'react-icons/fi';
import { createPortal } from 'react-dom';

import { ID } from '~/types/data';
import FixedButton from '~/components/FixedButton';

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
  }[];
  rightIcon?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
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
  if (!rawRecentItems.length || !selectedItemId)
    return getRecent ? allItems.slice(0, numberOfRecentItems) : allItems;
  const recentItems = rawRecentItems
    .map(({ id }) => allItems.find((item) => item.id === id))
    .filter((x) => !!x) as Item[];
  const itemsNotInRecent = allItems.filter((x) => !recentItems.find((y) => y.id === x.id));
  if (recentItems.find(({ id }) => id === selectedItemId))
    return getRecent ? recentItems : [...recentItems, ...itemsNotInRecent];
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
    numberOfRecentItems,
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
  }) => {
    const [fullScreen, setFullScreen] = useState(false);
    const [leaving, setLeaving] = useState(false);

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
      if (!fullScreen && leaving) return;
      setLeaving(true);
      setTimeout(() => {
        setLeaving(false);
        setFullScreen(false);
      }, 300);
    };

    useEffect(closeFullScreen, [selectedItemId]);

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
      <Wrapper leaving={leaving} fullScreen={fullScreen} onClick={closeFullScreen}>
        {itemsToIterate.map(({ id, name, disabled }) => (
          <FixedButton
            key={id}
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
        ))}
        {extraOptionsToIterate &&
          extraOptionsToIterate.map(({ value, icon, onClick, color, onFileChange }) => (
            <FixedButton
              key={value}
              value={value}
              onClick={onClick}
              color={color}
              icon={icon}
              onFileChange={onFileChange}
            />
          ))}
        {(!fullScreen || leaving) && (
          <FixedButton
            icon={<FiGrid />}
            value={`See all ${listName}`}
            onClick={() => setFullScreen(true)}
            color="add"
          />
        )}
      </Wrapper>
    );
  }
);

export default FScreenListing;

const Wrapper = styled.div<{ leaving: boolean; fullScreen: boolean }>`
  position: ${({ fullScreen }) => (fullScreen ? 'fixed' : 'relative')};
  align-content: flex-start;
  flex-wrap: wrap;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  gap: 8px;
  color: #424242;
  transition: backdrop-filter 300ms ease-out, background 300ms ease-out;
  align-items: flex-start;
  justify-content: flex-start;
  background: ${({ fullScreen, leaving }) =>
    fullScreen && !leaving ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0)'};
  z-index: 20;
  padding: ${({ fullScreen, leaving }) =>
    fullScreen ? (leaving ? '16px' : '16px 40vw 16px 16px') : '0'};
  backdrop-filter: blur(${({ fullScreen, leaving }) => (fullScreen && !leaving ? 30 : 0)}px);
`;
