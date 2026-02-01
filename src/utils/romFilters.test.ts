import { describe, it, expect } from 'vitest';
import {
  byQuery,
  bySystems,
  byRegions,
  byAchievements,
  byAvailability,
  combineFilters,
} from './romFilters';
import type { Rom } from '@/types/rom';

const createRom = (overrides: Partial<Rom> = {}): Rom =>
  ({
    id: '1',
    displayName: 'Super Mario Bros',
    system: 'nes',
    region: 'USA',
    verified: true,
    numAchievements: 10,
    filePathExists: true,
    ...overrides,
  }) as Rom;

describe('romFilters', () => {
  describe('byQuery', () => {
    it('matches partial name case-insensitively', () => {
      const rom = createRom({ displayName: 'Super Mario Bros' });
      expect(byQuery('mario')(rom)).toBe(true);
      expect(byQuery('MARIO')(rom)).toBe(true);
      expect(byQuery('super mario')(rom)).toBe(true);
    });

    it('returns true for empty query', () => {
      const rom = createRom();
      expect(byQuery('')(rom)).toBe(true);
    });

    it('returns false when no match', () => {
      const rom = createRom({ displayName: 'Zelda' });
      expect(byQuery('mario')(rom)).toBe(false);
    });
  });

  describe('bySystems', () => {
    it('matches when system is in list', () => {
      const rom = createRom({ system: 'nes' });
      expect(bySystems(['nes', 'snes'])(rom)).toBe(true);
    });

    it('returns false when system not in list', () => {
      const rom = createRom({ system: 'nes' });
      expect(bySystems(['snes', 'gb'])(rom)).toBe(false);
    });

    it('returns true for empty list', () => {
      const rom = createRom();
      expect(bySystems([])(rom)).toBe(true);
    });
  });

  describe('byRegions', () => {
    it('matches when region is in list', () => {
      const rom = createRom({ region: 'USA' });
      expect(byRegions(['USA', 'Europe'])(rom)).toBe(true);
    });

    it('returns false when region not in list', () => {
      const rom = createRom({ region: 'Japan' });
      expect(byRegions(['USA', 'Europe'])(rom)).toBe(false);
    });

    it('returns true for empty list', () => {
      const rom = createRom();
      expect(byRegions([])(rom)).toBe(true);
    });
  });

  describe('byAchievements', () => {
    it('returns true for null filter', () => {
      const rom = createRom();
      expect(byAchievements(null)(rom)).toBe(true);
    });

    it('has-achievements matches ROMs with achievements', () => {
      expect(byAchievements('has-achievements')(createRom({ numAchievements: 10 }))).toBe(true);
      expect(byAchievements('has-achievements')(createRom({ numAchievements: 0 }))).toBe(false);
      expect(byAchievements('has-achievements')(createRom({ numAchievements: undefined }))).toBe(
        false
      );
    });

    it('no-achievements matches verified ROMs without achievements', () => {
      expect(
        byAchievements('no-achievements')(createRom({ verified: true, numAchievements: 0 }))
      ).toBe(true);
      expect(
        byAchievements('no-achievements')(createRom({ verified: false, numAchievements: 0 }))
      ).toBe(false);
      expect(
        byAchievements('no-achievements')(createRom({ verified: true, numAchievements: 5 }))
      ).toBe(false);
    });

    it('unverified matches unverified ROMs', () => {
      expect(byAchievements('unverified')(createRom({ verified: false }))).toBe(true);
      expect(byAchievements('unverified')(createRom({ verified: true }))).toBe(false);
    });
  });

  describe('byAvailability', () => {
    it('returns true for null filter', () => {
      const rom = createRom();
      expect(byAvailability(null)(rom)).toBe(true);
    });

    it('available matches ROMs with existing files', () => {
      expect(byAvailability('available')(createRom({ filePathExists: true }))).toBe(true);
      expect(byAvailability('available')(createRom({ filePathExists: false }))).toBe(false);
    });

    it('unavailable matches ROMs with missing files', () => {
      expect(byAvailability('unavailable')(createRom({ filePathExists: false }))).toBe(true);
      expect(byAvailability('unavailable')(createRom({ filePathExists: true }))).toBe(false);
    });
  });

  describe('combineFilters', () => {
    it('returns true when all predicates pass', () => {
      const rom = createRom({ displayName: 'Mario', system: 'nes' });
      const predicate = combineFilters(byQuery('mario'), bySystems(['nes']));
      expect(predicate(rom)).toBe(true);
    });

    it('returns false when any predicate fails', () => {
      const rom = createRom({ displayName: 'Mario', system: 'nes' });
      const predicate = combineFilters(byQuery('zelda'), bySystems(['nes']));
      expect(predicate(rom)).toBe(false);
    });

    it('short-circuits on first failure', () => {
      let secondCalled = false;
      const alwaysFalse = () => false;
      const tracker = (_rom: Rom) => {
        secondCalled = true;
        return true;
      };

      const predicate = combineFilters(alwaysFalse, tracker);
      predicate(createRom());

      expect(secondCalled).toBe(false);
    });
  });
});
