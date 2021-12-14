import { TYPES } from 'tedious';

const dataTypes = {
  // Exact numerics
  bit: TYPES.Bit,
  tinyint: TYPES.TinyInt,     // nem
  smallint: TYPES.SmallInt,   // nem
  int: TYPES.Int,
  bigint: TYPES.BigInt,
  numeric: TYPES.Numeric,   // vannak tovabbi parameterek Numeric(length, tizedesjegyek szama)
  decimal: TYPES.Decimal,   // nem
  smallmoney: TYPES.SmallMoney, // szorgalmi feladat
  money: TYPES.Money,         // szorgalmi feladat
  // Approximate numerics
  float: TYPES.Float,     // KELL
  real: TYPES.Real,       // nem
  // Date and Time
  smalldatetime: TYPES.SmallDateTime,   // nem
  datetime: TYPES.DateTime,             // KELL
  datetime2: TYPES.DateTime2,           // nem
  datetimeoffset: TYPES.DateTimeOffset, // nem
  time: TYPES.Time,   // nem
  date: TYPES.Date,   // nem
  // Character Strings
  char: TYPES.Char,     // nem
  varchar: TYPES.VarChar,   // nem
  text: TYPES.Text,   // nem
  // Unicode Strings
  nchar: TYPES.NChar,   // KELL
  nvarchar: TYPES.NVarChar,   // KELL
  ntext: TYPES.NText,   // NEM
  // Binary Strings
  binary: TYPES.Binary,   // KELL
  varbinary: TYPES.VarBinary,   // KELL
  image: TYPES.Image,   // nem
  // Other Data Types
  null: TYPES.Null,   // ??? nem
  TVP: TYPES.TVP,   // nem
  UDT: TYPES.UDT,   // nem
  uniqueidentifier: TYPES.UniqueIdentifier,   // KELL
  variant: TYPES.Variant,   // nem
  xml: TYPES.xml,   // KELL
};

export default dataTypes;
