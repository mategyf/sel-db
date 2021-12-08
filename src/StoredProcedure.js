import dataTypes from './dataTypes';

export default class StoredProcedure {
  constructor(procName, timeOut) {
    this.procName = procName;
    this.timeOut = timeOut;

    this.params = [];
  }

  addParameter(name, type, value) {
    const parsed = this.getVariableType(type);
    this.params.push({
      direction: 'input',
      name,
      type: parsed.type,
      value,
      options: parsed.options,
    });
  }

  addOutputParameter(name, type, value) {
    const parsed = this.getVariableType(type);
    this.params.push({
      direction: 'output',
      name,
      type: parsed.type,
      value,
      options: parsed.options,
    });
  }

  static getVariableType(str) {
    const [nameStr, lengthStr] = str.replace(')', '').split('(');

    let length;
    if (lengthStr) {
      length = parseInt(lengthStr, 10);
      if (Number.isNaN(length)) length = lengthStr.toLowerCase();
    }

    const name = dataTypes[nameStr.toLowerCase()];
    if (!name) {
      throw new Error('Invalid data type!');
    }
    /* https://tediousjs.github.io/tedious/api-datatypes.html */

    if (length) {
      return { type: name, options: { length } };
    }
    return { type: name };
  }
}
