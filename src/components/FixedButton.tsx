import { useState, useRef, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { FiMessageSquare, FiTrash2, FiEdit2, FiDownload, FiCheck } from 'react-icons/fi';
import AutowidthInput from 'react-autowidth-input';
import { nanoid } from 'nanoid';
import { darken } from 'polished';

import { ID } from '~/types/data';

interface FixedButtonProps extends HTMLAttributes<HTMLDivElement> {
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
  ...rest
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

  const onInputEnter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditing(false);
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
      {...rest}
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
      <form onSubmit={onInputEnter}>
        {isEditing ? (
          <PillInput autoComplete="false" name={data} value={value} onChange={onValueChange} />
        ) : (
          value
        )}
      </form>
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
  form {
    white-space: nowrap;
  }
  & svg * {
    stroke-width: 3px;
  }
  font-family: inherit;
  background: ${({ theme }) => theme.colors.blurBg};
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
  transition: background-color ${({ theme }) => theme.transitions.normal}ms ease-out;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  color: ${({ color, disabled, theme }) =>
    disabled
      ? '#bdbdbd'
      : color
      ? color === 'add'
        ? theme.nodeColors.accent
        : 'red'
      : theme.colors.font};
  border: ${({ selected, theme }) =>
    selected
      ? `solid 2px ${theme.nodeColors.accent}`
      : `solid 1px ${theme.colors.blurBorderColor}`};
  backdrop-filter: blur(35px) saturate(200%);
  transition: box-shadow ${({ theme }) => theme.transitions.normal}ms ease-out,
    background ${({ theme }) => theme.transitions.normal}ms ease-out;
  user-select: none;
  &:hover {
    box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.15);
  }
  &:active {
    background: ${({ theme }) => darken(0.03, theme.colors.blurBg)};
  }
`;

const PillInput = styled(AutowidthInput)`
  border: none;
  color: inherit;
  min-width: unset;
  background: rgba(255, 226, 8, 0.1);
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
  transition: background-color ${({ theme }) => theme.transitions.normal}ms ease-out,
    width ${({ theme }) => theme.transitions.quick}ms ease-out;
  color: ${({ red }) => (red ? 'red' : 'inherit')};
  cursor: pointer;
`;
