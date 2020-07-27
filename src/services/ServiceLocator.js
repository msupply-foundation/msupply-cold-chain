const services = {};

export const getService = key => services[key];

export const registerService = (key, service) => {
  services[key] = service;
};
