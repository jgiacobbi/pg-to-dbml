// NOTE: possible to use https://www.dbml.org/js-module/#api for the transform to dbml?
module.exports = function getColumnType(col) {
  const { data_type: dataType, udt_name: udtName } = col;
  let columnType;
  switch (dataType) {
    case 'character varying':
    case 'varchar':
      columnType = 'varchar';
      break;
    case 'double precision':
      columnType = 'float8';
      break;
    case 'timestamp with time zone':
      columnType = 'timestamptz';
      break;
    case 'timestamp':
    case 'timestamp without time zone':
    case 'time without time zone':
      columnType = 'timestamp';
      break;
    case 'USER-DEFINED':
      return udtName;
    default:
      columnType = dataType;
  }

  return columnType;
};
