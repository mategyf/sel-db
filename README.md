# @mategyf/sel-db

_Selester Ltd. T-SQL connection handler using [tedious](https://www.npmjs.com/package/tedious)._

This is basically a wrapper that wraps promises around tedious' callbacks.

**Currently only works with stored procedures!**

## Installation

```bash
yarn add @mategyf/sel-db
```

## Basic example

Considering a stored procedure as follows, running on a local sql database:

```sql
CREATE PROCEDURE [dbo].[countChar]
@inputVal varchar(30),
@outputCount int OUTPUT
AS
set @outputCount = LEN(@inputVal);
GO
```

A basic implementation would be:

```javascript
import { DB, StoredProcedure } from '@mategyf/sel-db';

const db = new DB();

const sqlConfig = {
  server: 'localhost',
  options: {},
  authentication: {
    type: 'default',
    options: {
      userName: 'my-username',
      password: 'my-password',
    },
  },
};

await db.initiateConnection(sqlConfig);

const sp = new StoredProcedure('countChar');
sp.addParam('inputVal', 'VARCHAR', 'something', { length: 30 });
sp.addOutputParam('outputCount', 'int');

const result = await db.callSP(sp);
console.log(result);
// {
//   output: {
//     outputCount: 9
//   },
//   columns: [],
//   recordset: []
// }
```

## Real-life implementation

Sel-db can be used with a logger, [@mategyf/express-logger](https://www.npmjs.com/package/@mategyf/express-logger) is tested with it, but anything that has `xxx.info()` and `xxx.error()` methods should work.

Create a file that exports an instance of the DB class. To keep things organized, it can also contain the config object.

`db.js`:

```javascript
import logger from '@mategyf/express-logger';
import { DB } from '@mategyf/sel-db';

export const sqlConfig = {
  server: 'localhost',
  options: {},
  authentication: {
    type: 'default',
    options: {
      userName: 'my-username',
      password: 'my-password',
    },
  },
};

export const db = new DB(logger);
```

In a place that gets called at init (like `index.js`), initialize the connection:

```javascript
import { db, sqlConfig } from './db';

db.initiateConnection(sqlConfig);
// ...
```

Then make a function for calling the stored procedure.

`countChar.js`

```javascript
import { StoredProcedure } from '@mategyf/sel-db';
import { db } from './db';

export default async function countChar(str) {
  const sp = new StoredProcedure('countChar');
  sp.addParam('inputVal', 'VARCHAR', str, { length: 30 });
  sp.addOutputParam('outputCount', 'int');

  const sqlResult = await db.callSP(sp);

  return sqlResult.output.outputCount;
}
```

Since this returns a promise, use eg. `const a = await countChar('a')` to get the result.

## API

### Connection

Todo.

### Stored procedures

Todo.

## Known issues

### ECONNRESET, timeout (?) on Azure

After some time, connections to azure databases are broken, they switch to 'Final' state, possibly due to timeout settings. If the actual internet connection is still open, sel-db will close the previous, then create a new connection when a new request is called.

The disconnection event still throws an uncaught exception, which clogs the logging and potentially the console/terminal running express.
