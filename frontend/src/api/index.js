import { classesApi } from './classesApi';
import { holdsApi } from './holdsApi';

export const api = {
  getClasses: classesApi.getAll,
  getClass: classesApi.getById,
  createClass: classesApi.create,
  createHold: classesApi.createHold,
  getHold: holdsApi.getById,
  confirmHold: holdsApi.confirm,
  cancelHold: holdsApi.cancel,
  getMyHolds: holdsApi.getMine,
};

export { classesApi, holdsApi };
