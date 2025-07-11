const testRomFilenames = [
  "The Legend of Zelda - A Link to the Past (USA).sfc",
  "The Legend of Zelda - A Link to the Past (EUR) [b1].sfc",
  "Super Mario World (USA) [!].sfc",
  "Super Mario World (Japan) [T+Eng1.0].sfc",
  "Super Mario World 2 - Yoshi's Island (USA) (Rev 1).sfc",

  "Chrono Trigger (USA).sfc",
  "Chrono_Trigger_(U)_[!].sfc",
  "Chrono Trigger (Beta) (J).sfc",

  "Pokémon - Emerald Version (USA).gba",
  "Pokemon_Emerald_(U)_[f1].gba",
  "Pokémon - Fire Red Version (Europe).gba",
  "Pokémon - Fire Red Version (USA) [Hack by Someone v1.2].gba",
  "Pokémon - Crystal Version (USA, Europe).gbc",

  "Final Fantasy VII (USA) (Disc 1).bin",
  "Final Fantasy VII (USA) (Disc 1).cue",
  "Final Fantasy VII (USA) (Disc 2).bin",
  "Final Fantasy VII (USA) (Disc 2).cue",

  "Castlevania - Symphony of the Night (USA).bin",
  "Castlevania - Symphony of the Night (JPN).cue",

  "Donkey Kong Country 2 - Diddy's Kong Quest (USA).sfc",
  "Donkey_Kong_Country_2-Diddys_Kong_Quest_(E)_[h1C].sfc",

  "EarthBound (USA).sfc",
  "EarthBound (USA) [Hack by Tomato v1.2b].sfc",

  "Super Metroid (USA) [T+Spa1.1].sfc",
  "Super Metroid (USA) [T+Fre].sfc",

  "Super Mario Bros. (World).nes",
  "Super_Mario_Bros_(E)_[!].nes",

  "GoldenEye 007 (USA).z64",
  "The Legend of Zelda - Ocarina of Time (USA).n64",
  "The Legend of Zelda - Ocarina of Time (Europe) (Rev A).z64",

  "Metal Gear Solid (USA) (Disc 1).bin",
  "Metal Gear Solid (USA) (Disc 2).bin",

  "Mega Man X3 (USA).sfc",
  "Mega_Man_X3_(U)_[!].sfc",

  "Kirby's Dream Land (USA).gb",
  "Kirby - Nightmare in Dream Land (USA).gba",
  "Kirby (Japan) [En by Aeon Genesis v1.1].gb",

  "Dragon Quest III (JPN) [T+Eng v2.0].gbc"
]

const expectedCleanFilenames = [
  "The Legend of Zelda - A Link to the Past (USA).sfc",
  "The Legend of Zelda - A Link to the Past (EUR).sfc",
  "Super Mario World (USA).sfc",
  "Super Mario World (Japan).sfc",
  "Super Mario World 2 - Yoshi's Island (USA).sfc",

  "Chrono Trigger (USA).sfc",
  "Chrono Trigger (USA).sfc",
  "Chrono Trigger (Beta) (J).sfc",

  "Pokémon - Emerald Version (USA).gba",
  "Pokemon Emerald (USA).gba",
  "Pokémon - Fire Red Version (Europe).gba",
  "Pokémon - Fire Red Version (USA).gba",
  "Pokémon - Crystal Version (USA, Europe).gbc",

  "Final Fantasy VII (USA) (Disc 1).bin",
  "Final Fantasy VII (USA) (Disc 1).cue",
  "Final Fantasy VII (USA) (Disc 2).bin",
  "Final Fantasy VII (USA) (Disc 2).cue",

  "Castlevania - Symphony of the Night (USA).bin",
  "Castlevania - Symphony of the Night (JPN).cue",

  "Donkey Kong Country 2 - Diddy's Kong Quest (USA).sfc",
  "Donkey Kong Country 2 - Diddys Kong Quest (E).sfc",

  "EarthBound (USA).sfc",
  "EarthBound (USA).sfc",

  "Super Metroid (USA).sfc",
  "Super Metroid (USA).sfc",

  "Super Mario Bros. (World).nes",
  "Super Mario Bros. (E).nes",

  "GoldenEye 007 (USA).z64",
  "The Legend of Zelda - Ocarina of Time (USA).n64",
  "The Legend of Zelda - Ocarina of Time (Europe).z64",

  "Metal Gear Solid (USA) (Disc 1).bin",
  "Metal Gear Solid (USA) (Disc 2).bin",

  "Mega Man X3 (USA).sfc",
  "Mega Man X3 (USA).sfc",

  "Kirby's Dream Land (USA).gb",
  "Kirby - Nightmare in Dream Land (USA).gba",
  "Kirby (Japan).gb",

  "Dragon Quest III (JPN).gbc"
]
