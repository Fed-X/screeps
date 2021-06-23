import Creeper from "../Creeper"

export default class SpawnTransporter extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    /*if (creep.ticksToLive != undefined && creep.ticksToLive < 50) {
      creepMemory.task = 'renewing'
      creepMemory.target = undefined
    }*/
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let extensions = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let towers = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let resources: any[] = creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
          if (spawns.length > 0 || extensions.length > 0 || towers.length > 0) { resources = resources.concat(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })) }
          resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
          let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
          if (target) { creepMemory.target = target.id }
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if ((target instanceof StructureContainer) || (target instanceof StructureStorage)) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creepMemory.task = 'transporting'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
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
          let towers = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let storage = _.filter(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }), function(struct:any){ return struct.store[RESOURCE_ENERGY] < struct.store.getCapacity() })
          if (spawns.length > 0) {
            creepMemory.target = spawns[0].id
          } else if (extensions.length > 0) {
            creepMemory.target = extensions[0].id
          } else if (towers.length > 0) {
            creepMemory.target = towers[0].id
          } else if (storage.length > 0) {
            creepMemory.target = storage[0].id
          }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
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
        self.moveTo(spawns[0].pos)
        if (creep.ticksToLive != undefined && creep.ticksToLive > 1000) { creepMemory.task = 'filling' }
        break
      }

      default: {
        creepMemory.task = 'filling'
        creepMemory.target = undefined
      }
    }
  }
}
