import extend from 'lodash/extend'
import mapValues from 'lodash/mapValues'
import isPlainObject from 'lodash/isPlainObject'
import isFunction from 'lodash/isFunction'
import forOwn from 'lodash/forOwn'
import get from 'lodash/get'
import set from 'lodash/set'

const OPTIONS_KEY = 'data'

const install = function (Vue, options) {
  if (install.installed) return

  const $tasks = {
    beforeDestroy: Symbol('beforeDestroy'),
    created: Symbol('created')
  }

  const methods = {}
  const initTasks = []
  const plugins = mapValues(options.plugins, function (value, key) {
    value.name = key
    if (value.methods) {
      extend(methods, value.methods)
    }
    if (value.init) {
      initTasks.push(function () {
        value.init(this, $tasks)
      })
    }
    return value
  })

  const walk = function (obj, cb, path = '') {
    let result
    if (isPlainObject(obj)) {
      result = {}
      forOwn(obj, (v, k) => {
        let [name, type] = k.split('@')
        const fullPath = path ? `${path}.${name}` : name
        const plugin = plugins[type]
        if (plugin) {
          set(result, name, cb(plugin, fullPath, v))
          delete obj[k]
        } else {
          set(result, name, walk(v, cb, fullPath))
        }
      })
    } else {
      result = obj
    }
    return result
  }

  Vue.mixin({
    methods,
    beforeCreate () {
      const vm = this
      const $options = vm.$options
      for (let task of initTasks) { task.call(vm) }
      let opts = get($options, OPTIONS_KEY)
      if (opts) {
        $options.data = function () {
          if (isFunction(opts)) {
            opts = opts.apply(vm, arguments)
          }
          const out = {}
          const data = walk(opts, function (plugin, name, value) {
            const type = plugin.name
            if (isFunction(plugin.enter)) {
              out[type] = out[type] || plugin.enter(vm, $tasks)
            }
            return isFunction(plugin.each) ? plugin.each(vm, value, name, out[type], $tasks) : undefined
          })
          forOwn(out, function (value, key) {
            const after = plugins[key].after
            if (isFunction(after)) {
              after(vm, value, $tasks)
            }
          })
          return data
        }
      }
    },
    created () {
      const tasks = get(this, $tasks.created)
      if (tasks) {
        for (let task of tasks) { task.call(this) }
      }
    },
    beforeDestroy () {
      const tasks = get(this, $tasks.beforeDestroy)
      if (tasks) {
        for (let task of tasks) { task.call(this) }
      }
    }
  })
}

export default {
  install
}
