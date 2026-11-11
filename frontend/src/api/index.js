import { classesApi } from './classesApi';
import { configApi } from './configApi';
import { holdsApi } from './holdsApi';

/** Extra response fields are OK; never rename/remove §1.4 contract fields. */
export const api = {
  getConfig: configApi.get,
  createClass: classesApi.create,
  getClasses: classesApi.getAll,
  getClass: classesApi.getById,
  createHold: classesApi.createHold,
  getHold: holdsApi.getById,
  confirmHold: holdsApi.confirm,
  cancelHold: holdsApi.cancel,
  getMyHolds: holdsApi.getMine,
};

export { classesApi, configApi, holdsApi };
export { API_PATHS, STUDENT_ID_HEADER } from './paths';
