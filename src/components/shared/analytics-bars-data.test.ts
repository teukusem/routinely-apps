import { mapBarsToFillPercentages } from './analytics-bars-data';

describe('analytics bars data', () => {
  it('renders bar heights from the supplied prop', () => {
    const bars = [
      { label: 'Mon', value: 0.82 },
      { label: 'Tue', value: 0.5 },
    ];

    expect(mapBarsToFillPercentages(bars)).toEqual(['82%', '50%']);
  });
});
