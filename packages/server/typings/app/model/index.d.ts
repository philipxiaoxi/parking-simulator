// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportMap = require('../../../app/model/map');

declare module 'egg' {
  interface IModel {
    Map: ReturnType<typeof ExportMap>;
  }
}
