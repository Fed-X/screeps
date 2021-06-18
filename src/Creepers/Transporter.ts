import Creeper from "../Creeper"

export default class Transporter extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          const target = _.max(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }), (container:any) => container.store[RESOURCE_ENERGY])
          creepMemory.target = target.id
        }

        let target:any = Game.getObjectById(creepMemory.target)
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
          creepMemory.task = 'transporting'
          creepMemory.target = undefined
        }
        break
      }

      // Transport energy to needed structures
      case 'transporting': {
        if (!creepMemory.target) {
          let extensions = _.filter(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let spawns = _.filter(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          if (extensions.length > 0) {
            creepMemory.target = extensions[0].id
          } else if (spawns.length > 0) {
            creepMemory.target = spawns[0].id
          }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (target.energy == target.energyCapacity) { creepMemory.target = undefined }
          if (creep.carry[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        }
        break
      }
    }
  }
}
