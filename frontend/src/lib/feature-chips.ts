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
        'bg-amber-50/70 dark:bg-amber-950/15 border-amber-200/40 dark:border-amber-800/30 text-amber-600 dark:text-amber-600',
      icon: 'text-amber-500 dark:text-amber-500',
      label: 'text-amber-700 dark:text-amber-400'
    }
  },
  {
    id: 'forest-breeze',
    label: '森林微风',
    classes: {
      container:
        'bg-emerald-50/70 dark:bg-emerald-950/15 border-emerald-200/40 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-600',
      icon: 'text-emerald-500 dark:text-emerald-500',
      label: 'text-emerald-700 dark:text-emerald-400'
    }
  },
  {
    id: 'skyline',
    label: '天际长风',
    classes: {
      container:
        'bg-sky-50/70 dark:bg-sky-950/20 border-sky-200/40 dark:border-sky-800/30 text-sky-600 dark:text-sky-600',
      icon: 'text-sky-500 dark:text-sky-500',
      label: 'text-sky-700 dark:text-sky-400'
    }
  },
  {
    id: 'violet-dream',
    label: '紫罗云梦',
    classes: {
      container:
        'bg-violet-50/70 dark:bg-violet-950/20 border-violet-200/40 dark:border-violet-800/30 text-violet-600 dark:text-violet-600',
      icon: 'text-violet-500 dark:text-violet-500',
      label: 'text-violet-700 dark:text-violet-400'
    }
  },
  {
    id: 'rose-quartz',
    label: '玫瑰石英',
    classes: {
      container:
        'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/40 dark:border-rose-800/30 text-rose-600 dark:text-rose-600',
      icon: 'text-rose-500 dark:text-rose-500',
      label: 'text-rose-700 dark:text-rose-400'
    }
  },
  {
    id: 'midnight',
    label: '午夜星辉',
    classes: {
      container:
        'bg-slate-900/50 dark:bg-slate-900/50 border-slate-700/40 dark:border-slate-700 text-slate-100 dark:text-slate-100',
      icon: 'text-amber-200 dark:text-amber-200',
      label: 'text-slate-100'
    }
  },
  {
    id: 'aurora',
    label: '极光幻彩',
    classes: {
      container:
        'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200/40 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-600',
      icon: 'text-indigo-400 dark:text-indigo-500',
      label: 'text-indigo-700 dark:text-indigo-400'
    }
  },
  {
    id: 'citrus-spark',
    label: '青柠火花',
    classes: {
      container:
        'bg-lime-50/70 dark:bg-lime-950/20 border-lime-200/40 dark:border-lime-800/30 text-lime-600 dark:text-lime-600',
      icon: 'text-lime-500 dark:text-lime-500',
      label: 'text-lime-700 dark:text-lime-400'
    }
  },
  {
    id: 'lavender-mist',
    label: '薰衣草雾',
    classes: {
      container:
        'bg-fuchsia-50/70 dark:bg-fuchsia-950/20 border-fuchsia-200/40 dark:border-fuchsia-800/30 text-fuchsia-600 dark:text-fuchsia-600',
      icon: 'text-purple-400 dark:text-purple-500',
      label: 'text-fuchsia-700 dark:text-fuchsia-400'
    }
  },
  {
    id: 'ember',
    label: '余烬流火',
    classes: {
      container:
        'bg-orange-50/70 dark:bg-orange-950/20 border-orange-200/40 dark:border-orange-800/30 text-orange-600 dark:text-orange-600',
      icon: 'text-orange-500 dark:text-orange-500',
      label: 'text-orange-700 dark:text-orange-400'
    }
  },
  {
    id: 'azure-wave',
    label: '蔚蓝浪潮',
    classes: {
      container:
        'bg-cyan-50/70 dark:bg-cyan-950/20 border-cyan-200/40 dark:border-cyan-800/30 text-cyan-600 dark:text-cyan-600',
      icon: 'text-cyan-500 dark:text-cyan-500',
      label: 'text-cyan-700 dark:text-cyan-400'
    }
  },
  {
    id: 'slate-focus',
    label: '钴石沉静',
    classes: {
      container:
        'bg-slate-100/70 dark:bg-slate-900/25 border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-600',
      icon: 'text-slate-500 dark:text-slate-250',
      label: 'text-slate-700 dark:text-slate-400'
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
  'bg-amber-50/70 dark:bg-amber-950/15 border-amber-200/40 dark:border-amber-800/30 text-amber-600 dark:text-amber-200'
const DEFAULT_ICON_CLASS = 'text-amber-500 dark:text-amber-200'
const DEFAULT_LABEL_CLASS = 'text-amber-700 dark:text-amber-100'

const LEGACY_FALLBACK_CONTAINER =
  'bg-yellow-50/70 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-200'
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
