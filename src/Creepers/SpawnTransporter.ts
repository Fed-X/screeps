import Creeper from "../Creeper"

export default class SpawnTransporter extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    // @ts-ignore
    if (creep.ticksToLive < 100) {
      creepMemory.task = 'renewing'
      creepMemory.target = undefined
    }
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let target:any = _.sortBy(creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 }), (container:any) => -container.store[RESOURCE_ENERGY])[0]
          if (!target) {
            target = _.sortBy(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }), (resource:any) => -resource.amount)[0]
          }
          creepMemory.target = target.id
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if (target instanceof StructureContainer) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { creep.moveTo(target) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creepMemory.task = 'transporting'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creepMemory.task = 'transporting'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Transport energy to needed structures
      case 'transporting': {
        if (!creepMemory.target) {
          let spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let extensions = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          if (spawns.length > 0) {
            creepMemory.target = spawns[0].id
          } else if (extensions.length > 0) {
            creepMemory.target = extensions[0].id
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
        } else {
          creepMemory.target = undefined
        }
        break
      }

      // Head to controller for renewal
      case 'renewing': {
        const spawns = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
        creep.moveTo(spawns[0])
        // @ts-ignore
        if (creep.ticksToLive > 1000) { creepMemory.task = 'filling' }
        break
      }

      default: {
        creepMemory.task = 'filling'
        creepMemory.target = undefined
      }
    }
  }
}
