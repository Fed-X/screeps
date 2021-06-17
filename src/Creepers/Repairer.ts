import Creeper from "../Creeper"

export default class Repairer extends Creeper {
  run(): void {
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'harvesting': {
        let target:any = Game.getObjectById(creepMemory.source)
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
          creepMemory.task = 'repairing'
        }
        break
      }
      case 'repairing': {
        if (!creepMemory.target) {
          let targets:any = creep.room.find(FIND_STRUCTURES, { filter: object => object.hits < object.hitsMax });
          targets.sort((a:any,b:any) => a.hits - b.hits);
          if (targets.length > 0) { creepMemory.target = targets[0].id }
        }
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.repair(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
          if (creep.carry[RESOURCE_ENERGY] == 0) {
            creepMemory.task = 'harvesting'
            creepMemory.target = undefined
          }
        } else {
          creepMemory.role = 'upgrader'
          creepMemory.task = 'harvesting'
          creepMemory.target = undefined
        }
        break
      }
    }
  }
}
