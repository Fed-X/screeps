import Creeper from "../Creeper"

export default class Maintainer extends Creeper {
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

        let target:any = Game.getObjectById(creepMemory.target); if (target == null) { creepMemory.target = undefined }
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || creep.pickup(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
          creepMemory.task = 'repairing'
          creepMemory.target = undefined
        }
        break
      }

      // Repair structures by largest difference in hp. Will definitely need more intelligent filtering.
      case 'repairing': {
        if (!creepMemory.target) {
          let targets:any = _.sortBy(creep.room.find(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) && s.hits < s.hitsMax }), s => s.hits)
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.repair(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (target.hits == target.hitsMax) { creepMemory.target = undefined }
          if (creep.carry[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'filling'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.target = undefined
          const spawns = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
          creep.moveTo(spawns[0])
        }
        break
      }
    }
  }
}
