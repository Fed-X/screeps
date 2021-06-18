import Creeper from "../Creeper"

export default class Repairer extends Creeper {
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
          creepMemory.task = 'repairing'
          creepMemory.target = undefined
        }
        break
      }

      // Repair structures by largest difference in hp. Will definitely need more intelligent filtering.
      case 'repairing': {
        if (!creepMemory.target) {
          let targets:any = _.sortBy(creep.room.find(FIND_STRUCTURES, { filter: s => s.hits < s.hitsMax && s.hits / s.hitsMax < 0.75 }), s => s.hits)
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
          if (!creepMemory.target) { creepMemory.target = undefined }
          const spawns = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
          creep.moveTo(spawns[0])
        }
        break
      }
    }
  }
}
