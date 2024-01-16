import classNames from 'classnames';
import React from 'react';

type Props = {
  selectTab: () => void;
  selectedTab: string;
  children: string;
};

const TabButton: React.FC<Props> = ({ selectTab, selectedTab, children }) => {
  return (
    <button onClick={selectTab}>
      <p 
        className={classNames(
          'text-2xl md:text-4xl font-bold text-text-secondary',
          'hover:text-white transition-all border-blood', 
          {
            'border-b-4 pb-2 text-white': selectedTab === children,
          })}
      >
        {children}
      </p>
    </button>
  );
};

export default TabButton;