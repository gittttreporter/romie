import { expect, test, describe } from 'vitest';
import { cleanDisplayName, extractRegionFromFilename } from './romUtils';

describe('extractRegionFromFilename', () => {
  [
    ['Chrono Trigger (USA).sfc', 'USA'],
    ['Super Mario World (Japan) [T+Eng1.0].sfc', 'Japan'],
    ['Pokemon_Emerald_(U)_[f1].gba', 'USA'],
    ['GoldenEye 007 (USA, Europe).z64', 'USA'],
  ].forEach(([filename, expected]) => {
    test(`returns ${expected} when given ${filename}`, () => {
      expect(extractRegionFromFilename(filename)).to.equal(expected);
    });
  });
});

describe('extractRegionFromFilename - false positive prevention', () => {
  [
    // Should NOT match region codes within the ROM name
    ['arkretrn.zip', 'Unknown'], // has "kr" but no tag
    ['btlkroad.zip', 'Unknown'], // has "kr" but no tag
    ['buckrog.zip', 'Unknown'], // has "kr" but no tag
    ['earthjkr.zip', 'Unknown'], // has "kr" but no tag

    // SHOULD match when in proper tags
    ['Super Mario Bros (Korea).nes', 'Korea'],
    ['Sonic [KR].md', 'Korea'],
    ['Game (USA, Korea).rom', 'USA'], // Priority: USA first

    // European countries
    ['FIFA 98 (Sweden).iso', 'Europe'],
    ['Rally (Norway).bin', 'Europe'],
    ['Adventure (Netherlands).rom', 'Europe'],
    ['Racing Game (Denmark).rom', 'Europe'],
    ['Football (Portugal).iso', 'Europe'],
    ['Puzzle Game (Poland).rom', 'Europe'],
    ['Strategy (Finland).rom', 'Europe'],

    // Translation tags with region codes should be ignored
    ['Shadowgate (U) [!] [T-BR] [T-Zafarion G-Nenhum] [A-2015].nes', 'USA'], // USA ROM, ignore BR translation
    ['Game [T-BR].rom', 'Unknown'], // Only translation tag, no actual region
    ['Final Fantasy (J) [T-Eng].nes', 'Japan'], // Japan ROM, ignore translation
    ['Castlevania [T-FR] [T-Spanish].nes', 'Unknown'], // Only translations, no region

    // Language tags should not be detected as regions
    ['Batman - The Video Game (PT-BR).zip', 'Unknown'], // Portuguese-Brazilian is language, not region
    ['Battle City (PT-BR).zip', 'Unknown'], // Language tag only
    ['Battletoads (PT-BR).zip', 'Unknown'], // Language tag only
    ['Game (EN-US).rom', 'Unknown'], // English-US is language, not region
  ].forEach(([filename, expected]) => {
    test(`returns ${expected} when given ${filename}`, () => {
      expect(extractRegionFromFilename(filename)).to.equal(expected);
    });
  });
});

describe('cleanDisplayName', () => {
  [
    // Basic cleaning
    ['Super Mario Bros (USA).nes', 'Super Mario Bros'],
    ['Sonic_the_Hedgehog_2_(World).md', 'Sonic The Hedgehog 2'],
    ['Final Fantasy VII (USA) (Disc 1).pbp', 'Final Fantasy Vii'],

    // Complex titles with punctuation
    [
      'Legend of Zelda, The - Ocarina of Time (USA) (v1.2).n64',
      'Legend Of Zelda, The Ocarina Of Time',
    ],
    ['Street Fighter II - Champion Edition (USA).gen', 'Street Fighter Ii Champion Edition'],

    // Case variations
    ['CONTRA (USA).nes', 'Contra'],
    ['super metroid (USA).smc', 'Super Metroid'],
    ['CaStLeVaNiA (USA).nes', 'Castlevania'],

    // Different bracket types
    ['Tetris (World) [!].gb', 'Tetris'],
    ['Mega Man X [h1].smc', 'Mega Man X'],
    ['Donkey Kong Country [T+Fre].smc', 'Donkey Kong Country'],

    // Multiple separators
    ['street-fighter-alpha-3 (USA).cps2', 'Street Fighter Alpha 3'],
    ['double_dragon__ii (USA).nes', 'Double Dragon Ii'],

    // Edge cases
    ['Metal Gear Solid (USA) (Disc 1) (v1.1).bin', 'Metal Gear Solid'],
    ['F-Zero - Maximum Velocity (USA).gba', 'F Zero Maximum Velocity'],
    ['Pac-Man (USA).nes', 'Pac Man'],

    // Multi-disc games
    ['Final Fantasy VIII (USA) (Disc 2).bin', 'Final Fantasy Viii'],
    ['Xenogears (USA) (Disc 1).bin', 'Xenogears'],

    // Special characters and numbers
    ['R-Type III - The Third Lightning (USA).smc', 'R Type Iii The Third Lightning'],
    ['007 - GoldenEye (USA).n64', '007 Goldeneye'],
  ].forEach(([filename, expected]) => {
    test(`returns ${expected} when given ${filename}`, () => {
      expect(cleanDisplayName(filename)).to.equal(expected);
    });
  });
});
