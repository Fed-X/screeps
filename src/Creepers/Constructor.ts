import Creeper from "../Creeper"

export default class Constructor extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let resources: any[] = creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
          resources = resources.concat(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } }))
          resources = resources.concat(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }))
          let target:any = _.sortBy(resources, (resource:any) => resource instanceof Resource ? -resource.amount : -resource.store[RESOURCE_ENERGY])[0]
          if (target) { creepMemory.target = target.id }
        }

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if ((target instanceof StructureContainer) || (target instanceof StructureStorage)) {
          let result = creep.withdraw(target, RESOURCE_ENERGY)
          if (result == ERR_NOT_IN_RANGE)         { self.moveTo(target.pos) }
          if (result == ERR_NOT_ENOUGH_RESOURCES) { creepMemory.target = undefined }
          if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creepMemory.task = 'constructing'
            creepMemory.target = undefined
          }
        } else {
          if (creep.pickup(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creepMemory.task = 'constructing'
            creepMemory.target = undefined
          }
        }
        break
      }

      // Transport energy to build sites by largest first. Convert into upgrader if none available.
      case 'constructing': {
        if (!creepMemory.target || !Game.getObjectById(creepMemory.target)) {
          let targets:any = _.sortBy(creep.room.find(FIND_MY_CONSTRUCTION_SITES), function(s:any){ return s.progressTotal })
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.build(target) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.task = 'upgrading'
          creepMemory.target = undefined
        }
        break
      }

      // Upgrade room controller
      case 'upgrading': {
        let target:any = creep.room.controller
        let roads = _.any(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_ROAD)
        if (creep.pos.inRangeTo(target, 3)) {
          if (_.any(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_ROAD)) {
            creep.moveTo(target)
          } else {
            creep.upgradeController(target)
          }
        } else {
          self.moveTo(target.pos)
        }
        if (creep.store[RESOURCE_ENERGY] == 0) {
          creepMemory.task = 'filling'
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
