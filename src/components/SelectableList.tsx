import styled from 'styled-components';
import { getLuminance } from 'polished';

import colors from '~/constants/colors';

type OptionTypes = 'divider' | 'item';

interface Option {
  label?: string;
  onClick?: () => void;
  color?: string;
  icon?: React.ReactNode;
  type: OptionTypes;
  selected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface SelectableListProps {
  options: Option[];
  onOptionSelect?: () => void;
  style?: any;
}

const SelectableList: FC<SelectableListProps> = ({ options, onOptionSelect, ...rest }) => {
  const onClickProxy = (cb: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOptionSelect) onOptionSelect();
    if (cb) cb();
  };

  const rightOptionKind = (option: Option) => {
    const options: {
      divider: () => React.ReactElement;
      item: () => React.ReactElement;
      // header: () => React.ReactElement;
    } = {
      divider: () => <hr />,
      // header: () => <span>{option}</span>,
      item: () => (
        <OptionButton
          selected={option.selected}
          color={option.color}
          onMouseEnter={option.onMouseEnter}
          onMouseLeave={option.onMouseLeave}
          onClick={onClickProxy(option.onClick!)}
          type="button"
        >
          <span>
            {option.icon}
            {option.label}
          </span>
        </OptionButton>
      ),
    };

    return options[option.type] && options[option.type]();
  };

  return (
    <Ul {...rest}>
      {options.length ? (
        options.map((option, index) => <li key={index}>{rightOptionKind(option)}</li>)
      ) : (
        <li>
          <OptionButton disabled>
            <span>No options available</span>
          </OptionButton>
        </li>
      )}
    </Ul>
  );
};

export default SelectableList;

const OptionButton = styled.button<{ selected?: boolean; disabled?: boolean }>`
  display: block;
  width: 100%;
  font-family: inherit;
  background: transparent;
  border: none;
  display: block;
  width: 100%;
  padding: 0;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  user-select: none;
  & > * {
    background-color: ${({ selected }) => (selected ? 'rgba(125,125,125,0.15)' : 'transparent')};
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    text-align: left;
    border: none;
    padding: 8px 12px;
    color: ${({ color, theme }) => color || theme.colors.font};
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.superQuick}ms ease-out;
    margin: 1px 0;
    &:hover {
      background-color: ${({ theme }) => theme.nodeColors.accent};
      color: ${({ theme }) =>
        getLuminance(theme.nodeColors.accent) > 0.4 ? colors.light.font : colors.dark.font};
    }
  }
`;

const Ul = styled.ul`
  margin: 0;
  padding: 6px 8px;
  li {
    list-style: none;
    & > span {
      display: block;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 500;
      margin: 2px 6px;
      opacity: 0.5;
    }
    hr {
      border: none;
      height: 1px;
      background-color: #eee;
      margin: 6px;
    }
  }
`;
