const createRedirect = (
  destination: string,
  option?: { permanent: boolean }
) => {
  return {
    redirect: {
      destination,
      permanent: option?.permanent || false,
    },
  };
};

export { createRedirect };
