/**
 * Contract shapes from assignment §1.4 (camelCase JSON).
 *
 * @typedef {Object} CreateClassRequest
 * @property {string} name
 * @property {number} totalSeats
 *
 * @typedef {Object} CreateClassResponse
 * @property {string} id
 * @property {string} name
 * @property {number} totalSeats
 *
 * @typedef {Object} ClassDetail
 * @property {string} id
 * @property {string} name
 * @property {number} totalSeats
 * @property {number} heldSeats
 * @property {number} confirmedSeats
 * @property {number} availableSeats
 *
 * @typedef {Object} CreateHoldResponse
 * @property {string} holdId
 * @property {string} classId
 * @property {string} studentId
 * @property {string} status
 * @property {string} expiresAt
 *
 * @typedef {Object} HoldStatusResponse
 * @property {string} holdId
 * @property {string} classId
 * @property {string} status
 * @property {string} expiresAt
 *
 * @typedef {Object} ConfirmHoldResponse
 * @property {string} holdId
 * @property {string} status
 *
 * @typedef {Object} StudentHoldItem
 * @property {string} holdId
 * @property {string} classId
 * @property {string} className
 * @property {string} status
 * @property {string} expiresAt
 */

export {};
