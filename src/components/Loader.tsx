import { TailSpin } from 'react-loader-spinner';

const Loader = () => {
  return (
    <TailSpin
      visible={true}
      height="24"
      width="24"
      color="#FFF"
      ariaLabel="tail-spin-loading"
      radius="1"
    />
  );
};

export default Loader;