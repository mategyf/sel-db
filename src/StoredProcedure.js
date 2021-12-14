import dataTypes from './dataTypes';

export default class StoredProcedure {
  constructor(procName, timeOut) {
    this.procName = procName;
    this.timeOut = timeOut;
    this.params = [];
  }

  addParam(name, type, value, options) {
    const parsed = StoredProcedure.getDataType(type, options);
    this.params.push({
      direction: 'input',
      name,
      type: parsed.type,
      value,
      options: parsed.options,
    });
  }

  addOutputParam(name, type, value, options) {
    const parsed = StoredProcedure.getDataType(type, options);
    this.params.push({
      direction: 'output',
      name,
      type: parsed.type,
      value,
      options: parsed.options,
    });
  }

  static getDataType(typeStr, options) {
    // eslint-disable-next-line no-unused-vars
    const [nameStr, optionsStr] = typeStr.replace(')', '').split('(');

    // let length;
    // if (optionsStr) {
    //   length = parseInt(optionsStr, 10);
    //   if (Number.isNaN(length)) length = optionsStr.toLowerCase();
    // }

    const name = dataTypes[nameStr.toLowerCase()];
    if (!name) {
      throw new Error('Invalid data type!');
    }
    /* https://tediousjs.github.io/tedious/api-datatypes.html */

    // if (length) {
    //   return { type: name, options: { length } };
    // }
    // return { type: name };
    return { type: name, options };
  }
}
