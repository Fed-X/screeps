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
          let storage = creep.room.controller && creep.room.controller.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })
          if (storage) {
            let storage_link:any = storage.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
            if (storage_link) {
              if (storage.pos.inRangeTo(storage_link, 2) && storage_link.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                creepMemory.target = storage_link.id
              }
              if (!creepMemory.target) { creepMemory.target = storage.id }
            } else {
              let resources: any[] = creep.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_STORAGE && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0 })
              resources = resources.concat(creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0 }))
              resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
              let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
              if (target) { creepMemory.target = target.id }
            }
          } else {
            let resources: any[] = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0 })
            resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
            let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
            if (target) { creepMemory.target = target.id }
          }
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if (target instanceof StructureLink) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'transporting:link'
            creepMemory.target = undefined
          }
        } else if (target instanceof StructureStorage) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'transporting:storage'
            creepMemory.target = undefined
          }
        } else if (target instanceof StructureContainer) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'transporting:container'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creepMemory.task = 'transporting:container'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Transport energy from storage to needed structures
      case 'transporting:storage': {
        let storage = creep.room.controller && creep.room.controller.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })
        if (storage) {
          let storage_link:any = storage.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
          if (storage_link) {
            if (storage.pos.inRangeTo(storage_link, 2) && storage_link.store.getUsedCapacity(RESOURCE_ENERGY) >= 400) {
              creepMemory.task = 'filling'
              creepMemory.target = storage_link.id
            }
          }
        }

        if (!creepMemory.target) {
          let spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }), function(struct:any){ return struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          let extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (struct:any) => struct instanceof StructureExtension && struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          let towers = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), function(struct:any){ return struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          if (spawns.length > 0) {
            creepMemory.target = spawns[0].id
          } else if (extension) {
            creepMemory.target = extension.id
          } else if (towers.length > 0) {
            creepMemory.target = towers[0].id
          }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) { creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.target = undefined
        }
        break
      }

      // Transport energy from containers to needed structures
      case 'transporting:container': {
        let storage = creep.room.controller && creep.room.controller.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })
        if (storage) {
          let storage_link:any = storage.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
          if (storage_link) {
            if (storage.pos.inRangeTo(storage_link, 2) && storage_link.store.getUsedCapacity(RESOURCE_ENERGY) >= 400) {
              creepMemory.task = 'filling'
              creepMemory.target = storage_link.id
            }
          }
        }

        if (!creepMemory.target) {
          let spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }), function(struct:any){ return struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          let extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (struct:any) => struct instanceof StructureExtension && struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          let towers = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), function(struct:any){ return struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          let storages = _.filter(creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }), function(struct:any){ return struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          if (spawns.length > 0) {
            creepMemory.target = spawns[0].id
          } else if (extension) {
            creepMemory.target = extension.id
          } else if (towers.length > 0) {
            creepMemory.target = towers[0].id
          } else if (storages.length > 0) {
            creepMemory.target = storages[0].id
          }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) { creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.target = undefined
        }
        break
      }

      // Transport energy from link to storage
      case 'transporting:link': {
        if (!creepMemory.target) {
          let storages = _.filter(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }), function(struct:any){ return struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
          if (storages.length > 0) {
            creepMemory.target = storages[0].id
          }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) { creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == 0) {
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
