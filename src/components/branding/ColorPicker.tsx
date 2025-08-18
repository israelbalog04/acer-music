'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { COLOR_PRESETS, ColorPalette } from '@/types/branding';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  disabled?: boolean;
  description?: string;
}

export function ColorPicker({ 
  label, 
  value, 
  onChange, 
  presets, 
  disabled = false,
  description 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Synchroniser avec la valeur externe
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fermer le picker quand on clique dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidHexColor(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorChange = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const defaultPresets = presets || COLOR_PRESETS.modern;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Aperçu de couleur cliquable */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: value }}
          title={`Cliquer pour modifier ${label}`}
        />
        
        {/* Input texte pour hex */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 font-mono"
        />
      </div>

      {/* Presets de couleurs */}
      {defaultPresets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 w-full">Couleurs prédéfinies:</span>
          {defaultPresets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && handleColorChange(preset)}
              disabled={disabled}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform disabled:opacity-50"
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>
      )}

      {/* Color picker popup */}
      {isOpen && !disabled && (
        <div ref={pickerRef} className="relative">
          <div className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <HexColorPicker 
              color={value} 
              onChange={handleColorChange}
            />
            
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600 font-mono">{value}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Validation des couleurs hex
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Composant pour les palettes de couleurs complètes
interface ColorPaletteEditorProps {
  colors: ColorPalette;
  onChange: (colors: Record<string, string>) => void;
  disabled?: boolean;
}

export function ColorPaletteEditor({ colors, onChange, disabled }: ColorPaletteEditorProps) {
  const colorDefinitions = [
    { key: 'primary', label: 'Couleur Primaire', description: 'Couleur principale de votre marque' },
    { key: 'secondary', label: 'Couleur Secondaire', description: 'Couleur d\'accent' },
    { key: 'accent', label: 'Couleur d\'Accent', description: 'Pour les éléments d\'action' },
    { key: 'background', label: 'Arrière-plan', description: 'Couleur de fond principale' },
    { key: 'surface', label: 'Surface', description: 'Couleur des cartes et panneaux' },
    { key: 'text', label: 'Texte Principal', description: 'Couleur du texte principal' },
    { key: 'textSecondary', label: 'Texte Secondaire', description: 'Couleur du texte secondaire' },
    { key: 'success', label: 'Succès', description: 'Couleur pour les messages de succès' },
    { key: 'warning', label: 'Attention', description: 'Couleur pour les avertissements' },
    { key: 'error', label: 'Erreur', description: 'Couleur pour les erreurs' },
    { key: 'info', label: 'Information', description: 'Couleur pour les informations' }
  ];

  const handleColorChange = (key: string, color: string) => {
    const newColors: Record<string, string> = {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      text: colors.text,
      textSecondary: colors.textSecondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
      [key]: color
    };
    onChange(newColors);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {colorDefinitions.map(({ key, label, description }) => (
          <ColorPicker
            key={key}
            label={label}
            value={typeof colors[key] === 'string' ? colors[key] : '#000000'}
            onChange={(color) => handleColorChange(key, color)}
            disabled={disabled}
            description={description}
          />
        ))}
      </div>
      
      {/* Aperçu de la palette */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu de la palette</h4>
        <div className="grid grid-cols-6 gap-2">
          {colorDefinitions.slice(0, 6).map(({ key, label }) => (
            <div key={key} className="text-center">
              <div 
                className="w-full h-12 rounded-md border border-gray-200 mb-1"
                style={{ backgroundColor: typeof colors[key] === 'string' ? colors[key] : '#000000' }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}