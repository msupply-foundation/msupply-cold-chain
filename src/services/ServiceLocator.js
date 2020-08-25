import { SERVICES, SERVICE_LOCATOR_ERROR } from '~constants';

const servicesContainer = {};

export const getService = key => {
  if (!Object.values(SERVICES).includes(key)) {
    throw new Error(SERVICE_LOCATOR_ERROR.SERVICE_NOT_SUPPORTED);
  }

  const service = servicesContainer[key];

  if (!service) throw new Error(SERVICE_LOCATOR_ERROR.SERVICE_NOT_REGISTERED);

  return service;
};

export const getServices = keys => {
  return keys.map(key => getService(key));
};

export const registerService = (key, service) => {
  if (!(typeof key === 'string' && key)) {
    throw new Error(SERVICE_LOCATOR_ERROR.MUST_REGISTER_A_KEY);
  }

  if (!Object.values(SERVICES).includes(key)) {
    throw new Error(SERVICE_LOCATOR_ERROR.SERVICE_NOT_SUPPORTED);
  }

  servicesContainer[key] = service;
  return true;
};

export const deleteServices = () => {
  if (__DEV__) {
    Object.keys(servicesContainer).forEach(key => {
      servicesContainer[key] = null;
    });
  } else {
    throw new Error(SERVICE_LOCATOR_ERROR.CANT_DELETE_SERVICES);
  }
};
