let isArray = Array.isArray,
    isObj = (thing) => ((typeof thing === 'object') && thing instanceof Object),
    isFunc = (thing) => typeof thing === 'function',
    isString = (thing) => typeof thing === 'string',
    isNum = (thing) => typeof thing === 'number';

export {isArray, isObj, isFunc, isString, isNum};