import React from 'react';

type Props = {
  children: React.ReactElement | null;
};

const OutletContainer: React.FC<Props> = ({ children }) => {
  return (
    <div className="bg-background">
      <div className="
        mx-auto min-h-screen max-w-screen-2xl pb-12 md:pb-24 px-8 md:px-16"
      >
        {children}
      </div>
    </div>
  );
};

export default OutletContainer;