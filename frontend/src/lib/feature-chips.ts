import { cn } from '@/lib/utils'

export type FeatureChipPresetId =
  | 'golden-glow'
  | 'forest-breeze'
  | 'skyline'
  | 'violet-dream'
  | 'rose-quartz'
  | 'midnight'
  | 'aurora'
  | 'citrus-spark'
  | 'lavender-mist'
  | 'ember'
  | 'azure-wave'
  | 'slate-focus'

export interface FeatureChipAppearance {
  presetId?: FeatureChipPresetId | string
  containerClassName?: string
  iconClassName?: string
  labelClassName?: string
  className?: string
  iconClass?: string
  labelClass?: string
  textClassName?: string
}

export interface FeatureChipPreset {
  id: FeatureChipPresetId
  label: string
  description?: string
  classes: {
    container: string
    icon: string
    label?: string
  }
}

interface FeatureChipVisualSource {
  color?: string
  appearance?: FeatureChipAppearance
}

interface FeatureChipVisuals {
  containerClass: string
  iconClass: string
  labelClass: string
}

const FEATURE_CHIP_PRESETS: FeatureChipPreset[] = [
  {
    id: 'golden-glow',
    label: '琥珀晨光',
    classes: {
      container:
        'bg-gradient-to-r from-amber-50/90 to-orange-50/70 dark:from-amber-950/25 dark:to-orange-900/20 border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-200',
      icon: 'text-amber-500 dark:text-amber-300',
      label: 'text-amber-800 dark:text-amber-100'
    }
  },
  {
    id: 'forest-breeze',
    label: '森林微风',
    classes: {
      container:
        'bg-gradient-to-r from-emerald-50/90 to-teal-50/70 dark:from-emerald-950/25 dark:to-teal-900/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-200',
      icon: 'text-emerald-500 dark:text-emerald-300',
      label: 'text-emerald-800 dark:text-emerald-100'
    }
  },
  {
    id: 'skyline',
    label: '天际长风',
    classes: {
      container:
        'bg-gradient-to-r from-sky-50/90 to-blue-50/70 dark:from-sky-950/25 dark:to-blue-900/20 border-sky-200/60 dark:border-sky-800/40 text-sky-700 dark:text-sky-200',
      icon: 'text-sky-500 dark:text-sky-300',
      label: 'text-sky-800 dark:text-sky-100'
    }
  },
  {
    id: 'violet-dream',
    label: '紫罗云梦',
    classes: {
      container:
        'bg-gradient-to-r from-violet-50/90 to-purple-50/70 dark:from-violet-950/25 dark:to-purple-900/20 border-violet-200/60 dark:border-violet-800/40 text-violet-700 dark:text-violet-200',
      icon: 'text-violet-500 dark:text-violet-300',
      label: 'text-violet-800 dark:text-violet-100'
    }
  },
  {
    id: 'rose-quartz',
    label: '玫瑰石英',
    classes: {
      container:
        'bg-gradient-to-r from-rose-50/90 to-pink-50/70 dark:from-rose-950/25 dark:to-pink-900/20 border-rose-200/60 dark:border-rose-800/40 text-rose-700 dark:text-rose-200',
      icon: 'text-rose-500 dark:text-rose-300',
      label: 'text-rose-800 dark:text-rose-100'
    }
  },
  {
    id: 'midnight',
    label: '午夜星辉',
    classes: {
      container:
        'bg-slate-900/70 dark:bg-slate-900/60 border-slate-700/70 dark:border-slate-700 text-slate-100 dark:text-slate-100',
      icon: 'text-amber-300 dark:text-amber-200',
      label: 'text-slate-100'
    }
  },
  {
    id: 'aurora',
    label: '极光幻彩',
    classes: {
      container:
        'bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-emerald-50/60 dark:from-indigo-950/30 dark:via-sky-900/20 dark:to-emerald-900/20 border-indigo-200/60 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-200',
      icon: 'text-sky-500 dark:text-sky-300',
      label: 'text-indigo-800 dark:text-indigo-100'
    }
  },
  {
    id: 'citrus-spark',
    label: '青柠火花',
    classes: {
      container:
        'bg-gradient-to-r from-lime-50/90 to-yellow-50/70 dark:from-lime-950/25 dark:to-yellow-900/20 border-lime-200/60 dark:border-lime-800/40 text-lime-700 dark:text-lime-200',
      icon: 'text-lime-500 dark:text-lime-300',
      label: 'text-lime-800 dark:text-lime-100'
    }
  },
  {
    id: 'lavender-mist',
    label: '薰衣草雾',
    classes: {
      container:
        'bg-gradient-to-r from-fuchsia-50/85 to-purple-50/70 dark:from-fuchsia-950/25 dark:to-purple-900/20 border-fuchsia-200/60 dark:border-fuchsia-800/40 text-fuchsia-700 dark:text-fuchsia-200',
      icon: 'text-purple-500 dark:text-purple-300',
      label: 'text-fuchsia-800 dark:text-fuchsia-100'
    }
  },
  {
    id: 'ember',
    label: '余烬流火',
    classes: {
      container:
        'bg-gradient-to-r from-orange-100/80 to-red-100/70 dark:from-orange-950/30 dark:to-red-900/20 border-orange-200/60 dark:border-orange-800/40 text-orange-700 dark:text-orange-200',
      icon: 'text-orange-500 dark:text-orange-300',
      label: 'text-orange-800 dark:text-orange-100'
    }
  },
  {
    id: 'azure-wave',
    label: '蔚蓝浪潮',
    classes: {
      container:
        'bg-gradient-to-r from-cyan-50/90 to-blue-50/70 dark:from-cyan-950/25 dark:to-blue-900/20 border-cyan-200/60 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-200',
      icon: 'text-cyan-500 dark:text-cyan-300',
      label: 'text-cyan-800 dark:text-cyan-100'
    }
  },
  {
    id: 'slate-focus',
    label: '钴石沉静',
    classes: {
      container:
        'bg-gradient-to-r from-slate-100/80 to-zinc-100/70 dark:from-slate-900/40 dark:to-zinc-900/30 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200',
      icon: 'text-slate-500 dark:text-slate-300',
      label: 'text-slate-800 dark:text-slate-100'
    }
  }
]

export const FEATURE_CHIP_PRESET_MAP = FEATURE_CHIP_PRESETS.reduce<Record<string, FeatureChipPreset>>(
  (acc, preset) => {
    acc[preset.id] = preset
    return acc
  },
  {}
)

export const FEATURE_CHIP_PRESET_LIST = FEATURE_CHIP_PRESETS

export const DEFAULT_FEATURE_CHIP_PRESET_ID: FeatureChipPresetId = FEATURE_CHIP_PRESETS[0].id

const DEFAULT_CONTAINER_CLASS =
  'bg-gradient-to-r from-amber-50/90 to-orange-50/70 dark:from-amber-950/25 dark:to-orange-900/20 border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-200'
const DEFAULT_ICON_CLASS = 'text-amber-500 dark:text-amber-300'
const DEFAULT_LABEL_CLASS = 'text-amber-800 dark:text-amber-100'

const LEGACY_FALLBACK_CONTAINER =
  'bg-yellow-50/80 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-200'
const LEGACY_FALLBACK_ICON = 'text-yellow-600 dark:text-yellow-400'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const collectStrings = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  const values = keys
    .map((key) => {
      const raw = record[key]
      if (typeof raw !== 'string') return undefined
      const trimmed = raw.trim()
      return trimmed.length > 0 ? trimmed : undefined
    })
    .filter((item): item is string => Boolean(item))

  if (values.length === 0) return undefined
  return values.join(' ')
}

export const parseFeatureChipAppearance = (source: unknown): FeatureChipAppearance | undefined => {
  if (!isRecord(source)) return undefined

  const presetId = collectStrings(source, ['presetId', 'preset', 'theme', 'variant'])

  const containerClassName = collectStrings(source, [
    'containerClassName',
    'containerClass',
    'className',
    'backgroundClass',
    'borderClass',
    'textClass',
    'baseClass',
    'container'
  ])

  const iconClassName = collectStrings(source, ['iconClassName', 'iconClass', 'iconColorClass', 'iconColor'])
  const labelClassName = collectStrings(source, ['labelClassName', 'labelClass', 'textClassName', 'textClass'])

  if (!presetId && !containerClassName && !iconClassName && !labelClassName) {
    return undefined
  }

  return {
    presetId,
    containerClassName,
    iconClassName,
    labelClassName
  }
}

const computeLegacyVisuals = (color: string): FeatureChipVisuals => {
  const trimmed = color.trim()
  if (!trimmed) {
    return {
      containerClass: LEGACY_FALLBACK_CONTAINER,
      iconClass: LEGACY_FALLBACK_ICON,
      labelClass: ''
    }
  }

  const classes = trimmed.split(/\s+/).filter(Boolean)
  const hasBackground = classes.some((cls) => cls.startsWith('bg-') || cls.startsWith('bg[') || cls.startsWith('bg-gradient'))
  const hasText = classes.some((cls) => cls.startsWith('text-'))
  const hasBorder = classes.some((cls) => cls.startsWith('border-') || cls.startsWith('border['))

  return {
    containerClass: cn(
      trimmed,
      hasBackground ? '' : LEGACY_FALLBACK_CONTAINER,
      hasText ? '' : hasBackground ? 'text-white' : '',
      hasBorder ? '' : hasBackground ? 'border-transparent' : 'border-yellow-200/50 dark:border-yellow-800/40'
    ),
    iconClass: hasText ? '' : hasBackground ? 'text-white' : LEGACY_FALLBACK_ICON,
    labelClass: ''
  }
}

export const computeFeatureChipVisuals = (chip: FeatureChipVisualSource | undefined): FeatureChipVisuals => {
  if (!chip) {
    return {
      containerClass: DEFAULT_CONTAINER_CLASS,
      iconClass: DEFAULT_ICON_CLASS,
      labelClass: DEFAULT_LABEL_CLASS
    }
  }

  const appearance = chip.appearance
  if (appearance) {
    const presetId = appearance.presetId && appearance.presetId in FEATURE_CHIP_PRESET_MAP
      ? (appearance.presetId as FeatureChipPresetId)
      : undefined
    const preset = presetId ? FEATURE_CHIP_PRESET_MAP[presetId] : undefined

    if (preset) {
      return {
        containerClass: cn(
          preset.classes.container,
          appearance.className,
          appearance.containerClassName
        ),
        iconClass: cn(preset.classes.icon, appearance.iconClassName, appearance.iconClass),
        labelClass: cn(preset.classes.label, appearance.labelClassName, appearance.labelClass, appearance.textClassName)
      }
    }

    const containerClass = cn(appearance.className, appearance.containerClassName)
    const iconClass = cn(appearance.iconClassName, appearance.iconClass)
    const labelClass = cn(appearance.labelClassName, appearance.labelClass, appearance.textClassName)

    if (containerClass || iconClass || labelClass) {
      return {
        containerClass: containerClass || DEFAULT_CONTAINER_CLASS,
        iconClass: iconClass || DEFAULT_ICON_CLASS,
        labelClass: labelClass || DEFAULT_LABEL_CLASS
      }
    }
  }

  if (chip.color) {
    return computeLegacyVisuals(chip.color)
  }

  return {
    containerClass: DEFAULT_CONTAINER_CLASS,
    iconClass: DEFAULT_ICON_CLASS,
    labelClass: DEFAULT_LABEL_CLASS
  }
}

export type { FeatureChipVisuals }
export { FEATURE_CHIP_PRESETS }
