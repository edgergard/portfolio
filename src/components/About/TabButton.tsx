import classNames from "classnames";
import React from "react";

type Props = {
  selectTab: () => void;
  selectedTab: number;
  id: number;
  children: string;
};

const TabButton: React.FC<Props> = ({
  selectTab,
  selectedTab,
  children,
  id,
}) => {
  return (
    <button onClick={selectTab}>
      <p
        className={classNames(
          "text-lg md:text-3xl lg:text-[27px] xl:text-4xl font-bold",
          "hover:text-white transition-colors border-blood text-text-secondary",
          {
            "border-b-4 pb-[1px] md:pb-2 text-white": selectedTab === id,
          }
        )}
      >
        {children}
      </p>
    </button>
  );
};

export default TabButton;
