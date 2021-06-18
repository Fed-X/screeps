import { ErrorMapper } from "utils/ErrorMapper";

import Spawn from "Spawn"
import Upgrader from "Creepers/Upgrader"
import Constructor from "Creepers/Constructor"
import Transporter from "Creepers/Transporter"
import Repairer from "Creepers/Repairer"
import Harvester from "Creepers/Harvester"

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

  for(const name in Game.spawns) {
    let spawn = new Spawn(memory, Game.spawns[name])
    spawn.createCreep()
  }

  for (const name in Game.creeps) {
    let creep
    let creepMemory = memory['creeps'][name]
    switch (creepMemory['role']) {
      case 'harvester': { creep = new Harvester(memory, Game.creeps[name]); break }
      case 'transporter': { creep = new Transporter(memory, Game.creeps[name]); break }
      case 'upgrader': { creep = new Upgrader(memory, Game.creeps[name]); break }
      case 'constructor': { creep = new Constructor(memory, Game.creeps[name]); break }
      case 'repairer': { creep = new Repairer(memory, Game.creeps[name]); break }
    }
    if (creep) { creep.run() }
  }

  RawMemory.set(JSON.stringify(memory))
});
