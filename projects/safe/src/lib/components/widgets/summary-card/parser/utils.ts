import { get } from 'lodash';
import { Record } from '../../../../models/record.model';
import calcFunctions from './calcFunctions';

/** Prefix for data keys */
const DATA_PREFIX = '{{data.';
/** Prefix for calc keys */
const CALC_PREFIX = '{{calc.';
/** Suffix for all keys */
const PLACEHOLDER_SUFFIX = '}}';

/**
 * Mapping of file types / kendo icons.
 */
const ICON_EXTENSIONS: any = {
  bmp: 'k-i-file-programming',
  csv: 'k-i-file-csv',
  doc: 'k-i-file-word',
  docm: 'k-i-file-word',
  docx: 'k-i-file-word',
  eml: 'k-i-file',
  epub: 'k-i-file',
  gif: 'k-i-file-video',
  gz: 'k-i-file-zip',
  htm: 'k-i-file-programming',
  html: 'k-i-file-programming',
  jpg: 'k-i-file-image',
  jpeg: 'k-i-file-image',
  msg: 'k-i-file',
  odp: 'k-i-file-presentation',
  odt: 'k-i-file-txt',
  ods: 'k-i-file-data',
  pdf: 'k-i-file-pdf',
  png: 'k-i-file-image',
  ppt: 'k-i-file-ppt',
  pptx: 'k-i-file-ppt',
  pptm: 'k-i-file-ppt',
  rtf: 'k-i-file-txt',
  txt: 'k-i-file-txt',
  xls: 'k-i-file-excel',
  xlsx: 'k-i-file-excel',
  xps: 'k-i-file',
  zip: 'k-i-file-zip',
  xlsm: 'k-i-file-excel',
  xml: 'k-i-file-excel',
};

/**
 * Parse the html body of a summary card with the content of a record,
 * and calculate the calc functions.
 *
 * @param html The html text
 * @param record The record to fill the text with
 * @param aggregationData The aggregation data to fill the text with
 * @param fields Available fields
 * @returns The parsed html
 */
export const parseHtml = (
  html: string,
  record: Record | null,
  aggregationData: any,
  fields: any
) => {
  if (record) {
    const htmlWithRecord = replaceRecordFields(html, record, fields);
    return applyOperations(htmlWithRecord);
  } else if (aggregationData) {
    const htmlWithAggregation = replaceRecordFields(
      html,
      { data: aggregationData } as Record,
      fields
    );
    return applyOperations(htmlWithAggregation);
  } else {
    return applyOperations(html);
  }
};

/**
 * Replaces the html resource fields with the resource data.
 *
 * @param html String with the content html.
 * @param record Record object.
 * @param fields Available fields
 * @returns formatted html
 */
const replaceRecordFields = (
  html: string,
  record: any,
  fields: any
): string => {
  const fieldsValue = getFieldsValue(record);
  let formattedHtml = html;
  if (fields) {
    for (const field of fields) {
      const value = fieldsValue[field.name];
      let convertedValue: any;
      switch (field.type) {
        case 'url':
          convertedValue =
            '<a href="' +
            value +
            '" target="_blank">' +
            applyLayoutFormat(value, field) +
            '</a>';
          break;
        case 'email':
          convertedValue =
            '<a href="mailto: ' +
            value +
            '">' +
            applyLayoutFormat(value, field) +
            '</a>';
          break;
        case 'date':
          convertedValue = applyLayoutFormat(
            new Date(value).toLocaleString().split(',')[0],
            field
          );
          break;
        case 'datetime':
          const date = new Date(value);
          const hour =
            date.getHours() >= 12 ? date.getHours() - 12 : date.getHours();
          const minutes =
            date.getMinutes() < 10
              ? '0' + date.getMinutes()
              : date.getMinutes();
          const time = date.getHours() >= 12 ? 'PM' : 'AM';
          convertedValue = applyLayoutFormat(
            date.toLocaleString().split(',')[0] +
              ', ' +
              hour +
              ':' +
              minutes +
              ' ' +
              time,
            field
          );
          break;
        case 'boolean':
          const checked = value ? 'checked' : '';
          convertedValue =
            '<input type="checkbox" style="margin: 0; height: 16px; width: 16px;" ' +
            checked +
            ' disabled></input>';
          break;
        case 'file':
          convertedValue = '';
          for (let i = 0; value[i]; ) {
            const file = value[i];
            const fileExt = file.name.split('.').pop();
            const fileIcon =
              fileExt && ICON_EXTENSIONS[fileExt]
                ? ICON_EXTENSIONS[fileExt]
                : 'k-i-file';
            const fileName = applyLayoutFormat(
              fileExt && ICON_EXTENSIONS[fileExt]
                ? file.name.slice(0, file.name.lastIndexOf(fileExt) - 1)
                : file.name,
              field
            );
            convertedValue +=
              '<button type="file" ' +
              `field="${field.name}" ` +
              `index="${i++}" ` +
              'style="border: none; padding: 4px 6px; cursor: pointer" title="' +
              file.name +
              '">' +
              ' <span class="k-icon ' +
              fileIcon +
              '"></span>' +
              fileName +
              '</button>'; // add elements to be able to identify file when clicking on button
          }
          break;
        case 'owner':
        case 'users':
        case 'resources':
          convertedValue = (value ? value.length : 0) + ' items';
          break;
        default:
          convertedValue = applyLayoutFormat(value, field);
          break;
      }

      const regex = new RegExp(
        `${DATA_PREFIX}${field.name}\\b${PLACEHOLDER_SUFFIX}`,
        'gi'
      );
      formattedHtml = formattedHtml.replace(regex, convertedValue);
    }
  }
  return formattedHtml;
};

/**
 * Returns an object with the record data keys paired with the values.
 *
 * @param record Record object.
 * @returns fields
 */
const getFieldsValue = (record: any) => {
  const fields: any = {};
  for (const [key, value] of Object.entries(record)) {
    if (!key.startsWith('__') && key !== 'form') {
      if (value instanceof Object) {
        for (const [key2, value2] of Object.entries(value)) {
          if (!key2.startsWith('__')) {
            fields[(key === 'data' ? '' : key + '.') + key2] = value2;
          }
        }
      } else {
        fields[key] = value;
      }
    }
  }
  return fields;
};

/**
 * Apply the calc functions on the html body.
 *
 * @param html The html body on which we want to apply the functions
 * @returns The html body with the calculated result of the functions
 */
const applyOperations = (html: string): string => {
  const regex = new RegExp(
    `${CALC_PREFIX}(\\w+)\\(([^\\)]+)\\)${PLACEHOLDER_SUFFIX}`,
    'gm'
  );
  let parsedHtml = html;
  let result = regex.exec(html);
  while (result !== null) {
    // get the function
    const calcFunc = get(calcFunctions, result[1]);
    if (calcFunc) {
      // get the arguments and clean the numbers to be parsed correctly
      const args = result[2]
        .split(';')
        .map((arg) => arg.replace(/[\s,]/gm, ''));
      // apply the function
      let resultText;
      try {
        resultText = calcFunc.call(...args);
      } catch (err: any) {
        resultText = `<span style="text-decoration: red wavy underline" title="${err.message}"> ${err.name}</span>`;
      }
      parsedHtml = parsedHtml.replace(result[0], resultText);
    }
    result = regex.exec(html);
  }
  return parsedHtml;
};

/**
 * Returns an array with the layout available fields.
 *
 * @param fields Array of fields.
 * @returns list of data keys
 */
export const getDataKeys = (fields: any): string[] =>
  fields.map((field: any) => DATA_PREFIX + field.name + PLACEHOLDER_SUFFIX);

/**
 * Returns an array with the calc operations keys.
 *
 * @returns List of calc keys
 */
export const getCalcKeys = (): string[] => {
  const calcObjects = Object.values(calcFunctions);
  return calcObjects.map(
    (obj) => CALC_PREFIX + obj.signature + PLACEHOLDER_SUFFIX
  );
};

/**
 * Applies layout field format ignoring html tags
 *
 * @param name Original value of the field
 * @param field Field information, used to get field name and format
 * @returns Formatted field value
 */
export const applyLayoutFormat = (
  name: string | null,
  field: any
): string | null => {
  if (name && field.layoutFormat && field.layoutFormat.length > 1) {
    const regex = new RegExp(
      `${DATA_PREFIX}${field.name}\\b${PLACEHOLDER_SUFFIX}`,
      'gi'
    );
    const value = field.layoutFormat
      .replace(/<(.|\n)*?>/g, '')
      .replace(regex, name);
    return applyOperations(value);
  } else {
    return name;
  }
};
