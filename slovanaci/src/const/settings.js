export const SettingTypes = Object.freeze({
  Text: 0,
  Bool: 1,
  Int: 2,
  Enum: 3,
  Number: 4,
});

export const SettingIds = Object.freeze({ MostFrequentGames: 1 });

export const gameTypeOptions = [
  { value: 'all', label: 'Vše' },
  { value: 'small', label: 'Turnájky' },
  { value: 'big', label: 'Zápasy' },
];

export const settingDefinitions = {
  [SettingIds.MostFrequentGames]: {
    options: gameTypeOptions.map((option, index) => ({ value: String(index), label: option.label })),
    defaultValue: '2',
  },
};

export const getDefaultGameType = (settings) => {
  const setting = settings.find(item => item.id === SettingIds.MostFrequentGames);
  const value = setting?.Value ?? settingDefinitions[SettingIds.MostFrequentGames].defaultValue;
  return gameTypeOptions.find((option, index) => String(index) === value)?.value ?? 'big';
};

export const serializeSettingValue = (setting, value) => {
  switch (setting.Type) {
    case SettingTypes.Text:
      return String(value);
    case SettingTypes.Bool:
      if (value !== true && value !== false && value !== 'true' && value !== 'false') {
        throw new Error('Neplatná logická hodnota.');
      }
      return String(value);
    case SettingTypes.Int:
    case SettingTypes.Number: {
      const number = Number(value);
      if (String(value).trim() === '' || !Number.isFinite(number) ||
          (setting.Type === SettingTypes.Int && !Number.isSafeInteger(number))) {
        throw new Error('Neplatná číselná hodnota.');
      }
      return String(number);
    }
    case SettingTypes.Enum:
      if (!settingDefinitions[setting.id]?.options.some(option => option.value === String(value))) {
        throw new Error('Neplatná hodnota výběru.');
      }
      return String(value);
    default:
      throw new Error('Nepodporovaný typ nastavení.');
  }
};