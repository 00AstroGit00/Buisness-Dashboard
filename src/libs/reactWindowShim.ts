/**
 * Compatibility shim for `react-window` exports.
 * Some bundlers or dependency optimizers may expose components differently.
 * This module tries multiple lookup strategies and exports graceful fallbacks.
 */
import * as RW from 'react-window';

const anyRW: any = RW as any;

export const FixedSizeList: any = anyRW.FixedSizeList ?? anyRW.List ?? anyRW.default?.FixedSizeList ?? anyRW.default ?? null;
export const VariableSizeList: any = anyRW.VariableSizeList ?? anyRW.default?.VariableSizeList ?? null;
export const FixedSizeGrid: any = anyRW.FixedSizeGrid ?? anyRW.Grid ?? anyRW.default?.FixedSizeGrid ?? null;
export const VariableSizeGrid: any = anyRW.VariableSizeGrid ?? null;

export default RW;
