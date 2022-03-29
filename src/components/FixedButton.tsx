import { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { FiMessageSquare, FiTrash2, FiEdit2, FiDownload, FiCheck } from 'react-icons/fi';
import AutowidthInput from 'react-autowidth-input';
import { nanoid } from 'nanoid';

import { ID } from '~/types/data';

interface FixedButtonProps {
  data?: any;
  onClick?: (data?: any) => void;
  onDelete?: (data?: any) => void;
  onDownload?: (data?: any) => void;
  value: string;
  selected?: boolean;
  icon?: React.ReactNode;
  color?: 'add' | 'delete';
  onValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  rightIcon?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  onFileChange?: (
    ref: React.RefObject<HTMLInputElement>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const FixedButton: FC<FixedButtonProps> = ({
  onClick,
  data,
  selected,
  value,
  onValueChange,
  onDownload,
  onDelete,
  onFileChange,
  icon,
  color,
  disabled,
  className,
  rightIcon,
  as,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDelete, _setExpandedDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInnerClick = (func: (data?: ID) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    func(data);
  };

  const handleClick = (onClick: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) return;
    onClick();
  };

  const undoConfirmDelete = () => {
    _setExpandedDelete(false);
    document.removeEventListener('click', undoConfirmDelete);
  };

  const setExpandedDelete = (expanded: boolean) => {
    document.addEventListener('click', undoConfirmDelete);
    _setExpandedDelete(expanded);
  };

  const fileId = nanoid();

  return (
    <FixedButtonWrapper
      className={className}
      disabled={disabled}
      withButtons={!!onValueChange || !!onDownload || !!onDelete}
      color={color}
      selected={selected}
      onClick={handleClick(() => onClick && onClick(data))}
      as={as}
    >
      {!!onFileChange && (
        <>
          <FileLabel htmlFor={fileId} />
          <File
            id={fileId}
            onChange={(e) => onFileChange(inputRef, e)}
            ref={inputRef}
            type="file"
          />
        </>
      )}
      {icon}
      {isEditing ? <PillInput name={data} value={value} onChange={onValueChange} /> : value}
      {rightIcon}
      {onValueChange && (
        <FixedButtonInnerButton
          onClick={handleInnerClick(() => (isEditing ? setIsEditing(false) : setIsEditing(true)))}
        >
          {isEditing ? <FiCheck /> : <FiEdit2 />}
        </FixedButtonInnerButton>
      )}
      {onDownload && (
        <FixedButtonInnerButton onClick={handleInnerClick(() => onDownload(data))}>
          <FiDownload />
        </FixedButtonInnerButton>
      )}
      {onDelete && (
        <FixedButtonInnerButton
          opened={expandedDelete}
          red
          onClick={handleInnerClick(() =>
            expandedDelete ? onDelete(data) : setExpandedDelete(true)
          )}
        >
          <FiTrash2 />
          {expandedDelete && 'Delete'}
        </FixedButtonInnerButton>
      )}
    </FixedButtonWrapper>
  );
};

export default FixedButton;

const FileLabel = styled.label`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const File = styled.input`
  display: none;
`;

const FixedButtonWrapper = styled.button<{
  selected?: boolean;
  color?: 'add' | 'delete';
  withButtons?: boolean;
  disabled?: boolean;
}>`
  & svg * {
    stroke-width: 3px;
  }
  font-family: inherit;
  background: rgba(255, 255, 255, 0.7);
  padding: ${({ selected, withButtons }) =>
    selected
      ? `0 ${!withButtons ? '12px' : '4px'} 0 14px`
      : `0 ${!withButtons ? '13px' : '5px'} 0 15px`};
  height: 40px;
  border-radius: 12px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  font-weight: 600;
  justify-content: flex-start;
  gap: 6px;
  font-size: 13px;
  align-items: center;
  position: relative;
  transition: background-color 300ms ease-out;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  color: ${({ color, disabled }) =>
    disabled ? '#bdbdbd' : color ? (color === 'add' ? '#0068f6' : 'red') : '#424242'};
  border: ${({ selected }) => (selected ? 'solid 2px #0068f6' : 'solid 1px rgba(255,255,255,0.8)')};
  backdrop-filter: blur(40px);
  transition: box-shadow 300ms ease-out, background 300ms ease-out;
  user-select: none;
  &:hover {
    box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.15);
  }
  &:active {
    background: rgba(235, 235, 235, 0.7);
  }
`;

const PillInput = styled(AutowidthInput)`
  border: none;
  color: inherit;
  min-width: unset;
  background: lightyellow;
  border-radius: 4px;
  padding: 4px 8px;
  width: min-content;
  font-weight: inherit;
  font-size: inherit;
`;

const FixedButtonInnerButton = styled.button<{ red?: boolean; opened?: boolean }>`
  color: inherit;
  border-radius: 8px;
  height: 28px;
  gap: 4px;
  width: ${({ opened }) => (opened ? '73px' : '28px')};
  display: flex;
  justify-content: flex-start;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  align-items: center;
  border: none;
  overflow: hidden;
  svg {
    flex-shrink: 0;
  }
  background: rgba(0, 0, 0, 0.05);
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  transition: background-color 300ms ease-out, width 200ms ease-out;
  color: ${({ red }) => (red ? 'red' : 'inherit')};
  cursor: pointer;
`;
