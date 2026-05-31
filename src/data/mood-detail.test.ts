import {
  buildInitialMoodDetailFixtures,
  getMoodDetailView,
} from '../data/routinely';

describe('mood detail fixtures', () => {
  it('returns fixture copy for the current date', () => {
    const fixtures = buildInitialMoodDetailFixtures('2026-05-31');
    const detail = getMoodDetailView('2026-05-31', fixtures);

    expect(detail.hasFixture).toBe(true);
    expect(detail.summary).toBe('Calm, focused.');
    expect(detail.energyLabel).toBe('7/10');
  });

  it('returns neutral fallback copy for dates without fixtures', () => {
    const fixtures = buildInitialMoodDetailFixtures('2026-05-31');
    const detail = getMoodDetailView('2026-05-30', fixtures);

    expect(detail.hasFixture).toBe(false);
    expect(detail.summary).toBe('No mood details logged for this date yet.');
    expect(detail.energyLabel).toBe('—');
    expect(detail.note).toBe('Add a mood score to capture how this day felt.');
  });

  it('does not ask for a mood score after a score was logged', () => {
    const fixtures = buildInitialMoodDetailFixtures('2026-05-31');
    const detail = getMoodDetailView('2026-05-30', fixtures, 3);

    expect(detail.hasFixture).toBe(false);
    expect(detail.summary).toBe('Mood score 3/5 logged. No extra details added yet.');
    expect(detail.note).toBe('Add an optional note when you want more context for this day.');
  });
});
