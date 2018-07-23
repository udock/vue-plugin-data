module.exports = {
  external: (id) => /^lodash\/.*$/.test(id),
  globals: {
    'babel-runtime/core-js/get-iterator': 'core.getIterator',
    'babel-runtime/core-js/symbol': 'core.Symbol',
    'babel-runtime/helpers/slicedToArray': 'BabelHelpers.slicedToArray',
    'lodash/extend': '_.extend',
    'lodash/forOwn': '_.forOwn',
    'lodash/get': '_.get',
    'lodash/isFunction': '_.isFunction',
    'lodash/isPlainObject': '_.isPlainObject',
    'lodash/mapValues': '_.mapValues',
    'lodash/set': '_.set'
  }
}
