const path = require('path');

const yargs = require('yargs');

const transformTableStructureToDBML = require('./transformTableStructureToDBML');
const transformEnumToDBML = require('./transformEnumToDBML');
const transformFKsToRefsDBML = require('./transformFKsToRefsDBML');

const createFile = require('../utils/createFile');
const writeToFile = require('../utils/writeToFile');
const db = require('../db');

const getFileName = ({
  dbName, dir, schema, splitDbmlBySchema,
}) => {
  const fileName = splitDbmlBySchema ? `${dbName}.${schema}` : dbName;

  return path.join(dir, `${fileName}.dbml`);
};

const getColumnGetter = (schemas) => (schemaName, tableName, ordinalPosition) => {
  const cleanTableName = tableName.replace(/"/g, '');

  return schemas
    .filter(({ schema }) => schema === schemaName)
    .reduce((acc, { tables }) => [].concat(acc, [...tables]), [])
    .filter((table) => table.tableName === cleanTableName)
    .map(({ structure }) => structure.find((col) => col.ordinal_position === ordinalPosition))[0];
};

module.exports = (schemaStructures) => {
  const { o: outputDir, separate_dbml_by_schema: splitDbmlBySchema } = yargs.argv;
  const { dbName } = db;
  const dir = outputDir || './';

  const includeSchemaName = schemaStructures.length > 1 && !splitDbmlBySchema;

  let filePathWithName;
  if (!splitDbmlBySchema) {
    filePathWithName = getFileName({
      dbName,
      dir,
      splitDbmlBySchema,
    });

    createFile(filePathWithName);
  }

  const columnGetter = getColumnGetter(schemaStructures);

  return schemaStructures.forEach(({
    constraints, schema, tables, enums,
  }) => {
    if (splitDbmlBySchema) {
      filePathWithName = getFileName({
        dbName,
        dir,
        schema,
        splitDbmlBySchema,
      });

      createFile(filePathWithName);
    }

    enums.forEach((enumDefinition) => {
      const dbml = transformEnumToDBML(enumDefinition, schema, includeSchemaName);
      writeToFile(filePathWithName, dbml);
    });

    tables.forEach((tableDefinition) => {
      const dbml = transformTableStructureToDBML(tableDefinition, schema, includeSchemaName);
      writeToFile(filePathWithName, dbml);
    });

    const relationsDbml = transformFKsToRefsDBML(
      schema,
      constraints,
      includeSchemaName,
      columnGetter,
    );

    writeToFile(filePathWithName, relationsDbml, splitDbmlBySchema);
  });
};
