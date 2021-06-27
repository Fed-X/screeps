import Creeper from "../Creeper"

export default class Transporter extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let memory = this.memory
    let creepMemory = memory['creeps'][creep.name]
    let spawnTransporters = _.filter(creep.room.find(FIND_MY_CREEPS), function(c) { return memory['creeps'][c.name]?.role == 'spawnTransporter' })
    if (spawnTransporters.length == 0) { creepMemory.role = 'spawnTransporter' }
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let storage = creep.room.controller && creep.room.controller.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })
          if (storage) {
            let storage_link:any = storage.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
            if (storage_link && storage.pos.inRangeTo(storage_link, 2) && storage_link.store[RESOURCE_ENERGY] / storage_link.store.getCapacity(RESOURCE_ENERGY) >= 0.25) {
              creepMemory.target = storage_link.id
            }
          }

          if (!creepMemory.target) {
            let towers = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), function(struct:any){ return struct.energy < struct.energyCapacity })
            let storage = _.filter(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }), function(struct:any){ return struct.store[RESOURCE_ENERGY] < struct.store.getCapacity(RESOURCE_ENERGY) })
            let resources: any[] = creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
            if (towers.length > 0 || storage.length == 0) { resources = resources.concat(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })) }
            resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
            let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
            if (target) { creepMemory.target = target.id }
          }
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if ((target instanceof StructureContainer) || (target instanceof StructureStorage) || (target instanceof StructureLink)) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.task = 'transporting'; creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creepMemory.task = 'transporting'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creepMemory.task = 'transporting'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Transport energy to needed structures
      case 'transporting': {
        if (!creepMemory.target) {
          let towers = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let storage = _.filter(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }), function(struct:any){ return struct.store[RESOURCE_ENERGY] < struct.store.getCapacity(RESOURCE_ENERGY) })
          let spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          let extensions = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }), function(struct:any){ return struct.energy < struct.energyCapacity })
          if (towers.length > 0) {
            creepMemory.target = towers[0].id
          } else if (storage.length > 0) {
            creepMemory.target = storage[0].id
          } else if (spawns.length > 0) {
            creepMemory.target = spawns[0].id
          } else if (extensions.length > 0) {
            creepMemory.target = extensions[0].id
          }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (target.energy == target.energyCapacity) { creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.target = undefined
        }
        break
      }

      default: {
        creepMemory.task = 'filling'
        creepMemory.target = undefined
      }
    }
  }
}
