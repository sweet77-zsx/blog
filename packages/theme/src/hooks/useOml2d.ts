import { onBeforeUnmount, onMounted } from 'vue'
import { withBase } from 'vitepress'
import type { ModelOptions, Widget, WidgetOptions } from 'l2d-widget'
import { useOml2dOptions } from '../composables/config/blog'

type LegacyModelOptions = ModelOptions & {
  position?: [number, number]
}

type Oml2dOptions = Omit<WidgetOptions, 'model'> & {
  model?: WidgetOptions['model']
  models?: LegacyModelOptions[]
  mobileDisplay?: boolean
  mobileSize?: WidgetOptions['size']
  tips?: unknown
}

const defaultOptions: Partial<WidgetOptions> = {
  size: { width: 200, height: 200 },
}

function warnLegacyOptions(options: Oml2dOptions) {
  if (options.models) {
    console.warn('[sugarat-theme] oml2d.models 已废弃，请改用 l2d-widget 的 oml2d.model 配置。当前版本会自动兼容转换，更多配置请查看 https://github.com/hacxy/l2d-widget')
  }

  if (options.tips) {
    console.warn('[sugarat-theme] oml2d.tips 是 oh-my-live2d 的旧配置，l2d-widget 仅支持在 model.tips 中配置提示气泡。更多配置请查看 https://github.com/hacxy/l2d-widget')
  }
}

function normalizeModel(model: LegacyModelOptions): ModelOptions {
  const path = /^(?:https?:)?\/\//i.test(model.path) ? model.path : withBase(model.path)
  return {
    ...model,
    path,
    offset: model.offset,
    tips: model.tips
  }
}

function normalizeOptions(options: Oml2dOptions): WidgetOptions | undefined {
  const { models, mobileDisplay, mobileSize, ...widgetOptions } = options

  warnLegacyOptions(options)

  const isMobile = window.matchMedia('(max-width: 768px)').matches

  if (mobileDisplay === false && isMobile) {
    return
  }

  const model = widgetOptions.model ?? models
  if (!model) {
    return
  }

  return {
    ...defaultOptions,
    ...widgetOptions,
    ...(isMobile && mobileSize ? { size: mobileSize } : {}),
    model: Array.isArray(model)
      ? model.map(normalizeModel)
      : normalizeModel(model as LegacyModelOptions)
  }
}

export function useOml2d() {
  const oml2dOptions = useOml2dOptions()
  let widget: Widget | undefined
  let loadTimeoutTimer: ReturnType<typeof setTimeout> | undefined

  const init = async () => {
    if (!oml2dOptions.value || widget) {
      return
    }

    const options = normalizeOptions(oml2dOptions.value as Oml2dOptions)
    if (options) {
      const { createWidget } = await import('l2d-widget')
      widget = createWidget(options)

      let loaded = false
      widget.l2d.on('loaded', () => {
        loaded = true
        if (loadTimeoutTimer) {
          clearTimeout(loadTimeoutTimer)
          loadTimeoutTimer = undefined
        }
      })

      // 10秒超时防卡死：若因极端网络原因加载超时，自动收起“正在加载”状态条，避免用户页面卡住
      loadTimeoutTimer = setTimeout(() => {
        if (!loaded) {
          console.warn('[sugarat-theme] 看板娘资源加载超时，自动收起加载提示')
          const spans = document.querySelectorAll('span')
          spans.forEach((span) => {
            if (span.textContent?.trim() === '正在加载' && span.parentElement) {
              const bar = span.parentElement
              const isRight = bar.style.right !== '' && bar.style.right !== 'auto'
              bar.style.transform = isRight ? 'translateY(50%) translateX(100%)' : 'translateY(50%) translateX(-100%)'
            }
          })
        }
      }, 10000)
    }
  }

  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    if (loadTimeoutTimer) {
      clearTimeout(loadTimeoutTimer)
    }
    widget?.destroy()
  })
}
