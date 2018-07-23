'use strict'
const _ = require('lodash')
const jsonic = require('jsonic')

module.exports = function (loader, options) {
  let plugins = '{ '
  _.each(options.plugins, function (plugin) {
    if (_.isString(plugin)) plugin = [plugin]
    const pluginConfigs = plugin[0].split('|')
    const pluginName = pluginConfigs[0]
    const pluginConfig = _.defaults({}, plugin[1], jsonic(pluginConfigs[1] || ''))

    const $name = `${options.$name}--${pluginName}`
    const install = require(`${$name}/lib/plugin`)({
      $name,
      $plugin: `require('${$name}').default`,
      $vuex: options.$vuex,
      $router: options.$router,
      $config: JSON.stringify(pluginConfig).replace(/"([^"]+?)\|require":("[^"]*?")/g, '"$1":require($2)')
    })
    plugins += `'${pluginName}': ${install}, `
  })
  plugins += '}'
  plugins = plugins.replace(', }', ' }')
  return {
    install: `framework.use(
      ${options.$plugin},
      {
        plugins: ${plugins}
      })`
  }
}
