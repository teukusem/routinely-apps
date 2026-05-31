import { StyleSheet, View } from 'react-native';

import { DatePill } from '../DatePill';
import { spacing } from '../../theme/spacing';
import type { DatePillOption, LocalDate } from '../../types/routinely';

type DateSelectorProps = {
  datePills: DatePillOption[];
  onSelectDate: (localDate: LocalDate) => void;
  selectedDate: LocalDate;
};

export function DateSelector({ datePills, onSelectDate, selectedDate }: DateSelectorProps) {
  return (
    <View style={styles.dateSelector}>
      {datePills.map((datePill) => (
        <DatePill
          key={datePill.isoDate}
          active={selectedDate === datePill.isoDate}
          label={datePill.label}
          onPress={() => onSelectDate(datePill.isoDate)}
          value={datePill.value}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dateSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
