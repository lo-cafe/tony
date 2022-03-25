import { useState } from 'react';
import styled, { css } from 'styled-components';
import { FiMessageSquare, FiTrash2, FiEdit2, FiDownload, FiCheck } from 'react-icons/fi';
import AutowidthInput from 'react-autowidth-input';

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
  withButtons?: boolean;
  onValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const FixedButton: FC<FixedButtonProps> = ({
  onClick,
  data,
  selected,
  value,
  onValueChange,
  onDownload,
  onDelete,
  icon,
  color,
  disabled,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleInnerClick = (func: (data?: ID) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    func(data);
  };

  const handleClick = (onClick: () => void) => () => {
    if (isEditing) return;
    onClick();
  };

  return (
    <FixedButtonWrapper
      className={className}
      disabled={disabled}
      withButtons={!!onValueChange || !!onDownload || !!onDelete}
      color={color}
      selected={selected}
      onClick={handleClick(() => onClick && onClick(data))}
    >
      {icon}
      {isEditing ? <PillInput name={data} value={value} onChange={onValueChange} /> : value}
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
        <FixedButtonInnerButton red onClick={handleInnerClick(() => onDelete(data))}>
          <FiTrash2 />
        </FixedButtonInnerButton>
      )}
    </FixedButtonWrapper>
  );
};

export default FixedButton;

const FixedButtonWrapper = styled.div<{
  selected?: boolean;
  color?: 'add' | 'delete';
  withButtons?: boolean;
  disabled?: boolean;
}>`
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
  gap: 8px;
  font-size: 14px;
  align-items: center;
  transition: background-color 300ms ease-out;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  color: ${({ color, disabled }) =>
    disabled ? '#bdbdbd' : color ? (color === 'add' ? '#0068f6' : 'red') : '#424242'};
  border: ${({ selected }) => (selected ? 'solid 2px #0068f6' : 'solid 1px rgba(255,255,255,0.9)')};
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

const FixedButtonInnerButton = styled.button<{ red?: boolean }>`
  color: inherit;
  border-radius: 8px;
  height: 28px;
  width: 28px;
  display: flex;
  justify-content: flex-start;
  font-size: 16px;
  align-items: center;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  transition: background-color 300ms ease-out;
  color: ${({ red }) => (red ? 'red' : 'inherit')};
  cursor: pointer;
`;
