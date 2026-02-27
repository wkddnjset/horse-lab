'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Trash2 } from 'lucide-react'
import type { StrategyWeights } from '@/types/strategy'
import { savePreset, deletePreset } from '@/actions/pick'
import { MAX_PRESETS } from '@/lib/constants'

interface Preset {
  id: string
  name: string
  weights: StrategyWeights
}

interface PresetSelectorProps {
  presets: Preset[]
  onSelect: (weights: StrategyWeights) => void
  currentWeights: StrategyWeights
}

export function PresetSelector({ presets, onSelect, currentWeights }: PresetSelectorProps) {
  const [items, setItems] = useState(presets)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (items.length >= MAX_PRESETS) return
    setSaving(true)
    const name = `프리셋 ${items.length + 1}`
    const result = await savePreset(name, currentWeights)
    if (result) {
      setItems([...items, { id: result.id, name: result.name, weights: result.weights as StrategyWeights }])
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await deletePreset(id)
    setItems(items.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-body font-medium text-foreground">프리셋</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={saving || items.length >= MAX_PRESETS}
          className="gap-1 text-caption"
        >
          <Save className="h-3.5 w-3.5" />
          저장 ({items.length}/{MAX_PRESETS})
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-caption text-muted-foreground">저장된 프리셋이 없습니다</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((preset) => (
            <div key={preset.id} className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(preset.weights)}
                className="text-caption"
              >
                {preset.name}
              </Button>
              <button
                onClick={() => handleDelete(preset.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
