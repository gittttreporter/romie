<template>
  <!-- <div class="empty-state">
    <div class="emoji">🎮</div>
    <h2>No ROMs yet</h2>
    <p>Your library is empty. Start building your collection by importing your first ROM.</p>
    <button class="primary-button" @click="triggerImport">
      + Import ROMs
    </button>
  </div> -->
  <RomListItem
    name="Metroid Fusion"
    console="GBA"
    region="USA"
    size="3.2 MB"
    dateAdded="2025-06-17T14:12:00Z"
  />

  <RomListItem
    name="Final Fantasy VI"
    console="SNES"
    region="JPN"
    size="2.4 MB"
    dateAdded="2025-06-15T10:05:00Z"
  />

  <RomListItem
    name="Castlevania: Symphony of the Night"
    console="PSX"
    region="USA"
    size="657 MB"
    dateAdded="2025-06-14T21:37:00Z"
  />

  <RomListItem
    name="Tetris"
    console="GB"
    region="EUR"
    size="32 KB"
    dateAdded="2025-06-13T08:17:00Z"
  />

  <RomListItem
    name="Pokémon Red"
    console="GB"
    region="JPN"
    size="512 KB"
    dateAdded="2025-06-12T17:02:00Z"
  />

  <RomListItem
    name="The Legend of Zelda: A Link to the Past"
    console="SNES"
    region="USA"
    size="1.1 MB"
    dateAdded="2025-06-11T12:45:00Z"
  />

  <RomListItem
    name="Golden Sun"
    console="GBA"
    region="USA"
    size="8.2 MB"
    dateAdded="2025-06-10T09:30:00Z"
  />

  <RomListItem
    name="Mother 3"
    console="GBA"
    region="JPN (fan translated)"
    size="6.1 MB"
    dateAdded="2025-06-09T13:20:00Z"
  />

  <RomListItem
    name="Super Mario 64"
    console="N64"
    region="USA"
    size="7.9 MB"
    dateAdded="2025-06-08T16:20:00Z"
  />

  <RomListItem
    name="Crash Bandicoot (Demo Disc)"
    console="PSX"
    region="PAL"
    size="230 MB"
    dateAdded="2025-06-07T18:45:00Z"
  />

</template>

<script setup lang="ts">
  import RomListItem from '@/components/RomListItem.vue'
</script>

<style scoped lang="less">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  color: #aaa;

  .emoji {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h2 {
    color: #f2f2f2;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    max-width: 320px;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  // TODO: Duplicated - Create common styles for standard elements.
  .primary-button {
    background-color: #ff2d55;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background-color: #ff3a66;
    }
  }
}
</style>
