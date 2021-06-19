import Creeper from "../Creeper"

export default class Constructor extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      // Withdraw energy from largest container
      case 'filling': {
        if (!creepMemory.target) {
          let target:any = _.sortBy(creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }), (container:any) => -container.store[RESOURCE_ENERGY])[0]
          if (!target) {
            target = _.sortBy(creep.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY } }), (resource:any) => -resource.amount)[0]
          }
          creepMemory.target = target.id
        }

        let target:any = Game.getObjectById(creepMemory.target)
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || creep.pickup(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
          creepMemory.task = 'constructing'
          creepMemory.target = undefined
        }
        break
      }

      // Transport energy to build sites by largest first. Convert into upgrader if none available.
      case 'constructing': {
        if (!creepMemory.target || !Game.getObjectById(creepMemory.target)) {
          let targets:any = _.sortBy(creep.room.find(FIND_MY_CONSTRUCTION_SITES), function(s:any){ return -s.progressTotal })
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.build(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (creep.carry[RESOURCE_ENERGY] == 0) {
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
        let targets:any = _.sortBy(creep.room.find(FIND_MY_CONSTRUCTION_SITES), function(s:any){ return -s.progressTotal })
        if (targets.length > 0) {
          creepMemory.task = 'constructing'
          creepMemory.target = targets[0].id
        } else {
          let target:any = creep.room.controller
          if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (creep.carry[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
          }
        }
        break
      }
    }
  }
}
