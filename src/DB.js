/* eslint-disable operator-linebreak */
import { Connection, Request } from 'tedious';

export default class DB {
  constructor(sqlConfig, logger) {
    this.config = sqlConfig;
    this.connection = new Connection(sqlConfig);
    if (logger) {
      this.logger = logger;
    } else {
      this.replaceLogger();
    }
    this.checkSqlConfig();
    // this.opendbConnection();
  }

  getState() {
    return this.connection?.state?.name;
  }

  resetConnection() {
    return new Promise((resolve, reject) => {
      if (this.getState() !== 'Final') {
        this.logger.info('Reset skipped, not in final state.');
        resolve(this.getState());
      }

      this.connection.reset((e) => {
        if (e) {
          this.logger.error(`Database connection reset failed! ${e}`);
          reject(e);
        }
        this.logger.info('Connection successfully reset.');
        resolve(this.getState());
      });
    });
  }

  // async resetDbConnection() {
  //   if (this.connection?.state?.name !== 'Final') {
  //     return;
  //   }

  //   this.connection.reset((err) => {
  //     if (err) {
  //       this.logger.error(`Database connection reset failed! ${err}`);
  //       const error = new Error('Database connection reset failed!');
  //       error.status = 500;
  //       throw error;
  //     }
  //     this.logger.info('Database connection reset successful.');
  //   });

  // const promise = new Promise((res, rej) => {
  //   this.connection.reset((err) => {
  //     if (err) {
  //       rej();
  //     }
  //     res();
  //   });
  // });

  // await promise()
  //   .then(() => {
  //     res();
  //   })
  //   .catch(() => {
  //     throw new Error("Connection failed");
  //   });
  // }

  openConnection() {
    return new Promise((resolve, reject) => {
      const state = this.getState();
      if (state === 'LoggedIn') {
        this.logger.info('sel-db: Already logged in.');
        resolve(this.getState());
      }

      if (state === 'Connecting') {
        this.logger.info('sel-db: Already connecting, waiting for completion.');
        // resolve(this.getState());
        this.connection.on('connect', (err) => {
          if (err) {
            this.logger.error(`sel-db: ${err}`);
            reject(err);
          }
          resolve(this.getState());
        });
      } else if (state === 'Final') {
        this.logger.info('sel-db: State Final. Resetting connection.');
        this.resetConnection()
          .then(() => {
            this.logger.info('sel-db: Connection reset.');
            resolve(this.getState());
          })
          .catch((e) => {
            this.logger.error(`sel-db: ${e}`);
            reject(e);
          });
      } else {
        this.connection.connect((err) => {
          if (err) {
            this.logger.error(`sel-db: ${err}`);
            reject(err);
          }
          this.logger.info('sel-db: Database connection successful.');
          resolve(this.getState());
        });
      }
    });
  }

  async opendbConnection() {
    console.log(this.connection?.state?.name);
    if (
      this.connection?.state?.name === 'LoggedIn' ||
      this.connection?.state?.name === 'Connecting'
    ) {
      return;
    }

    if (this.connection?.state?.name === 'Final') {
      await this.resetDbConnection();
      return;
    }

    this.connection.connect((err) => {
      if (err) {
        this.logger.error(err);
        const error = new Error('Database connection failed!'); // send back err too?
        error.status = 500;
        throw error;
      }
      this.logger.info('Database connection successful.');
    });

    // const promise = new Promise((res, rej) => {
    //   this.connection.connect((err) => {
    //     if (err) {
    //       logger.error(err);
    //       rej();
    //     }
    //     logger.info("Database connected successfully");
    //     res();
    //   });
    // });

    // await promise
    //   .then(() => {
    //     return;
    //   })
    //   .catch((err) => {
    //     const error = new Error("Database connection failed");
    //     error.status = 500;
    //     throw error;
    //   });

    // return;
  }

  retardedCall(sp) {
    return new Promise((resolve, reject) => {
      const output = {};
      let columns = [];
      const recordset = [];

      const request = new Request(sp.procName, (err) => {
        if (err) {
          reject(err);
        }
      });

      request.setTimeout = sp.timeOut;

      sp.params.forEach((param) => {
        if (param.direction === 'input') {
          request.addParameter(
            param.name,
            param.type,
            param.value,
            param.options,
          );
        } else {
          request.addOutputParameter(
            param.name,
            param.type,
            param.value,
            param.options,
          );
        }
      });

      request.on('requestCompleted', () => {
        resolve({ output, columns, recordset });
      });

      request.on('returnValue', (name, value) => {
        output[name] = value;
      });

      request.on('columnMetadata', (columnsMetadata) => {
        columns = columnsMetadata.map((colData) => ({
          name: colData.colName,
          type: colData.type.name,
        }));
      });

      // todo: 'columns' name
      request.on('row', (xxxcolumns) => {
        const record = {};

        xxxcolumns.forEach((column) => {
          record[column.metadata.colName] = column.value;
        });

        recordset.push(record);
      });

      this.connection.callProcedure(request);
    });
  }

  async callSP(sp) {
    return this.openConnection()
      .then(() => this.retardedCall(sp))
      .catch((e) => {
        this.logger.error(`sel-db: ${e}`);
        throw e;
      });
  }

  async callStoredProcedure(sp) {
    await this.opendbConnection();

    const promise = new Promise((res, rej) => {
      const output = {};
      let columns = [];
      const recordset = [];

      const request = new Request(sp.procName, (err) => {
        if (err) {
          rej(err);
        }
      });

      // request.setTimeout = parseInt(process.env.DB_TIMEOUT);
      request.setTimeout = sp.timeOut;

      sp.params.forEach((param) => {
        if (param.direction === 'input') {
          request.addParameter(
            param.name,
            param.type,
            param.value,
            param.options,
          );
        } else {
          request.addOutputParameter(
            param.name,
            param.type,
            param.value,
            param.options,
          );
        }
      });

      request.on('requestCompleted', () => {
        res({ output, columns, recordset });
      });

      request.on('returnValue', (name, value) => {
        output[name] = value;
      });

      request.on('columnMetadata', (columnsMetadata) => {
        columns = columnsMetadata.map((colData) => ({
          name: colData.colName,
          type: colData.type.name,
        }));
      });

      request.on('row', (xxxcolumns) => {
        const record = {};

        xxxcolumns.forEach((column) => {
          record[column.metadata.colName] = column.value;
        });

        recordset.push(record);
      });

      this.connection.callProcedure(request);
    });

    const result = await promise
      .then((output) => output)
      .catch((err) => {
        this.logger.error(err);
        const error = new Error('Failed');
        error.status = 500;
        throw error;
      });

    return result;
  }

  replaceLogger() {
    this.logger = {
      // eslint-disable-next-line no-console
      info: console.log,
      // eslint-disable-next-line no-console
      error: console.error,
    };
  }

  checkSqlConfig() {
    const validTypes = [
      'default',
      'ntlm',
      'azure-active-directory-password',
      'azure-active-directory-access-token',
      'azure-active-directory-msi-vm',
      'azure-active-directory-msi-app-service',
    ];

    try {
      if (!this.config.server) {
        throw new Error('No server configured!');
      }
      if (!this.config.authentication) {
        throw new Error('No authentication provided!');
      }
      const { type } = this.config.authentication;
      if (!type) {
        this.config.authentication.type = 'default';
      } else if (!validTypes.includes(type)) {
        throw new Error('Invalid authentication type!');
      }
      if (
        !this.config.authentication.options ||
        !this.config.authentication.options.userName ||
        !this.config.authentication.options.password
      ) {
        throw new Error('No user or pass provided!');
      }
    } catch (e) {
      this.logger.error(e.message);
      throw new Error(`sel-db config: ${e.message}`);
    }
  }
}

/*
  declare STATE: {
    INITIALIZED: State;
    CONNECTING: State;
    SENT_PRELOGIN: State;
    REROUTING: State;
    TRANSIENT_FAILURE_RETRY: State;
    SENT_TLSSSLNEGOTIATION: State;
    SENT_LOGIN7_WITH_STANDARD_LOGIN: State;
    SENT_LOGIN7_WITH_NTLM: State;
    SENT_LOGIN7_WITH_FEDAUTH: State;
    LOGGED_IN_SENDING_INITIAL_SQL: State;
    LOGGED_IN: State;
    SENT_CLIENT_REQUEST: State;
    SENT_ATTENTION: State;
    FINAL: State;
  }
*/
