import styled from 'styled-components';

type OptionTypes = 'divider' | 'item' | 'header';

interface Option {
  label?: string | React.ReactElement;
  onClick?: () => void;
  color?: string;
  icon?: React.ReactNode;
  type: OptionTypes;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface SelectableListProps {
  options: Option[];
  onOptionSelect: () => void;
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
      header: () => React.ReactElement;
    } = {
      divider: () => <hr />,
      header: () => <span>{option}</span>,
      item: () => (
        <OptionButton
          color={option.color}
          onMouseEnter={option.onMouseEnter}
          onMouseLeave={option.onMouseLeave}
          onClick={onClickProxy(option.onClick)}
          type="button"
        >
          {typeof option.label === 'object' ? option : <span>{option.icon}{option.label}</span>}
        </OptionButton>
      ),
    };

    return options[option.type] && options[option.type]();
  };

  return (
    <Ul {...rest}>
      {options.map((option, index) => (
        <li key={index}>{rightOptionKind(option)}</li>
      ))}
    </Ul>
  );
};

export default SelectableList;

const OptionButton = styled.button`
  display: block;
  width: 100%;
  background-color: transparent;
  font-family: inherit;
  border: none;
  display: block;
  width: 100%;
  padding: 0;
  & > * {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    text-align: left;
    background-color: transparent;
    border: none;
    padding: 8px 12px;
    color: ${({ color }) => color || '#424242'};
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: 150ms ease-out;
    margin: 1px 0;
    &:hover {
      background-color: #0050d3;
      color: white;
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
