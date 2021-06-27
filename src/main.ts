import { ErrorMapper } from "utils/ErrorMapper";

import Spawn from "Spawn"
import Upgrader from "Creepers/Upgrader"
import Constructor from "Creepers/Constructor"
import SpawnTransporter from "Creepers/SpawnTransporter"
import Transporter from "Creepers/Transporter"
import Harvester from "Creepers/Harvester"
import Maintainer from "Creepers/Maintainer"
import Repairer from "Creepers/Repairer"
import Attacker from "Creepers/Attacker"

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const memory = JSON.parse(RawMemory.get())

  if (memory['creeps'] == undefined) { memory['creeps'] = {} }

  // Automatically delete memory of missing creeps
  for (const name in memory['creeps']) {
    if (!Game.creeps[name]) {
      delete memory['creeps'][name]
    }
  }

  // Create and renew creeps
  for (const name in Game.spawns) {
    let spawn = new Spawn(memory, Game.spawns[name])
    spawn.createCreep()
    spawn.renewCreeps()
  }

  // Create and run creep instances
  for (const name in Game.creeps) {
    let creep
    let creepMemory = memory['creeps'][name]
    switch (creepMemory?.role) {
      case 'harvester': { creep = new Harvester(memory, Game.creeps[name]); break }
      case 'spawnTransporter': { creep = new SpawnTransporter(memory, Game.creeps[name]); break }
      case 'transporter': { creep = new Transporter(memory, Game.creeps[name]); break }
      case 'upgrader': { creep = new Upgrader(memory, Game.creeps[name]); break }
      case 'constructor': { creep = new Constructor(memory, Game.creeps[name]); break }
      case 'repairer': { creep = new Repairer(memory, Game.creeps[name]); break }
      case 'maintainer': { creep = new Maintainer(memory, Game.creeps[name]); break }
      case 'attacker': { creep = new Attacker(memory, Game.creeps[name]); break }
    }
    if (creep) { creep.run() }
  }

  // Run room functions
  for (const name in Game.rooms) {
    let room = Game.rooms[name]
    
    let towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })
    _.each(towers, (tower: StructureTower) => {
      let enemies = room.find(FIND_HOSTILE_CREEPS)
      if (enemies.length > 0) {
        tower.attack(enemies[0])
      }
    })

    let source_links = _.filter(room.find(FIND_SOURCES), source => {
      let link = source.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
      return (link ? source.pos.inRangeTo(link, 2) : false)
    })
    let storage = room.controller && room.controller.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })
    if (storage) {
      let storage_link = storage.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
      if (storage_link && storage.pos.inRangeTo(storage_link, 2)) {
        _.each(source_links, source => {
          let link:any = source.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
          if (link && link.store[RESOURCE_ENERGY] / link.store.getCapacity(RESOURCE_ENERGY) >= 0.25) {
            link.transferEnergy(storage_link)
          }
        })
      }
    }
  }

  RawMemory.set(JSON.stringify(memory))
});
